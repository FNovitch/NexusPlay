import type { Request, Response } from "express";
import { OrderStatus, PaymentHistoryType, PaymentStatus, Prisma, ProductStatus, SellerPayoutStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import { consultarPagamento, criarPreferenciaPagamento, getMercadoPagoInitPoint, getMercadoPagoWebhookPaymentId, getMercadoPagoWebhookTopic, validarAssinaturaMercadoPago } from "../services/mercado-pago.service.js";
import { calcularFrete, normalizarCep } from "../services/melhorEnvio.service.js";

type CartPayloadItem = { productId: string; quantity: number; customizationNotes?: string; selectedVariations?: Record<string, string> };
type ShippingSelection = {
  groupId: string;
  sellerId?: string;
  sellerProfileId?: string | null;
  artesaoId?: string | null;
  cepOrigem: string;
  cepDestino: string;
  transportadora: string;
  servico: string;
  servicoId: string;
  valor: number;
  prazo: number;
  melhorEnvioId?: string;
};

const addressString = (address: unknown) => JSON.stringify(address ?? {});
const orderInclude = { items: { include: { product: true, seller: true } }, buyer: { select: { id: true, name: true, email: true } }, history: { orderBy: { createdAt: "asc" as const } }, shippingQuotes: true };

function orderCode() {
  return `NEXUS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
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
  if (status === "rejected") return OrderStatus.PAYMENT_REJECTED;
  if (status === "refunded") return OrderStatus.REFUNDED;
  if (status === "cancelled" || status === "canceled") return OrderStatus.CANCELED;
  return OrderStatus.AWAITING_PAYMENT;
}

async function addHistory(orderId: string, previousStatus: OrderStatus | null, newStatus: OrderStatus, note?: string) {
  await prisma.orderHistory.create({ data: { orderId, previousStatus: previousStatus ?? undefined, newStatus, note } });
}

async function createBlockedPayouts(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, buyer: { include: { customer: true } } }
  });
  if (!order) return;

  const itemsBySeller = order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
    acc[item.sellerId] = [...(acc[item.sellerId] ?? []), item];
    return acc;
  }, {});

  const existingHistory = order.mpPaymentId
    ? await prisma.paymentHistory.findFirst({ where: { type: PaymentHistoryType.CUSTOMER_PURCHASE, mpPaymentId: order.mpPaymentId, status: "APPROVED" } })
    : null;
  if (!existingHistory) {
    await prisma.paymentHistory.create({
      data: {
        customerId: order.buyer.customer?.id,
        orderId: order.id,
        type: PaymentHistoryType.CUSTOMER_PURCHASE,
        amount: order.total,
        status: "APPROVED",
        mpPaymentId: order.mpPaymentId,
        mpPreferenceId: order.mpPreferenceId,
        description: `Compra ${order.orderCode}`
      }
    });
  }

  for (const [sellerId, items] of Object.entries(itemsBySeller)) {
    const artisan = await prisma.artisan.findFirst({ where: { storeId: sellerId } });
    if (!artisan) continue;
    const saleAmount = items.reduce((sum, item) => sum + Number(item.total), 0);
    await prisma.sellerPayout.upsert({
      where: { orderId_artisanId: { orderId: order.id, artisanId: artisan.id } },
      update: { status: SellerPayoutStatus.BLOCKED, saleAmount, totalAmount: saleAmount, availableAmount: saleAmount },
      create: {
        orderId: order.id,
        artisanId: artisan.id,
        saleAmount,
        shippingAmount: 0,
        totalAmount: saleAmount,
        availableAmount: saleAmount,
        status: SellerPayoutStatus.BLOCKED,
        note: "Valor bloqueado até confirmação de recebimento pelo cliente."
      }
    });
  }
}

export async function createOrder(req: Request, res: Response) {
  const items = (req.body.items ?? []) as CartPayloadItem[];
  const shippingAddress = req.body.shippingAddress ?? req.body.enderecoEntrega;
  const shippingSelections = (req.body.shippingSelections ?? []) as ShippingSelection[];

  if (!Array.isArray(items) || items.length === 0) throw new AppError("Não foi possível concluir o pedido.", 400, { carrinho: "Carrinho vazio." });
  if (!shippingAddress) throw new AppError("Não foi possível concluir o pedido.", 400, { enderecoEntrega: "Informe o endereço de entrega." });

  const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) } }, include: { seller: true } });
  if (products.length !== items.length) throw new AppError("Não foi possível concluir o pedido.", 404, { produtos: "Um ou mais produtos não foram encontrados." });

  const orderItems = items.map((item) => {
    const product = products.find((current) => current.id === item.productId)!;
    if (product.status !== ProductStatus.ACTIVE) throw new AppError("Não foi possível concluir o pedido.", 400, { produto: `${product.name} não está ativo.` });
    if (product.stock < item.quantity) throw new AppError("Não foi possível concluir o pedido.", 400, { estoque: `Estoque insuficiente para ${product.name}.` });
    const variations = Array.isArray(product.variations) ? product.variations as Array<{ name: string; options: string[] }> : [];
    const missing = variations.find((variation) => !item.selectedVariations?.[variation.name]);
    if (missing) throw new AppError("Não foi possível concluir o pedido.", 400, { variacao: `Selecione ${missing.name} para ${product.name}.` });
    const image = Array.isArray(product.images) ? (product.images[0] as { url?: string } | undefined)?.url : undefined;
    const unitPrice = Number(product.price);
    return { product, item, unitPrice, subtotal: unitPrice * item.quantity, image };
  });

  const productsTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const destinationZipCode = normalizarCep((shippingAddress as { zipCode?: string; cep?: string }).zipCode ?? (shippingAddress as { zipCode?: string; cep?: string }).cep ?? "");
  const recalculatedFreight = await calcularFrete({
    cepDestino: destinationZipCode,
    itens: items.map((item) => ({ produtoId: item.productId, quantidade: item.quantity, variacaoSelecionada: item.selectedVariations }))
  });
  if (shippingSelections.length !== recalculatedFreight.grupos.length) {
    throw new AppError("Não foi possível concluir o pedido.", 400, { frete: "Selecione uma opção de frete para cada loja." });
  }
  const validatedShipping = recalculatedFreight.grupos.map((grupo) => {
    const selected = shippingSelections.find((item) => item.groupId === grupo.groupId || item.sellerId === grupo.sellerId);
    if (!selected) {
      throw new AppError("Não foi possível concluir o pedido.", 400, { frete: `Selecione o frete de ${grupo.loja}.` });
    }
    const option = grupo.opcoes.find((current) => String(current.melhorEnvioServiceId) === String(selected.servicoId) || current.id === selected.servicoId);
    if (!option) {
      throw new AppError("Não foi possível concluir o pedido.", 400, { frete: `Opção de frete inválida para ${grupo.loja}.` });
    }
    return {
      groupId: grupo.groupId,
      sellerId: grupo.sellerId,
      artisanId: grupo.sellerProfileId ?? grupo.artesaoId,
      originZipCode: grupo.cepOrigem,
      destinationZipCode: grupo.cepDestino,
      carrier: option.empresa,
      service: option.nome,
      serviceId: String(option.melhorEnvioServiceId),
      price: option.preco,
      deliveryTime: option.prazo,
      melhorEnvioId: option.id
    };
  });
  const shippingTotal = validatedShipping.reduce((sum, item) => sum + item.price, 0);
  const total = productsTotal + shippingTotal;
  const buyer = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!buyer) throw new AppError("Comprador não encontrado", 404);

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
        },
        shippingQuotes: {
          create: validatedShipping.map((freight) => ({
            artisanId: freight.artisanId,
            sellerId: freight.sellerId,
            originZipCode: freight.originZipCode,
            destinationZipCode: freight.destinationZipCode,
            carrier: freight.carrier,
            service: freight.service,
            serviceId: freight.serviceId,
            price: freight.price,
            deliveryTime: freight.deliveryTime,
            melhorEnvioId: freight.melhorEnvioId
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
    items: [
      ...pedido.items.map((item) => ({ title: item.productName || item.product.name, quantity: item.quantity, unit_price: Number(item.unitPrice) })),
      ...(shippingTotal > 0 ? [{ title: "Frete", quantity: 1, unit_price: shippingTotal }] : [])
    ]
  });

  const initPoint = getMercadoPagoInitPoint(preference);
  if (!initPoint) throw new AppError("Não foi possível criar o link de pagamento.", 500, { pagamento: "Mercado Pago não retornou init_point." });

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
  if (!order || order.buyerId !== req.user!.id) throw new AppError("Pedido não encontrado", 404);
  res.json({ success: true, data: { pedido: order } });
}

export async function cancelMyOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: String(req.params.id) } });
  if (!order || order.buyerId !== req.user!.id) throw new AppError("Pedido não encontrado", 404);
  const cancelable: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PENDING, OrderStatus.AWAITING_PAYMENT];
  if (!cancelable.includes(order.status)) {
    throw new AppError("Pedido não pode ser cancelado neste status", 400, { status: "Cancelamento indisponível." });
  }
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELED }, include: orderInclude });
  await addHistory(order.id, order.status, OrderStatus.CANCELED, "Pedido cancelado pelo cliente.");
  res.json({ success: true, message: "Pedido cancelado.", data: { pedido: updated } });
}

export async function confirmReceipt(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: String(req.params.id) }, include: orderInclude });
  if (!order || order.buyerId !== req.user!.id) throw new AppError("Pedido não encontrado", 404);
  if (order.paymentStatus !== PaymentStatus.APPROVED) {
    throw new AppError("Pagamento ainda não aprovado.", 400, { payment: "A confirmação de recebimento exige pagamento aprovado." });
  }
  if (order.status === OrderStatus.CANCELED) {
    throw new AppError("Pedido cancelado.", 400, { status: "Pedido cancelado não pode ser confirmado." });
  }
  if (order.customerConfirmedDelivery) {
    return res.json({ success: true, message: "Recebimento já confirmado.", data: { pedido: order } });
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const pedido = await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.DELIVERED,
        customerConfirmedDelivery: true,
        deliveryConfirmedAt: now,
        paymentReleasedToArtisan: true
      },
      include: orderInclude
    });
    await tx.orderHistory.create({ data: { orderId: order.id, previousStatus: order.status, newStatus: OrderStatus.DELIVERED, note: "Recebimento confirmado pelo cliente." } });
    await tx.sellerPayout.updateMany({ where: { orderId: order.id, status: SellerPayoutStatus.BLOCKED }, data: { status: SellerPayoutStatus.AVAILABLE, releasedAt: now, note: "Valor disponível após confirmação de recebimento." } });
    return pedido;
  });

  res.json({ success: true, message: "Recebimento confirmado. Avaliação liberada.", data: { pedido: updated } });
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
  if (!order) throw new AppError("Pedido não encontrado", 404);
  res.json({ success: true, data: { pedido: order } });
}

export async function updateArtisanOrderStatus(req: Request, res: Response) {
  const allowed: OrderStatus[] = [OrderStatus.IN_PRODUCTION, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
  const status = String(req.body.status ?? "").toUpperCase() as OrderStatus;
  if (!allowed.includes(status)) throw new AppError("Status inválido", 400, { status: "A loja pode usar IN_PRODUCTION, SHIPPED ou DELIVERED." });
  const order = await prisma.order.findFirst({ where: { id: String(req.params.id), items: { some: { sellerId: req.user!.sellerId } } } });
  if (!order) throw new AppError("Pedido não encontrado", 404);
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status }, include: orderInclude });
  await addHistory(order.id, order.status, status, "Status atualizado pela loja.");
  res.json({ success: true, message: "Status atualizado.", data: { pedido: updated } });
}

export async function paymentWebhook(req: Request, res: Response) {
  try {
    const topic = getMercadoPagoWebhookTopic(req.body, req.query);
    const paymentId = getMercadoPagoWebhookPaymentId({ query: req.query, body: req.body });
    if (!paymentId) return res.status(200).json({ success: true, message: "Evento ignorado." });
    if (topic && topic.includes("merchant_order")) {
      console.info("[mercado-pago:webhook:merchant-order:ignored]", { topic, paymentId });
      return res.status(200).json({ success: true, message: "Evento ignorado." });
    }
    if (topic && !topic.includes("payment")) {
      console.info("[mercado-pago:webhook:ignored]", { topic, paymentId });
      return res.status(200).json({ success: true, message: "Evento ignorado." });
    }
    if (!validarAssinaturaMercadoPago(req.headers, paymentId)) return res.status(401).json({ success: false, message: "Assinatura do webhook inválida." });
    const payment = await consultarPagamento(paymentId) as {
      id?: string | number;
      status?: string;
      status_detail?: string;
      external_reference?: string;
      transaction_amount?: number;
      preference_id?: string;
      payment_method_id?: string;
      payment_type_id?: string;
    };
    const orderId = "external_reference" in payment ? String(payment.external_reference) : undefined;
    const status = "status" in payment ? String(payment.status) : "pending";
    console.info("[mercado-pago:webhook:payment]", { topic, paymentId, externalReference: orderId, status, statusDetail: payment.status_detail });
    if (!orderId || orderId.startsWith("subscription:")) return res.status(200).json({ success: true, message: "Evento ignorado." });
    const current = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, buyer: { include: { customer: true } } } });
    if (!current) {
      console.info("[mercado-pago:webhook:order:not-found]", { paymentId, externalReference: orderId });
      return res.status(200).json({ success: true, message: "Evento ignorado." });
    }
    const newOrderStatus = mapOrderStatusFromPayment(status);
    const newPaymentStatus = mapPaymentStatus(status);
    const sameStatusAlreadyProcessed = current.mpPaymentId === String(payment.id) && current.paymentStatus === newPaymentStatus && current.status === newOrderStatus;
    const updated = sameStatusAlreadyProcessed
      ? current
      : await prisma.order.update({
          where: { id: current.id },
          data: {
            status: newOrderStatus,
            paymentStatus: newPaymentStatus,
            mpPaymentId: String(payment.id),
            mpStatus: status,
            mpPreferenceId: payment.preference_id ?? current.mpPreferenceId
          },
          include: { items: true }
        });
    if (!sameStatusAlreadyProcessed && current.status !== newOrderStatus) {
      await addHistory(current.id, current.status, newOrderStatus, `Webhook Mercado Pago: ${status}`);
    }
    const existingPaymentHistory = await prisma.paymentHistory.findFirst({
      where: { type: PaymentHistoryType.CUSTOMER_PURCHASE, mpPaymentId: String(payment.id), status: newPaymentStatus }
    });
    if (!existingPaymentHistory) {
      await prisma.paymentHistory.create({
        data: {
          customerId: current.buyer.customer?.id,
          orderId: current.id,
          type: PaymentHistoryType.CUSTOMER_PURCHASE,
          amount: payment.transaction_amount ?? current.total,
          status: newPaymentStatus,
          mpPaymentId: String(payment.id),
          mpPreferenceId: payment.preference_id ?? current.mpPreferenceId,
          description: `Compra ${current.orderCode} - Mercado Pago ${status}`
        }
      });
    }
    if (status === "approved" && current.paymentStatus !== PaymentStatus.APPROVED) {
      await Promise.all(updated.items.map((item) => prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity }, seller: { update: { salesCount: { increment: item.quantity } } } } })));
      await createBlockedPayouts(current.id);
    }
  } catch (error) {
    console.error("[mercado-pago:webhook:error]", error instanceof Error ? { message: error.message, name: error.name } : { message: "unknown" });
  }
  res.status(200).json({ success: true, message: "Webhook processado com sucesso." });
}
