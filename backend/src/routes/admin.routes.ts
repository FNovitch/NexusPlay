import { Router } from "express";
import {
  activateProduct,
  adminDashboard,
  adminLogin,
  adminProfile,
  approveArtisan,
  approveProduct,
  blockArtisan,
  blockCustomer,
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
  listAdminProducts,
  listAdminReviews,
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

adminRoutes.post("/admin/login", asyncHandler(adminLogin));

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

adminRoutes.get("/admin/avaliacoes", asyncHandler(listAdminReviews));
adminRoutes.put("/admin/avaliacoes/:id/ocultar", asyncHandler(hideReview));
adminRoutes.put("/admin/avaliacoes/:id/exibir", asyncHandler(showReview));
adminRoutes.delete("/admin/avaliacoes/:id", asyncHandler(deleteReviewAdmin));

adminRoutes.get("/admin/categorias", asyncHandler(listAdminCategories));
adminRoutes.post("/admin/categorias", asyncHandler(createAdminCategory));
adminRoutes.put("/admin/categorias/:id", asyncHandler(updateAdminCategory));
adminRoutes.delete("/admin/categorias/:id", asyncHandler(deleteAdminCategory));
