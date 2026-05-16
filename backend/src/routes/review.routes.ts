import { Router } from "express";
import { createReview } from "../controllers/review.controller.js";
<<<<<<< HEAD
import { asyncHandler } from "../middlewares/async-handler.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { reviewSchema } from "./schemas.js";

export const reviewRoutes = Router();

<<<<<<< HEAD
reviewRoutes.post("/reviews", authenticate, validate(reviewSchema), asyncHandler(createReview));
=======
reviewRoutes.post("/reviews", authenticate, validate(reviewSchema), createReview);
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
