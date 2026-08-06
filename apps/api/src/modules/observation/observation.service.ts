import type { Observation, Prisma } from "@prisma/client";
import { ObservationType as PrismaObservationType } from "@prisma/client";
import { Role } from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { JwtPayload } from "../../lib/jwt";
import type {
  CreateObservationBody,
  ListObservationsQuery,
  UpdateObservationBody,
} from "./observation.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Observation row enriched with its parent plot and worker summary. */
export type ObservationDetail = Observation & {
  plot: {
    id: string;
    name: string;
    projectId: string;
  };
  worker: {
    id: string;
    name: string;
    email: string;
  };
  _count: { media: number };
};

/** Paginated list response shape. */
export interface ObservationList {
  items: ObservationDetail[];
  total: number;
  page: number;
  limit: number;
}

// ─── Include clause (reused across queries) ───────────────────────────────────

const OBSERVATION_INCLUDE = {
  plot: {
    select: {
      id: true,
      name: true,
      projectId: true,
    },
  },
  worker: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: { select: { media: true } },
} satisfies Prisma.ObservationInclude;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify the plot exists and return its projectId so we can resolve
 * the parent organisation for ownership checks.
 */
async function resolvePlot(
  plotId: string,
): Promise<{ id: string; projectId: string; project: { orgId: string } }> {
  const plot = await prisma.plot.findUnique({
    where: { id: plotId },
    select: {
      id: true,
      projectId: true,
      project: { select: { orgId: true } },
    },
  });
  if (!plot) {
    throw new AppError(404, "PLOT_NOT_FOUND", "Plot not found");
  }
  return plot;
}

/**
 * Load a single observation and throw 404 when missing.
 */
async function findOrFail(id: string): Promise<ObservationDetail> {
  const obs = await prisma.observation.findUnique({
    where: { id },
    include: OBSERVATION_INCLUDE,
  });
  if (!obs) {
    throw new AppError(
      404,
      "OBSERVATION_NOT_FOUND",
      "Observation not found",
    );
  }
  return obs as unknown as ObservationDetail;
}

/**
 * Authorisation rules for mutations:
 *   FIELD_WORKER  — may only touch their own observations
 *   NGO_MANAGER   — may only touch observations whose plot belongs to their org
 *   NCCR_ADMIN / SUPER_ADMIN — unrestricted
 */
async function assertMutationAccess(
  obs: ObservationDetail,
  actor: JwtPayload,
): Promise<void> {
  if (
    actor.role === Role.FIELD_WORKER &&
    obs.workerId !== actor.sub
  ) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only modify your own observations",
    );
  }

  if (actor.role === Role.NGO_MANAGER) {
    // Resolve the org that owns the parent project
    const actorUser = await prisma.user.findUnique({
      where: { id: actor.sub },
      select: { orgId: true },
    });
    const plotInfo = await prisma.plot.findUnique({
      where: { id: obs.plotId },
      select: { project: { select: { orgId: true } } },
    });
    if (actorUser?.orgId !== plotInfo?.project.orgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only modify observations that belong to your organisation's plots",
      );
    }
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Create a new observation.
 * workerId is always the authenticated actor (FIELD_WORKER creates their own records).
 * NCCR_ADMIN / SUPER_ADMIN may also create on behalf of any worker — workerId
 * defaults to actor.sub and the plot access check still applies.
 */
export async function createObservation(
  input: CreateObservationBody,
  actor: JwtPayload,
): Promise<ObservationDetail> {
  // Confirm plot exists (throws 404 otherwise)
  await resolvePlot(input.plotId);

  return prisma.observation.create({
    data: {
      plotId: input.plotId,
      workerId: actor.sub,
      type: (input.type ?? "GENERAL") as PrismaObservationType,
      observedAt: input.observedAt ?? new Date(),
      metricsJson: input.metricsJson as Prisma.InputJsonValue | undefined,
      notes: input.notes,
      gpsLat: input.gpsLat,
      gpsLng: input.gpsLng,
    },
    include: OBSERVATION_INCLUDE,
  }) as unknown as Promise<ObservationDetail>;
}

/**
 * List observations with optional filters (plotId, type, workerId, date range)
 * and pagination.
 *
 * FIELD_WORKER sees only their own observations.
 * All higher roles see all observations (subject to supplied filters).
 */
export async function listObservations(
  query: ListObservationsQuery,
  actor: JwtPayload,
): Promise<ObservationList> {
  const { plotId, type, workerId, startDate, endDate, page, limit } = query;

  // Field workers are scoped to their own records regardless of query param
  const effectiveWorkerId =
    actor.role === Role.FIELD_WORKER ? actor.sub : workerId;

  const where: Prisma.ObservationWhereInput = {
    ...(plotId && { plotId }),
    ...(type && { type: type as PrismaObservationType }),
    ...(effectiveWorkerId && { workerId: effectiveWorkerId }),
    ...(startDate || endDate
      ? {
          observedAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.observation.findMany({
      where,
      include: OBSERVATION_INCLUDE,
      orderBy: { observedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.observation.count({ where }),
  ]);

  return { items: items as unknown as ObservationDetail[], total, page, limit };
}

/**
 * Get a single observation by id.
 * FIELD_WORKER may only read their own observation.
 */
export async function getObservationById(
  id: string,
  actor: JwtPayload,
): Promise<ObservationDetail> {
  const obs = await findOrFail(id);

  if (actor.role === Role.FIELD_WORKER && obs.workerId !== actor.sub) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only view your own observations",
    );
  }

  return obs;
}

/**
 * Update mutable fields on an observation.
 * plotId and workerId are immutable after creation.
 */
export async function updateObservation(
  id: string,
  input: UpdateObservationBody,
  actor: JwtPayload,
): Promise<ObservationDetail> {
  const obs = await findOrFail(id);
  await assertMutationAccess(obs, actor);

  return prisma.observation.update({
    where: { id },
    data: {
      ...(input.type !== undefined && {
        type: input.type as PrismaObservationType,
      }),
      ...(input.observedAt !== undefined && { observedAt: input.observedAt }),
      ...(input.metricsJson !== undefined && {
        metricsJson: input.metricsJson as Prisma.InputJsonValue,
      }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.gpsLat !== undefined && { gpsLat: input.gpsLat }),
      ...(input.gpsLng !== undefined && { gpsLng: input.gpsLng }),
    },
    include: OBSERVATION_INCLUDE,
  }) as unknown as Promise<ObservationDetail>;
}

/**
 * Delete an observation.
 * Cascades to MediaAsset via schema's onDelete: SetNull rule.
 */
export async function deleteObservation(
  id: string,
  actor: JwtPayload,
): Promise<void> {
  const obs = await findOrFail(id);
  await assertMutationAccess(obs, actor);
  await prisma.observation.delete({ where: { id } });
}
