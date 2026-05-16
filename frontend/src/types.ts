<<<<<<< HEAD
export type {
  CartItem,
  Category,
  Product,
  ProductDimensions,
  ProductImage,
  ProductStatus,
  Seller
} from "./types/product";
export type { AddressDTO, CreateAddressDTO } from "./types/address";
export type { AdminPermissionLevel, UserResponseDTO, UserRole, UserType } from "./types/user";
export type { AdminResponseDTO, CreateAdminDTO } from "./types/admin";
export type { ArtisanResponseDTO, CreateArtisanDTO } from "./types/artisan";
export type { CreateCustomerDTO, CustomerResponseDTO } from "./types/customer";
=======
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
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
