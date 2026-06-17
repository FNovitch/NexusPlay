import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runtimeNodeEnv = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "production"
  ? process.env.NODE_ENV
  : "development";

const envFileNames = [`.env.${runtimeNodeEnv}`, ".env"];
const envPaths = envFileNames.flatMap((fileName) => [
  path.resolve(process.cwd(), fileName),
  path.resolve(__dirname, "../../", fileName),
  path.resolve(__dirname, "../../../", fileName),
]);

for (const candidate of envPaths) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
  }
}

function databaseSchema(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);
    return parsed.searchParams.get("schema")?.trim();
  } catch {
    return undefined;
  }
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  DATABASE_SCHEMA: z.string().default("nexusplay"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  BACKEND_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGINS: z.string().optional(),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_PUBLIC_KEY: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("nexusplay/products"),
  MELHOR_ENVIO_BASE_URL: z.string().url().default("https://sandbox.melhorenvio.com.br/api"),
  MELHOR_ENVIO_TOKEN: z.string().optional(),
  MELHOR_ENVIO_CLIENT_ID: z.string().optional(),
  MELHOR_ENVIO_CLIENT_SECRET: z.string().optional(),
  MELHOR_ENVIO_REDIRECT_URL: z.string().url().optional(),
  MELHOR_ENVIO_SANDBOX: z.coerce.boolean().default(true),
  MELHOR_ENVIO_USER_AGENT: z.string().default("NexusPlay Marketplace (suporte@nexusplay.demo)"),
  MELHOR_ENVIO_CEP_ORIGEM: z.string().default("55900000"),
}).superRefine((value, ctx) => {
  const schema = databaseSchema(value.DATABASE_URL);
  const expectedSchema = value.DATABASE_SCHEMA.trim();

  if (!expectedSchema || expectedSchema.toLowerCase() === "public") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_SCHEMA"],
      message: "DATABASE_SCHEMA deve ser um schema exclusivo do NexusPlay, por exemplo nexusplay."
    });
  }

  if (!schema || schema.toLowerCase() === "public") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message: "Configure DATABASE_URL com schema dedicado para NexusPlay, por exemplo schema=nexusplay."
    });
  } else if (expectedSchema && schema !== expectedSchema) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message: "O schema da DATABASE_URL deve ser igual a DATABASE_SCHEMA para evitar uso acidental de outro projeto."
    });
  }

  if (value.NODE_ENV !== "production") return;

  if (value.MERCADO_PAGO_ACCESS_TOKEN && !value.MERCADO_PAGO_WEBHOOK_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["MERCADO_PAGO_WEBHOOK_SECRET"],
      message: "MERCADO_PAGO_WEBHOOK_SECRET e obrigatoria quando Mercado Pago estiver ativo em producao."
    });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Erro ao carregar variaveis de ambiente do backend:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
