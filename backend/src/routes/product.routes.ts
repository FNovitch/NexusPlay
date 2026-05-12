import { Router } from "express";
import { UserRole } from "@prisma/client";
import { archiveProduct, createProduct, myProducts, updateProduct } from "../controllers/product.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema, productSchema, updateProductSchema } from "./schemas.js";

export const productRoutes = Router();

productRoutes.use(authenticate, requireRole(UserRole.SELLER));
productRoutes.get("/seller/products", myProducts);
productRoutes.post("/seller/products", validate(productSchema), createProduct);
productRoutes.patch("/seller/products/:id", validate(updateProductSchema), updateProduct);
productRoutes.delete("/seller/products/:id", validate(idParamSchema), archiveProduct);
