import { z } from "zod";
import { CreditStatus } from "@bluechain/shared";

// ─── Reusable field definitions ───────────────────────────────────────────────

const txHash = z
  .string()
  .trim()
  .regex(/^0x[0-9a-fA-F]{64}$/, "txHash must be a 66-character hex string starting with 0x")
  .optional();

const ipfsCid = z
  .string()
  .trim()
  .max(128, "ipfsCid must be at most 128 characters")
  .optional();

const contentHash = z
  .string()
  .trim()
  .max(128, "contentHash must be at most 128 characters")
  .optional();

const network = z
  .string()
  .trim()
  .max(64, "network must be at most 64 characters")
  .default("polygon-amoy");

// ─── Anchor schema ────────────────────────────────────────────────────────────

/**
 * POST /v1/blockchain/:reportId/anchor
 *
 * Anchors an APPROVED MonitoringReport to the blockchain.
 * The report must be in APPROVED status — enforced in the service layer.
 *
 * The caller may optionally supply an already-recorded txHash (e.g. from a
 * front-end wallet submission) and/or an IPFS CID and content hash for the
 * report payload.  When no txHash is provided the service records a pending
 * anchor and marks txHash as null until confirmed externally.
 */
export const anchorReportSchema = z.object({
  txHash,
  ipfsCid,
  contentHash,
  network,
});

/**
 * POST /v1/blockchain/:reportId/confirm
 *
 * Confirms a pending ChainAnchor once the transaction has been mined.
 * Caller provides the definitive txHash and optional blockNumber.
 */
export const confirmAnchorSchema = z.object({
  txHash: z
    .string()
    .trim()
    .regex(/^0x[0-9a-fA-F]{64}$/, "txHash must be a 66-character hex string starting with 0x"),
  blockNumber: z
    .number({ invalid_type_error: "blockNumber must be a number" })
    .int()
    .nonnegative("blockNumber must be >= 0")
    .optional(),
  ipfsCid,
});

// ─── Credit schemas ───────────────────────────────────────────────────────────

/**
 * POST /v1/blockchain/credits
 *
 * Mints a new CarbonCredit record for an approved project.
 * Only NCCR_ADMIN and SUPER_ADMIN may mint.
 */
export const mintCreditSchema = z.object({
  projectId: z.string().trim().min(1, "projectId is required"),
  amounttCO2e: z
    .number({ invalid_type_error: "amounttCO2e must be a number" })
    .positive("amounttCO2e must be greater than 0"),
  vintageYear: z
    .number({ invalid_type_error: "vintageYear must be a number" })
    .int()
    .min(2000, "vintageYear must be >= 2000")
    .max(2100, "vintageYear must be <= 2100"),
  tokenId: z.string().trim().optional(),
  txMint: txHash,
  ipfsCid,
});

/**
 * POST /v1/blockchain/credits/:id/transfer
 *
 * Transfers ownership of a MINTED credit from one user to another.
 * Only NCCR_ADMIN and SUPER_ADMIN may initiate transfers.
 */
export const transferCreditSchema = z.object({
  toUserId: z.string().trim().min(1, "toUserId is required"),
  amount: z
    .number({ invalid_type_error: "amount must be a number" })
    .positive("amount must be greater than 0"),
  txHash,
});

/**
 * POST /v1/blockchain/credits/:id/retire
 *
 * Retires a MINTED or TRANSFERRED credit permanently.
 * CORPORATE_BUYER may retire credits they own; NCCR_ADMIN and SUPER_ADMIN
 * may retire any credit.
 */
export const retireCreditSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(500, "reason must be at most 500 characters")
    .optional(),
  txHash,
});

/**
 * GET /v1/blockchain/credits — optional filters + pagination
 */
export const listCreditsQuerySchema = z.object({
  projectId: z.string().trim().optional(),
  status: z
    .enum(Object.values(CreditStatus) as [string, ...string[]])
    .optional(),
  ownerUserId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type AnchorReportBody = z.infer<typeof anchorReportSchema>;
export type ConfirmAnchorBody = z.infer<typeof confirmAnchorSchema>;
export type MintCreditBody = z.infer<typeof mintCreditSchema>;
export type TransferCreditBody = z.infer<typeof transferCreditSchema>;
export type RetireCreditBody = z.infer<typeof retireCreditSchema>;
export type ListCreditsQuery = z.infer<typeof listCreditsQuerySchema>;
