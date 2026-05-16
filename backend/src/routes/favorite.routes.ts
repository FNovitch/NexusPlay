import { Router } from "express";
import { listFavorites, toggleFavorite } from "../controllers/favorite.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { productIdParamSchema } from "./schemas.js";

export const favoriteRoutes = Router();

favoriteRoutes.get("/favorites", authenticate, listFavorites);
favoriteRoutes.post("/favorites/:productId", authenticate, validate(productIdParamSchema), toggleFavorite);
