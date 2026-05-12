import { Router } from "express";
import { UserRole } from "@prisma/client";
import { adminOverview, moderateProduct, moderateSeller } from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { moderateProductSchema, moderateSellerSchema } from "./schemas.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole(UserRole.ADMIN));
adminRoutes.get("/admin/overview", adminOverview);
adminRoutes.patch("/admin/sellers/:id/status", validate(moderateSellerSchema), moderateSeller);
adminRoutes.patch("/admin/products/:id/status", validate(moderateProductSchema), moderateProduct);
