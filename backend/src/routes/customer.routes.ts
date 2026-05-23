import { Router } from "express";
import { getCustomerProfile, loginCustomer, registerCustomer, updateCustomerProfile } from "../controllers/customer.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireCustomer } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { customerUpdateSchema, loginSchema, registerCustomerSchema } from "./schemas.js";

export const customerRoutes = Router();

customerRoutes.post("/clientes/cadastro", validate(registerCustomerSchema), asyncHandler(registerCustomer));
customerRoutes.post("/clientes/login", validate(loginSchema), asyncHandler(loginCustomer));
customerRoutes.get("/clientes/perfil", authenticate, requireCustomer, asyncHandler(getCustomerProfile));
customerRoutes.put("/clientes/perfil", authenticate, requireCustomer, validate(customerUpdateSchema), asyncHandler(updateCustomerProfile));
