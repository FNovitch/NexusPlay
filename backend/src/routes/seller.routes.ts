import { Router } from "express";
import { UserRole } from "@prisma/client";
import { dashboard, getSellerStore, listSellers, updateMySeller } from "../controllers/seller.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { sellerUpdateSchema } from "./schemas.js";

export const sellerRoutes = Router();

sellerRoutes.get("/sellers", listSellers);
sellerRoutes.get("/sellers/:slug", getSellerStore);
sellerRoutes.patch("/seller/me", authenticate, requireRole(UserRole.SELLER), validate(sellerUpdateSchema), updateMySeller);
sellerRoutes.get("/seller/me/dashboard", authenticate, requireRole(UserRole.SELLER), dashboard);
