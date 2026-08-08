import { z } from "zod";
import { ReportStatus } from "@bluechain/shared";

// ─── Reusable field definitions ───────────────────────────────────────────────

const projectId = z.string().trim().min(1, "projectId is required");

const periodStart = z.coerce.date({
  invalid_type_error: "periodStart must be a valid ISO date string",
});

const periodEnd = z.coerce.date({
  invalid_type_error: "periodEnd must be a valid ISO date string",
});

const status = z.enum(
  Object.values(ReportStatus) as [string, ...string[]],
  {
    errorMap: () => ({
      message:
        "status must be DRAFT, SUBMITTED, IN_VERIFICATION, APPROVED, REJECTED, or CHANGES_REQUESTED",
    }),
  },
);

const summaryJson = z.record(z.unknown()).optional();

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

// ─── Schemas ──────────────────────────────────────────────────────────────────

/**
 * POST /v1/monitoring-reports
 * NGO_MANAGER / NCCR_ADMIN / SUPER_ADMIN create a report for a project.
 * `submittedBy` is always resolved from the JWT — not accepted from the body.
 */
export const createMonitoringReportSchema = z
  .object({
    projectId,
    periodStart,
    periodEnd,
    summaryJson,
    ipfsCid,
    contentHash,
  })
  .refine((d) => d.periodEnd > d.periodStart, {
    message: "periodEnd must be after periodStart",
    path: ["periodEnd"],
  });

/**
 * PUT /v1/monitoring-reports/:id
 * All mutable fields are optional; at least one must be supplied.
 * Status transitions are validated in the service layer.
 */
export const updateMonitoringReportSchema = z
  .object({
    periodStart,
    periodEnd,
    status,
    summaryJson,
    ipfsCid,
    contentHash,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * GET /v1/monitoring-reports
 * Optional filters + pagination, following the observation/project pattern.
 */
export const listMonitoringReportsQuerySchema = z.object({
  projectId: z.string().trim().optional(),
  status: z
    .enum(Object.values(ReportStatus) as [string, ...string[]])
    .optional(),
  submittedBy: z.string().trim().optional(),
  startDate: z.coerce
    .date({ invalid_type_error: "startDate must be a valid ISO date string" })
    .optional(),
  endDate: z.coerce
    .date({ invalid_type_error: "endDate must be a valid ISO date string" })
    .optional(),
  page: z.coerce
    .number()
    .int()
    .min(1, "page must be at least 1")
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "limit must be at least 1")
    .max(100, "limit must be at most 100")
    .default(20),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateMonitoringReportBody = z.infer<
  typeof createMonitoringReportSchema
>;
export type UpdateMonitoringReportBody = z.infer<
  typeof updateMonitoringReportSchema
>;
export type ListMonitoringReportsQuery = z.infer<
  typeof listMonitoringReportsQuerySchema
>;
