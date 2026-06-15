import { api } from "../lib/api";
import type { ArtisanResponseDTO, CreateArtisanDTO } from "../types";

export type ArtisanLoginResponse = {
  success?: boolean;
  message?: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ARTISAN";
    storeId?: string | null;
    status?: string;
  };
};

export async function registerArtisan(payload: CreateArtisanDTO) {
  try {
    const { data } = await api.post<{ success: boolean; message: string; data: { id: string; nome: string; email: string; status: string }; artisan: ArtisanResponseDTO }>("/sellers/register", payload);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function loginArtisan(email: string, password: string) {
  const { data } = await api.post<ArtisanLoginResponse & { data?: ArtisanLoginResponse }>("/sellers/login", { email, password });
  return data.data ?? data;
}

export async function getMyArtisanProfile() {
  const { data } = await api.get<{ data?: { artisan: ArtisanResponseDTO }; artisan?: ArtisanResponseDTO }>("/sellers/me");
  return data.data?.artisan ?? data.artisan!;
}

export async function updateMyArtisanProfile(payload: Partial<CreateArtisanDTO>) {
  const { data } = await api.patch<{ data?: { artisan: ArtisanResponseDTO }; artisan?: ArtisanResponseDTO }>("/sellers/me", payload);
  return data.data?.artisan ?? data.artisan!;
}
