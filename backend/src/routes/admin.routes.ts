import { Router } from "express";
import { UserRole } from "@prisma/client";
import { adminOverview, moderateProduct, moderateSeller } from "../controllers/admin.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { moderateProductSchema, moderateSellerSchema } from "./schemas.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole(UserRole.ADMIN));
adminRoutes.get("/admin/overview", asyncHandler(adminOverview));
adminRoutes.patch("/admin/sellers/:id/status", validate(moderateSellerSchema), asyncHandler(moderateSeller));
adminRoutes.patch("/admin/products/:id/status", validate(moderateProductSchema), asyncHandler(moderateProduct));
