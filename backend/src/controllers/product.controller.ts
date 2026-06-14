import type { Request, Response } from "express";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import type { CreateProductDTO, UpdateProductDTO } from "../modules/products/product.types.js";
import { deleteImageFromCloudinary, uploadImageToCloudinary, type StoredImage } from "../services/storage.service.js";
import { slugify } from "../utils/slugify.js";

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function requestFiles(req: Request) {
  const files = Array.isArray(req.files) ? req.files : [];
  return files;
}

function imageJson(images: Array<StoredImage & { id?: string }>, name: string) {
  return images.map((image) => ({
    id: image.id,
    url: image.url,
    publicId: image.publicId,
    filename: image.fileName,
    alt: name
  }));
}

function productDebug(event: string, payload: Record<string, unknown>) {
  if (process.env.PRODUCT_DEBUG !== "true") return;
  console.info(`[product:create:${event}]`, payload);
}

async function uniqueProductSlug(tx: Prisma.TransactionClient, name: string, ignoreId?: string) {
  const base = slugify(name) || `produto-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  while (await tx.product.findFirst({ where: { slug: candidate, id: ignoreId ? { not: ignoreId } : undefined }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function myProducts(req: Request, res: Response) {
  const products = await prisma.product.findMany({
    where: { sellerId: req.user!.sellerId },
    include: { category: true, productImages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" }
  });

  res.json({ products });
}

export async function createProduct(req: Request, res: Response) {
  productDebug("start", {
    user: req.user ? { id: req.user.id, role: req.user.role, sellerId: req.user.sellerId } : null,
    bodyKeys: Object.keys(req.body ?? {}),
    fileCount: requestFiles(req).length
  });

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
    throw new AppError("Perfil de vendedor não encontrado", 404);
  }

  const artisan = seller.artisans[0];
  productDebug("seller-found", {
    sellerId: seller.id,
    sellerStatus: seller.status,
    artisanId: artisan?.id,
    artisanStatus: artisan?.status,
    artisanActive: artisan?.active,
    artisanBlocked: artisan?.blocked
  });

  const address = artisan?.addresses.find((item) => item.isDefault) ?? artisan?.addresses[0];
  const defaultPickupAddress = address
    ? `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}`
    : null;
  const pickupAvailable = body.pickupAvailable ?? artisan?.acceptsLocalPickup ?? false;

  const files = requestFiles(req);
  productDebug("upload-start", { fileCount: files.length, fileNames: files.map((file) => file.originalname) });
  const uploaded = files.length > 0 ? await Promise.all(files.map(uploadImageToCloudinary)) : [];
  productDebug("upload-complete", { uploadedCount: uploaded.length, publicIds: uploaded.map((image) => image.publicId) });
  if (uploaded.length === 0) {
    throw new AppError("Envie pelo menos uma imagem do produto", 400, { images: "Envie de 1 a 3 imagens." });
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const slug = await uniqueProductSlug(tx, body.name);
      productDebug("prisma-create-start", { sellerId: req.user!.sellerId, categoryId: body.categoryId, slug });

      const created = await tx.product.create({
        data: {
          categoryId: body.categoryId,
          sellerId: req.user!.sellerId!,
          name: body.name,
          slug,
          description: body.description,
          price: body.price,
          stock: body.stock,
          categoryName: body.category,
          images: [],
          mainImage: Prisma.JsonNull,
          artisanId: artisan?.id ?? seller.id,
          artisanName: artisan?.name ?? seller.storeName,
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

      const createdImages = await Promise.all(uploaded.map((image) => tx.productImage.create({
        data: {
          productId: created.id,
          url: image.url,
          publicId: image.publicId,
          fileName: image.fileName
        }
      })));
      const images = imageJson(createdImages.map((image) => ({ id: image.id, url: image.url, publicId: image.publicId, fileName: image.fileName })), created.name);

      return tx.product.update({
        where: { id: created.id },
        data: { images, mainImage: images[0] },
        include: { category: true, productImages: { orderBy: { createdAt: "asc" } }, seller: true }
      });
    });

    productDebug("success", { productId: product.id, imageCount: product.productImages.length });
    res.status(201).json({ product });
  } catch (error) {
    productDebug("prisma-error-cleanup", {
      uploadedCount: uploaded.length,
      message: error instanceof Error ? error.message : "unknown"
    });
    await Promise.allSettled(uploaded.map((image) => deleteImageFromCloudinary(image.publicId)));
    throw error;
  }
}

export async function updateProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: String(req.params.id) }, include: { productImages: true } });

  if (!product || product.sellerId !== req.user?.sellerId) {
    throw new AppError("Produto não encontrado", 404);
  }

  const body = req.body as UpdateProductDTO & { categoryId?: string; removeImageIds?: string[] };
  const files = requestFiles(req);
  const removeImageIds = body.removeImageIds ?? [];
  const remainingImageCount = product.productImages.filter((image) => !removeImageIds.includes(image.id)).length;
  if (remainingImageCount + files.length > 3) {
    throw new AppError("Limite de imagens excedido", 400, { images: "O produto pode ter no maximo 3 imagens." });
  }

  if (remainingImageCount + files.length === 0) {
    throw new AppError("Envie pelo menos uma imagem do produto", 400, { images: "Mantenha pelo menos uma imagem." });
  }

  const uploaded = files.length > 0 ? await Promise.all(files.map(uploadImageToCloudinary)) : [];
  const toRemove = product.productImages.filter((image) => removeImageIds.includes(image.id));
  await Promise.all(toRemove.map((image) => deleteImageFromCloudinary(image.publicId)));

  const data: Prisma.ProductUpdateInput = {
    category: body.categoryId ? { connect: { id: body.categoryId } } : undefined,
    name: body.name,
    description: body.description,
    price: body.price,
    stock: body.stock,
    categoryName: body.category,
    dimensions: body.dimensions === undefined ? undefined : body.dimensions ?? Prisma.JsonNull,
    variations: body.variations === undefined ? undefined : parseJsonField(body.variations, []),
    weight: body.weight,
    shippingAvailable: body.shippingAvailable,
    pickupAvailable: body.pickupAvailable,
    pickupAddress: body.pickupAddress,
    customizationAvailable: body.customizationAvailable,
    personalizationPrompt: body.personalizationPrompt
  };

  const updated = await prisma.$transaction(async (tx) => {
    const slug = body.name ? await uniqueProductSlug(tx, body.name, product.id) : undefined;

    if (toRemove.length > 0) {
      await tx.productImage.deleteMany({ where: { id: { in: toRemove.map((image) => image.id) }, productId: product.id } });
    }

    if (uploaded.length > 0) {
      await Promise.all(uploaded.map((image) => tx.productImage.create({
        data: {
          productId: product.id,
          url: image.url,
          publicId: image.publicId,
          fileName: image.fileName
        }
      })));
    }

    const allImages = await tx.productImage.findMany({ where: { productId: product.id }, orderBy: { createdAt: "asc" } });
    const jsonImages = imageJson(allImages.map((image) => ({ id: image.id, url: image.url, publicId: image.publicId, fileName: image.fileName })), body.name ?? product.name);

    return tx.product.update({
      where: { id: product.id },
      data: { ...data, slug, images: jsonImages, mainImage: jsonImages[0] },
      include: { category: true, productImages: { orderBy: { createdAt: "asc" } }, seller: true }
    });
  });

  res.json({ product: updated });
}

export async function archiveProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });

  if (!product || product.sellerId !== req.user?.sellerId) {
    throw new AppError("Produto não encontrado", 404);
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { status: ProductStatus.INACTIVE }
  });

  res.status(204).send();
}
