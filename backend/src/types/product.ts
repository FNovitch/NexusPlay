export type ProductStatus = "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "PENDING";

export type ProductImage = {
  url: string;
  filename: string;
  alt: string;
};

export type ProductDimensions = {
  width: number;
  height: number;
  length: number;
};

export type CreateProductDTO = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  categoryId?: string;
  images: ProductImage[];
  dimensions?: ProductDimensions | null;
  weight?: number;
  shippingAvailable?: boolean;
  pickupAvailable?: boolean;
  pickupAddress?: string | null;
  customizationAvailable?: boolean;
  personalizationPrompt?: string | null;
};

export type UpdateProductDTO = Partial<CreateProductDTO> & {
  status?: ProductStatus;
};

export type ProductResponseDTO = {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: ProductImage[];
  mainImage: ProductImage | null;
  artisanId: string;
  artisanName: string;
  artisanSlug: string;
  dimensions: ProductDimensions | null;
  weight: number;
  shippingAvailable: boolean;
  pickupAvailable: boolean;
  pickupAddress: string | null;
  status: ProductStatus;
  averageRating: number;
  totalReviews: number;
  customizationAvailable: boolean;
  personalizationPrompt: string | null;
  rating: number;
  salesCount: number;
  seller?: {
    id: string;
    storeName: string;
    slug: string;
    avatarUrl?: string | null;
    rating?: number;
    status?: string;
  };
  categoryDetails?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
  };
  createdAt: string;
  updatedAt: string;
};
