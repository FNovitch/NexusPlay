import { Router } from "express";
import { UserRole } from "@prisma/client";
import { dashboard, getSellerStore, listSellers, updateMySeller } from "../controllers/seller.controller.js";
<<<<<<< HEAD
import { asyncHandler } from "../middlewares/async-handler.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { sellerUpdateSchema } from "./schemas.js";

export const sellerRoutes = Router();

<<<<<<< HEAD
sellerRoutes.get("/sellers", asyncHandler(listSellers));
sellerRoutes.get("/sellers/:slug", asyncHandler(getSellerStore));
sellerRoutes.patch("/seller/me", authenticate, requireRole(UserRole.ARTISAN), validate(sellerUpdateSchema), asyncHandler(updateMySeller));
sellerRoutes.get("/seller/me/dashboard", authenticate, requireRole(UserRole.ARTISAN), asyncHandler(dashboard));
=======
sellerRoutes.get("/sellers", listSellers);
sellerRoutes.get("/sellers/:slug", getSellerStore);
sellerRoutes.patch("/seller/me", authenticate, requireRole(UserRole.SELLER), validate(sellerUpdateSchema), updateMySeller);
sellerRoutes.get("/seller/me/dashboard", authenticate, requireRole(UserRole.SELLER), dashboard);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
