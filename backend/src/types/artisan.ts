import type { AddressDTO, CreateAddressDTO, UpdateAddressDTO } from "./address.js";

export type ArtisanResponseDTO = {
  id: string;
  userId: string;
  userType: "ARTISAN";
  name: string;
  email: string;
  cpf: string | null;
  phone: string;
  storeId: string | null;
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  document: string;
  address: AddressDTO | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateArtisanDTO = {
  name: string;
  email: string;
  password: string;
  cpf?: string | null;
  phone: string;
  storeName: string;
  storeSlug?: string;
  storeDescription: string;
  document: string;
  address: CreateAddressDTO;
};

export type UpdateArtisanDTO = {
  name?: string;
  cpf?: string | null;
  phone?: string;
  storeName?: string;
  storeSlug?: string;
  storeDescription?: string;
  document?: string;
  isDeleted?: boolean;
  address?: UpdateAddressDTO;
};
