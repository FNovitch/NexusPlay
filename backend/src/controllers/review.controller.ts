import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function createReview(req: Request, res: Response) {
  const review = await prisma.review.create({
    data: {
      authorId: req.user!.id,
      productId: req.body.productId,
      sellerId: req.body.sellerId,
      orderItemId: req.body.orderItemId,
      type: req.body.type,
      rating: req.body.rating,
      comment: req.body.comment
    }
  });

  if (review.productId) {
    const agg = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true }
    });
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: agg._avg.rating ?? 0 }
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
