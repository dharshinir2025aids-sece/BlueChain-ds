import type { Plot, Prisma } from "@prisma/client";
import { Role } from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { JwtPayload } from "../../lib/jwt";
import type {
  CreatePlotBody,
  ListPlotsQuery,
  UpdatePlotBody,
} from "./plot.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Plot row enriched with its parent project and aggregate counts. */
export type PlotDetail = Plot & {
  project: {
    id: string;
    title: string;
    orgId: string;
    ecosystemType: string;
    status: string;
  };
  _count: { observations: number };
};

/** Paginated list response shape. */
export interface PlotList {
  items: PlotDetail[];
  total: number;
  page: number;
  limit: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve actor's orgId from DB (not stored in JWT to keep tokens small). */
async function resolveActorOrgId(actorId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: actorId },
    select: { orgId: true },
  });
  return user?.orgId ?? null;
}

/**
 * Load the parent project of a plot and verify it exists.
 * Throws 404 when the project is missing.
 */
async function resolveParentProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, orgId: true },
  });
  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Parent project not found");
  }
  return project;
}

/**
 * Ownership check: NGO_MANAGERs may only mutate plots whose parent project
 * belongs to their own organisation. NCCR_ADMIN and SUPER_ADMIN are unrestricted.
 */
function assertPlotOwnership(
  projectOrgId: string,
  actorRole: Role,
  actorOrgId: string | null,
): void {
  if (actorRole === Role.NGO_MANAGER && projectOrgId !== actorOrgId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only modify plots that belong to your organisation's projects",
    );
  }
}

/**
 * Build the GeoJSON blob stored in geometryGeoJson.
 * When the caller supplies village/district/stateCode we embed them in a
 * `properties` key so the data is persisted without a schema change.
 */
function buildGeometryJson(
  boundaryGeoJson: Record<string, unknown> | undefined,
  annotations: {
    village?: string;
    district?: string;
    stateCode?: string;
  },
): Prisma.InputJsonValue | undefined {
  const hasAnnotations =
    annotations.village || annotations.district || annotations.stateCode;

  if (!boundaryGeoJson && !hasAnnotations) return undefined;

  const base: Record<string, unknown> = boundaryGeoJson ?? {};

  if (hasAnnotations) {
    const existing =
      typeof base.properties === "object" && base.properties !== null
        ? (base.properties as Record<string, unknown>)
        : {};
    base.properties = {
      ...existing,
      ...(annotations.village !== undefined && {
        village: annotations.village,
      }),
      ...(annotations.district !== undefined && {
        district: annotations.district,
      }),
      ...(annotations.stateCode !== undefined && {
        stateCode: annotations.stateCode,
      }),
    };
  }

  return base as Prisma.InputJsonValue;
}

// ─── Include clause (reused across queries) ───────────────────────────────────

const PLOT_INCLUDE = {
  project: {
    select: {
      id: true,
      title: true,
      orgId: true,
      ecosystemType: true,
      status: true,
    },
  },
  _count: { select: { observations: true } },
} satisfies Prisma.PlotInclude;

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Create a plot under an existing project.
 * NGO_MANAGER must own the parent project's organisation.
 */
export async function createPlot(
  input: CreatePlotBody,
  actor: JwtPayload,
): Promise<PlotDetail> {
  const project = await resolveParentProject(input.projectId);

  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    assertPlotOwnership(project.orgId, actor.role, actorOrgId);
  }

  const geometryGeoJson = buildGeometryJson(input.boundaryGeoJson, {
    village: input.village,
    district: input.district,
    stateCode: input.stateCode,
  });

  return prisma.plot.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      areaHa: input.areaHa ?? 0,
      centroidLat: input.latitude,
      centroidLng: input.longitude,
      geometryGeoJson,
    },
    include: PLOT_INCLUDE,
  }) as Promise<PlotDetail>;
}

/**
 * List plots with optional filter by projectId, paginated.
 * All authenticated roles may list plots.
 */
export async function listPlots(query: ListPlotsQuery): Promise<PlotList> {
  const { projectId, page, limit } = query;

  const where: Prisma.PlotWhereInput = {
    ...(projectId && { projectId }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.plot.findMany({
      where,
      include: PLOT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.plot.count({ where }),
  ]);

  return { items: items as PlotDetail[], total, page, limit };
}

/**
 * Get a single plot by id.
 * Includes parent project details and observation count.
 */
export async function getPlotById(id: string): Promise<PlotDetail> {
  const plot = await prisma.plot.findUnique({
    where: { id },
    include: PLOT_INCLUDE,
  });

  if (!plot) {
    throw new AppError(404, "PLOT_NOT_FOUND", "Plot not found");
  }

  return plot as PlotDetail;
}

/**
 * Update a plot's mutable fields.
 * Ownership enforced for NGO_MANAGERs via parent project's orgId.
 */
export async function updatePlot(
  id: string,
  input: UpdatePlotBody,
  actor: JwtPayload,
): Promise<PlotDetail> {
  const plot = await prisma.plot.findUnique({
    where: { id },
    select: { id: true, projectId: true, geometryGeoJson: true },
  });
  if (!plot) {
    throw new AppError(404, "PLOT_NOT_FOUND", "Plot not found");
  }

  const project = await resolveParentProject(plot.projectId);
  const actorOrgId = await resolveActorOrgId(actor.sub);
  assertPlotOwnership(project.orgId, actor.role, actorOrgId);

  // Merge geometryGeoJson: start from existing, then overlay incoming
  const existingGeo =
    plot.geometryGeoJson &&
    typeof plot.geometryGeoJson === "object" &&
    !Array.isArray(plot.geometryGeoJson)
      ? (plot.geometryGeoJson as Record<string, unknown>)
      : undefined;

  const geometryGeoJson = buildGeometryJson(
    input.boundaryGeoJson ?? existingGeo,
    {
      village: input.village,
      district: input.district,
      stateCode: input.stateCode,
    },
  );

  return prisma.plot.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.areaHa !== undefined && { areaHa: input.areaHa }),
      ...(input.latitude !== undefined && { centroidLat: input.latitude }),
      ...(input.longitude !== undefined && { centroidLng: input.longitude }),
      ...(geometryGeoJson !== undefined && { geometryGeoJson }),
    },
    include: PLOT_INCLUDE,
  }) as Promise<PlotDetail>;
}

/**
 * Delete a plot.
 * Cascades to observations via the schema's onDelete: Cascade rule.
 * Ownership enforced for NGO_MANAGERs.
 */
export async function deletePlot(
  id: string,
  actor: JwtPayload,
): Promise<void> {
  const plot = await prisma.plot.findUnique({
    where: { id },
    select: { id: true, projectId: true },
  });
  if (!plot) {
    throw new AppError(404, "PLOT_NOT_FOUND", "Plot not found");
  }

  const project = await resolveParentProject(plot.projectId);
  const actorOrgId = await resolveActorOrgId(actor.sub);
  assertPlotOwnership(project.orgId, actor.role, actorOrgId);

  await prisma.plot.delete({ where: { id } });
}
