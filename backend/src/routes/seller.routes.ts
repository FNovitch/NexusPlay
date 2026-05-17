import { Router } from "express";
import { UserRole } from "@prisma/client";
import { dashboard, getSellerStore, listSellers, updateMySeller } from "../controllers/seller.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { sellerUpdateSchema } from "./schemas.js";

export const sellerRoutes = Router();

sellerRoutes.get("/sellers", asyncHandler(listSellers));
sellerRoutes.get("/sellers/:slug", asyncHandler(getSellerStore));
sellerRoutes.patch("/seller/me", authenticate, requireRole(UserRole.ARTISAN), validate(sellerUpdateSchema), asyncHandler(updateMySeller));
sellerRoutes.get("/seller/me/dashboard", authenticate, requireRole(UserRole.ARTISAN), asyncHandler(dashboard));
