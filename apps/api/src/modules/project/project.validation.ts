import { z } from "zod";
import { EcosystemType, ProjectStatus } from "@bluechain/shared";

// ─── Reusable field definitions ───────────────────────────────────────────────

const title = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(200, "Title must be at most 200 characters");

const description = z
  .string()
  .trim()
  .max(2000, "Description must be at most 2000 characters")
  .optional();

const orgId = z
  .string()
  .trim()
  .min(1, "orgId is required");

const ecosystemType = z.enum(
  Object.values(EcosystemType) as [string, ...string[]],
  { errorMap: () => ({ message: "ecosystemType must be MANGROVE, SEAGRASS, or SALT_MARSH" }) },
);

const status = z.enum(
  Object.values(ProjectStatus) as [string, ...string[]],
  { errorMap: () => ({ message: "Invalid project status" }) },
);

const methodology = z
  .string()
  .trim()
  .max(500, "Methodology must be at most 500 characters")
  .optional();

const areaHa = z
  .number({ invalid_type_error: "areaHa must be a number" })
  .nonnegative("areaHa must be zero or positive")
  .optional();

const boundaryGeoJson = z.record(z.unknown()).optional();

const startDate = z.coerce
  .date({ invalid_type_error: "startDate must be a valid ISO date string" })
  .optional();

const stateCode = z
  .string()
  .trim()
  .length(2, "stateCode must be a 2-character state code")
  .toUpperCase()
  .optional();

// ─── Schemas ─────────────────────────────────────────────────────────────────

/** POST /v1/projects — NGO_MANAGER creates a new project */
export const createProjectSchema = z.object({
  title,
  orgId,
  ecosystemType,
  description,
  methodology,
  areaHa,
  boundaryGeoJson,
  startDate,
  stateCode,
});

/** PUT /v1/projects/:id — all fields optional, status allowed for admins */
export const updateProjectSchema = z
  .object({
    title,
    ecosystemType,
    status,
    description,
    methodology,
    areaHa,
    boundaryGeoJson,
    startDate,
    stateCode,
  })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" },
  );

/** GET /v1/projects — optional filters + pagination */
export const listProjectsQuerySchema = z.object({
  status: z
    .enum(Object.values(ProjectStatus) as [string, ...string[]])
    .optional(),
  ecosystemType: z
    .enum(Object.values(EcosystemType) as [string, ...string[]])
    .optional(),
  orgId: z.string().trim().optional(),
  stateCode: z.string().trim().toUpperCase().optional(),
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

export type CreateProjectBody = z.infer<typeof createProjectSchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
