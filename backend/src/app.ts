import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { router } from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { sanitizeInput } from "./middlewares/sanitize.js";
import { uploadRoot } from "./middlewares/upload.js";

const app = express();
const devOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
];
const configuredOrigins = (env.CORS_ORIGINS ?? env.FRONTEND_URL)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set(env.NODE_ENV === "production" ? configuredOrigins : [...configuredOrigins, ...devOrigins]);

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(hpp());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/$/, "");
      if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
if (env.NODE_ENV !== "production") {
  app.use(
    "/uploads",
    express.static(uploadRoot, {
      setHeaders(res) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    })
  );
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      details: env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    });
  }
});

app.use("/api/v1", router);

app.use(notFound);
app.use(errorHandler);

export default app;
