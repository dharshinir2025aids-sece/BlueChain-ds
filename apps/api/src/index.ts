import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { healthRouter } from "./modules/health/health.router";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "BlueChain MRV API",
      version: "0.1.0",
      docs: "/v1/health",
    },
  });
});

app.use("/v1/health", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.API_PORT, env.API_HOST, () => {
  console.log(
    `[bluechain-api] listening on http://${env.API_HOST}:${env.API_PORT}`,
  );
});

export default app;
