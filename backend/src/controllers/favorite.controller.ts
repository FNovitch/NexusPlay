import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function listFavorites(req: Request, res: Response) {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    include: { product: { include: { seller: true, category: true } } },
    orderBy: { createdAt: "desc" }
  });

  res.json({ favorites });
}

export async function toggleFavorite(req: Request, res: Response) {
  const key = { userId_productId: { userId: req.user!.id, productId: String(req.params.productId) } };
  const existing = await prisma.favorite.findUnique({ where: key });

  if (existing) {
    await prisma.favorite.delete({ where: key });
    return res.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: { userId: req.user!.id, productId: String(req.params.productId) }
  });

  res.status(201).json({ favorited: true });
}
