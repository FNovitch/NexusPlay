import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runtimeNodeEnv = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "production"
  ? process.env.NODE_ENV
  : "development";

const envFileNames = [`.env.${runtimeNodeEnv}`, ".env"];
const envPaths = envFileNames.flatMap((fileName) => [
  path.resolve(process.cwd(), fileName),
  path.resolve(__dirname, "../", fileName),
  path.resolve(__dirname, "../../", fileName),
]);

for (const candidate of envPaths) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
  }
}

const databaseUrl = process.env.DATABASE_URL;
const expectedSchema = (process.env.DATABASE_SCHEMA ?? "nexusplay").trim();

function schemaFromUrl(url: string) {
  try {
    return new URL(url).searchParams.get("schema")?.trim();
  } catch {
    return undefined;
  }
}

const schema = databaseUrl ? schemaFromUrl(databaseUrl) : undefined;

if (!expectedSchema || expectedSchema.toLowerCase() === "public") {
  console.error("DATABASE_SCHEMA deve ser um schema exclusivo do NexusPlay, por exemplo nexusplay.");
  process.exit(1);
}

if (!schema || schema.toLowerCase() === "public") {
  console.error("Configure DATABASE_URL com schema dedicado para NexusPlay, por exemplo schema=nexusplay.");
  process.exit(1);
}

if (schema !== expectedSchema) {
  console.error("O schema da DATABASE_URL deve ser igual a DATABASE_SCHEMA para evitar uso acidental de outro projeto.");
  process.exit(1);
}
