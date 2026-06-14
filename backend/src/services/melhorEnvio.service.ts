import { ProductStatus, type Prisma, type Product } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";

export type FreightItemInput = {
  produtoId: string;
  quantidade: number;
  variacaoSelecionada?: Record<string, string>;
};

export type FreightOption = {
  id: string;
  nome: string;
  empresa: string;
  preco: number;
  prazo: number;
  imagem?: string | null;
  melhorEnvioServiceId: number;
  tipo?: "SHIPPING" | "PICKUP";
  enderecoRetirada?: string | null;
  instrucoesRetirada?: string | null;
};

export type FreightGroup = {
  groupId: string;
  sellerId: string;
  artesaoId: string | null;
  loja: string;
  cepOrigem: string;
  cepDestino: string;
  opcoes: FreightOption[];
};

type ProductWithSeller = Product & {
  seller: {
    id: string;
    storeName: string;
    artisans: Array<{
      id: string;
      acceptsLocalPickup: boolean;
      pickupInstructions: string | null;
      addresses: Array<{
        street: string;
        number: string;
        complement: string | null;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        isDefault: boolean;
      }>;
    }>;
  };
};

type MelhorEnvioResponse = Array<{
  id?: number | string;
  name?: string;
  price?: string | number | null;
  custom_price?: string | number | null;
  delivery_time?: number | string | null;
  company?: { name?: string; picture?: string | null };
  error?: string;
}>;

function freightDebug(event: string, payload: Record<string, unknown>) {
  if (process.env.FREIGHT_DEBUG !== "true") return;
  console.info(`[freight:${event}]`, payload);
}

export function normalizarCep(cep: string) {
  return String(cep ?? "").replace(/\D/g, "");
}

export function validarCep(cep: string) {
  return /^\d{8}$/.test(normalizarCep(cep));
}

function melhorEnvioUrl(path: string) {
  const base = env.MELHOR_ENVIO_BASE_URL.replace(/\/$/, "");
  const apiBase = base.endsWith("/api") ? base : `${base}/api`;
  return `${apiBase}${path}`;
}

function headers() {
  if (!env.MELHOR_ENVIO_TOKEN) {
    throw new AppError("Melhor Envio não configurado.", 500, { frete: "Configure MELHOR_ENVIO_TOKEN no backend." });
  }

  return {
    Authorization: `Bearer ${env.MELHOR_ENVIO_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": env.MELHOR_ENVIO_USER_AGENT
  };
}

function dimensionsOf(product: Product) {
  const value = product.dimensions as Prisma.JsonObject | null;
  const width = Number(value?.width ?? 0);
  const height = Number(value?.height ?? 0);
  const length = Number(value?.length ?? 0);
  const weight = Number(product.weight);

  if (width <= 0 || height <= 0 || length <= 0 || weight <= 0) {
    throw new AppError("Não foi possível calcular o frete.", 400, {
      produto: `${product.name} precisa de peso, largura, altura e comprimento válidos.`
    });
  }

  return { width, height, length, weight };
}

function originZip(product: ProductWithSeller) {
  const artisan = product.seller.artisans[0] ?? null;
  const address = artisan?.addresses.find((item) => item.isDefault) ?? artisan?.addresses[0] ?? null;
  return normalizarCep(address?.zipCode || env.MELHOR_ENVIO_CEP_ORIGEM);
}

function pickupAddress(product: ProductWithSeller) {
  const artisan = product.seller.artisans[0] ?? null;
  const address = artisan?.addresses.find((item) => item.isDefault) ?? artisan?.addresses[0] ?? null;
  if (!address) return null;
  return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}`;
}

function buildPickupOption(product: ProductWithSeller): FreightOption | null {
  const artisan = product.seller.artisans[0] ?? null;
  const productAllowsPickup = Boolean(product.pickupAvailable);
  const storeAllowsPickup = Boolean(artisan?.acceptsLocalPickup);

  if (!productAllowsPickup && !storeAllowsPickup) {
    return null;
  }

  return {
    id: `${product.sellerId}:pickup`,
    nome: "Retirar na loja",
    empresa: product.seller.storeName,
    preco: 0,
    prazo: 0,
    imagem: null,
    melhorEnvioServiceId: 0,
    tipo: "PICKUP",
    enderecoRetirada: product.pickupAddress ?? pickupAddress(product),
    instrucoesRetirada: artisan?.pickupInstructions ?? null
  };
}

function sandboxShippingOptions(product: ProductWithSeller): FreightOption[] {
  return [
    { id: `${product.sellerId}:mock-pac`, nome: "PAC Sandbox", empresa: "Correios", preco: 24.9, prazo: 6, imagem: null, melhorEnvioServiceId: 1, tipo: "SHIPPING" },
    { id: `${product.sellerId}:mock-sedex`, nome: "SEDEX Sandbox", empresa: "Correios", preco: 39.9, prazo: 3, imagem: null, melhorEnvioServiceId: 2, tipo: "SHIPPING" }
  ];
}

function parseFreightNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const raw = value.trim();
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapOptions(response: MelhorEnvioResponse): FreightOption[] {
  const removed: Array<{ id?: string | number; name?: string; reason: string; price?: unknown; customPrice?: unknown; error?: string }> = [];
  const options = response.flatMap((item) => {
    const price = parseFreightNumber(item.custom_price ?? item.price);
    if (item.error) {
      removed.push({ id: item.id, name: item.name, reason: "carrier_error", error: item.error, price: item.price, customPrice: item.custom_price });
      return [];
    }
    if (!item.id) {
      removed.push({ id: item.id, name: item.name, reason: "missing_id", price: item.price, customPrice: item.custom_price });
      return [];
    }
    if (price <= 0) {
      removed.push({ id: item.id, name: item.name, reason: "invalid_price", price: item.price, customPrice: item.custom_price });
      return [];
    }

    return [{
      id: String(item.id),
      nome: item.name ?? `Servico ${item.id}`,
      empresa: item.company?.name ?? "Melhor Envio",
      preco: price,
      prazo: Math.max(0, Math.trunc(parseFreightNumber(item.delivery_time))),
      imagem: item.company?.picture ?? null,
      melhorEnvioServiceId: Number(item.id),
      tipo: "SHIPPING" as const
    }];
  });

  freightDebug("melhor-envio:map-options", {
    received: response.length,
    accepted: options.length,
    removed
  });

  return options;
}

export function tratarErroMelhorEnvio(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError("Não foi possível calcular o frete.", 400, {
    frete: error instanceof Error ? error.message : "Melhor Envio indisponível."
  });
}

export async function listarTransportadoras() {
  const response = await fetch(melhorEnvioUrl("/v2/me/shipment/companies"), { headers: headers(), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new AppError("Não foi possível listar transportadoras.", response.status);
  return response.json();
}

export function montarPacoteDoCarrinho(items: Array<{ product: Product; quantity: number }>) {
  return items.map(({ product, quantity }) => {
    const dimensions = dimensionsOf(product);
    return {
      id: product.id,
      width: dimensions.width,
      height: dimensions.height,
      length: dimensions.length,
      weight: dimensions.weight,
      insurance_value: Number(product.price),
      quantity
    };
  });
}

async function calcularGrupo(cepDestino: string, products: ProductWithSeller[], items: FreightItemInput[]): Promise<FreightGroup> {
  const first = products[0];
  const cepOrigem = originZip(first);
  if (!validarCep(cepOrigem)) {
    throw new AppError("Não foi possível calcular o frete.", 400, { cepOrigem: "CEP de origem inválido." });
  }

  const productsWithQuantity = products.map((product) => ({
    product,
    quantity: items.find((item) => item.produtoId === product.id)?.quantidade ?? 1
  }));

  if (!env.MELHOR_ENVIO_TOKEN && env.NODE_ENV !== "production") {
    return {
      groupId: first.sellerId,
      sellerId: first.sellerId,
      artesaoId: first.seller.artisans[0]?.id ?? null,
      loja: first.seller.storeName,
      cepOrigem,
      cepDestino,
      opcoes: [
        ...[buildPickupOption(first)].filter((option): option is FreightOption => option !== null),
        ...sandboxShippingOptions(first)
      ]
    };
  }

  const pickup = buildPickupOption(first);
  let shippingOptions: FreightOption[] = [];

  if (products.some((product) => product.shippingAvailable)) {
    try {
      const body = {
        from: { postal_code: cepOrigem },
        to: { postal_code: cepDestino },
        products: montarPacoteDoCarrinho(productsWithQuantity),
        options: {
          receipt: false,
          own_hand: false,
          collect: false
        }
      };
      freightDebug("melhor-envio:request", {
        url: melhorEnvioUrl("/v2/me/shipment/calculate"),
        headers: {
          Authorization: env.MELHOR_ENVIO_TOKEN ? "Bearer ***" : "missing",
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": env.MELHOR_ENVIO_USER_AGENT
        },
        body
      });
      const response = await fetch(melhorEnvioUrl("/v2/me/shipment/calculate"), {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(18000)
      });
      const data = await response.json().catch(() => []);
      freightDebug("melhor-envio:response", {
        status: response.status,
        ok: response.ok,
        body: data
      });
      if (!response.ok) {
        freightDebug("melhor-envio:error", { status: response.status, sellerId: first.sellerId });
        throw new AppError("Não foi possível calcular o frete.", response.status, { frete: "Transportadora indisponível para este carrinho." });
      }
      shippingOptions = mapOptions(data as MelhorEnvioResponse);
    } catch (error) {
      freightDebug("melhor-envio:failed", {
        sellerId: first.sellerId,
        message: error instanceof Error ? error.message : "unknown"
      });
      if (env.NODE_ENV !== "production" && !(error instanceof AppError && error.errors?.produto)) {
        shippingOptions = sandboxShippingOptions(first);
      }
      if (!pickup && shippingOptions.length === 0) throw tratarErroMelhorEnvio(error);
    }
  }

  return {
    groupId: first.sellerId,
    sellerId: first.sellerId,
    artesaoId: first.seller.artisans[0]?.id ?? null,
    loja: first.seller.storeName,
    cepOrigem,
    cepDestino,
    opcoes: [...(pickup ? [pickup] : []), ...shippingOptions]
  };
}

export async function calcularFrete(payload: { cepDestino: string; itens: FreightItemInput[] }) {
  const cepDestino = normalizarCep(payload.cepDestino);
  if (!validarCep(cepDestino)) {
    throw new AppError("Não foi possível calcular o frete.", 400, { cepDestino: "CEP inválido ou não atendido." });
  }
  if (!Array.isArray(payload.itens) || payload.itens.length === 0) {
    throw new AppError("Não foi possível calcular o frete.", 400, { itens: "Carrinho vazio." });
  }

  const productIds = payload.itens.map((item) => item.produtoId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { seller: { include: { artisans: { include: { addresses: true }, take: 1 } } } }
  });
  if (products.length !== productIds.length) {
    throw new AppError("Não foi possível calcular o frete.", 404, { produtos: "Um ou mais produtos não foram encontrados." });
  }
  const inactive = products.find((product) => product.status !== ProductStatus.ACTIVE);
  if (inactive) {
    throw new AppError("Não foi possível calcular o frete.", 400, { produto: `${inactive.name} não está ativo.` });
  }

  const bySeller = products.reduce<Record<string, ProductWithSeller[]>>((acc, product) => {
    acc[product.sellerId] = [...(acc[product.sellerId] ?? []), product as ProductWithSeller];
    return acc;
  }, {});

  freightDebug("calculate:start", { sellers: Object.keys(bySeller).length, items: payload.itens.length });
  const grupos = await Promise.all(Object.values(bySeller).map((sellerProducts) => {
    const sellerItems = payload.itens.filter((item) => sellerProducts.some((product) => product.id === item.produtoId));
    return calcularGrupo(cepDestino, sellerProducts, sellerItems);
  }));
  freightDebug("calculate:success", {
    groups: grupos.length,
    options: grupos.reduce((sum, grupo) => sum + grupo.opcoes.length, 0),
    returned: grupos.map((grupo) => ({
      groupId: grupo.groupId,
      sellerId: grupo.sellerId,
      options: grupo.opcoes.map((opcao) => ({ id: opcao.id, nome: opcao.nome, tipo: opcao.tipo, preco: opcao.preco }))
    }))
  });

  return {
    grupos,
    opcoes: grupos.flatMap((grupo) => grupo.opcoes.map((opcao) => ({ ...opcao, groupId: grupo.groupId, sellerId: grupo.sellerId })))
  };
}
