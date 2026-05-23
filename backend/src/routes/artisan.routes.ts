import { Router } from "express";
import {
  getMyArtisanProfile,
  loginArtisan,
  registerArtisan,
  updateMyArtisanProfile
} from "../controllers/artisan.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireArtisan } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { artisanUpdateSchema, loginSchema, registerArtisanSchema } from "./schemas.js";

export const artisanRoutes = Router();

artisanRoutes.post("/artisans/register", validate(registerArtisanSchema), asyncHandler(registerArtisan));
artisanRoutes.post("/artisans/login", validate(loginSchema), asyncHandler(loginArtisan));
artisanRoutes.get("/artisans/me", authenticate, requireArtisan, asyncHandler(getMyArtisanProfile));
artisanRoutes.patch("/artisans/me", authenticate, requireArtisan, validate(artisanUpdateSchema), asyncHandler(updateMyArtisanProfile));
