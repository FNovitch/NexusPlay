import { api } from "../lib/api";
import type { CreateAdminDTO } from "../types/admin";
import type { CreateArtisanDTO } from "../types/artisan";
import type { CreateCustomerDTO } from "../types/customer";
import type { UserResponseDTO } from "../types/user";

type AuthResponse = {
  token: string;
  user: UserResponseDTO;
};

export async function getMe() {
  const { data } = await api.get<{ user: UserResponseDTO }>("/me");
  return data.user;
}

export async function registerCustomer(payload: CreateCustomerDTO) {
  const { data } = await api.post<AuthResponse>("/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: "CUSTOMER",
    customer: {
      birthDate: payload.birthDate,
      cpf: payload.cpf,
      phone: payload.phone,
      address: payload.address
    }
  });
  return data.user;
}

export async function registerArtisan(payload: CreateArtisanDTO) {
  const { data } = await api.post<AuthResponse>("/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: "ARTISAN",
    artisan: {
      cpf: payload.cpf,
      phone: payload.phone,
      storeName: payload.storeName,
      storeSlug: payload.storeSlug,
      storeDescription: payload.storeDescription,
      document: payload.document,
      address: payload.address
    }
  });
  return data.user;
}

export async function registerAdmin(payload: CreateAdminDTO) {
  const { data } = await api.post<AuthResponse>("/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: "ADMIN",
    admin: { permissionLevel: payload.permissionLevel }
  });
  return data.user;
}
