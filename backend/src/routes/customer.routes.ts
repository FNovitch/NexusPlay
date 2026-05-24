import { Router } from "express";
import rateLimit from "express-rate-limit";
import { forgotCustomerPassword, getCustomerProfile, loginCustomer, registerCustomer, resetCustomerPassword, updateCustomerProfile } from "../controllers/customer.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireCustomer } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { customerUpdateSchema, forgotPasswordSchema, loginSchema, registerCustomerSchema, resetPasswordSchema } from "./schemas.js";

export const customerRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Muitas tentativas. Tente novamente em alguns minutos." }
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Muitas solicitacoes. Tente novamente em alguns minutos." }
});

customerRoutes.post("/clientes/cadastro", validate(registerCustomerSchema), asyncHandler(registerCustomer));
customerRoutes.post("/clientes/login", loginLimiter, validate(loginSchema), asyncHandler(loginCustomer));
customerRoutes.post("/clientes/esqueci-senha", passwordResetLimiter, validate(forgotPasswordSchema), asyncHandler(forgotCustomerPassword));
customerRoutes.post("/clientes/resetar-senha", passwordResetLimiter, validate(resetPasswordSchema), asyncHandler(resetCustomerPassword));
customerRoutes.get("/clientes/perfil", authenticate, requireCustomer, asyncHandler(getCustomerProfile));
customerRoutes.put("/clientes/perfil", authenticate, requireCustomer, validate(customerUpdateSchema), asyncHandler(updateCustomerProfile));
