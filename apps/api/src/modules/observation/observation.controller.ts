import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { listObservationsQuerySchema } from "./observation.validation";
import * as observationService from "./observation.service";

/** POST /v1/observations */
export async function createObservation(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const observation = await observationService.createObservation(
    req.body,
    req.user,
  );
  res.status(201).json({ success: true, data: observation });
}

/** GET /v1/observations */
export async function listObservations(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const query = listObservationsQuerySchema.parse(req.query);
  const result = await observationService.listObservations(query, req.user);
  res.status(200).json({ success: true, data: result });
}

/** GET /v1/observations/:id */
export async function getObservation(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const observation = await observationService.getObservationById(
    id,
    req.user,
  );
  res.status(200).json({ success: true, data: observation });
}

/** PUT /v1/observations/:id */
export async function updateObservation(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const observation = await observationService.updateObservation(
    id,
    req.body,
    req.user,
  );
  res.status(200).json({ success: true, data: observation });
}

/** DELETE /v1/observations/:id */
export async function deleteObservation(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  await observationService.deleteObservation(id, req.user);
  res.status(200).json({ success: true, data: null });
}
