import type { Request, Response } from "express";
<<<<<<< HEAD
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import type { CreateProductDTO, UpdateProductDTO } from "../modules/products/product.types.js";
=======
import { ProductStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
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

<<<<<<< HEAD
  const body = req.body as CreateProductDTO & { categoryId: string };
  const seller = await prisma.seller.findUnique({ where: { id: req.user.sellerId } });

  if (!seller) {
    throw new AppError("Perfil de vendedor nao encontrado", 404);
  }

  const product = await prisma.product.create({
    data: {
      categoryId: body.categoryId,
      sellerId: req.user.sellerId,
      name: body.name,
      slug: slugify(body.name),
      description: body.description,
      price: body.price,
      stock: body.stock,
      categoryName: body.category,
      images: body.images,
      mainImage: body.images[0],
      artisanId: seller.id,
      artisanName: seller.storeName,
      artisanSlug: seller.slug,
      dimensions: body.dimensions ?? Prisma.JsonNull,
      weight: body.weight ?? 0,
      shippingAvailable: body.shippingAvailable ?? true,
      pickupAvailable: body.pickupAvailable ?? false,
      pickupAddress: body.pickupAddress ?? null,
      customizationAvailable: body.customizationAvailable ?? false,
      personalizationPrompt: body.personalizationPrompt ?? null,
=======
  const product = await prisma.product.create({
    data: {
      ...req.body,
      sellerId: req.user.sellerId,
      slug: slugify(req.body.name),
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
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

<<<<<<< HEAD
  const body = req.body as UpdateProductDTO & { categoryId?: string };
  const data: Prisma.ProductUpdateInput = {
    category: body.categoryId ? { connect: { id: body.categoryId } } : undefined,
    name: body.name,
    slug: body.name ? slugify(body.name) : undefined,
    description: body.description,
    price: body.price,
    stock: body.stock,
    categoryName: body.category,
    images: body.images,
    mainImage: body.images?.[0],
    dimensions: body.dimensions === undefined ? undefined : body.dimensions ?? Prisma.JsonNull,
    weight: body.weight,
    shippingAvailable: body.shippingAvailable,
    pickupAvailable: body.pickupAvailable,
    pickupAddress: body.pickupAddress,
    customizationAvailable: body.customizationAvailable,
    personalizationPrompt: body.personalizationPrompt,
    status: body.status
  };

  const updated = await prisma.product.update({
    where: { id: product.id },
    data
=======
  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      ...req.body,
      slug: req.body.name ? slugify(req.body.name) : undefined
    }
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
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
<<<<<<< HEAD
    data: { status: ProductStatus.INACTIVE }
=======
    data: { status: ProductStatus.ARCHIVED }
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
  });

  res.status(204).send();
}
