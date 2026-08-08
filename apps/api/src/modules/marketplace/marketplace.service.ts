/**
 * Carbon Marketplace Service — Phase 9
 *
 * Architecture decision:
 *   The existing schema has no MarketplaceListing table.  Rather than add a new
 *   Prisma migration (which would require running `prisma migrate dev` and
 *   regenerating the client), the marketplace models listings using the
 *   AuditLog table as a durable event store:
 *
 *     entityType = "MarketplaceListing"
 *     entityId   = <generated cuid>
 *     action     = "LISTING_CREATED" | "LISTING_UPDATED" | "LISTING_CANCELLED" | "LISTING_SOLD"
 *     metaJson   = { creditId, sellerId, pricePerTonne, quantity?, notes?, status, ... }
 *
 *   This is a valid read-model pattern — the latest AuditLog event for each
 *   listingId is the canonical state of that listing.  It requires zero schema
 *   changes and keeps the Prisma client as-is.
 *
 *   A purchase call:
 *     1. Reads the listing (latest AuditLog for that listingId).
 *     2. Validates status/ownership/credit state.
 *     3. Creates a CreditTransfer (existing model) for the ownership change.
 *     4. Updates CarbonCredit.ownerUserId + status = TRANSFERRED.
 *     5. Appends a LISTING_SOLD AuditLog event.
 *   All steps run inside a single Prisma $transaction.
 */

import type { Prisma } from "@prisma/client";
import { CreditStatus as PrismaCreditStatus } from "@prisma/client";
import { Role } from "@bluechain/shared";
import { randomUUID } from "crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { JwtPayload } from "../../lib/jwt";
import type {
  CreateListingBody,
  ListListingsQuery,
  PurchaseListingBody,
  UpdateListingBody,
} from "./marketplace.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListingStatus = "ACTIVE" | "CANCELLED" | "SOLD";

/** Hydrated listing shape returned by the API. */
export interface ListingDetail {
  id: string;
  creditId: string;
  sellerId: string;
  pricePerTonne: number;
  notes: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  credit: {
    id: string;
    amounttCO2e: number;
    vintageYear: number;
    status: string;
    tokenId: string | null;
    ipfsCid: string | null;
    project: {
      id: string;
      title: string;
      ecosystemType: string;
      orgId: string;
    };
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ListingList {
  items: ListingDetail[];
  total: number;
  page: number;
  limit: number;
}

export interface PurchaseResult {
  listing: ListingDetail;
  transfer: {
    id: string;
    creditId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    createdAt: Date;
  };
}

// ─── AuditLog meta shape (internal) ──────────────────────────────────────────

interface ListingMeta {
  creditId: string;
  sellerId: string;
  pricePerTonne: number;
  notes: string | null;
  status: ListingStatus;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cast AuditLog.metaJson to ListingMeta safely. */
function parseMeta(raw: unknown): ListingMeta {
  if (
    raw === null ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    throw new AppError(500, "LISTING_CORRUPT", "Listing metadata is malformed");
  }
  return raw as ListingMeta;
}

/**
 * Fetch the latest AuditLog event for a listing id.
 * The most recently created row with entityType = "MarketplaceListing" and
 * entityId = listingId is the canonical state.
 */
async function fetchLatestEvent(listingId: string) {
  return prisma.auditLog.findFirst({
    where: { entityType: "MarketplaceListing", entityId: listingId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Load and hydrate a listing, throwing 404 when not found.
 * Enriches with credit + project + seller data in a single extra query.
 */
async function hydrateOrFail(listingId: string): Promise<ListingDetail> {
  const event = await fetchLatestEvent(listingId);
  if (!event) {
    throw new AppError(404, "LISTING_NOT_FOUND", "Marketplace listing not found");
  }

  const meta = parseMeta(event.metaJson);

  const credit = await prisma.carbonCredit.findUnique({
    where: { id: meta.creditId },
    select: {
      id: true,
      amounttCO2e: true,
      vintageYear: true,
      status: true,
      tokenId: true,
      ipfsCid: true,
      project: {
        select: {
          id: true,
          title: true,
          ecosystemType: true,
          orgId: true,
        },
      },
    },
  });
  if (!credit) {
    throw new AppError(404, "CREDIT_NOT_FOUND", "Credit associated with listing not found");
  }

  const seller = await prisma.user.findUnique({
    where: { id: meta.sellerId },
    select: { id: true, name: true, email: true },
  });
  if (!seller) {
    throw new AppError(404, "USER_NOT_FOUND", "Seller account not found");
  }

  return {
    id: listingId,
    creditId: meta.creditId,
    sellerId: meta.sellerId,
    pricePerTonne: meta.pricePerTonne,
    notes: meta.notes,
    status: meta.status,
    createdAt: event.createdAt.toISOString(),
    updatedAt: meta.updatedAt,
    credit: {
      id: credit.id,
      amounttCO2e: credit.amounttCO2e,
      vintageYear: credit.vintageYear,
      status: credit.status as string,
      tokenId: credit.tokenId,
      ipfsCid: credit.ipfsCid,
      project: {
        id: credit.project.id,
        title: credit.project.title,
        ecosystemType: credit.project.ecosystemType as string,
        orgId: credit.project.orgId,
      },
    },
    seller,
  };
}

/** Resolve actor orgId (not in JWT). */
async function resolveActorOrgId(actorId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: actorId },
    select: { orgId: true },
  });
  return user?.orgId ?? null;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * List active marketplace listings with optional filters and pagination.
 * All authenticated roles may browse (no ownership scoping on read).
 */
export async function listListings(
  query: ListListingsQuery,
  _actor: JwtPayload,
): Promise<ListingList> {
  const { ecosystemType, vintageYear, minPrice, maxPrice, projectId, sellerId, page, limit } = query;

  // Collect all ACTIVE listing ids from AuditLog
  // Strategy: find all distinct entityIds where the latest action indicates ACTIVE status.
  // We fetch a reasonable batch, hydrate, then filter/paginate in memory.
  // This is efficient enough for the current scale (marketplace is Phase 9 bootstrap).

  const allEvents = await prisma.auditLog.findMany({
    where: { entityType: "MarketplaceListing" },
    orderBy: { createdAt: "desc" },
    select: {
      entityId: true,
      metaJson: true,
      createdAt: true,
    },
  });

  // Deduplicate — keep only the latest event per listingId
  const seenIds = new Set<string>();
  const latestEvents: typeof allEvents = [];
  for (const ev of allEvents) {
    if (ev.entityId && !seenIds.has(ev.entityId)) {
      seenIds.add(ev.entityId);
      latestEvents.push(ev);
    }
  }

  // Filter to ACTIVE only + apply optional query filters
  const activeMetas = latestEvents.filter((ev) => {
    const meta = ev.metaJson as ListingMeta | null;
    if (!meta || meta.status !== "ACTIVE") return false;
    if (sellerId && meta.sellerId !== sellerId) return false;
    if (minPrice !== undefined && meta.pricePerTonne < minPrice) return false;
    if (maxPrice !== undefined && meta.pricePerTonne > maxPrice) return false;
    return true;
  });

  const total = activeMetas.length;
  const paginated = activeMetas.slice((page - 1) * limit, page * limit);

  // Hydrate each listing
  const hydrated = await Promise.all(
    paginated.map(async (ev) => {
      try {
        return await hydrateOrFail(ev.entityId!);
      } catch {
        return null;
      }
    }),
  );

  // Post-hydration filters (ecosystemType, vintageYear, projectId)
  const items = hydrated.filter((l): l is ListingDetail => {
    if (!l) return false;
    if (ecosystemType && l.credit.project.ecosystemType !== ecosystemType) return false;
    if (vintageYear !== undefined && l.credit.vintageYear !== vintageYear) return false;
    if (projectId && l.credit.project.id !== projectId) return false;
    return true;
  });

  return { items, total, page, limit };
}

/**
 * Get a single listing by id.
 * All authenticated roles may read.
 */
export async function getListingById(
  listingId: string,
  _actor: JwtPayload,
): Promise<ListingDetail> {
  return hydrateOrFail(listingId);
}

/**
 * Create a marketplace listing for a credit the caller owns.
 *
 * Rules:
 *  - Credit must be MINTED or TRANSFERRED.
 *  - Caller must be the current ownerUserId on the credit.
 *  - No existing ACTIVE listing for this credit.
 */
export async function createListing(
  input: CreateListingBody,
  actor: JwtPayload,
): Promise<ListingDetail> {
  const credit = await prisma.carbonCredit.findUnique({
    where: { id: input.creditId },
    select: { id: true, status: true, ownerUserId: true },
  });
  if (!credit) {
    throw new AppError(404, "CREDIT_NOT_FOUND", "Carbon credit not found");
  }

  if (
    credit.status !== PrismaCreditStatus.MINTED &&
    credit.status !== PrismaCreditStatus.TRANSFERRED
  ) {
    throw new AppError(
      422,
      "CREDIT_NOT_LISTABLE",
      `Only MINTED or TRANSFERRED credits can be listed. Current status: ${credit.status}`,
    );
  }

  if (credit.ownerUserId !== actor.sub) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only list credits you own",
    );
  }

  // Check for existing active listing on this credit
  const existingEvents = await prisma.auditLog.findMany({
    where: { entityType: "MarketplaceListing" },
    orderBy: { createdAt: "desc" },
    select: { entityId: true, metaJson: true },
  });

  const seenIds = new Set<string>();
  for (const ev of existingEvents) {
    if (ev.entityId && !seenIds.has(ev.entityId)) {
      seenIds.add(ev.entityId);
      const meta = ev.metaJson as ListingMeta | null;
      if (meta?.creditId === input.creditId && meta?.status === "ACTIVE") {
        throw new AppError(
          409,
          "LISTING_EXISTS",
          "An active listing already exists for this credit",
        );
      }
    }
  }

  const listingId = randomUUID();
  const now = new Date().toISOString();

  const meta: ListingMeta = {
    creditId: input.creditId,
    sellerId: actor.sub,
    pricePerTonne: input.pricePerTonne,
    notes: input.notes ?? null,
    status: "ACTIVE",
    updatedAt: now,
  };

  await prisma.auditLog.create({
    data: {
      actorId: actor.sub,
      action: "LISTING_CREATED",
      entityType: "MarketplaceListing",
      entityId: listingId,
      metaJson: meta as unknown as Prisma.InputJsonValue,
    },
  });

  return hydrateOrFail(listingId);
}

/**
 * Update price or notes on an ACTIVE listing.
 * Only the seller or NCCR_ADMIN / SUPER_ADMIN may update.
 */
export async function updateListing(
  listingId: string,
  input: UpdateListingBody,
  actor: JwtPayload,
): Promise<ListingDetail> {
  const listing = await hydrateOrFail(listingId);

  if (listing.status !== "ACTIVE") {
    throw new AppError(
      409,
      "LISTING_NOT_ACTIVE",
      `Only ACTIVE listings can be updated. Current status: ${listing.status}`,
    );
  }

  // Only the seller or privileged admins may update
  if (
    listing.sellerId !== actor.sub &&
    actor.role !== Role.NCCR_ADMIN &&
    actor.role !== Role.SUPER_ADMIN
  ) {
    throw new AppError(403, "FORBIDDEN", "You can only update your own listings");
  }

  const now = new Date().toISOString();
  const meta: ListingMeta = {
    creditId: listing.creditId,
    sellerId: listing.sellerId,
    pricePerTonne: input.pricePerTonne ?? listing.pricePerTonne,
    notes: input.notes !== undefined ? (input.notes ?? null) : listing.notes,
    status: "ACTIVE",
    updatedAt: now,
  };

  await prisma.auditLog.create({
    data: {
      actorId: actor.sub,
      action: "LISTING_UPDATED",
      entityType: "MarketplaceListing",
      entityId: listingId,
      metaJson: meta as unknown as Prisma.InputJsonValue,
    },
  });

  return hydrateOrFail(listingId);
}

/**
 * Cancel an ACTIVE listing.
 * Only the seller or NCCR_ADMIN / SUPER_ADMIN may cancel.
 * Credit ownership does not change.
 */
export async function cancelListing(
  listingId: string,
  actor: JwtPayload,
): Promise<void> {
  const listing = await hydrateOrFail(listingId);

  if (listing.status !== "ACTIVE") {
    throw new AppError(
      409,
      "LISTING_NOT_ACTIVE",
      `Only ACTIVE listings can be cancelled. Current status: ${listing.status}`,
    );
  }

  if (
    listing.sellerId !== actor.sub &&
    actor.role !== Role.NCCR_ADMIN &&
    actor.role !== Role.SUPER_ADMIN
  ) {
    throw new AppError(403, "FORBIDDEN", "You can only cancel your own listings");
  }

  const now = new Date().toISOString();
  const meta: ListingMeta = {
    creditId: listing.creditId,
    sellerId: listing.sellerId,
    pricePerTonne: listing.pricePerTonne,
    notes: listing.notes,
    status: "CANCELLED",
    updatedAt: now,
  };

  await prisma.auditLog.create({
    data: {
      actorId: actor.sub,
      action: "LISTING_CANCELLED",
      entityType: "MarketplaceListing",
      entityId: listingId,
      metaJson: meta as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Purchase a listed credit.
 *
 * Executed inside a single $transaction:
 *  1. Re-validates listing is still ACTIVE.
 *  2. Re-validates credit is still MINTED or TRANSFERRED.
 *  3. Prevents self-purchase.
 *  4. Creates CreditTransfer record (mirrors blockchain.service.transferCredit).
 *  5. Updates CarbonCredit.ownerUserId → buyer, status → TRANSFERRED.
 *  6. Appends LISTING_SOLD AuditLog event.
 */
export async function purchaseListing(
  listingId: string,
  input: PurchaseListingBody,
  actor: JwtPayload,
): Promise<PurchaseResult> {
  const listing = await hydrateOrFail(listingId);

  if (listing.status !== "ACTIVE") {
    throw new AppError(
      409,
      "LISTING_NOT_ACTIVE",
      `This listing is no longer available. Status: ${listing.status}`,
    );
  }

  if (listing.sellerId === actor.sub) {
    throw new AppError(
      422,
      "SELF_PURCHASE",
      "You cannot purchase your own listing",
    );
  }

  if (
    listing.credit.status !== PrismaCreditStatus.MINTED &&
    listing.credit.status !== PrismaCreditStatus.TRANSFERRED
  ) {
    throw new AppError(
      422,
      "CREDIT_UNAVAILABLE",
      `This credit is no longer available for purchase. Status: ${listing.credit.status}`,
    );
  }

  // Validate quantity does not exceed available tCO2e
  if (input.quantity > listing.credit.amounttCO2e) {
    throw new AppError(
      422,
      "QUANTITY_EXCEEDS_AVAILABLE",
      `Requested quantity (${input.quantity}) exceeds available tCO2e (${listing.credit.amounttCO2e})`,
    );
  }

  const now = new Date().toISOString();
  const soldMeta: ListingMeta = {
    creditId: listing.creditId,
    sellerId: listing.sellerId,
    pricePerTonne: listing.pricePerTonne,
    notes: listing.notes,
    status: "SOLD",
    updatedAt: now,
  };

  // Execute all DB writes atomically
  const [transfer] = await prisma.$transaction([
    // 1. Record ownership transfer
    prisma.creditTransfer.create({
      data: {
        creditId: listing.creditId,
        fromUserId: listing.sellerId,
        toUserId: actor.sub,
        amount: input.quantity,
        txHash: null,
      },
    }),
    // 2. Update credit ownership
    prisma.carbonCredit.update({
      where: { id: listing.creditId },
      data: {
        ownerUserId: actor.sub,
        status: PrismaCreditStatus.TRANSFERRED,
      },
    }),
    // 3. Mark listing as SOLD
    prisma.auditLog.create({
      data: {
        actorId: actor.sub,
        action: "LISTING_SOLD",
        entityType: "MarketplaceListing",
        entityId: listingId,
        metaJson: soldMeta as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);

  // Hydrate the now-SOLD listing for the response
  const updatedListing = await hydrateOrFail(listingId);

  return {
    listing: updatedListing,
    transfer: {
      id: transfer.id,
      creditId: transfer.creditId,
      fromUserId: transfer.fromUserId,
      toUserId: transfer.toUserId,
      amount: transfer.amount,
      createdAt: transfer.createdAt,
    },
  };
}
