import { Router } from "express";
import { checkout, myOrders, paymentWebhook } from "../controllers/order.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { checkoutSchema } from "./schemas.js";

export const orderRoutes = Router();

orderRoutes.post("/checkout", authenticate, validate(checkoutSchema), asyncHandler(checkout));
orderRoutes.get("/orders", authenticate, asyncHandler(myOrders));
orderRoutes.post("/payments/webhook", asyncHandler(paymentWebhook));
