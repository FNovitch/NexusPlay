import { Router } from "express";
import { cancelSubscription, createSubscriptionCheckout, getArtisanSubscriptionStatus, listSubscriptionPlans, subscriptionWebhook } from "../controllers/subscription.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireArtisan } from "../middlewares/auth.js";

export const subscriptionRoutes = Router();

subscriptionRoutes.get("/subscriptions/plans", asyncHandler(listSubscriptionPlans));
subscriptionRoutes.post("/artesao/subscription/checkout", authenticate, requireArtisan, asyncHandler(createSubscriptionCheckout));
subscriptionRoutes.get("/artesao/subscription/status", authenticate, requireArtisan, asyncHandler(getArtisanSubscriptionStatus));
subscriptionRoutes.post("/artesao/subscription/cancel", authenticate, requireArtisan, asyncHandler(cancelSubscription));
subscriptionRoutes.post("/webhooks/mercado-pago/subscription", asyncHandler(subscriptionWebhook));
