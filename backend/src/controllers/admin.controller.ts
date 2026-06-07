import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { ArtisanSubscriptionStatus, OrderStatus, PaymentHistoryType, PaymentStatus, ProductStatus, SellerPayoutStatus, SellerStatus, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import { slugify } from "../utils/slugify.js";

const takeFrom = (req: Request) => Math.min(Number(req.query.take ?? 20), 100);
const skipFrom = (req: Request) => Math.max(Number(req.query.skip ?? 0), 0);
const contains = (q: unknown) => (q ? { contains: String(q), mode: "insensitive" as const } : undefined);
const success = (res: Response, data: unknown, message = "Operacao realizada com sucesso.") => res.json({ success: true, message, data });
const paramId = (req: Request) => String(req.params.id);
const dateRange = (req: Request) => {
  const gte = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : undefined;
  const lte = req.query.dateTo ? new Date(String(req.query.dateTo)) : undefined;
  return {
    gte: gte && !Number.isNaN(gte.getTime()) ? gte : undefined,
    lte: lte && !Number.isNaN(lte.getTime()) ? lte : undefined
  };
};

function adminUser(user: { id: string; name: string; email: string; role: UserRole; adminProfile?: { id: string; permissionLevel: string } | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissionLevel: user.adminProfile?.permissionLevel
  };
}

export async function adminLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { adminProfile: true } });
  if (!user || user.role !== UserRole.ADMIN || user.isDeleted || !user.adminProfile?.active || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("E-mail ou senha invalidos.", 401);
  }
  await prisma.admin.update({ where: { userId: user.id }, data: { lastLogin: new Date() } });
  const token = signToken({ sub: user.id, role: user.role });
  res.json({ success: true, message: "Login administrativo realizado.", data: { token, user: adminUser(user) }, token, user: adminUser(user) });
}

export async function adminProfile(req: Request, res: Response) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, include: { adminProfile: true } });
  success(res, { user: adminUser(user) });
}

export async function updateAdminProfile(req: Request, res: Response) {
  const { name } = req.body;
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: { name }, include: { adminProfile: true } });
  if (name) await prisma.admin.update({ where: { userId: req.user!.id }, data: { name } });
  success(res, { user: adminUser(user) }, "Perfil atualizado com sucesso.");
}

export async function changeAdminPassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError("Senha atual invalida.", 401, { currentPassword: "Senha atual invalida." });
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  success(res, null, "Senha alterada com sucesso.");
}

export async function adminDashboard(_req: Request, res: Response) {
  const [
    totalClientes,
    totalArtesaos,
    artesaosPendentes,
    artesaosAprovados,
    artesaosRecusados,
    totalProdutos,
    produtosAtivos,
    produtosPendentes,
    totalPedidos,
    pedidosPendentes,
    pedidosEntregues,
    faturamento,
    avaliacoesRecentes,
    ultimosPedidos,
    novosCadastros,
    artesaosPendentesLista
  ] = await Promise.all([
    prisma.customer.count({ where: { isDeleted: false } }),
    prisma.artisan.count({ where: { isDeleted: false } }),
    prisma.artisan.count({ where: { status: SellerStatus.PENDING, isDeleted: false } }),
    prisma.artisan.count({ where: { status: SellerStatus.APPROVED, isDeleted: false } }),
    prisma.artisan.count({ where: { status: SellerStatus.REJECTED, isDeleted: false } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
    prisma.product.count({ where: { status: ProductStatus.PENDING } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: [OrderStatus.CREATED, OrderStatus.PAID, OrderStatus.IN_PRODUCTION] } } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.aggregate({ where: { paymentStatus: PaymentStatus.APPROVED }, _sum: { total: true } }),
    prisma.review.findMany({ include: { author: { select: { name: true } }, product: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.order.findMany({ include: { buyer: { select: { name: true, email: true } }, items: { include: { seller: true, product: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.user.findMany({ where: { role: { in: [UserRole.CUSTOMER, UserRole.ARTISAN] } }, select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.artisan.findMany({ where: { status: SellerStatus.PENDING, isDeleted: false }, include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  success(res, {
    metrics: { totalClientes, totalArtesaos, artesaosPendentes, artesaosAprovados, artesaosRecusados, totalProdutos, produtosAtivos, produtosPendentes, totalPedidos, pedidosPendentes, pedidosEntregues, faturamentoTotal: Number(faturamento._sum.total ?? 0) },
    avaliacoesRecentes,
    ultimosPedidos,
    novosCadastros,
    artesaosPendentesLista
  });
}

export async function listAdminCustomers(req: Request, res: Response) {
  const q = req.query.q;
  const where = {
    isDeleted: false,
    OR: q ? [{ name: contains(q) }, { cpf: contains(q) }, { user: { email: contains(q) } }] : undefined
  };
  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, include: { user: { select: { email: true, name: true, createdAt: true } }, addresses: true }, skip: skipFrom(req), take: takeFrom(req), orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where })
  ]);
  success(res, { items, total });
}

export async function getAdminCustomer(req: Request, res: Response) {
  const item = await prisma.customer.findUnique({ where: { id: paramId(req) }, include: { user: true, addresses: true } });
  if (!item || item.isDeleted) throw new AppError("Cliente nao encontrado", 404);
  const [recentOrders, orderSummary, paymentSummary] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: item.userId },
      include: { items: { include: { product: true, seller: true } } },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.order.aggregate({ where: { buyerId: item.userId }, _count: { _all: true }, _sum: { total: true } }),
    prisma.paymentHistory.aggregate({ where: { customerId: item.id }, _count: { _all: true }, _sum: { amount: true } })
  ]);
  success(res, {
    ...item,
    recentOrders,
    summary: {
      totalOrders: orderSummary._count._all,
      totalSpent: Number(orderSummary._sum.total ?? 0),
      totalPayments: paymentSummary._count._all,
      totalPaid: Number(paymentSummary._sum.amount ?? 0)
    }
  });
}

export async function blockCustomer(req: Request, res: Response) {
  const reason = String(req.body.reason ?? req.body.motivo ?? "").trim();
  if (!reason) throw new AppError("Motivo obrigatorio", 400, { reason: "Informe o motivo do bloqueio." });
  const item = await prisma.customer.update({ where: { id: paramId(req) }, data: { blocked: true, blockReason: reason } });
  success(res, item, "Cliente bloqueado.");
}

export async function unblockCustomer(req: Request, res: Response) {
  const item = await prisma.customer.update({ where: { id: paramId(req) }, data: { blocked: false, blockReason: null, active: true } });
  success(res, item, "Cliente desbloqueado.");
}

export async function deleteCustomer(req: Request, res: Response) {
  const item = await prisma.customer.update({ where: { id: paramId(req) }, data: { isDeleted: true, active: false } });
  await prisma.user.update({ where: { id: item.userId }, data: { isDeleted: true } });
  success(res, null, "Cliente desativado.");
}

export async function listAdminArtisans(req: Request, res: Response) {
  const q = req.query.q;
  const status = req.query.status ? String(req.query.status).toUpperCase() as SellerStatus : undefined;
  const blocked = req.query.blocked === "true" ? true : undefined;
  const where = {
    isDeleted: false,
    status,
    blocked,
    OR: q ? [{ name: contains(q) }, { storeName: contains(q) }, { document: contains(q) }, { user: { email: contains(q) } }] : undefined
  };
  const [items, total] = await Promise.all([
    prisma.artisan.findMany({ where, include: { user: { select: { email: true, name: true } }, addresses: true, store: true }, skip: skipFrom(req), take: takeFrom(req), orderBy: { createdAt: "desc" } }),
    prisma.artisan.count({ where })
  ]);
  success(res, { items, total });
}

export async function getAdminArtisan(req: Request, res: Response) {
  const item = await prisma.artisan.findUnique({ where: { id: paramId(req) }, include: { user: true, addresses: true, store: true } });
  if (!item || item.isDeleted) throw new AppError("Artesao nao encontrado", 404);
  const productOwnerFilter = item.storeId ? { OR: [{ artisanId: item.id }, { sellerId: item.storeId }] } : { artisanId: item.id };
  const [recentProducts, subscriptions, payoutSummary, paymentSummary] = await Promise.all([
    prisma.product.findMany({
      where: productOwnerFilter,
      include: { category: true, productImages: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    prisma.artisanSubscription.findMany({ where: { artisanId: item.id }, include: { plan: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.sellerPayout.aggregate({ where: { artisanId: item.id }, _count: { _all: true }, _sum: { availableAmount: true, totalAmount: true } }),
    prisma.paymentHistory.aggregate({ where: { artisanId: item.id }, _count: { _all: true }, _sum: { amount: true } })
  ]);
  success(res, {
    ...item,
    recentProducts,
    subscriptions,
    summary: {
      totalPayouts: payoutSummary._count._all,
      availablePayout: Number(payoutSummary._sum.availableAmount ?? 0),
      totalPayout: Number(payoutSummary._sum.totalAmount ?? 0),
      totalPayments: paymentSummary._count._all,
      totalReceived: Number(paymentSummary._sum.amount ?? 0)
    }
  });
}

async function updateArtisanAndStore(id: string, data: { status?: SellerStatus; active?: boolean; blocked?: boolean; rejectionReason?: string | null; blockReason?: string | null }) {
  const artisan = await prisma.artisan.update({ where: { id }, data });
  if (artisan.storeId && data.status) await prisma.seller.update({ where: { id: artisan.storeId }, data: { status: data.status } });
  return artisan;
}

export async function approveArtisan(req: Request, res: Response) {
  success(res, await updateArtisanAndStore(paramId(req), { status: SellerStatus.APPROVED, active: true, blocked: false, rejectionReason: null }), "Artesao aprovado.");
}

export async function rejectArtisan(req: Request, res: Response) {
  const reason = String(req.body.reason ?? req.body.motivo ?? "").trim();
  if (!reason) throw new AppError("Motivo obrigatorio", 400, { reason: "Informe o motivo da recusa." });
  success(res, await updateArtisanAndStore(paramId(req), { status: SellerStatus.REJECTED, rejectionReason: reason }), "Artesao recusado.");
}

export async function blockArtisan(req: Request, res: Response) {
  const reason = String(req.body.reason ?? req.body.motivo ?? "").trim();
  if (!reason) throw new AppError("Motivo obrigatorio", 400, { reason: "Informe o motivo do bloqueio." });
  success(res, await updateArtisanAndStore(paramId(req), { blocked: true, blockReason: reason }), "Artesao bloqueado.");
}

export async function unblockArtisan(req: Request, res: Response) {
  success(res, await updateArtisanAndStore(paramId(req), { blocked: false, blockReason: null, active: true }), "Artesao desbloqueado.");
}

export async function deleteArtisan(req: Request, res: Response) {
  const artisan = await prisma.artisan.update({ where: { id: paramId(req) }, data: { isDeleted: true, active: false } });
  await prisma.user.update({ where: { id: artisan.userId }, data: { isDeleted: true } });
  success(res, null, "Artesao desativado.");
}

export async function listAdminProducts(req: Request, res: Response) {
  const status = req.query.status ? String(req.query.status).toUpperCase() as ProductStatus : undefined;
  const where = { status, name: contains(req.query.q), categoryId: req.query.categoryId ? String(req.query.categoryId) : undefined, sellerId: req.query.sellerId ? String(req.query.sellerId) : undefined };
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, include: { seller: true, category: true, productImages: { orderBy: { createdAt: "asc" } } }, skip: skipFrom(req), take: takeFrom(req), orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where })
  ]);
  success(res, { items, total });
}

export async function getAdminProduct(req: Request, res: Response) {
  const item = await prisma.product.findUnique({
    where: { id: paramId(req) },
    include: {
      seller: true,
      category: true,
      productImages: { orderBy: { createdAt: "asc" } },
      reviews: { include: { author: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 8 },
      _count: { select: { favorites: true, orderItems: true, reviews: true } }
    }
  });
  if (!item) throw new AppError("Produto nao encontrado", 404);
  success(res, item);
}

const productStatus = (status: ProductStatus) => async (req: Request, res: Response) => {
  const reason = status === ProductStatus.REJECTED ? String(req.body.reason ?? req.body.motivo ?? "").trim() : undefined;
  if (status === ProductStatus.REJECTED && !reason) throw new AppError("Motivo obrigatorio", 400, { reason: "Informe o motivo da recusa." });
  const item = await prisma.product.update({ where: { id: paramId(req) }, data: { status, rejectionReason: reason ?? null } });
  success(res, item, "Produto atualizado.");
};

export const approveProduct = productStatus(ProductStatus.ACTIVE);
export const rejectProduct = productStatus(ProductStatus.REJECTED);
export const activateProduct = productStatus(ProductStatus.ACTIVE);
export const deactivateProduct = productStatus(ProductStatus.INACTIVE);
export async function deleteProductAdmin(req: Request, res: Response) {
  const item = await prisma.product.update({ where: { id: paramId(req) }, data: { status: ProductStatus.INACTIVE } });
  success(res, item, "Produto desativado.");
}

export async function listAdminOrders(req: Request, res: Response) {
  const status = req.query.status ? String(req.query.status).toUpperCase() as OrderStatus : undefined;
  const paymentStatus = req.query.paymentStatus ? String(req.query.paymentStatus).toUpperCase() as PaymentStatus : undefined;
  const { gte, lte } = dateRange(req);
  const q = req.query.q;
  const where = {
    status,
    paymentStatus,
    createdAt: gte || lte ? { gte, lte } : undefined,
    OR: q ? [
      { orderCode: contains(q) },
      { buyer: { email: contains(q) } },
      { buyer: { name: contains(q) } }
    ] : undefined
  };
  const items = await prisma.order.findMany({ where, include: { buyer: true, items: { include: { product: true, seller: true } } }, skip: skipFrom(req), take: takeFrom(req), orderBy: { createdAt: "desc" } });
  success(res, { items, total: await prisma.order.count({ where }) });
}

export async function getAdminOrder(req: Request, res: Response) {
  const item = await prisma.order.findUnique({
    where: { id: paramId(req) },
    include: {
      buyer: true,
      items: { include: { product: true, seller: true } },
      history: { orderBy: { createdAt: "desc" } },
      paymentHistories: { orderBy: { createdAt: "desc" } },
      sellerPayouts: { include: { artisan: { include: { user: { select: { email: true, name: true } } } } }, orderBy: { createdAt: "desc" } },
      shippingQuotes: { include: { artisan: true }, orderBy: { createdAt: "desc" } }
    }
  });
  if (!item) throw new AppError("Pedido nao encontrado", 404);
  success(res, item);
}

export async function updateAdminOrderStatus(req: Request, res: Response) {
  const aliases: Record<string, OrderStatus> = {
    PENDENTE: OrderStatus.PENDING,
    AGUARDANDO_PAGAMENTO: OrderStatus.AWAITING_PAYMENT,
    PAGO: OrderStatus.PAID,
    EM_PREPARO: OrderStatus.IN_PRODUCTION,
    ENVIADO: OrderStatus.SHIPPED,
    ENTREGUE: OrderStatus.DELIVERED,
    CANCELADO: OrderStatus.CANCELED
  };
  const raw = String(req.body.status ?? "").toUpperCase();
  const status = aliases[raw] ?? raw as OrderStatus;
  if (!Object.values(OrderStatus).includes(status)) throw new AppError("Status invalido", 400, { status: "Status de pedido invalido." });
  const current = await prisma.order.findUniqueOrThrow({ where: { id: paramId(req) } });
  const item = await prisma.order.update({ where: { id: paramId(req) }, data: { status } });
  await prisma.orderHistory.create({ data: { orderId: item.id, previousStatus: current.status, newStatus: status, note: "Status atualizado pelo administrador." } });
  success(res, item, "Status do pedido atualizado.");
}

export async function listAdminReviews(req: Request, res: Response) {
  const rating = req.query.rating ? Number(req.query.rating) : undefined;
  const where = { rating, productId: req.query.productId ? String(req.query.productId) : undefined, authorId: req.query.customerId ? String(req.query.customerId) : undefined };
  const items = await prisma.review.findMany({ where, include: { author: true, product: true }, skip: skipFrom(req), take: takeFrom(req), orderBy: { createdAt: "desc" } });
  success(res, { items, total: await prisma.review.count({ where }) });
}

export async function hideReview(req: Request, res: Response) {
  success(res, await prisma.review.update({ where: { id: paramId(req) }, data: { hidden: true } }), "Avaliacao ocultada.");
}

export async function showReview(req: Request, res: Response) {
  success(res, await prisma.review.update({ where: { id: paramId(req) }, data: { hidden: false } }), "Avaliacao exibida.");
}

export async function deleteReviewAdmin(req: Request, res: Response) {
  await prisma.review.delete({ where: { id: paramId(req) } });
  success(res, null, "Avaliacao excluida.");
}

export async function listAdminCategories(req: Request, res: Response) {
  const active = req.query.active === undefined || req.query.active === "" ? undefined : req.query.active === "true";
  const where = { active, OR: req.query.q ? [{ name: contains(req.query.q) }, { slug: contains(req.query.q) }] : undefined };
  const [items, total] = await Promise.all([
    prisma.category.findMany({ where, include: { _count: { select: { products: true } } }, skip: skipFrom(req), take: takeFrom(req), orderBy: { name: "asc" } }),
    prisma.category.count({ where })
  ]);
  success(res, { items, total });
}

export async function createAdminCategory(req: Request, res: Response) {
  const name = String(req.body.name ?? "").trim();
  if (name.length < 2) throw new AppError("Nome obrigatorio", 400, { name: "Informe o nome da categoria." });
  const item = await prisma.category.create({ data: { name, slug: slugify(name), description: req.body.description, imageUrl: req.body.imageUrl } });
  res.status(201).json({ success: true, message: "Categoria criada.", data: item });
}

export async function updateAdminCategory(req: Request, res: Response) {
  const name = req.body.name ? String(req.body.name).trim() : undefined;
  const item = await prisma.category.update({ where: { id: paramId(req) }, data: { name, slug: name ? slugify(name) : undefined, description: req.body.description, imageUrl: req.body.imageUrl, active: req.body.active } });
  success(res, item, "Categoria atualizada.");
}

export async function deleteAdminCategory(req: Request, res: Response) {
  const count = await prisma.product.count({ where: { categoryId: paramId(req) } });
  if (count > 0) {
    const item = await prisma.category.update({ where: { id: paramId(req) }, data: { active: false } });
    return success(res, item, "Categoria desativada pois possui produtos vinculados.");
  }
  await prisma.category.delete({ where: { id: paramId(req) } });
  success(res, null, "Categoria excluida.");
}

export async function listAdminSubscriptions(req: Request, res: Response) {
  const status = req.query.status ? String(req.query.status).toUpperCase() as ArtisanSubscriptionStatus : undefined;
  const items = await prisma.artisanSubscription.findMany({
    where: { status },
    include: { artisan: { include: { user: { select: { email: true, name: true } } } }, plan: true },
    skip: skipFrom(req),
    take: takeFrom(req),
    orderBy: { createdAt: "desc" }
  });
  success(res, { items, total: await prisma.artisanSubscription.count({ where: { status } }) });
}

export async function activateAdminSubscription(req: Request, res: Response) {
  const subscription = await prisma.artisanSubscription.findUnique({ where: { id: paramId(req) }, include: { plan: true } });
  if (!subscription || !subscription.plan) throw new AppError("Assinatura nao encontrada", 404);
  const startDate = new Date();
  const expirationDate = new Date(startDate);
  expirationDate.setDate(expirationDate.getDate() + subscription.plan.durationDays);
  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.artisanSubscription.update({ where: { id: subscription.id }, data: { status: ArtisanSubscriptionStatus.ACTIVE, startDate, expirationDate } });
    await tx.artisan.update({ where: { id: subscription.artisanId }, data: { subscriptionActive: true, subscriptionExpiresAt: expirationDate } });
    return updated;
  });
  success(res, item, "Assinatura ativada manualmente.");
}

export async function cancelAdminSubscription(req: Request, res: Response) {
  const subscription = await prisma.artisanSubscription.update({ where: { id: paramId(req) }, data: { status: ArtisanSubscriptionStatus.CANCELED } });
  await prisma.artisan.update({ where: { id: subscription.artisanId }, data: { subscriptionActive: false, subscriptionExpiresAt: null } });
  success(res, subscription, "Assinatura cancelada.");
}

export async function listAdminPayouts(req: Request, res: Response) {
  const status = req.query.status ? String(req.query.status).toUpperCase() as SellerPayoutStatus : undefined;
  const items = await prisma.sellerPayout.findMany({
    where: { status },
    include: { artisan: { include: { user: { select: { email: true, name: true } } } }, order: true },
    skip: skipFrom(req),
    take: takeFrom(req),
    orderBy: { createdAt: "desc" }
  });
  success(res, { items, total: await prisma.sellerPayout.count({ where: { status } }) });
}

export async function markPayoutPaid(req: Request, res: Response) {
  const item = await prisma.sellerPayout.update({ where: { id: paramId(req) }, data: { status: SellerPayoutStatus.PAID, paidAt: new Date(), note: req.body.note ?? "Repasse marcado como pago pelo administrador." } });
  success(res, item, "Repasse marcado como pago.");
}

export async function listAdminPaymentHistory(req: Request, res: Response) {
  const { gte, lte } = dateRange(req);
  const status = req.query.status ? String(req.query.status) : undefined;
  const type = req.query.type ? String(req.query.type).toUpperCase() as PaymentHistoryType : undefined;
  const where = {
    status,
    type,
    createdAt: gte || lte ? { gte, lte } : undefined,
    OR: req.query.q ? [
      { description: contains(req.query.q) },
      { mpPaymentId: contains(req.query.q) },
      { order: { orderCode: contains(req.query.q) } }
    ] : undefined
  };
  const items = await prisma.paymentHistory.findMany({
    where,
    include: { artisan: true, customer: true, order: true, subscription: { include: { plan: true } } },
    skip: skipFrom(req),
    take: takeFrom(req),
    orderBy: { createdAt: "desc" }
  });
  success(res, { items, total: await prisma.paymentHistory.count({ where }) });
}
