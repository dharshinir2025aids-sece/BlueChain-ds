import { z } from "zod";
import { ObservationType } from "@bluechain/shared";

// ─── Reusable field definitions ───────────────────────────────────────────────

const plotId = z.string().trim().min(1, "plotId is required");

const type = z.enum(
  Object.values(ObservationType) as [string, ...string[]],
  {
    errorMap: () => ({
      message:
        "type must be BIOMASS, WATER_QUALITY, PHOTO_SURVEY, SENSOR_READING, or GENERAL",
    }),
  },
);

const observedAt = z.coerce
  .date({ invalid_type_error: "observedAt must be a valid ISO date string" })
  .optional();

const metricsJson = z.record(z.unknown()).optional();

const notes = z
  .string()
  .trim()
  .max(2000, "notes must be at most 2000 characters")
  .optional();

const gpsLat = z
  .number({ invalid_type_error: "gpsLat must be a number" })
  .min(-90, "gpsLat must be >= -90")
  .max(90, "gpsLat must be <= 90")
  .optional();

const gpsLng = z
  .number({ invalid_type_error: "gpsLng must be a number" })
  .min(-180, "gpsLng must be >= -180")
  .max(180, "gpsLng must be <= 180")
  .optional();

// ─── Schemas ──────────────────────────────────────────────────────────────────

/** POST /v1/observations — FIELD_WORKER creates an observation */
export const createObservationSchema = z.object({
  plotId,
  type: type.optional(),
  observedAt,
  metricsJson,
  notes,
  gpsLat,
  gpsLng,
});

/** PUT /v1/observations/:id — all fields optional, at least one required */
export const updateObservationSchema = z
  .object({
    type,
    observedAt,
    metricsJson,
    notes,
    gpsLat,
    gpsLng,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/** GET /v1/observations — optional filters + pagination */
export const listObservationsQuerySchema = z.object({
  plotId: z.string().trim().optional(),
  type: z
    .enum(Object.values(ObservationType) as [string, ...string[]])
    .optional(),
  workerId: z.string().trim().optional(),
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

export type CreateObservationBody = z.infer<typeof createObservationSchema>;
export type UpdateObservationBody = z.infer<typeof updateObservationSchema>;
export type ListObservationsQuery = z.infer<typeof listObservationsQuerySchema>;
