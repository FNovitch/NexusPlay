import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "./schemas.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), asyncHandler(register));
authRoutes.post("/login", validate(loginSchema), asyncHandler(login));
authRoutes.get("/me", authenticate, asyncHandler(me));
