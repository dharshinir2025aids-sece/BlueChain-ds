import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { listProjectsQuerySchema } from "./project.validation";
import * as projectService from "./project.service";

/** POST /v1/projects */
export async function createProject(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const project = await projectService.createProject(req.body, req.user);
  res.status(201).json({ success: true, data: project });
}

/** GET /v1/projects */
export async function listProjects(req: Request, res: Response) {
  const query = listProjectsQuerySchema.parse(req.query);
  const result = await projectService.listProjects(query);
  res.status(200).json({ success: true, data: result });
}

/** GET /v1/projects/:id */
export async function getProject(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const project = await projectService.getProjectById(id);
  res.status(200).json({ success: true, data: project });
}

/** PUT /v1/projects/:id */
export async function updateProject(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const project = await projectService.updateProject(
    id,
    req.body,
    req.user,
  );
  res.status(200).json({ success: true, data: project });
}

/** DELETE /v1/projects/:id */
export async function deleteProject(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  await projectService.deleteProject(id, req.user);
  res.status(200).json({ success: true, data: null });
}
