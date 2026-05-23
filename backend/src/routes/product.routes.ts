import { Router } from "express";
import { archiveProduct, createProduct, myProducts, updateProduct } from "../controllers/product.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireArtisan } from "../middlewares/auth.js";
import { productImageUpload } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema, productSchema, updateProductSchema } from "./schemas.js";

export const productRoutes = Router();

const sellerOnly = [authenticate, requireArtisan];

productRoutes.get("/seller/products", sellerOnly, asyncHandler(myProducts));
productRoutes.post("/seller/products", sellerOnly, productImageUpload.array("images", 3), validate(productSchema), asyncHandler(createProduct));
productRoutes.patch("/seller/products/:id", sellerOnly, productImageUpload.array("images", 3), validate(updateProductSchema), asyncHandler(updateProduct));
productRoutes.delete("/seller/products/:id", sellerOnly, validate(idParamSchema), asyncHandler(archiveProduct));
