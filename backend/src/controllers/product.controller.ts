import type { Request, Response } from "express";
import { ProductStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import { slugify } from "../utils/slugify.js";

export async function myProducts(req: Request, res: Response) {
  const products = await prisma.product.findMany({
    where: { sellerId: req.user!.sellerId },
    include: { category: true },
    orderBy: { updatedAt: "desc" }
  });

  res.json({ products });
}

export async function createProduct(req: Request, res: Response) {
  if (!req.user?.sellerId) {
    throw new AppError("Apenas vendedores podem criar produtos", 403);
  }

  const product = await prisma.product.create({
    data: {
      ...req.body,
      sellerId: req.user.sellerId,
      slug: slugify(req.body.name),
      status: ProductStatus.PENDING
    }
  });

  res.status(201).json({ product });
}

export async function updateProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });

  if (!product || product.sellerId !== req.user?.sellerId) {
    throw new AppError("Produto nao encontrado", 404);
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      ...req.body,
      slug: req.body.name ? slugify(req.body.name) : undefined
    }
  });

  res.json({ product: updated });
}

export async function archiveProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });

  if (!product || product.sellerId !== req.user?.sellerId) {
    throw new AppError("Produto nao encontrado", 404);
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { status: ProductStatus.ARCHIVED }
  });

  res.status(204).send();
}
