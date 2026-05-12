import type { Request, Response } from "express";
import { ProductStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } }
  });

  res.json({ categories });
}

export async function listProducts(req: Request, res: Response) {
  const { q, category, minPrice, maxPrice, rating, sort = "featured" } = req.query;
  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : sort === "best_sellers"
          ? { salesCount: "desc" as const }
          : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      stock: { gt: 0 },
      name: q ? { contains: String(q), mode: "insensitive" } : undefined,
      category: category ? { slug: String(category) } : undefined,
      price: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined
      },
      rating: rating ? { gte: Number(rating) } : undefined
    },
    include: {
      category: true,
      seller: {
        select: { id: true, storeName: true, slug: true, avatarUrl: true, rating: true, status: true }
      },
      reviews: { select: { rating: true } }
    },
    orderBy,
    take: 60
  });

  res.json({ products });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findFirst({
    where: {
      slug: String(req.params.slug),
      status: ProductStatus.ACTIVE
    },
    include: {
      category: true,
      seller: true,
      reviews: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!product) {
    return res.status(404).json({ message: "Produto nao encontrado" });
  }

  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      sellerId: product.sellerId,
      status: ProductStatus.ACTIVE
    },
    take: 8,
    include: { seller: true, category: true }
  });

  res.json({ product, related });
}

export async function autocomplete(req: Request, res: Response) {
  const q = String(req.query.q ?? "");
  if (q.length < 2) {
    return res.json({ suggestions: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      name: { contains: q, mode: "insensitive" }
    },
    select: { id: true, name: true, slug: true, images: true },
    take: 8
  });

  res.json({ suggestions: products });
}
