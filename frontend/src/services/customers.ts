import { api } from "../lib/api";
import type { CreateCustomerDTO, CustomerResponseDTO } from "../types";

export async function registerCustomer(payload: CreateCustomerDTO) {
  const { data } = await api.post<{ success: boolean; message: string; data: CustomerResponseDTO }>("/customers/register", payload);
  return data;
}

export async function loginCustomer(email: string, password: string) {
  const { data } = await api.post<{ data?: { token: string; user: { id: string; name: string; email: string; role: "CUSTOMER" } }; token?: string; user?: { id: string; name: string; email: string; role: "CUSTOMER" } }>("/customers/login", { email, password });
  return data.data ?? { token: data.token!, user: data.user! };
}

export async function getCustomerProfile() {
  const { data } = await api.get<{ data: CustomerResponseDTO }>("/customers/me");
  return data.data;
}

export async function requestCustomerPasswordReset(email: string) {
  const { data } = await api.post<{ success: boolean; message: string }>("/customers/forgot-password", { email });
  return data;
}

export async function resetCustomerPassword(token: string, password: string, confirmPassword: string) {
  const { data } = await api.post<{ success: boolean; message: string }>("/customers/reset-password", {
    token,
    password,
    confirmPassword
  });
  return data;
}
