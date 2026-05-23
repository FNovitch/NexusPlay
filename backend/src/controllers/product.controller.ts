import type { Request, Response } from "express";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import type { CreateProductDTO, UpdateProductDTO } from "../modules/products/product.types.js";
import { slugify } from "../utils/slugify.js";

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function uploadedImages(req: Request, name: string) {
  const files = Array.isArray(req.files) ? req.files : [];
  return files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    alt: name
  }));
}

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

  const body = req.body as CreateProductDTO & { categoryId: string };
  const seller = await prisma.seller.findUnique({
    where: { id: req.user.sellerId },
    include: {
      artisans: {
        include: { addresses: true },
        take: 1
      }
    }
  });

  if (!seller) {
    throw new AppError("Perfil de vendedor nao encontrado", 404);
  }

  const artisan = seller.artisans[0];
  const address = artisan?.addresses.find((item) => item.isDefault) ?? artisan?.addresses[0];
  const defaultPickupAddress = address
    ? `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}`
    : null;
  const pickupAvailable = body.pickupAvailable ?? artisan?.acceptsLocalPickup ?? false;

  const images = uploadedImages(req, body.name);
  const bodyImages = images.length > 0 ? images : body.images;
  if (!bodyImages || bodyImages.length === 0) {
    throw new AppError("Envie pelo menos uma imagem do produto", 400, { images: "Envie de 1 a 3 imagens." });
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
      images: bodyImages,
      mainImage: bodyImages[0],
      artisanId: seller.id,
      artisanName: seller.storeName,
      artisanSlug: seller.slug,
      dimensions: body.dimensions ?? Prisma.JsonNull,
      variations: parseJsonField(body.variations, []),
      weight: body.weight ?? 0,
      shippingAvailable: body.shippingAvailable ?? true,
      pickupAvailable,
      pickupAddress: pickupAvailable ? body.pickupAddress ?? defaultPickupAddress : null,
      customizationAvailable: body.customizationAvailable ?? false,
      personalizationPrompt: body.personalizationPrompt ?? null,
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

  const body = req.body as UpdateProductDTO & { categoryId?: string };
  const images = uploadedImages(req, body.name ?? product.name);
  const data: Prisma.ProductUpdateInput = {
    category: body.categoryId ? { connect: { id: body.categoryId } } : undefined,
    name: body.name,
    slug: body.name ? slugify(body.name) : undefined,
    description: body.description,
    price: body.price,
    stock: body.stock,
    categoryName: body.category,
    images: images.length > 0 ? images : body.images,
    mainImage: images.length > 0 ? images[0] : body.images?.[0],
    dimensions: body.dimensions === undefined ? undefined : body.dimensions ?? Prisma.JsonNull,
    variations: body.variations === undefined ? undefined : parseJsonField(body.variations, []),
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
    data: { status: ProductStatus.INACTIVE }
  });

  res.status(204).send();
}
