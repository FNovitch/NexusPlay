import { Router } from "express";
import { calculateFreight } from "../controllers/freight.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireCustomer } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { freightCalculateSchema } from "./schemas.js";

export const freightRoutes = Router();

freightRoutes.post("/frete/calcular", authenticate, requireCustomer, validate(freightCalculateSchema), asyncHandler(calculateFreight));
freightRoutes.post("/shipping/calculate", authenticate, requireCustomer, validate(freightCalculateSchema), asyncHandler(calculateFreight));
