export type ProductStatus = "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "PENDING";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
};

export type Seller = {
  id: string;
  storeName: string;
  slug: string;
  bio?: string;
  story?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  rating: number;
  salesCount: number;
  status?: string;
};

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

export type Product = {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string | Category;
  categoryDetails?: Category;
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
  personalizationPrompt?: string | null;
  rating: number;
  salesCount: number;
  seller?: Seller;
  createdAt?: string;
  updatedAt?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  customizationNotes?: string;
};
