import { Router } from "express";
import { UserRole } from "@prisma/client";
import { adminOverview, moderateProduct, moderateSeller } from "../controllers/admin.controller.js";
<<<<<<< HEAD
import { asyncHandler } from "../middlewares/async-handler.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { moderateProductSchema, moderateSellerSchema } from "./schemas.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole(UserRole.ADMIN));
<<<<<<< HEAD
adminRoutes.get("/admin/overview", asyncHandler(adminOverview));
adminRoutes.patch("/admin/sellers/:id/status", validate(moderateSellerSchema), asyncHandler(moderateSeller));
adminRoutes.patch("/admin/products/:id/status", validate(moderateProductSchema), asyncHandler(moderateProduct));
=======
adminRoutes.get("/admin/overview", adminOverview);
adminRoutes.patch("/admin/sellers/:id/status", validate(moderateSellerSchema), moderateSeller);
adminRoutes.patch("/admin/products/:id/status", validate(moderateProductSchema), moderateProduct);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
