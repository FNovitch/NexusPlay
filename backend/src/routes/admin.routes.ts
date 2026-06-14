import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  activateAdminSubscription,
  activateProduct,
  adminDashboard,
  adminLogin,
  adminProfile,
  approveArtisan,
  approveProduct,
  blockArtisan,
  blockCustomer,
  cancelAdminSubscription,
  changeAdminPassword,
  createAdminCategory,
  deactivateProduct,
  deleteAdminCategory,
  deleteArtisan,
  deleteCustomer,
  deleteProductAdmin,
  deleteReviewAdmin,
  getAdminArtisan,
  getAdminCustomer,
  getAdminOrder,
  getAdminProduct,
  hideReview,
  listAdminArtisans,
  listAdminCategories,
  listAdminCustomers,
  listAdminOrders,
  listAdminPaymentHistory,
  listAdminPayouts,
  listAdminProducts,
  listAdminReviews,
  listAdminSubscriptions,
  markPayoutPaid,
  rejectArtisan,
  rejectProduct,
  showReview,
  unblockArtisan,
  unblockCustomer,
  updateAdminCategory,
  updateAdminOrderStatus,
  updateAdminProfile
} from "../controllers/admin.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

export const adminRoutes = Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Muitas tentativas. Tente novamente em alguns minutos." }
});

adminRoutes.post("/admin/login", adminLoginLimiter, asyncHandler(adminLogin));

adminRoutes.use("/admin", authenticate, requireAdmin);
adminRoutes.get("/admin/perfil", asyncHandler(adminProfile));
adminRoutes.put("/admin/perfil", asyncHandler(updateAdminProfile));
adminRoutes.put("/admin/alterar-senha", asyncHandler(changeAdminPassword));
adminRoutes.get("/admin/dashboard", asyncHandler(adminDashboard));
adminRoutes.get("/admin/overview", asyncHandler(adminDashboard));

adminRoutes.get("/admin/clientes", asyncHandler(listAdminCustomers));
adminRoutes.get("/admin/clientes/:id", asyncHandler(getAdminCustomer));
adminRoutes.put("/admin/clientes/:id/bloquear", asyncHandler(blockCustomer));
adminRoutes.put("/admin/clientes/:id/desbloquear", asyncHandler(unblockCustomer));
adminRoutes.delete("/admin/clientes/:id", asyncHandler(deleteCustomer));

adminRoutes.get("/admin/artesaos", asyncHandler(listAdminArtisans));
adminRoutes.get("/admin/artesaos/:id", asyncHandler(getAdminArtisan));
adminRoutes.put("/admin/artesaos/:id/aprovar", asyncHandler(approveArtisan));
adminRoutes.put("/admin/artesaos/:id/recusar", asyncHandler(rejectArtisan));
adminRoutes.put("/admin/artesaos/:id/bloquear", asyncHandler(blockArtisan));
adminRoutes.put("/admin/artesaos/:id/desbloquear", asyncHandler(unblockArtisan));
adminRoutes.delete("/admin/artesaos/:id", asyncHandler(deleteArtisan));

adminRoutes.get("/admin/produtos", asyncHandler(listAdminProducts));
adminRoutes.get("/admin/produtos/:id", asyncHandler(getAdminProduct));
adminRoutes.put("/admin/produtos/:id/aprovar", asyncHandler(approveProduct));
adminRoutes.put("/admin/produtos/:id/recusar", asyncHandler(rejectProduct));
adminRoutes.put("/admin/produtos/:id/ativar", asyncHandler(activateProduct));
adminRoutes.put("/admin/produtos/:id/desativar", asyncHandler(deactivateProduct));
adminRoutes.delete("/admin/produtos/:id", asyncHandler(deleteProductAdmin));

adminRoutes.get("/admin/pedidos", asyncHandler(listAdminOrders));
adminRoutes.get("/admin/pedidos/:id", asyncHandler(getAdminOrder));
adminRoutes.put("/admin/pedidos/:id/status", asyncHandler(updateAdminOrderStatus));

adminRoutes.get("/admin/avaliações", asyncHandler(listAdminReviews));
adminRoutes.put("/admin/avaliações/:id/ocultar", asyncHandler(hideReview));
adminRoutes.put("/admin/avaliações/:id/exibir", asyncHandler(showReview));
adminRoutes.delete("/admin/avaliações/:id", asyncHandler(deleteReviewAdmin));

adminRoutes.get("/admin/categorias", asyncHandler(listAdminCategories));
adminRoutes.post("/admin/categorias", asyncHandler(createAdminCategory));
adminRoutes.put("/admin/categorias/:id", asyncHandler(updateAdminCategory));
adminRoutes.delete("/admin/categorias/:id", asyncHandler(deleteAdminCategory));

adminRoutes.get("/admin/assinaturas", asyncHandler(listAdminSubscriptions));
adminRoutes.put("/admin/assinaturas/:id/ativar", asyncHandler(activateAdminSubscription));
adminRoutes.put("/admin/assinaturas/:id/cancelar", asyncHandler(cancelAdminSubscription));
adminRoutes.get("/admin/repasses", asyncHandler(listAdminPayouts));
adminRoutes.put("/admin/repasses/:id/pagar", asyncHandler(markPayoutPaid));
adminRoutes.get("/admin/pagamentos", asyncHandler(listAdminPaymentHistory));
