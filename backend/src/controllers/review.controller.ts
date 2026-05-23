import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";

export async function createReview(req: Request, res: Response) {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: req.body.orderItemId },
    include: { order: true, review: true, product: true }
  });

  if (!orderItem || orderItem.order.buyerId !== req.user!.id) {
    throw new AppError("Voce so pode avaliar produtos comprados por voce", 403);
  }

  if (orderItem.order.status !== "DELIVERED") {
    throw new AppError("Produto so pode ser avaliado apos a entrega", 400, { order: "Pedido ainda nao foi entregue." });
  }

  if (orderItem.review) {
    throw new AppError("Este item ja foi avaliado", 409, { review: "Avaliacao duplicada nao permitida." });
  }

  const review = await prisma.review.create({
    data: {
      authorId: req.user!.id,
      productId: orderItem.productId,
      sellerId: orderItem.sellerId,
      orderItemId: orderItem.id,
      type: "PRODUCT",
      rating: req.body.rating,
      comment: req.body.comment
    }
  });

  if (review.productId) {
    const [agg, totalReviews] = await Promise.all([
      prisma.review.aggregate({
        where: { productId: review.productId },
        _avg: { rating: true }
      }),
      prisma.review.count({ where: { productId: review.productId } })
    ]);
    const averageRating = agg._avg.rating ?? 0;

    await prisma.product.update({
      where: { id: review.productId },
      data: { averageRating, totalReviews, rating: averageRating }
    });
  }

  if (review.sellerId) {
    const agg = await prisma.review.aggregate({
      where: { sellerId: review.sellerId },
      _avg: { rating: true }
    });
    await prisma.seller.update({
      where: { id: review.sellerId },
      data: { rating: agg._avg.rating ?? 0 }
    });
  }

  res.status(201).json({ review });
}
