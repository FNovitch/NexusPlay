import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { login, me, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "./schemas.js";

export const authRoutes = Router();

const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Muitas tentativas. Tente novamente em alguns minutos." }
});

authRoutes.post("/register", validate(registerSchema), asyncHandler(register));
authRoutes.post("/login", authLoginLimiter, validate(loginSchema), asyncHandler(login));
authRoutes.get("/me", authenticate, asyncHandler(me));
