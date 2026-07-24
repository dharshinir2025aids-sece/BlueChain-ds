import { Router, type Router as RouterType } from "express";
import type { HealthStatus } from "@bluechain/shared";

export const healthRouter: RouterType = Router();

healthRouter.get("/", (_req, res) => {
  const payload: HealthStatus = {
    service: "bluechain-api",
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: payload,
  });
});
