<<<<<<< HEAD
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

const app = express();
const allowedOrigins = new Set([env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"]);

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(hpp());
app.use(morgan("dev"));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
=======
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import { sanitizeInput } from "./middlewares/sanitize.js";
import { router } from "./routes/index.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(hpp());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", name: "KRIAR API" });
});

app.use("/api/v1", router);
app.use(notFound);
app.use(errorHandler);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
