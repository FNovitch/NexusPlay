import { Router } from "express";
import { archiveProduct, createProduct, myProducts, updateProduct } from "../controllers/product.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireActiveSubscription, requireArtisan } from "../middlewares/auth.js";
import { productImageMemoryUpload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema, productSchema, updateProductSchema } from "./schemas.js";

export const productRoutes = Router();

const sellerOnly = [authenticate, requireArtisan];
const activeSellerOnly = [authenticate, requireArtisan, requireActiveSubscription];

productRoutes.get("/seller/products", sellerOnly, asyncHandler(myProducts));
productRoutes.post("/seller/products", activeSellerOnly, productImageMemoryUpload.array("images", 3), validate(productSchema), asyncHandler(createProduct));
productRoutes.patch("/seller/products/:id", activeSellerOnly, productImageMemoryUpload.array("images", 3), validate(updateProductSchema), asyncHandler(updateProduct));
productRoutes.delete("/seller/products/:id", sellerOnly, validate(idParamSchema), asyncHandler(archiveProduct));
