import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { listMonitoringReportsQuerySchema } from "./monitoringReport.validation";
import * as reportService from "./monitoringReport.service";

/** POST /v1/monitoring-reports */
export async function createMonitoringReport(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const report = await reportService.createMonitoringReport(
    req.body,
    req.user,
  );
  res.status(201).json({ success: true, data: report });
}

/** GET /v1/monitoring-reports */
export async function listMonitoringReports(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const query = listMonitoringReportsQuerySchema.parse(req.query);
  const result = await reportService.listMonitoringReports(query, req.user);
  res.status(200).json({ success: true, data: result });
}

/** GET /v1/monitoring-reports/:id */
export async function getMonitoringReport(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const report = await reportService.getMonitoringReportById(id, req.user);
  res.status(200).json({ success: true, data: report });
}

/** PUT /v1/monitoring-reports/:id */
export async function updateMonitoringReport(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const report = await reportService.updateMonitoringReport(
    id,
    req.body,
    req.user,
  );
  res.status(200).json({ success: true, data: report });
}

/** DELETE /v1/monitoring-reports/:id */
export async function deleteMonitoringReport(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  await reportService.deleteMonitoringReport(id, req.user);
  res.status(200).json({ success: true, data: null });
}
