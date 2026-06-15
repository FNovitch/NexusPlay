import axios from "axios";
import { products, sellers, categories } from "../data/mock";
import { normalizeProduct } from "../api/products";
import { apiBaseUrl, demoMode } from "../config/env";
import type { Product, Seller } from "../types";

export const api = axios.create({
  baseURL: apiBaseUrl
});

const cache = new Map<string, unknown>();
const demoCategorySlugs = new Set(categories.map((category) => category.slug));
const legacyProductSlugs = new Set([
  "teclado-mecanico-nebula-tkl",
  "headset-pulse-71-rgb",
  "mouse-gamer-vector-8k",
  "deskmat-cybergrid-xl",
  "luminaria-rgb-hexapack",
  "controle-propad-x",
  "action-figure-cacadora-estelar",
  "camiseta-arcade-mode"
]);

function cached<T>(key: string, loader: () => Promise<T>) {
  const current = cache.get(key);
  if (current) return Promise.resolve(current as T);
  return loader().then((data) => {
    cache.set(key, data);
    return data;
  });
}

function removeLegacyProducts(items: Product[]) {
  return items.filter((product) => !legacyProductSlugs.has(product.slug));
}

function mergeDemoCategories(apiCategories: typeof categories) {
  const validApiCategories = apiCategories.filter((category) => demoCategorySlugs.has(category.slug));
  const existing = new Set(validApiCategories.map((category) => category.slug));
  return [
    ...validApiCategories,
    ...categories.filter((category) => !existing.has(category.slug))
  ];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexus-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getProducts(params?: Record<string, string>) {
  const key = `products:${JSON.stringify(params ?? {})}`;
  return cached(key, async () => {
    try {
      const { data } = await api.get<{ products: Product[] }>("/products", { params });
      const apiProducts = removeLegacyProducts(data.products.map(normalizeProduct));
      return apiProducts.length > 0 ? apiProducts : demoMode ? products : [];
    } catch {
      return demoMode ? products : [];
    }
  });
}

export async function getProduct(slug: string) {
  try {
    const { data } = await api.get<{ product: Product; related: Product[] }>(`/products/${slug}`);
    if (legacyProductSlugs.has(data.product.slug)) {
      throw new Error("Produto legado removido do catálogo.");
    }
    return {
      product: normalizeProduct(data.product),
      related: removeLegacyProducts(data.related.map(normalizeProduct))
    };
  } catch {
    if (!demoMode) {
      throw new Error("Produto não encontrado.");
    }

    const product = products.find((item) => item.slug === slug) ?? products[0];
    return {
      product,
      related: products.filter((item) => item.sellerId === product.sellerId && item.id !== product.id)
    };
  }
}

export async function getSellers() {
  return cached("sellers", async () => {
    try {
      const { data } = await api.get<{ sellers: Seller[] }>("/sellers");
      return data.sellers;
    } catch {
      return demoMode ? sellers : [];
    }
  });
}

export async function getSeller(slug: string) {
  try {
    const { data } = await api.get<{ seller: Seller & { products: Product[] } }>(`/sellers/${slug}`);
    const apiProducts = removeLegacyProducts(data.seller.products.map(normalizeProduct));
    const fallbackSeller = sellers.find((item) => item.slug === slug);
    if (apiProducts.length > 0 || !fallbackSeller) {
      return { ...data.seller, products: apiProducts };
    }
    return { ...fallbackSeller, products: products.filter((item) => item.sellerId === fallbackSeller.id) };
  } catch {
    if (!demoMode) {
      throw new Error("Loja não encontrada.");
    }

    const seller = sellers.find((item) => item.slug === slug) ?? sellers[0];
    return { ...seller, products: products.filter((item) => item.sellerId === seller.id) };
  }
}

export async function getCategories() {
  return cached("categories", async () => {
    try {
      const { data } = await api.get<{ categories: typeof categories }>("/categories");
      return mergeDemoCategories(data.categories);
    } catch {
      return demoMode ? categories : [];
    }
  });
}
