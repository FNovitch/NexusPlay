import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
<<<<<<< HEAD
import { asyncHandler } from "../middlewares/async-handler.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "./schemas.js";

export const authRoutes = Router();

<<<<<<< HEAD
authRoutes.post("/register", validate(registerSchema), asyncHandler(register));
authRoutes.post("/login", validate(loginSchema), asyncHandler(login));
authRoutes.get("/me", authenticate, asyncHandler(me));
=======
authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.get("/me", authenticate, me);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
