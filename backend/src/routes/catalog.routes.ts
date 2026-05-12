import { Router } from "express";
import { autocomplete, getProduct, listCategories, listProducts } from "../controllers/catalog.controller.js";
import { validate } from "../middlewares/validate.js";
import { productQuerySchema } from "./schemas.js";

export const catalogRoutes = Router();

catalogRoutes.get("/categories", listCategories);
catalogRoutes.get("/products", validate(productQuerySchema), listProducts);
catalogRoutes.get("/products/autocomplete", autocomplete);
catalogRoutes.get("/products/:slug", getProduct);
