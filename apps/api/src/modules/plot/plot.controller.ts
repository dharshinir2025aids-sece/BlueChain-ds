import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { listPlotsQuerySchema } from "./plot.validation";
import * as plotService from "./plot.service";

/** POST /v1/plots */
export async function createPlot(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const plot = await plotService.createPlot(req.body, req.user);
  res.status(201).json({ success: true, data: plot });
}

/** GET /v1/plots */
export async function listPlots(req: Request, res: Response) {
  const query = listPlotsQuerySchema.parse(req.query);
  const result = await plotService.listPlots(query);
  res.status(200).json({ success: true, data: result });
}

/** GET /v1/plots/:id */
export async function getPlot(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const plot = await plotService.getPlotById(id);
  res.status(200).json({ success: true, data: plot });
}

/** PUT /v1/plots/:id */
export async function updatePlot(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const plot = await plotService.updatePlot(id, req.body, req.user);
  res.status(200).json({ success: true, data: plot });
}

/** DELETE /v1/plots/:id */
export async function deletePlot(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  await plotService.deletePlot(id, req.user);
  res.status(200).json({ success: true, data: null });
}
