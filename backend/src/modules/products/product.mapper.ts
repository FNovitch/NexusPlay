import type { ProductDimensions, ProductImage, ProductResponseDTO, ProductStatus, ProductVariation } from "./product.types.js";

type ProductMapperInput = {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: unknown;
  stock: number;
  categoryName: string;
  images: unknown;
  mainImage: unknown;
  artisanId: string;
  artisanName: string;
  artisanSlug: string;
  dimensions: unknown;
  variations?: unknown;
  weight: unknown;
  shippingAvailable: boolean;
  pickupAvailable: boolean;
  pickupAddress: string | null;
  status: string;
  averageRating: number;
  totalReviews: number;
  customizationAvailable: boolean;
  personalizationPrompt: string | null;
  rating: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
  seller?: {
    id: string;
    storeName: string;
    slug: string;
    avatarUrl?: string | null;
    rating?: number;
    status?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
  };
  reviews?: Array<{ rating: number; comment?: string; createdAt?: Date; author?: { id: string; name: string; avatarUrl?: string | null } }>;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeImage(value: unknown, fallbackAlt: string): ProductImage | null {
  if (typeof value === "string" && value.length > 0) {
    return {
      url: value,
      filename: value.split("/").pop()?.split("?")[0] || "product-image",
      alt: fallbackAlt
    };
  }

  if (!isRecord(value) || typeof value.url !== "string" || value.url.length === 0) {
    return null;
  }

  return {
    url: value.url,
    filename: typeof value.filename === "string" && value.filename.length > 0 ? value.filename : "product-image",
    alt: typeof value.alt === "string" && value.alt.length > 0 ? value.alt : fallbackAlt
  };
}

export function normalizeProductImages(images: unknown, fallbackAlt: string): ProductImage[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => normalizeImage(image, fallbackAlt))
    .filter((image): image is ProductImage => image !== null)
    .slice(0, 3);
}

function normalizeDimensions(value: unknown): ProductDimensions | null {
  if (!isRecord(value)) {
    return null;
  }

  const width = Number(value.width);
  const height = Number(value.height);
  const length = Number(value.length);

  if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(length)) {
    return null;
  }

  return { width, height, length };
}

function normalizeVariations(value: unknown): ProductVariation[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((variation) => ({
      name: typeof variation.name === "string" ? variation.name : "",
      options: Array.isArray(variation.options) ? variation.options.filter((option): option is string => typeof option === "string" && option.length > 0) : []
    }))
    .filter((variation) => variation.name.length > 0 && variation.options.length > 0);
}

export function mapProductToResponse(product: ProductMapperInput): ProductResponseDTO {
  const images = normalizeProductImages(product.images, product.name);
  const mainImage = normalizeImage(product.mainImage, product.name) ?? images[0] ?? null;
  const reviews = product.reviews ?? [];
  const reviewsAverage =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : product.averageRating;

  return {
    id: product.id,
    sellerId: product.sellerId,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    category: product.categoryName || product.category?.name || "",
    images,
    mainImage,
    artisanId: product.artisanId || product.sellerId,
    artisanName: product.artisanName || product.seller?.storeName || "",
    artisanSlug: product.artisanSlug || product.seller?.slug || "",
    dimensions: normalizeDimensions(product.dimensions),
    variations: normalizeVariations(product.variations),
    weight: Number(product.weight),
    shippingAvailable: product.shippingAvailable,
    pickupAvailable: product.pickupAvailable,
    pickupAddress: product.pickupAddress ?? null,
    status: product.status as ProductStatus,
    averageRating: reviewsAverage,
    totalReviews: product.totalReviews || reviews.length,
    customizationAvailable: product.customizationAvailable,
    personalizationPrompt: product.personalizationPrompt ?? null,
    rating: reviewsAverage || product.rating,
    salesCount: product.salesCount,
    reviews: reviews.map((review) => ({
      rating: review.rating,
      comment: review.comment ?? "",
      createdAt: review.createdAt?.toISOString?.() ?? "",
      author: review.author
    })),
    seller: product.seller,
    categoryDetails: product.category,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}
