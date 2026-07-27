import "dotenv/config";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { healthRouter } from "./modules/health/health.router";
import { authRouter } from "./modules/auth/auth.router";
import { projectRouter } from "./modules/project/project.router";
import { plotRouter } from "./modules/plot/plot.router";

const app: Express = express();

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
app.use("/v1/auth", authRouter);
app.use("/v1/projects", projectRouter);
app.use("/v1/plots", plotRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.API_PORT, env.API_HOST, () => {
  console.log(
    `[bluechain-api] listening on http://${env.API_HOST}:${env.API_PORT}`,
  );
});

export default app;
