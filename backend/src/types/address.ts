export type AddressDTO = {
  id: string;
  userId: string;
  customerId: string | null;
  artisanId: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressDTO = {
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
};

export type UpdateAddressDTO = Partial<CreateAddressDTO>;
