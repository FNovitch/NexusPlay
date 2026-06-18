import { Router } from "express";
import { rateLimit } from "express-rate-limit";
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
adminRoutes.get("/admin/customers", asyncHandler(listAdminCustomers));
adminRoutes.get("/admin/customers/:id", asyncHandler(getAdminCustomer));
adminRoutes.put("/admin/customers/:id/block", asyncHandler(blockCustomer));
adminRoutes.put("/admin/customers/:id/unblock", asyncHandler(unblockCustomer));
adminRoutes.delete("/admin/customers/:id", asyncHandler(deleteCustomer));

adminRoutes.get("/admin/artesaos", asyncHandler(listAdminArtisans));
adminRoutes.get("/admin/artesaos/:id", asyncHandler(getAdminArtisan));
adminRoutes.put("/admin/artesaos/:id/aprovar", asyncHandler(approveArtisan));
adminRoutes.put("/admin/artesaos/:id/recusar", asyncHandler(rejectArtisan));
adminRoutes.put("/admin/artesaos/:id/bloquear", asyncHandler(blockArtisan));
adminRoutes.put("/admin/artesaos/:id/desbloquear", asyncHandler(unblockArtisan));
adminRoutes.delete("/admin/artesaos/:id", asyncHandler(deleteArtisan));
adminRoutes.get("/admin/sellers", asyncHandler(listAdminArtisans));
adminRoutes.get("/admin/sellers/:id", asyncHandler(getAdminArtisan));
adminRoutes.put("/admin/sellers/:id/approve", asyncHandler(approveArtisan));
adminRoutes.put("/admin/sellers/:id/reject", asyncHandler(rejectArtisan));
adminRoutes.put("/admin/sellers/:id/block", asyncHandler(blockArtisan));
adminRoutes.put("/admin/sellers/:id/unblock", asyncHandler(unblockArtisan));
adminRoutes.delete("/admin/sellers/:id", asyncHandler(deleteArtisan));

adminRoutes.get("/admin/produtos", asyncHandler(listAdminProducts));
adminRoutes.get("/admin/produtos/:id", asyncHandler(getAdminProduct));
adminRoutes.put("/admin/produtos/:id/aprovar", asyncHandler(approveProduct));
adminRoutes.put("/admin/produtos/:id/recusar", asyncHandler(rejectProduct));
adminRoutes.put("/admin/produtos/:id/ativar", asyncHandler(activateProduct));
adminRoutes.put("/admin/produtos/:id/desativar", asyncHandler(deactivateProduct));
adminRoutes.delete("/admin/produtos/:id", asyncHandler(deleteProductAdmin));
adminRoutes.get("/admin/products", asyncHandler(listAdminProducts));
adminRoutes.get("/admin/products/:id", asyncHandler(getAdminProduct));
adminRoutes.put("/admin/products/:id/approve", asyncHandler(approveProduct));
adminRoutes.put("/admin/products/:id/reject", asyncHandler(rejectProduct));
adminRoutes.put("/admin/products/:id/activate", asyncHandler(activateProduct));
adminRoutes.put("/admin/products/:id/deactivate", asyncHandler(deactivateProduct));
adminRoutes.delete("/admin/products/:id", asyncHandler(deleteProductAdmin));

adminRoutes.get("/admin/pedidos", asyncHandler(listAdminOrders));
adminRoutes.get("/admin/pedidos/:id", asyncHandler(getAdminOrder));
adminRoutes.put("/admin/pedidos/:id/status", asyncHandler(updateAdminOrderStatus));
adminRoutes.get("/admin/orders", asyncHandler(listAdminOrders));
adminRoutes.get("/admin/orders/:id", asyncHandler(getAdminOrder));
adminRoutes.put("/admin/orders/:id/status", asyncHandler(updateAdminOrderStatus));

adminRoutes.get("/admin/avaliações", asyncHandler(listAdminReviews));
adminRoutes.put("/admin/avaliações/:id/ocultar", asyncHandler(hideReview));
adminRoutes.put("/admin/avaliações/:id/exibir", asyncHandler(showReview));
adminRoutes.delete("/admin/avaliações/:id", asyncHandler(deleteReviewAdmin));
adminRoutes.get("/admin/reviews", asyncHandler(listAdminReviews));
adminRoutes.put("/admin/reviews/:id/hide", asyncHandler(hideReview));
adminRoutes.put("/admin/reviews/:id/show", asyncHandler(showReview));
adminRoutes.delete("/admin/reviews/:id", asyncHandler(deleteReviewAdmin));

adminRoutes.get("/admin/categorias", asyncHandler(listAdminCategories));
adminRoutes.post("/admin/categorias", asyncHandler(createAdminCategory));
adminRoutes.put("/admin/categorias/:id", asyncHandler(updateAdminCategory));
adminRoutes.delete("/admin/categorias/:id", asyncHandler(deleteAdminCategory));
adminRoutes.get("/admin/categories", asyncHandler(listAdminCategories));
adminRoutes.post("/admin/categories", asyncHandler(createAdminCategory));
adminRoutes.put("/admin/categories/:id", asyncHandler(updateAdminCategory));
adminRoutes.delete("/admin/categories/:id", asyncHandler(deleteAdminCategory));

adminRoutes.get("/admin/assinaturas", asyncHandler(listAdminSubscriptions));
adminRoutes.put("/admin/assinaturas/:id/ativar", asyncHandler(activateAdminSubscription));
adminRoutes.put("/admin/assinaturas/:id/cancelar", asyncHandler(cancelAdminSubscription));
adminRoutes.get("/admin/repasses", asyncHandler(listAdminPayouts));
adminRoutes.put("/admin/repasses/:id/pagar", asyncHandler(markPayoutPaid));
adminRoutes.get("/admin/pagamentos", asyncHandler(listAdminPaymentHistory));
adminRoutes.get("/admin/subscriptions", asyncHandler(listAdminSubscriptions));
adminRoutes.put("/admin/subscriptions/:id/activate", asyncHandler(activateAdminSubscription));
adminRoutes.put("/admin/subscriptions/:id/cancel", asyncHandler(cancelAdminSubscription));
adminRoutes.get("/admin/payouts", asyncHandler(listAdminPayouts));
adminRoutes.put("/admin/payouts/:id/pay", asyncHandler(markPayoutPaid));
adminRoutes.get("/admin/payments", asyncHandler(listAdminPaymentHistory));
