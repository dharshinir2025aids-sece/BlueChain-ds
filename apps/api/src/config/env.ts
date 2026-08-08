import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .default(
      "postgresql://bluechain:bluechain@localhost:5432/bluechain_mrv?schema=public",
    ),
  JWT_SECRET: z.string().default("dev-only-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // ─── Blockchain ────────────────────────────────────────────────────────────
  BLOCKCHAIN_NETWORK: z.string().default("polygon-amoy"),
  BLOCKCHAIN_RPC_URL: z
    .string()
    .default("https://rpc-amoy.polygon.technology"),
  REGISTRY_CONTRACT_ADDRESS: z.string().default(""),
  CREDIT_CONTRACT_ADDRESS: z.string().default(""),
  RETIREMENT_CONTRACT_ADDRESS: z.string().default(""),
});

export const env = envSchema.parse(process.env);
