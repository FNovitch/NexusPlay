import type { Address, Admin, Artisan, Customer, User } from "@prisma/client";
import type {
  AddressDTO,
  AdminResponseDTO,
  ArtisanResponseDTO,
  CustomerResponseDTO,
  UserResponseDTO
} from "./user.types.js";

type CustomerWithUser = Customer & {
  user: User;
  addresses?: Address[];
};

type ArtisanWithUser = Artisan & {
  user: User;
  addresses?: Address[];
};

type AdminWithUser = Admin & {
  user: User;
};

export function mapUserToResponse(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    storeId: user.storeId ?? null,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export function mapAddressToResponse(address: Address): AddressDTO {
  return {
    id: address.id,
    userId: address.userId,
    customerId: address.customerId ?? null,
    artisanId: address.artisanId ?? null,
    street: address.street,
    number: address.number,
    complement: address.complement ?? null,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString()
  };
}

export function mapCustomerToResponse(customer: CustomerWithUser): CustomerResponseDTO {
  return {
    id: customer.id,
    userId: customer.userId,
    userType: "CUSTOMER",
    name: customer.name,
    email: customer.user.email,
    birthDate: customer.birthDate.toISOString(),
    cpf: customer.cpf,
    phone: customer.phone,
    addresses: (customer.addresses ?? []).map(mapAddressToResponse),
    isDeleted: customer.isDeleted,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString()
  };
}

export function mapArtisanToResponse(artisan: ArtisanWithUser): ArtisanResponseDTO {
  const addresses = artisan.addresses ?? [];
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const craftCategories = Array.isArray(artisan.craftCategories)
    ? artisan.craftCategories.filter((category): category is string => typeof category === "string")
    : [];

  return {
    id: artisan.id,
    userId: artisan.userId,
    userType: "ARTISAN",
    name: artisan.name,
    email: artisan.user.email,
    cpf: artisan.cpf ?? null,
    phone: artisan.phone,
    storeId: artisan.storeId ?? null,
    storeName: artisan.storeName,
    storeSlug: artisan.storeSlug,
    storeDescription: artisan.storeDescription,
    craftCategories,
    document: artisan.document,
    acceptsLocalPickup: artisan.acceptsLocalPickup,
    pickupInstructions: artisan.pickupInstructions ?? null,
    status: artisan.status,
    address: defaultAddress ? mapAddressToResponse(defaultAddress) : null,
    isDeleted: artisan.isDeleted,
    createdAt: artisan.createdAt.toISOString(),
    updatedAt: artisan.updatedAt.toISOString()
  };
}

export function mapAdminToResponse(admin: AdminWithUser): AdminResponseDTO {
  return {
    id: admin.id,
    userId: admin.userId,
    userType: "ADMIN",
    name: admin.name,
    email: admin.user.email,
    permissionLevel: admin.permissionLevel,
    isDeleted: admin.isDeleted,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString()
  };
}
