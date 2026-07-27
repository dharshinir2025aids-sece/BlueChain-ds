import { z } from "zod";

// ─── Reusable field definitions ───────────────────────────────────────────────

const projectId = z.string().trim().min(1, "projectId is required");

const name = z
  .string()
  .trim()
  .min(2, "name must be at least 2 characters")
  .max(200, "name must be at most 200 characters");

const areaHa = z
  .number({ invalid_type_error: "areaHa must be a number" })
  .nonnegative("areaHa must be zero or positive")
  .optional();

// Schema validates the requested lat/lng fields.
// They map to centroidLat / centroidLng in the Plot model.
const latitude = z
  .number({ invalid_type_error: "latitude must be a number" })
  .min(-90, "latitude must be >= -90")
  .max(90, "latitude must be <= 90")
  .optional();

const longitude = z
  .number({ invalid_type_error: "longitude must be a number" })
  .min(-180, "longitude must be >= -180")
  .max(180, "longitude must be <= 180")
  .optional();

// geometryGeoJson maps to Plot.geometryGeoJson (Json?)
const boundaryGeoJson = z.record(z.unknown()).optional();

// village, district, stateCode are NOT columns on the Plot model —
// they live on the parent Project. We accept them as part of a freeform
// metricsJson-style annotation stored inside geometryGeoJson properties,
// or simply ignored. To stay schema-safe we accept them as optional
// metadata and forward them into geometryGeoJson.properties when supplied,
// so no schema modification is required.
const village = z.string().trim().max(100).optional();
const district = z.string().trim().max(100).optional();
const stateCode = z
  .string()
  .trim()
  .length(2, "stateCode must be a 2-character state code")
  .toUpperCase()
  .optional();

// ─── Schemas ──────────────────────────────────────────────────────────────────

/** POST /v1/plots */
export const createPlotSchema = z.object({
  projectId,
  name,
  areaHa,
  latitude,
  longitude,
  boundaryGeoJson,
  village,
  district,
  stateCode,
});

/** PUT /v1/plots/:id — all fields optional except at least one must be present */
export const updatePlotSchema = z
  .object({
    name,
    areaHa,
    latitude,
    longitude,
    boundaryGeoJson,
    village,
    district,
    stateCode,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/** GET /v1/plots — optional filters + pagination */
export const listPlotsQuerySchema = z.object({
  projectId: z.string().trim().optional(),
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

export type CreatePlotBody = z.infer<typeof createPlotSchema>;
export type UpdatePlotBody = z.infer<typeof updatePlotSchema>;
export type ListPlotsQuery = z.infer<typeof listPlotsQuerySchema>;
