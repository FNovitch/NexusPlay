import type { AddressDTO, CreateAddressDTO, UpdateAddressDTO } from "./address.js";

export type CustomerResponseDTO = {
  id: string;
  userId: string;
  userType: "CUSTOMER";
  name: string;
  email: string;
  birthDate: string;
  cpf: string;
  phone: string;
  addresses: AddressDTO[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerDTO = {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  cpf: string;
  phone: string;
  address: CreateAddressDTO;
};

export type UpdateCustomerDTO = {
  name?: string;
  birthDate?: string;
  cpf?: string;
  phone?: string;
  isDeleted?: boolean;
  address?: UpdateAddressDTO;
};
