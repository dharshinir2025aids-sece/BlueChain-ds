import { z } from "zod";
import { CreditStatus, EcosystemType } from "@bluechain/shared";

// ─── Reusable field definitions ───────────────────────────────────────────────

const pricePerTonne = z
  .number({ invalid_type_error: "pricePerTonne must be a number" })
  .positive("pricePerTonne must be greater than 0");

const quantity = z
  .number({ invalid_type_error: "quantity must be a number" })
  .positive("quantity must be greater than 0");

const notes = z
  .string()
  .trim()
  .max(1000, "notes must be at most 1000 characters")
  .optional();

// ─── Listing schemas ──────────────────────────────────────────────────────────

/**
 * POST /v1/marketplace/listings
 *
 * Creates a marketplace listing for a MINTED or TRANSFERRED credit.
 * Only the current owner of the credit may list it.
 * Business rules enforced in the service layer:
 *  - credit must be MINTED or TRANSFERRED
 *  - credit must not already have an active listing
 *  - caller must be the ownerUserId on the credit
 */
export const createListingSchema = z.object({
  creditId: z.string().trim().min(1, "creditId is required"),
  pricePerTonne,
  notes,
});

/**
 * PUT /v1/marketplace/listings/:id
 *
 * Updates price or notes on an active listing.
 * Only the seller (credit owner) may update their own listing.
 * At least one field required.
 */
export const updateListingSchema = z
  .object({
    pricePerTonne,
    notes,
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * GET /v1/marketplace/listings — browse available listings
 * Open to all authenticated users.
 */
export const listListingsQuerySchema = z.object({
  ecosystemType: z
    .enum(Object.values(EcosystemType) as [string, ...string[]])
    .optional(),
  vintageYear: z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .optional(),
  minPrice: z.coerce
    .number()
    .positive("minPrice must be greater than 0")
    .optional(),
  maxPrice: z.coerce
    .number()
    .positive("maxPrice must be greater than 0")
    .optional(),
  projectId: z.string().trim().optional(),
  sellerId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Purchase schema ──────────────────────────────────────────────────────────

/**
 * POST /v1/marketplace/listings/:id/purchase
 *
 * Purchases a listed credit.  The buyer becomes the new owner via a
 * CreditTransfer record (same mechanism as blockchain.service.transferCredit).
 * Enforced in the service:
 *  - listing must be active (not cancelled)
 *  - credit must not be RETIRED
 *  - buyer cannot be the current owner (no self-purchase)
 *  - quantity validated against amounttCO2e on the credit
 */
export const purchaseListingSchema = z.object({
  quantity,
  notes,
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateListingBody = z.infer<typeof createListingSchema>;
export type UpdateListingBody = z.infer<typeof updateListingSchema>;
export type ListListingsQuery = z.infer<typeof listListingsQuerySchema>;
export type PurchaseListingBody = z.infer<typeof purchaseListingSchema>;

// ─── In-memory listing status (no schema change needed) ───────────────────────
// A listing is derived from a CarbonCredit + the MarketplaceListing record.
// Status is stored as a plain string field on the listing row.

/** All valid listing statuses. */
export const LISTING_STATUSES = ["ACTIVE", "CANCELLED", "SOLD"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

/** Zod enum constructed from the listing statuses (for filter validation). */
export const listingStatusEnum = z.enum(LISTING_STATUSES);

// Re-export CreditStatus for convenient use in the service
export { CreditStatus };
