import { Router } from "express";
import { UserRole } from "@prisma/client";
import { archiveProduct, createProduct, myProducts, updateProduct } from "../controllers/product.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema, productSchema, updateProductSchema } from "./schemas.js";

export const productRoutes = Router();

const sellerOnly = [authenticate, requireRole(UserRole.ARTISAN)];

productRoutes.get("/seller/products", sellerOnly, asyncHandler(myProducts));
productRoutes.post("/seller/products", sellerOnly, validate(productSchema), asyncHandler(createProduct));
productRoutes.patch("/seller/products/:id", sellerOnly, validate(updateProductSchema), asyncHandler(updateProduct));
productRoutes.delete("/seller/products/:id", sellerOnly, validate(idParamSchema), asyncHandler(archiveProduct));
