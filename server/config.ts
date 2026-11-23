import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_ORIGIN: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32),
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().default("nexusgamer"),
  DB_USER: z.string().default("nexusgamer_app"),
  DB_PASSWORD: z.string(),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
});

export const config = environmentSchema.parse(process.env);
