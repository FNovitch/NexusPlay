import { Router } from "express";
import { autocomplete, getProduct, listCategories, listProducts } from "../controllers/catalog.controller.js";
<<<<<<< HEAD
import { asyncHandler } from "../middlewares/async-handler.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { validate } from "../middlewares/validate.js";
import { productQuerySchema } from "./schemas.js";

export const catalogRoutes = Router();

<<<<<<< HEAD
catalogRoutes.get("/categories", asyncHandler(listCategories));
catalogRoutes.get("/products", validate(productQuerySchema), asyncHandler(listProducts));
catalogRoutes.get("/products/autocomplete", asyncHandler(autocomplete));
catalogRoutes.get("/products/:slug", asyncHandler(getProduct));
=======
catalogRoutes.get("/categories", listCategories);
catalogRoutes.get("/products", validate(productQuerySchema), listProducts);
catalogRoutes.get("/products/autocomplete", autocomplete);
catalogRoutes.get("/products/:slug", getProduct);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
