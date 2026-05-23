import { Router } from "express";
import { adminRoutes } from "./admin.routes.js";
import { artisanRoutes } from "./artisan.routes.js";
import { authRoutes } from "./auth.routes.js";
import { catalogRoutes } from "./catalog.routes.js";
import { customerRoutes } from "./customer.routes.js";
import { favoriteRoutes } from "./favorite.routes.js";
import { orderRoutes } from "./order.routes.js";
import { productRoutes } from "./product.routes.js";
import { reviewRoutes } from "./review.routes.js";
import { sellerRoutes } from "./seller.routes.js";

export const router = Router();

router.use(authRoutes);
router.use(artisanRoutes);
router.use(customerRoutes);
router.use(catalogRoutes);
router.use(sellerRoutes);
router.use(productRoutes);
router.use(orderRoutes);
router.use(reviewRoutes);
router.use(favoriteRoutes);
router.use(adminRoutes);
