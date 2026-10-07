import type { Prisma, VerificationPackage } from "@prisma/client";
import { VerificationDecision as PrismaVerificationDecision } from "@prisma/client";
import { Role } from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { JwtPayload } from "../../lib/jwt";
import type {
  DecideVerificationBody,
  ListVerificationQuery,
} from "./verification.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

const VP_INCLUDE = {
  report: {
    select: {
      id: true,
      projectId: true,
      periodStart: true,
      periodEnd: true,
      status: true,
      project: { select: { id: true, title: true, orgId: true } },
      submitter: { select: { id: true, name: true, email: true } },
    },
  },
  verifier: { select: { id: true, name: true, email: true } },
} satisfies Prisma.VerificationPackageInclude;

export type VerificationPackageDetail = VerificationPackage & {
  report: {
    id: string;
    projectId: string;
    periodStart: Date;
    periodEnd: Date;
    status: string;
    project: { id: string; title: string; orgId: string };
    submitter: { id: string; name: string; email: string };
  };
  verifier: { id: string; name: string; email: string } | null;
};

export interface VerificationList {
  items: VerificationPackageDetail[];
  total: number;
  page: number;
  limit: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveActorOrgId(actorId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: actorId },
    select: { orgId: true },
  });
  return user?.orgId ?? null;
}

async function findOrFail(id: string): Promise<VerificationPackageDetail> {
  const vp = await prisma.verificationPackage.findUnique({
    where: { id },
    include: VP_INCLUDE,
  });
  if (!vp) {
    throw new AppError(404, "VERIFICATION_NOT_FOUND", "Verification package not found");
  }
  return vp as unknown as VerificationPackageDetail;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * List verification packages.
 * VERIFIER — sees only packages assigned to them (or unassigned in PENDING).
 * NGO_MANAGER — sees packages for their org's reports.
 * NCCR_ADMIN / SUPER_ADMIN — unrestricted.
 */
export async function listVerificationPackages(
  query: ListVerificationQuery,
  actor: JwtPayload,
): Promise<VerificationList> {
  const { status, verifierId, reportId, page, limit } = query;

  const where: Prisma.VerificationPackageWhereInput = {
    ...(status && { status: status as PrismaVerificationDecision }),
    ...(verifierId && { verifierId }),
    ...(reportId && { reportId }),
  };

  if (actor.role === Role.VERIFIER) {
    // Verifier sees packages assigned to them OR unassigned pending ones
    where.OR = [
      { verifierId: actor.sub },
      { verifierId: null, status: PrismaVerificationDecision.PENDING },
    ];
  } else if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    where.report = { project: { orgId: actorOrgId ?? undefined } };
  }

  const [items, total] = await prisma.$transaction([
    prisma.verificationPackage.findMany({
      where,
      include: VP_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.verificationPackage.count({ where }),
  ]);

  return { items: items as unknown as VerificationPackageDetail[], total, page, limit };
}

/**
 * Get a single verification package by id.
 */
export async function getVerificationPackage(
  id: string,
  actor: JwtPayload,
): Promise<VerificationPackageDetail> {
  const vp = await findOrFail(id);

  if (actor.role === Role.VERIFIER && vp.verifierId !== null && vp.verifierId !== actor.sub) {
    throw new AppError(403, "FORBIDDEN", "This package is assigned to another verifier");
  }

  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (vp.report.project.orgId !== actorOrgId) {
      throw new AppError(403, "FORBIDDEN", "You can only view packages for your organisation");
    }
  }

  return vp;
}

/**
 * Record a verification decision (APPROVED / REJECTED / CHANGES_REQUESTED).
 * Only VERIFIER or NCCR_ADMIN / SUPER_ADMIN may decide.
 * Assigns the package to the actor as the verifier if not already assigned.
 */
export async function decideVerification(
  id: string,
  input: DecideVerificationBody,
  actor: JwtPayload,
): Promise<VerificationPackageDetail> {
  const vp = await findOrFail(id);

  if (
    vp.status !== PrismaVerificationDecision.PENDING &&
    vp.status !== PrismaVerificationDecision.CHANGES_REQUESTED
  ) {
    throw new AppError(
      409,
      "VERIFICATION_CLOSED",
      `Package with status ${vp.status} cannot receive a new decision`,
    );
  }

  const decision = input.decision as PrismaVerificationDecision;

  const updated = await prisma.verificationPackage.update({
    where: { id },
    data: {
      verifierId: vp.verifierId ?? actor.sub,
      status: decision,
      decision,
      comments: input.comments ?? null,
      decidedAt: new Date(),
    },
    include: VP_INCLUDE,
  });

  return updated as unknown as VerificationPackageDetail;
}
