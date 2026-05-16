import { Router } from "express";
import { UserRole } from "@prisma/client";
import { archiveProduct, createProduct, myProducts, updateProduct } from "../controllers/product.controller.js";
<<<<<<< HEAD
import { asyncHandler } from "../middlewares/async-handler.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema, productSchema, updateProductSchema } from "./schemas.js";

export const productRoutes = Router();

<<<<<<< HEAD
const sellerOnly = [authenticate, requireRole(UserRole.ARTISAN)];

productRoutes.get("/seller/products", sellerOnly, asyncHandler(myProducts));
productRoutes.post("/seller/products", sellerOnly, validate(productSchema), asyncHandler(createProduct));
productRoutes.patch("/seller/products/:id", sellerOnly, validate(updateProductSchema), asyncHandler(updateProduct));
productRoutes.delete("/seller/products/:id", sellerOnly, validate(idParamSchema), asyncHandler(archiveProduct));
=======
productRoutes.use(authenticate, requireRole(UserRole.SELLER));
productRoutes.get("/seller/products", myProducts);
productRoutes.post("/seller/products", validate(productSchema), createProduct);
productRoutes.patch("/seller/products/:id", validate(updateProductSchema), updateProduct);
productRoutes.delete("/seller/products/:id", validate(idParamSchema), archiveProduct);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
