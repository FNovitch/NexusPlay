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
      addresses: Array<{ zipCode: string; isDefault: boolean }>;
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
    throw new AppError("Melhor Envio nao configurado.", 500, { frete: "Configure MELHOR_ENVIO_TOKEN no backend." });
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
    throw new AppError("Nao foi possivel calcular o frete.", 400, {
      produto: `${product.name} precisa de peso, largura, altura e comprimento validos.`
    });
  }

  return { width, height, length, weight };
}

function originZip(product: ProductWithSeller) {
  const artisan = product.seller.artisans[0] ?? null;
  const address = artisan?.addresses.find((item) => item.isDefault) ?? artisan?.addresses[0] ?? null;
  return normalizarCep(address?.zipCode || env.MELHOR_ENVIO_CEP_ORIGEM);
}

function mapOptions(response: MelhorEnvioResponse): FreightOption[] {
  return response
    .filter((item) => !item.error && Number(item.custom_price ?? item.price) > 0)
    .map((item) => ({
      id: String(item.id),
      nome: item.name ?? `Servico ${item.id}`,
      empresa: item.company?.name ?? "Melhor Envio",
      preco: Number(item.custom_price ?? item.price),
      prazo: Number(item.delivery_time ?? 0),
      imagem: item.company?.picture ?? null,
      melhorEnvioServiceId: Number(item.id)
    }));
}

export function tratarErroMelhorEnvio(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError("Nao foi possivel calcular o frete.", 400, {
    frete: error instanceof Error ? error.message : "Melhor Envio indisponivel."
  });
}

export async function listarTransportadoras() {
  const response = await fetch(melhorEnvioUrl("/v2/me/shipment/companies"), { headers: headers(), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new AppError("Nao foi possivel listar transportadoras.", response.status);
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
    throw new AppError("Nao foi possivel calcular o frete.", 400, { cepOrigem: "CEP de origem invalido." });
  }

  const productsWithQuantity = products.map((product) => ({
    product,
    quantity: items.find((item) => item.produtoId === product.id)?.quantidade ?? 1
  }));
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

  if (!env.MELHOR_ENVIO_TOKEN && env.NODE_ENV !== "production") {
    return {
      groupId: first.sellerId,
      sellerId: first.sellerId,
      artesaoId: first.seller.artisans[0]?.id ?? null,
      loja: first.seller.storeName,
      cepOrigem,
      cepDestino,
      opcoes: [
        { id: `${first.sellerId}:mock-pac`, nome: "PAC Sandbox", empresa: "Correios", preco: 24.9, prazo: 6, imagem: null, melhorEnvioServiceId: 1 },
        { id: `${first.sellerId}:mock-sedex`, nome: "SEDEX Sandbox", empresa: "Correios", preco: 39.9, prazo: 3, imagem: null, melhorEnvioServiceId: 2 }
      ]
    };
  }

  const response = await fetch(melhorEnvioUrl("/v2/me/shipment/calculate"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(18000)
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new AppError("Nao foi possivel calcular o frete.", response.status, { frete: JSON.stringify(data) });
  }

  return {
    groupId: first.sellerId,
    sellerId: first.sellerId,
    artesaoId: first.seller.artisans[0]?.id ?? null,
    loja: first.seller.storeName,
    cepOrigem,
    cepDestino,
    opcoes: mapOptions(data as MelhorEnvioResponse)
  };
}

export async function calcularFrete(payload: { cepDestino: string; itens: FreightItemInput[] }) {
  const cepDestino = normalizarCep(payload.cepDestino);
  if (!validarCep(cepDestino)) {
    throw new AppError("Nao foi possivel calcular o frete.", 400, { cepDestino: "CEP invalido ou nao atendido." });
  }
  if (!Array.isArray(payload.itens) || payload.itens.length === 0) {
    throw new AppError("Nao foi possivel calcular o frete.", 400, { itens: "Carrinho vazio." });
  }

  const productIds = payload.itens.map((item) => item.produtoId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { seller: { include: { artisans: { include: { addresses: true }, take: 1 } } } }
  });
  if (products.length !== productIds.length) {
    throw new AppError("Nao foi possivel calcular o frete.", 404, { produtos: "Um ou mais produtos nao foram encontrados." });
  }
  const inactive = products.find((product) => product.status !== ProductStatus.ACTIVE);
  if (inactive) {
    throw new AppError("Nao foi possivel calcular o frete.", 400, { produto: `${inactive.name} nao esta ativo.` });
  }

  const bySeller = products.reduce<Record<string, ProductWithSeller[]>>((acc, product) => {
    acc[product.sellerId] = [...(acc[product.sellerId] ?? []), product as ProductWithSeller];
    return acc;
  }, {});

  const grupos = await Promise.all(Object.values(bySeller).map((sellerProducts) => {
    const sellerItems = payload.itens.filter((item) => sellerProducts.some((product) => product.id === item.produtoId));
    return calcularGrupo(cepDestino, sellerProducts, sellerItems);
  }));

  return {
    grupos,
    opcoes: grupos.flatMap((grupo) => grupo.opcoes.map((opcao) => ({ ...opcao, groupId: grupo.groupId, sellerId: grupo.sellerId })))
  };
}
