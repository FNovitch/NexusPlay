export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Seller = {
  id: string;
  storeName: string;
  slug: string;
  bio: string;
  story: string;
  avatarUrl?: string;
  coverUrl?: string;
  rating: number;
  salesCount: number;
  status?: string;
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
  images: string[];
  customizationAvailable: boolean;
  personalizationPrompt?: string;
  rating: number;
  salesCount: number;
  seller: Seller;
  category: Category;
};

export type CartItem = {
  product: Product;
  quantity: number;
  customizationNotes?: string;
};
