import type { Request, Response } from "express";
import { ProductStatus, SellerStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import { mapProductToResponse } from "../modules/products/product.mapper.js";
import { slugify } from "../utils/slugify.js";

export async function listSellers(_req: Request, res: Response) {
  const sellers = await prisma.seller.findMany({
    where: { status: SellerStatus.APPROVED },
    orderBy: [{ salesCount: "desc" }, { rating: "desc" }],
    select: {
      id: true,
      storeName: true,
      slug: true,
      bio: true,
      avatarUrl: true,
      coverUrl: true,
      rating: true,
      salesCount: true,
      status: true,
      _count: { select: { products: true, reviews: true } }
    },
    take: 24
  });

  res.json({ sellers });
}

export async function getSellerStore(req: Request, res: Response) {
  const seller = await prisma.seller.findUnique({
    where: { slug: String(req.params.slug) },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      reviews: {
        include: { author: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 8
      },
      products: {
        where: { status: ProductStatus.ACTIVE },
        include: { category: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!seller || seller.status !== SellerStatus.APPROVED) {
    throw new AppError("Loja não encontrada", 404);
  }

  res.json({
    seller: {
      ...seller,
      products: seller.products.map((product) => mapProductToResponse({ ...product, seller }))
    }
  });
}

export async function updateMySeller(req: Request, res: Response) {
  if (!req.user?.sellerId) {
    throw new AppError("Perfil de vendedor não encontrado", 404);
  }

  const { storeName, bio, story, avatarUrl, coverUrl } = req.body;
  const seller = await prisma.seller.update({
    where: { id: req.user.sellerId },
    data: {
      storeName,
      slug: storeName ? slugify(storeName) : undefined,
      bio,
      story,
      avatarUrl,
      coverUrl
    }
  });

  res.json({ seller });
}

export async function dashboard(req: Request, res: Response) {
  if (!req.user?.sellerId) {
    throw new AppError("Perfil de vendedor não encontrado", 404);
  }

  const [seller, items, products] = await Promise.all([
    prisma.seller.findUnique({ where: { id: req.user.sellerId } }),
    prisma.orderItem.findMany({
      where: { sellerId: req.user.sellerId, order: { paymentStatus: "APPROVED" } },
      include: { product: true, order: true },
      orderBy: { order: { createdAt: "desc" } },
      take: 50
    }),
    prisma.product.findMany({
      where: { sellerId: req.user.sellerId },
      orderBy: { salesCount: "desc" },
      take: 8
    })
  ]);

  const revenue = items.reduce((sum, item) => sum + Number(item.total), 0);
  res.json({
    seller,
    metrics: {
      orders: new Set(items.map((item) => item.orderId)).size,
      revenue,
      soldItems: items.reduce((sum, item) => sum + item.quantity, 0)
    },
    recentItems: items,
    topProducts: products
  });
}
