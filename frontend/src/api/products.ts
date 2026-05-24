import type { Category, Product, ProductImage, Seller } from "../types";

type RawProductImage = ProductImage | string;

type RawProduct = Omit<Partial<Product>, "images" | "mainImage" | "category" | "seller"> & {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  stock: number;
  category?: string | Category;
  categoryDetails?: Category;
  images?: RawProductImage[];
  mainImage?: RawProductImage | null;
  artisanId?: string;
  artisanName?: string;
  artisanSlug?: string;
  seller?: Seller;
};

function normalizeImage(image: RawProductImage | null | undefined, fallbackAlt: string): ProductImage | null {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return {
      url: image,
      filename: image.split("/").pop()?.split("?")[0] || "product-image",
      alt: fallbackAlt
    };
  }

  return {
    url: image.url,
    id: image.id,
    publicId: image.publicId,
    filename: image.filename || "product-image",
    alt: image.alt || fallbackAlt
  };
}

export function normalizeProduct(product: RawProduct): Product {
  const images = (product.images ?? [])
    .map((image) => normalizeImage(image, product.name))
    .filter((image): image is ProductImage => image !== null)
    .slice(0, 3);
  const mainImage = normalizeImage(product.mainImage, product.name) ?? images[0] ?? null;
  const categoryDetails = typeof product.category === "object" ? product.category : product.categoryDetails;
  const seller = product.seller;

  return {
    id: product.id,
    sellerId: product.sellerId ?? seller?.id ?? product.artisanId ?? "",
    categoryId: product.categoryId ?? categoryDetails?.id ?? "",
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    category: typeof product.category === "string" ? product.category : categoryDetails ?? "",
    categoryDetails,
    images,
    mainImage,
    artisanId: product.artisanId ?? seller?.id ?? product.sellerId ?? "",
    artisanName: product.artisanName ?? seller?.storeName ?? "",
    artisanSlug: product.artisanSlug ?? seller?.slug ?? "",
    dimensions: product.dimensions ?? null,
    variations: product.variations ?? [],
    weight: Number(product.weight ?? 0),
    shippingAvailable: product.shippingAvailable ?? true,
    pickupAvailable: product.pickupAvailable ?? false,
    pickupAddress: product.pickupAddress ?? null,
    status: product.status ?? "ACTIVE",
    averageRating: product.averageRating ?? product.rating ?? 0,
    totalReviews: product.totalReviews ?? 0,
    customizationAvailable: product.customizationAvailable ?? false,
    personalizationPrompt: product.personalizationPrompt ?? null,
    rating: product.rating ?? product.averageRating ?? 0,
    salesCount: product.salesCount ?? 0,
    reviews: product.reviews ?? [],
    seller,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

export function productImageUrl(product: Product) {
  const url = product.mainImage?.url ?? product.images[0]?.url ?? "";
  if (url.startsWith("/uploads")) {
    return `${new URL(import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").origin}${url}`;
  }
  return url;
}

export function productCategorySlug(product: Product) {
  if (typeof product.category === "object") {
    return product.category.slug;
  }
  return product.categoryDetails?.slug ?? product.category;
}

export function productSellerName(product: Product) {
  return product.seller?.storeName ?? product.artisanName;
}

export function productSellerSlug(product: Product) {
  return product.seller?.slug ?? product.artisanSlug;
}

export function productRating(product: Product) {
  return product.averageRating || product.rating || 0;
}

export function productSalesCount(product: Product) {
  return product.salesCount;
}
