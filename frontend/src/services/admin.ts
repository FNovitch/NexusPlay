import { api } from "../lib/api";

const adminPathAliases: Array<[RegExp, string]> = [
  [/^\/admin\/clientes(\/.*)?$/, "/admin/customers$1"],
  [/^\/admin\/artesaos(\/.*)?$/, "/admin/sellers$1"],
  [/^\/admin\/produtos(\/.*)?$/, "/admin/products$1"],
  [/^\/admin\/pedidos(\/.*)?$/, "/admin/orders$1"],
  [/^\/admin\/avaliações(\/.*)?$/, "/admin/reviews$1"],
  [/^\/admin\/categorias(\/.*)?$/, "/admin/categories$1"],
  [/^\/admin\/assinaturas(\/.*)?$/, "/admin/subscriptions$1"],
  [/^\/admin\/repasses(\/.*)?$/, "/admin/payouts$1"],
  [/^\/admin\/pagamentos(\/.*)?$/, "/admin/payments$1"]
];

const adminActionAliases: Array<[RegExp, string]> = [
  [/\/bloquear$/, "/block"],
  [/\/desbloquear$/, "/unblock"],
  [/\/aprovar$/, "/approve"],
  [/\/recusar$/, "/reject"],
  [/\/ativar$/, "/activate"],
  [/\/desativar$/, "/deactivate"],
  [/\/cancelar$/, "/cancel"],
  [/\/ocultar$/, "/hide"],
  [/\/exibir$/, "/show"],
  [/\/pagar$/, "/pay"]
];

function nexusAdminPath(path: string) {
  const resourcePath = adminPathAliases.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), path);
  return adminActionAliases.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), resourcePath);
}

export async function adminGet<T>(path: string) {
  const { data } = await api.get<{ data: T }>(nexusAdminPath(path));
  return data.data;
}

export async function adminPut<T>(path: string, payload?: unknown) {
  const { data } = await api.put<{ data: T; message: string }>(nexusAdminPath(path), payload ?? {});
  return data;
}

export async function adminPost<T>(path: string, payload?: unknown) {
  const { data } = await api.post<{ data: T; message: string }>(nexusAdminPath(path), payload ?? {});
  return data;
}

export async function adminDelete<T>(path: string) {
  const { data } = await api.delete<{ data: T; message: string }>(nexusAdminPath(path));
  return data;
}
