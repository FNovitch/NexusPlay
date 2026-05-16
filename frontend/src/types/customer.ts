import type { AddressDTO, CreateAddressDTO } from "./address";

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
