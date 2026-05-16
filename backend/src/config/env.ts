import dotenv from "dotenv";
<<<<<<< HEAD
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env")
];

const envPath = envPaths.find((candidate) => fs.existsSync(candidate));

dotenv.config(envPath ? { path: envPath } : undefined);
=======
import { z } from "zod";

dotenv.config();
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  BACKEND_URL: z.string().url().default("http://localhost:4000"),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
<<<<<<< HEAD
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Erro ao carregar variaveis de ambiente do backend:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
=======
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
