import { z } from "zod";
import { VerificationDecision } from "@bluechain/shared";

/** GET /v1/verification */
export const listVerificationQuerySchema = z.object({
  status: z
    .enum(Object.values(VerificationDecision) as [string, ...string[]])
    .optional(),
  verifierId: z.string().trim().optional(),
  reportId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** POST /v1/verification/:id/decide */
export const decideVerificationSchema = z.object({
  decision: z.enum([
    VerificationDecision.APPROVED,
    VerificationDecision.REJECTED,
    VerificationDecision.CHANGES_REQUESTED,
  ] as [string, ...string[]]),
  comments: z.string().trim().max(2000).optional(),
});

export type ListVerificationQuery = z.infer<typeof listVerificationQuerySchema>;
export type DecideVerificationBody = z.infer<typeof decideVerificationSchema>;
