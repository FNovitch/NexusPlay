import { Router } from "express";
import { createReview } from "../controllers/review.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { reviewSchema } from "./schemas.js";

export const reviewRoutes = Router();

reviewRoutes.post("/reviews", authenticate, validate(reviewSchema), asyncHandler(createReview));
