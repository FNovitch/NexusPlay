import type { Request, Response } from "express";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import { createCheckoutPreference, getPayment } from "../services/mercado-pago.service.js";

export async function checkout(req: Request, res: Response) {
  const items = req.body.items as Array<{ productId: string; quantity: number; customizationNotes?: string }>;
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, status: "ACTIVE" },
    include: { seller: true }
  });

  if (products.length !== items.length) {
    throw new AppError("Um ou mais produtos estao indisponiveis", 422);
  }

  const orderItems = items.map((item) => {
    const product = products.find((current) => current.id === item.productId)!;
    if (product.stock < item.quantity) {
      throw new AppError(`Estoque insuficiente para ${product.name}`, 422);
    }

    const unitPrice = Number(product.price);
    return {
      product,
      quantity: item.quantity,
      customizationNotes: item.customizationNotes,
      unitPrice,
      total: unitPrice * item.quantity
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.total, 0);
  const buyer = await prisma.user.findUnique({ where: { id: req.user!.id } });

  if (!buyer) {
    throw new AppError("Comprador nao encontrado", 404);
  }

  const order = await prisma.order.create({
    data: {
      buyerId: req.user!.id,
      total,
      items: {
        create: orderItems.map((item) => ({
          productId: item.product.id,
          sellerId: item.product.sellerId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          customizationNotes: item.customizationNotes
        }))
      }
    },
    include: { items: { include: { product: true, seller: true } } }
  });

  const preference = await createCheckoutPreference({
    orderId: order.id,
    buyerEmail: buyer.email,
    items: order.items.map((item) => ({
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice)
    }))
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { mpPreferenceId: preference.id }
  });

  const sellerTotals = order.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.seller.storeName] = (acc[item.seller.storeName] ?? 0) + Number(item.total);
    return acc;
  }, {});

  res.status(201).json({ order, preference, sellerTotals });
}

export async function myOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.id },
    include: { items: { include: { product: true, seller: true } } },
    orderBy: { createdAt: "desc" }
  });

  res.json({ orders });
}

export async function paymentWebhook(req: Request, res: Response) {
  const paymentId = String(req.query["data.id"] ?? req.body?.data?.id ?? "");
  if (!paymentId) {
    return res.status(200).json({ received: true });
  }

  const payment = await getPayment(paymentId);
  const orderId = "external_reference" in payment ? String(payment.external_reference) : undefined;

  if (orderId && payment.status === "approved") {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.APPROVED,
        status: "PAID",
        mpPaymentId: String(payment.id)
      },
      include: { items: true }
    });

    await Promise.all(
      order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
            seller: { update: { salesCount: { increment: item.quantity } } }
          }
        })
      )
    );
  }

  res.json({ received: true });
}
