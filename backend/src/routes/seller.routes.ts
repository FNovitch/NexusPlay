import { Router } from "express";
import { dashboard, getSellerStore, listSellers, updateMySeller } from "../controllers/seller.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireArtisan } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { sellerUpdateSchema } from "./schemas.js";

export const sellerRoutes = Router();

sellerRoutes.get("/sellers", asyncHandler(listSellers));
sellerRoutes.get("/sellers/:slug", asyncHandler(getSellerStore));
sellerRoutes.patch("/seller/me", authenticate, requireArtisan, validate(sellerUpdateSchema), asyncHandler(updateMySeller));
sellerRoutes.get("/seller/me/dashboard", authenticate, requireArtisan, asyncHandler(dashboard));
