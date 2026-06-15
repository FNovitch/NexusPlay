import { Router } from "express";
import { artisanOrders, cancelMyOrder, checkout, confirmReceipt, getArtisanOrder, getMyOrder, myOrders, paymentWebhook, updateArtisanOrderStatus } from "../controllers/order.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireArtisan, requireCustomer } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { checkoutSchema } from "./schemas.js";

export const orderRoutes = Router();

orderRoutes.post("/pedidos", authenticate, requireCustomer, validate(checkoutSchema), asyncHandler(checkout));
orderRoutes.post("/pedidos/checkout", authenticate, requireCustomer, validate(checkoutSchema), asyncHandler(checkout));
orderRoutes.post("/orders", authenticate, requireCustomer, validate(checkoutSchema), asyncHandler(checkout));
orderRoutes.post("/orders/checkout", authenticate, requireCustomer, validate(checkoutSchema), asyncHandler(checkout));
orderRoutes.post("/checkout", authenticate, requireCustomer, validate(checkoutSchema), asyncHandler(checkout));
orderRoutes.get("/pedidos/meus-pedidos", authenticate, requireCustomer, asyncHandler(myOrders));
orderRoutes.get("/orders", authenticate, requireCustomer, asyncHandler(myOrders));
orderRoutes.get("/orders/my-orders", authenticate, requireCustomer, asyncHandler(myOrders));
orderRoutes.get("/pedidos/:id", authenticate, requireCustomer, asyncHandler(getMyOrder));
orderRoutes.get("/orders/:id", authenticate, requireCustomer, asyncHandler(getMyOrder));
orderRoutes.put("/pedidos/:id/cancelar", authenticate, requireCustomer, asyncHandler(cancelMyOrder));
orderRoutes.put("/orders/:id/cancel", authenticate, requireCustomer, asyncHandler(cancelMyOrder));
orderRoutes.put("/pedidos/:id/confirmar-recebimento", authenticate, requireCustomer, asyncHandler(confirmReceipt));
orderRoutes.put("/orders/:id/confirm-receipt", authenticate, requireCustomer, asyncHandler(confirmReceipt));

orderRoutes.get("/artesao/pedidos", authenticate, requireArtisan, asyncHandler(artisanOrders));
orderRoutes.get("/artesao/pedidos/:id", authenticate, requireArtisan, asyncHandler(getArtisanOrder));
orderRoutes.put("/artesao/pedidos/:id/status", authenticate, requireArtisan, asyncHandler(updateArtisanOrderStatus));
orderRoutes.get("/seller/orders", authenticate, requireArtisan, asyncHandler(artisanOrders));
orderRoutes.get("/seller/orders/:id", authenticate, requireArtisan, asyncHandler(getArtisanOrder));
orderRoutes.put("/seller/orders/:id/status", authenticate, requireArtisan, asyncHandler(updateArtisanOrderStatus));

orderRoutes.post("/webhooks/mercado-pago", asyncHandler(paymentWebhook));
orderRoutes.post("/payments/webhook", asyncHandler(paymentWebhook));
