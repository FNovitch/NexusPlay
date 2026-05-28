import { api } from "../lib/api";

export async function adminGet<T>(path: string) {
  const { data } = await api.get<{ data: T }>(path);
  return data.data;
}

export async function adminPut<T>(path: string, payload?: unknown) {
  const { data } = await api.put<{ data: T; message: string }>(path, payload ?? {});
  return data;
}

export async function adminPost<T>(path: string, payload?: unknown) {
  const { data } = await api.post<{ data: T; message: string }>(path, payload ?? {});
  return data;
}

export async function adminDelete<T>(path: string) {
  const { data } = await api.delete<{ data: T; message: string }>(path);
  return data;
}
