import { Router } from "express";
import { checkout, myOrders, paymentWebhook } from "../controllers/order.controller.js";
<<<<<<< HEAD
import { asyncHandler } from "../middlewares/async-handler.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { checkoutSchema } from "./schemas.js";

export const orderRoutes = Router();

<<<<<<< HEAD
orderRoutes.post("/checkout", authenticate, validate(checkoutSchema), asyncHandler(checkout));
orderRoutes.get("/orders", authenticate, asyncHandler(myOrders));
orderRoutes.post("/payments/webhook", asyncHandler(paymentWebhook));
=======
orderRoutes.post("/checkout", authenticate, validate(checkoutSchema), checkout);
orderRoutes.get("/orders", authenticate, myOrders);
orderRoutes.post("/payments/webhook", paymentWebhook);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
