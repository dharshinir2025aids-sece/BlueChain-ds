import type { MonitoringReport, Prisma } from "@prisma/client";
import { ReportStatus as PrismaReportStatus } from "@prisma/client";
import { Role } from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { JwtPayload } from "../../lib/jwt";
import type {
  CreateMonitoringReportBody,
  ListMonitoringReportsQuery,
  UpdateMonitoringReportBody,
} from "./monitoringReport.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Report enriched with its parent project and submitter summary. */
export type MonitoringReportDetail = MonitoringReport & {
  project: {
    id: string;
    title: string;
    orgId: string;
  };
  submitter: {
    id: string;
    name: string;
    email: string;
  };
  _count: { media: number };
};

/** Paginated list response shape. */
export interface MonitoringReportList {
  items: MonitoringReportDetail[];
  total: number;
  page: number;
  limit: number;
}

// ─── Include clause ───────────────────────────────────────────────────────────

const REPORT_INCLUDE = {
  project: {
    select: {
      id: true,
      title: true,
      orgId: true,
    },
  },
  submitter: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: { select: { media: true } },
} satisfies Prisma.MonitoringReportInclude;

// ─── Status-transition rules ──────────────────────────────────────────────────

/**
 * Allowed forward transitions per role.
 * Tuple: [from, to, allowedRoles]
 */
const STATUS_TRANSITIONS: Array<
  [PrismaReportStatus, PrismaReportStatus, Role[]]
> = [
  // Author submits a draft
  [
    PrismaReportStatus.DRAFT,
    PrismaReportStatus.SUBMITTED,
    [Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN],
  ],
  // Admin sends back for changes
  [
    PrismaReportStatus.SUBMITTED,
    PrismaReportStatus.IN_VERIFICATION,
    [Role.NCCR_ADMIN, Role.SUPER_ADMIN],
  ],
  [
    PrismaReportStatus.SUBMITTED,
    PrismaReportStatus.CHANGES_REQUESTED,
    [Role.NCCR_ADMIN, Role.SUPER_ADMIN],
  ],
  // Author re-submits after changes
  [
    PrismaReportStatus.CHANGES_REQUESTED,
    PrismaReportStatus.SUBMITTED,
    [Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN],
  ],
  // Verifier / admin approves or rejects
  [
    PrismaReportStatus.IN_VERIFICATION,
    PrismaReportStatus.APPROVED,
    [Role.NCCR_ADMIN, Role.SUPER_ADMIN],
  ],
  [
    PrismaReportStatus.IN_VERIFICATION,
    PrismaReportStatus.REJECTED,
    [Role.NCCR_ADMIN, Role.SUPER_ADMIN],
  ],
  [
    PrismaReportStatus.IN_VERIFICATION,
    PrismaReportStatus.CHANGES_REQUESTED,
    [Role.NCCR_ADMIN, Role.SUPER_ADMIN],
  ],
];

function assertStatusTransition(
  from: PrismaReportStatus,
  to: PrismaReportStatus,
  actorRole: Role,
): void {
  // Same status — no transition needed
  if (from === to) return;

  const allowed = STATUS_TRANSITIONS.find(
    ([f, t]) => f === from && t === to,
  );

  if (!allowed) {
    throw new AppError(
      422,
      "INVALID_STATUS_TRANSITION",
      `Cannot transition a report from ${from} to ${to}`,
    );
  }

  if (!allowed[2].includes(actorRole)) {
    throw new AppError(
      403,
      "FORBIDDEN",
      `Your role is not permitted to move a report from ${from} to ${to}`,
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve the actor's orgId from the DB (not stored in JWT). */
async function resolveActorOrgId(actorId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: actorId },
    select: { orgId: true },
  });
  return user?.orgId ?? null;
}

/** Load report + include or throw 404. */
async function findOrFail(id: string): Promise<MonitoringReportDetail> {
  const report = await prisma.monitoringReport.findUnique({
    where: { id },
    include: REPORT_INCLUDE,
  });
  if (!report) {
    throw new AppError(
      404,
      "REPORT_NOT_FOUND",
      "Monitoring report not found",
    );
  }
  return report as unknown as MonitoringReportDetail;
}

/**
 * Ownership guard for mutations.
 *   NGO_MANAGER  — may only touch reports whose project belongs to their org
 *   NCCR_ADMIN / SUPER_ADMIN — unrestricted
 */
async function assertMutationAccess(
  report: MonitoringReportDetail,
  actor: JwtPayload,
): Promise<void> {
  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (report.project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only modify reports that belong to your organisation's projects",
      );
    }
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Create a new monitoring report.
 * submittedBy is always the authenticated actor.
 * Verifies the target project exists before inserting.
 */
export async function createMonitoringReport(
  input: CreateMonitoringReportBody,
  actor: JwtPayload,
): Promise<MonitoringReportDetail> {
  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { id: true, orgId: true },
  });
  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  // NGO_MANAGER can only create reports for their own org's projects
  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only create reports for your own organisation's projects",
      );
    }
  }

  const report = await prisma.monitoringReport.create({
    data: {
      projectId: input.projectId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      submittedBy: actor.sub,
      summaryJson: input.summaryJson as Prisma.InputJsonValue | undefined,
      ipfsCid: input.ipfsCid,
      contentHash: input.contentHash,
      // New reports always start as DRAFT
      status: PrismaReportStatus.DRAFT,
    },
    include: REPORT_INCLUDE,
  });

  return report as unknown as MonitoringReportDetail;
}

/**
 * List reports with optional filters and pagination.
 * NGO_MANAGER results are scoped to projects belonging to their org.
 * Higher roles see all reports subject to applied query filters.
 */
export async function listMonitoringReports(
  query: ListMonitoringReportsQuery,
  actor: JwtPayload,
): Promise<MonitoringReportList> {
  const { projectId, status, submittedBy, startDate, endDate, page, limit } =
    query;

  // Build base where clause
  const where: Prisma.MonitoringReportWhereInput = {
    ...(projectId && { projectId }),
    ...(status && { status: status as PrismaReportStatus }),
    ...(submittedBy && { submittedBy }),
    ...(startDate || endDate
      ? {
          periodStart: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {}),
  };

  // NGO_MANAGER: scope to their org's projects
  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    where.project = { orgId: actorOrgId ?? undefined };
  }

  const [items, total] = await prisma.$transaction([
    prisma.monitoringReport.findMany({
      where,
      include: REPORT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.monitoringReport.count({ where }),
  ]);

  return {
    items: items as unknown as MonitoringReportDetail[],
    total,
    page,
    limit,
  };
}

/**
 * Get a single report by id.
 * NGO_MANAGER may only read reports from their own org's projects.
 */
export async function getMonitoringReportById(
  id: string,
  actor: JwtPayload,
): Promise<MonitoringReportDetail> {
  const report = await findOrFail(id);

  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (report.project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only view reports that belong to your organisation's projects",
      );
    }
  }

  return report;
}

/**
 * Update mutable fields on a monitoring report.
 * projectId and submittedBy are immutable after creation.
 * Status transitions are validated against the allowed matrix.
 * APPROVED / REJECTED reports are locked — no further edits.
 */
export async function updateMonitoringReport(
  id: string,
  input: UpdateMonitoringReportBody,
  actor: JwtPayload,
): Promise<MonitoringReportDetail> {
  const report = await findOrFail(id);
  await assertMutationAccess(report, actor);

  // Lock approved/rejected reports
  if (
    report.status === PrismaReportStatus.APPROVED ||
    report.status === PrismaReportStatus.REJECTED
  ) {
    throw new AppError(
      409,
      "REPORT_LOCKED",
      `Reports with status ${report.status} cannot be modified`,
    );
  }

  // Validate status transition when status is being changed
  if (input.status !== undefined) {
    assertStatusTransition(
      report.status,
      input.status as PrismaReportStatus,
      actor.role,
    );
  }

  // Period date range consistency check (when either date changes)
  const newStart = input.periodStart ?? report.periodStart;
  const newEnd = input.periodEnd ?? report.periodEnd;
  if (newEnd <= newStart) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      "periodEnd must be after periodStart",
    );
  }

  const updated = await prisma.monitoringReport.update({
    where: { id },
    data: {
      ...(input.periodStart !== undefined && {
        periodStart: input.periodStart,
      }),
      ...(input.periodEnd !== undefined && { periodEnd: input.periodEnd }),
      ...(input.status !== undefined && {
        status: input.status as PrismaReportStatus,
      }),
      ...(input.summaryJson !== undefined && {
        summaryJson: input.summaryJson as Prisma.InputJsonValue,
      }),
      ...(input.ipfsCid !== undefined && { ipfsCid: input.ipfsCid }),
      ...(input.contentHash !== undefined && {
        contentHash: input.contentHash,
      }),
    },
    include: REPORT_INCLUDE,
  });

  return updated as unknown as MonitoringReportDetail;
}

/**
 * Delete a monitoring report.
 * Only DRAFT reports may be deleted to protect the audit trail.
 * Cascades to MediaAsset via schema's onDelete: SetNull.
 */
export async function deleteMonitoringReport(
  id: string,
  actor: JwtPayload,
): Promise<void> {
  const report = await findOrFail(id);
  await assertMutationAccess(report, actor);

  if (report.status !== PrismaReportStatus.DRAFT) {
    throw new AppError(
      409,
      "REPORT_NOT_DELETABLE",
      "Only DRAFT reports can be deleted",
    );
  }

  await prisma.monitoringReport.delete({ where: { id } });
}
