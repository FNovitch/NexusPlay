import type { Request, Response } from "express";
import { OrderStatus, PaymentStatus, Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import { consultarPagamento, criarPreferenciaPagamento, validarAssinaturaMercadoPago } from "../services/mercado-pago.service.js";

type CartPayloadItem = { productId: string; quantity: number; customizationNotes?: string; selectedVariations?: Record<string, string> };

const addressString = (address: unknown) => JSON.stringify(address ?? {});
const orderInclude = { items: { include: { product: true, seller: true } }, buyer: { select: { id: true, name: true, email: true } }, history: { orderBy: { createdAt: "asc" as const } } };

function orderCode() {
  return `KRIAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function mapPaymentStatus(status: string): PaymentStatus {
  if (status === "approved") return PaymentStatus.APPROVED;
  if (status === "rejected") return PaymentStatus.REJECTED;
  if (status === "cancelled" || status === "canceled") return PaymentStatus.CANCELED;
  if (status === "refunded") return PaymentStatus.REFUNDED;
  return PaymentStatus.PENDING;
}

function mapOrderStatusFromPayment(status: string): OrderStatus {
  if (status === "approved") return OrderStatus.PAID;
  if (status === "rejected" || status === "cancelled" || status === "canceled") return OrderStatus.CANCELED;
  return OrderStatus.AWAITING_PAYMENT;
}

async function addHistory(orderId: string, previousStatus: OrderStatus | null, newStatus: OrderStatus, note?: string) {
  await prisma.orderHistory.create({ data: { orderId, previousStatus: previousStatus ?? undefined, newStatus, note } });
}

function checkoutInitPoint(preference: { init_point?: string | null; sandbox_init_point?: string | null }) {
  if (process.env.NODE_ENV === "production") {
    return preference.init_point ?? preference.sandbox_init_point;
  }

  return preference.sandbox_init_point ?? preference.init_point;
}

export async function createOrder(req: Request, res: Response) {
  const items = (req.body.items ?? []) as CartPayloadItem[];
  const shippingAddress = req.body.shippingAddress ?? req.body.enderecoEntrega;
  const shippingTotal = Number(req.body.shippingTotal ?? req.body.valorFrete ?? 0);

  if (!Array.isArray(items) || items.length === 0) throw new AppError("Nao foi possivel concluir o pedido.", 400, { carrinho: "Carrinho vazio." });
  if (!shippingAddress) throw new AppError("Nao foi possivel concluir o pedido.", 400, { enderecoEntrega: "Informe o endereco de entrega." });

  const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) } }, include: { seller: true } });
  if (products.length !== items.length) throw new AppError("Nao foi possivel concluir o pedido.", 404, { produtos: "Um ou mais produtos nao foram encontrados." });

  const orderItems = items.map((item) => {
    const product = products.find((current) => current.id === item.productId)!;
    if (product.status !== ProductStatus.ACTIVE) throw new AppError("Nao foi possivel concluir o pedido.", 400, { produto: `${product.name} nao esta ativo.` });
    if (product.stock < item.quantity) throw new AppError("Nao foi possivel concluir o pedido.", 400, { estoque: `Estoque insuficiente para ${product.name}.` });
    const variations = Array.isArray(product.variations) ? product.variations as Array<{ name: string; options: string[] }> : [];
    const missing = variations.find((variation) => !item.selectedVariations?.[variation.name]);
    if (missing) throw new AppError("Nao foi possivel concluir o pedido.", 400, { variacao: `Selecione ${missing.name} para ${product.name}.` });
    const image = Array.isArray(product.images) ? (product.images[0] as { url?: string } | undefined)?.url : undefined;
    const unitPrice = Number(product.price);
    return { product, item, unitPrice, subtotal: unitPrice * item.quantity, image };
  });

  const productsTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = productsTotal + shippingTotal;
  const buyer = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!buyer) throw new AppError("Comprador nao encontrado", 404);

  const pedido = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderCode: orderCode(),
        buyerId: req.user!.id,
        status: OrderStatus.AWAITING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: "MERCADO_PAGO_CHECKOUT_PRO",
        productsTotal,
        shippingTotal,
        total,
        shippingAddress,
        items: {
          create: orderItems.map(({ product, item, unitPrice, subtotal, image }) => ({
            productId: product.id,
            sellerId: product.sellerId,
            productName: product.name,
            productImage: image,
            quantity: item.quantity,
            unitPrice,
            total: subtotal,
            customizationNotes: item.customizationNotes,
            selectedVariations: item.selectedVariations ?? Prisma.JsonNull
          }))
        }
      },
      include: orderInclude
    });
    await tx.orderHistory.create({ data: { orderId: created.id, newStatus: OrderStatus.AWAITING_PAYMENT, note: "Pedido criado aguardando pagamento." } });
    return created;
  });

  const preference = await criarPreferenciaPagamento({
    pedidoId: pedido.id,
    codigoPedido: pedido.orderCode,
    comprador: { nome: buyer.name, email: buyer.email },
    items: pedido.items.map((item) => ({ title: item.productName || item.product.name, quantity: item.quantity, unit_price: Number(item.unitPrice) }))
  });

  const initPoint = checkoutInitPoint(preference);
  if (!initPoint) throw new AppError("Nao foi possivel criar o link de pagamento.", 500, { pagamento: "Mercado Pago nao retornou init_point." });

  const updated = await prisma.order.update({ where: { id: pedido.id }, data: { mpPreferenceId: preference.id }, include: orderInclude });
  res.status(201).json({
    success: true,
    message: "Checkout criado com sucesso.",
    data: { pedidoId: updated.id, initPoint, pedido: updated, preferenceId: preference.id }
  });
}

export const checkout = createOrder;

export async function myOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({ where: { buyerId: req.user!.id }, include: orderInclude, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: { pedidos: orders }, orders });
}

export async function getMyOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: String(req.params.id) }, include: orderInclude });
  if (!order || order.buyerId !== req.user!.id) throw new AppError("Pedido nao encontrado", 404);
  res.json({ success: true, data: { pedido: order } });
}

export async function cancelMyOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: String(req.params.id) } });
  if (!order || order.buyerId !== req.user!.id) throw new AppError("Pedido nao encontrado", 404);
  const cancelable: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PENDING, OrderStatus.AWAITING_PAYMENT];
  if (!cancelable.includes(order.status)) {
    throw new AppError("Pedido nao pode ser cancelado neste status", 400, { status: "Cancelamento indisponivel." });
  }
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELED }, include: orderInclude });
  await addHistory(order.id, order.status, OrderStatus.CANCELED, "Pedido cancelado pelo cliente.");
  res.json({ success: true, message: "Pedido cancelado.", data: { pedido: updated } });
}

export async function artisanOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { items: { some: { sellerId: req.user!.sellerId } } },
    include: orderInclude,
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: { pedidos: orders } });
}

export async function getArtisanOrder(req: Request, res: Response) {
  const order = await prisma.order.findFirst({ where: { id: String(req.params.id), items: { some: { sellerId: req.user!.sellerId } } }, include: orderInclude });
  if (!order) throw new AppError("Pedido nao encontrado", 404);
  res.json({ success: true, data: { pedido: order } });
}

export async function updateArtisanOrderStatus(req: Request, res: Response) {
  const allowed: OrderStatus[] = [OrderStatus.IN_PRODUCTION, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
  const status = String(req.body.status ?? "").toUpperCase() as OrderStatus;
  if (!allowed.includes(status)) throw new AppError("Status invalido", 400, { status: "Artesao pode usar EM_PREPARO, ENVIADO ou ENTREGUE." });
  const order = await prisma.order.findFirst({ where: { id: String(req.params.id), items: { some: { sellerId: req.user!.sellerId } } } });
  if (!order) throw new AppError("Pedido nao encontrado", 404);
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status }, include: orderInclude });
  await addHistory(order.id, order.status, status, "Status atualizado pelo artesao.");
  res.json({ success: true, message: "Status atualizado.", data: { pedido: updated } });
}

export async function paymentWebhook(req: Request, res: Response) {
  try {
    const paymentId = String(req.query["data.id"] ?? req.query.id ?? req.body?.data?.id ?? req.body?.id ?? "");
    if (!paymentId) return res.status(200).json({ received: true });
    if (!validarAssinaturaMercadoPago(req.headers, paymentId)) return res.status(401).json({ received: false });
    const payment = await consultarPagamento(paymentId);
    const orderId = "external_reference" in payment ? String(payment.external_reference) : undefined;
    const status = "status" in payment ? String(payment.status) : "pending";
    if (!orderId) return res.status(200).json({ received: true });
    const current = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!current) return res.status(200).json({ received: true });
    const newOrderStatus = mapOrderStatusFromPayment(status);
    const updated = await prisma.order.update({
      where: { id: current.id },
      data: { status: newOrderStatus, paymentStatus: mapPaymentStatus(status), mpPaymentId: String(payment.id), mpStatus: status },
      include: { items: true }
    });
    await addHistory(current.id, current.status, newOrderStatus, `Webhook Mercado Pago: ${status}`);
    if (status === "approved" && current.paymentStatus !== PaymentStatus.APPROVED) {
      await Promise.all(updated.items.map((item) => prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity }, seller: { update: { salesCount: { increment: item.quantity } } } } })));
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[mercado-pago:webhook]", error);
  }
  res.status(200).json({ received: true });
}
