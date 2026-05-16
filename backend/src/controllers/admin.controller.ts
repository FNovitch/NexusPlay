import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function adminOverview(_req: Request, res: Response) {
  const [users, sellers, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.seller.groupBy({ by: ["status"], _count: true }),
    prisma.product.groupBy({ by: ["status"], _count: true }),
    prisma.order.count()
  ]);

  res.json({ users, sellers, products, orders });
}

export async function moderateSeller(req: Request, res: Response) {
  const seller = await prisma.seller.update({
    where: { id: String(req.params.id) },
    data: { status: req.body.status }
  });

  res.json({ seller });
}

export async function moderateProduct(req: Request, res: Response) {
  const product = await prisma.product.update({
    where: { id: String(req.params.id) },
    data: { status: req.body.status }
  });

  res.json({ product });
}
