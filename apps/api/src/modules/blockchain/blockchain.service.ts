import type { CarbonCredit, ChainAnchor, CreditTransfer, Prisma, Retirement } from "@prisma/client";
import { CreditStatus as PrismaCreditStatus, ReportStatus as PrismaReportStatus } from "@prisma/client";
import { Role } from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { JwtPayload } from "../../lib/jwt";
import type {
  AnchorReportBody,
  ConfirmAnchorBody,
  ListCreditsQuery,
  MintCreditBody,
  RetireCreditBody,
  TransferCreditBody,
} from "./blockchain.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreditDetail = CarbonCredit & {
  project: { id: string; title: string; orgId: string };
  owner: { id: string; name: string; email: string } | null;
  _count: { transfers: number };
};

export type AnchorDetail = ChainAnchor;

export type TransferDetail = CreditTransfer & {
  fromUser: { id: string; name: string; email: string };
  toUser: { id: string; name: string; email: string };
};

export type RetirementDetail = Retirement & {
  credit: { id: string; amounttCO2e: number; vintageYear: number };
  buyer: { id: string; name: string; email: string };
};

export interface CreditList {
  items: CreditDetail[];
  total: number;
  page: number;
  limit: number;
}

// ─── Include clauses ──────────────────────────────────────────────────────────

const CREDIT_INCLUDE = {
  project: { select: { id: true, title: true, orgId: true } },
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { transfers: true } },
} satisfies Prisma.CarbonCreditInclude;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve actor's orgId from DB (not stored in JWT to keep tokens small). */
async function resolveActorOrgId(actorId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: actorId },
    select: { orgId: true },
  });
  return user?.orgId ?? null;
}

/** Load a MonitoringReport or throw 404. */
async function findReportOrFail(reportId: string) {
  const report = await prisma.monitoringReport.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      contentHash: true,
      ipfsCid: true,
      projectId: true,
      project: { select: { id: true, orgId: true, title: true } },
    },
  });
  if (!report) {
    throw new AppError(404, "REPORT_NOT_FOUND", "Monitoring report not found");
  }
  return report;
}

/** Load a CarbonCredit or throw 404. */
async function findCreditOrFail(creditId: string): Promise<CreditDetail> {
  const credit = await prisma.carbonCredit.findUnique({
    where: { id: creditId },
    include: CREDIT_INCLUDE,
  });
  if (!credit) {
    throw new AppError(404, "CREDIT_NOT_FOUND", "Carbon credit not found");
  }
  return credit as unknown as CreditDetail;
}

/**
 * Read access guard for credits.
 * NGO_MANAGER sees only credits under their own org's projects.
 * CORPORATE_BUYER sees only credits they own.
 * NCCR_ADMIN / SUPER_ADMIN / VERIFIER — unrestricted read.
 */
async function assertCreditReadAccess(
  credit: CreditDetail,
  actor: JwtPayload,
): Promise<void> {
  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (credit.project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only view credits belonging to your organisation's projects",
      );
    }
  }

  if (actor.role === Role.CORPORATE_BUYER && credit.ownerUserId !== actor.sub) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only view credits you own",
    );
  }
}

// ─── Anchor functions ─────────────────────────────────────────────────────────

/**
 * Anchor an APPROVED MonitoringReport to the blockchain.
 *
 * Rules:
 *  - Report must be APPROVED (status check).
 *  - Only one active ChainAnchor per report is allowed (duplicate prevention).
 *  - NGO_MANAGER may only anchor reports from their own organisation.
 *  - NCCR_ADMIN / SUPER_ADMIN unrestricted.
 *
 * Blockchain note:
 *  The actual on-chain call happens outside the API (via a relayer or the
 *  frontend wallet).  This endpoint records the intent and the txHash when
 *  supplied, or leaves txHash null for later confirmation via
 *  POST /v1/blockchain/:reportId/confirm.
 */
export async function anchorReport(
  reportId: string,
  input: AnchorReportBody,
  actor: JwtPayload,
): Promise<AnchorDetail> {
  const report = await findReportOrFail(reportId);

  // Only APPROVED reports may be anchored
  if (report.status !== PrismaReportStatus.APPROVED) {
    throw new AppError(
      422,
      "REPORT_NOT_APPROVED",
      `Only APPROVED reports can be anchored on-chain. Current status: ${report.status}`,
    );
  }

  // Org-scoping for NGO_MANAGER
  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (report.project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only anchor reports from your own organisation's projects",
      );
    }
  }

  // Duplicate prevention — one anchor per report
  const existing = await prisma.chainAnchor.findFirst({
    where: { entityType: "MonitoringReport", entityId: reportId },
  });
  if (existing) {
    throw new AppError(
      409,
      "ALREADY_ANCHORED",
      "This report has already been anchored on-chain",
    );
  }

  // Resolve content hash: prefer body override, then report's stored value
  const resolvedHash =
    input.contentHash ??
    report.contentHash ??
    `sha256:${reportId}`;

  const anchor = await prisma.chainAnchor.create({
    data: {
      entityType: "MonitoringReport",
      entityId: reportId,
      contentHash: resolvedHash,
      ipfsCid: input.ipfsCid ?? report.ipfsCid ?? null,
      txHash: input.txHash ?? null,
      network: input.network,
    },
  });

  return anchor;
}

/**
 * Confirm a pending ChainAnchor with the definitive txHash / blockNumber
 * once the transaction has been mined.
 */
export async function confirmAnchor(
  reportId: string,
  input: ConfirmAnchorBody,
  actor: JwtPayload,
): Promise<AnchorDetail> {
  // Org-scoping guard (same as anchorReport)
  const report = await findReportOrFail(reportId);

  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (report.project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only confirm anchors for your own organisation's reports",
      );
    }
  }

  const anchor = await prisma.chainAnchor.findFirst({
    where: { entityType: "MonitoringReport", entityId: reportId },
  });
  if (!anchor) {
    throw new AppError(
      404,
      "ANCHOR_NOT_FOUND",
      "No chain anchor found for this report. Anchor it first via POST /v1/blockchain/:reportId/anchor",
    );
  }

  const updated = await prisma.chainAnchor.update({
    where: { id: anchor.id },
    data: {
      txHash: input.txHash,
      blockNumber: input.blockNumber ?? null,
      ipfsCid: input.ipfsCid ?? anchor.ipfsCid,
    },
  });

  return updated;
}

/**
 * Retrieve the ChainAnchor record for a MonitoringReport.
 * All authenticated roles may read (NGO_MANAGER org-scoped).
 */
export async function getAnchorByReport(
  reportId: string,
  actor: JwtPayload,
): Promise<AnchorDetail> {
  const report = await findReportOrFail(reportId);

  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (report.project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only view anchors for your own organisation's reports",
      );
    }
  }

  const anchor = await prisma.chainAnchor.findFirst({
    where: { entityType: "MonitoringReport", entityId: reportId },
  });
  if (!anchor) {
    throw new AppError(
      404,
      "ANCHOR_NOT_FOUND",
      "This report has not been anchored on-chain yet",
    );
  }

  return anchor;
}

/**
 * Return the anchor status for a MonitoringReport.
 * Status is derived from whether txHash and blockNumber are present.
 */
export async function getAnchorStatus(
  reportId: string,
  actor: JwtPayload,
): Promise<{ anchored: boolean; confirmed: boolean; anchor: AnchorDetail | null }> {
  const report = await findReportOrFail(reportId);

  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (report.project.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only check status for your own organisation's reports",
      );
    }
  }

  const anchor = await prisma.chainAnchor.findFirst({
    where: { entityType: "MonitoringReport", entityId: reportId },
  });

  return {
    anchored: anchor !== null,
    confirmed: anchor !== null && anchor.txHash !== null && anchor.blockNumber !== null,
    anchor,
  };
}

// ─── Credit functions ─────────────────────────────────────────────────────────

/**
 * Mint a new CarbonCredit for an approved project.
 * Only NCCR_ADMIN and SUPER_ADMIN may mint.
 */
export async function mintCredit(
  input: MintCreditBody,
  actor: JwtPayload,
): Promise<CreditDetail> {
  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { id: true, orgId: true, status: true },
  });
  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  const credit = await prisma.carbonCredit.create({
    data: {
      projectId: input.projectId,
      amounttCO2e: input.amounttCO2e,
      vintageYear: input.vintageYear,
      status: PrismaCreditStatus.MINTED,
      tokenId: input.tokenId ?? null,
      txMint: input.txMint ?? null,
      ipfsCid: input.ipfsCid ?? null,
      ownerUserId: actor.sub,
    },
    include: CREDIT_INCLUDE,
  });

  return credit as unknown as CreditDetail;
}

/**
 * List carbon credits with optional filters and pagination.
 * NGO_MANAGER sees only credits under their org's projects.
 * CORPORATE_BUYER sees only credits they own.
 */
export async function listCredits(
  query: ListCreditsQuery,
  actor: JwtPayload,
): Promise<CreditList> {
  const { projectId, status, ownerUserId, page, limit } = query;

  const where: Prisma.CarbonCreditWhereInput = {
    ...(projectId && { projectId }),
    ...(status && { status: status as PrismaCreditStatus }),
  };

  // Scope by role
  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    where.project = { orgId: actorOrgId ?? undefined };
  } else if (actor.role === Role.CORPORATE_BUYER) {
    where.ownerUserId = actor.sub;
  } else if (ownerUserId) {
    // NCCR_ADMIN / SUPER_ADMIN may filter by ownerUserId
    where.ownerUserId = ownerUserId;
  }

  const [items, total] = await prisma.$transaction([
    prisma.carbonCredit.findMany({
      where,
      include: CREDIT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.carbonCredit.count({ where }),
  ]);

  return {
    items: items as unknown as CreditDetail[],
    total,
    page,
    limit,
  };
}

/**
 * Get a single carbon credit by id.
 */
export async function getCreditById(
  creditId: string,
  actor: JwtPayload,
): Promise<CreditDetail> {
  const credit = await findCreditOrFail(creditId);
  await assertCreditReadAccess(credit, actor);
  return credit;
}

/**
 * Transfer a MINTED credit to another user.
 * Records a CreditTransfer row and updates the ownerUserId on the credit.
 */
export async function transferCredit(
  creditId: string,
  input: TransferCreditBody,
  actor: JwtPayload,
): Promise<TransferDetail> {
  const credit = await findCreditOrFail(creditId);

  if (credit.status !== PrismaCreditStatus.MINTED && credit.status !== PrismaCreditStatus.TRANSFERRED) {
    throw new AppError(
      422,
      "CREDIT_NOT_TRANSFERABLE",
      `Only MINTED or TRANSFERRED credits can be transferred. Current status: ${credit.status}`,
    );
  }

  // Verify recipient user exists
  const recipient = await prisma.user.findUnique({
    where: { id: input.toUserId },
    select: { id: true },
  });
  if (!recipient) {
    throw new AppError(404, "USER_NOT_FOUND", "Recipient user not found");
  }

  const [transfer] = await prisma.$transaction([
    prisma.creditTransfer.create({
      data: {
        creditId,
        fromUserId: credit.ownerUserId ?? actor.sub,
        toUserId: input.toUserId,
        amount: input.amount,
        txHash: input.txHash ?? null,
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        toUser: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.carbonCredit.update({
      where: { id: creditId },
      data: {
        ownerUserId: input.toUserId,
        status: PrismaCreditStatus.TRANSFERRED,
      },
    }),
  ]);

  return transfer as unknown as TransferDetail;
}

/**
 * Retire a MINTED or TRANSFERRED credit permanently.
 * CORPORATE_BUYER may only retire credits they own.
 * NCCR_ADMIN / SUPER_ADMIN may retire any credit.
 */
export async function retireCredit(
  creditId: string,
  input: RetireCreditBody,
  actor: JwtPayload,
): Promise<RetirementDetail> {
  const credit = await findCreditOrFail(creditId);

  if (
    credit.status !== PrismaCreditStatus.MINTED &&
    credit.status !== PrismaCreditStatus.TRANSFERRED
  ) {
    throw new AppError(
      422,
      "CREDIT_NOT_RETIRABLE",
      `Only MINTED or TRANSFERRED credits can be retired. Current status: ${credit.status}`,
    );
  }

  // CORPORATE_BUYER may only retire their own credits
  if (actor.role === Role.CORPORATE_BUYER && credit.ownerUserId !== actor.sub) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only retire credits you own",
    );
  }

  // Prevent double-retirement
  const existingRetirement = await prisma.retirement.findUnique({
    where: { creditId },
  });
  if (existingRetirement) {
    throw new AppError(409, "ALREADY_RETIRED", "This credit has already been retired");
  }

  const [retirement] = await prisma.$transaction([
    prisma.retirement.create({
      data: {
        creditId,
        buyerId: actor.sub,
        reason: input.reason ?? null,
        txHash: input.txHash ?? null,
      },
      include: {
        credit: { select: { id: true, amounttCO2e: true, vintageYear: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.carbonCredit.update({
      where: { id: creditId },
      data: {
        status: PrismaCreditStatus.RETIRED,
        txRetire: input.txHash ?? null,
      },
    }),
  ]);

  return retirement as unknown as RetirementDetail;
}
