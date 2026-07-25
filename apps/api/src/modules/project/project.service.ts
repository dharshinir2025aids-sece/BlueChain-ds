import type { Prisma, Project } from "@prisma/client";
import { Role } from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { JwtPayload } from "../../lib/jwt";
import type {
  CreateProjectBody,
  ListProjectsQuery,
  UpdateProjectBody,
} from "./project.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Full project row with its organisation and aggregate counts. */
export type ProjectDetail = Project & {
  organization: { id: string; name: string; type: string };
  _count: { plots: number; reports: number };
};

/** Paginated list response shape. */
export interface ProjectList {
  items: Project[];
  total: number;
  page: number;
  limit: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves the actor's orgId from the database.
 * JwtPayload intentionally excludes orgId to keep tokens small; we fetch it
 * on demand only when an ownership check is required.
 */
async function resolveActorOrgId(actorId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: actorId },
    select: { orgId: true },
  });
  return user?.orgId ?? null;
}

/**
 * Throws 403 if the actor is an NGO_MANAGER whose orgId does not match the
 * project's orgId. SUPER_ADMIN and NCCR_ADMIN may mutate any project.
 */
function assertOwnership(
  project: Project,
  actorRole: Role,
  actorOrgId: string | null,
): void {
  if (actorRole === Role.NGO_MANAGER && project.orgId !== actorOrgId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only modify projects that belong to your organisation",
    );
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Create a new project.
 * Verifies the target organisation exists before inserting.
 */
export async function createProject(
  input: CreateProjectBody,
  actor: JwtPayload,
): Promise<Project> {
  // Verify organisation exists
  const org = await prisma.organization.findUnique({
    where: { id: input.orgId },
  });
  if (!org) {
    throw new AppError(404, "ORG_NOT_FOUND", "Organisation not found");
  }

  // NGO_MANAGER can only create projects under their own org
  if (actor.role === Role.NGO_MANAGER) {
    const actorOrgId = await resolveActorOrgId(actor.sub);
    if (input.orgId !== actorOrgId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only create projects for your own organisation",
      );
    }
  }

  return prisma.project.create({
    data: {
      title: input.title,
      orgId: input.orgId,
      ecosystemType: input.ecosystemType as Prisma.ProjectCreateInput["ecosystemType"],
      description: input.description,
      methodology: input.methodology,
      areaHa: input.areaHa ?? 0,
      boundaryGeoJson: input.boundaryGeoJson
        ? (input.boundaryGeoJson as Prisma.InputJsonValue)
        : undefined,
      startDate: input.startDate,
      stateCode: input.stateCode,
      createdById: actor.sub,
    },
  });
}

/**
 * List projects with optional filters and pagination.
 * Returns items + total count for the caller to build pagination metadata.
 */
export async function listProjects(
  query: ListProjectsQuery,
): Promise<ProjectList> {
  const { status, ecosystemType, orgId, stateCode, page, limit } = query;

  const where: Prisma.ProjectWhereInput = {
    ...(status && { status: status as Prisma.ProjectWhereInput["status"] }),
    ...(ecosystemType && {
      ecosystemType: ecosystemType as Prisma.ProjectWhereInput["ecosystemType"],
    }),
    ...(orgId && { orgId }),
    ...(stateCode && { stateCode }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return { items, total, page, limit };
}

/**
 * Get a single project by id.
 * Includes organisation details and aggregate counts for plots and reports.
 */
export async function getProjectById(id: string): Promise<ProjectDetail> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, name: true, type: true } },
      _count: { select: { plots: true, reports: true } },
    },
  });

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  return project;
}

/**
 * Update a project's mutable fields.
 * Ownership is enforced: NGO_MANAGERs can only update their own org's projects.
 */
export async function updateProject(
  id: string,
  input: UpdateProjectBody,
  actor: JwtPayload,
): Promise<Project> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  const actorOrgId = await resolveActorOrgId(actor.sub);
  assertOwnership(project, actor.role, actorOrgId);

  return prisma.project.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.ecosystemType !== undefined && {
        ecosystemType: input.ecosystemType as Prisma.ProjectUpdateInput["ecosystemType"],
      }),
      ...(input.status !== undefined && {
        status: input.status as Prisma.ProjectUpdateInput["status"],
      }),
      ...(input.methodology !== undefined && { methodology: input.methodology }),
      ...(input.areaHa !== undefined && { areaHa: input.areaHa }),
      ...(input.boundaryGeoJson !== undefined && {
        boundaryGeoJson: input.boundaryGeoJson as Prisma.InputJsonValue,
      }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.stateCode !== undefined && { stateCode: input.stateCode }),
    },
  });
}

/**
 * Delete a project.
 * Only DRAFT projects may be deleted to protect data integrity.
 * Ownership is enforced for NGO_MANAGERs.
 */
export async function deleteProject(
  id: string,
  actor: JwtPayload,
): Promise<void> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  const actorOrgId = await resolveActorOrgId(actor.sub);
  assertOwnership(project, actor.role, actorOrgId);

  if (project.status !== "DRAFT") {
    throw new AppError(
      409,
      "PROJECT_NOT_DELETABLE",
      "Only DRAFT projects can be deleted. Archive or close the project instead.",
    );
  }

  await prisma.project.delete({ where: { id } });
}
