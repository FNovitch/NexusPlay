import { Router } from "express";
import { autocomplete, getProduct, listCategories, listProducts } from "../controllers/catalog.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { validate } from "../middlewares/validate.js";
import { productQuerySchema } from "./schemas.js";

export const catalogRoutes = Router();

catalogRoutes.get("/categories", asyncHandler(listCategories));
catalogRoutes.get("/products", validate(productQuerySchema), asyncHandler(listProducts));
catalogRoutes.get("/products/autocomplete", asyncHandler(autocomplete));
catalogRoutes.get("/products/:slug", asyncHandler(getProduct));
