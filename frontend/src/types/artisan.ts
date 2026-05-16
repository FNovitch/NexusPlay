import type { AddressDTO, CreateAddressDTO } from "./address";

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
