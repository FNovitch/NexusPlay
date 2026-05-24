import axios from "axios";
import { products, sellers, categories } from "../data/mock";
import { normalizeProduct } from "../api/products";
import type { Product, Seller } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kriar-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getProducts(params?: Record<string, string>) {
  try {
    const { data } = await api.get<{ products: Product[] }>("/products", { params });
    return data.products.map(normalizeProduct);
  } catch {
    if (!import.meta.env.DEV) return [];
    return products;
  }
}

export async function getProduct(slug: string) {
  try {
    const { data } = await api.get<{ product: Product; related: Product[] }>(`/products/${slug}`);
    return {
      product: normalizeProduct(data.product),
      related: data.related.map(normalizeProduct)
    };
  } catch {
    if (!import.meta.env.DEV) {
      throw new Error("Produto nao encontrado.");
    }

    const product = products.find((item) => item.slug === slug) ?? products[0];
    return {
      product,
      related: products.filter((item) => item.sellerId === product.sellerId && item.id !== product.id)
    };
  }
}

export async function getSellers() {
  try {
    const { data } = await api.get<{ sellers: Seller[] }>("/sellers");
    return data.sellers;
  } catch {
    if (!import.meta.env.DEV) return [];
    return sellers;
  }
}

export async function getSeller(slug: string) {
  try {
    const { data } = await api.get<{ seller: Seller & { products: Product[] } }>(`/sellers/${slug}`);
    return { ...data.seller, products: data.seller.products.map(normalizeProduct) };
  } catch {
    if (!import.meta.env.DEV) {
      throw new Error("Loja nao encontrada.");
    }

    const seller = sellers.find((item) => item.slug === slug) ?? sellers[0];
    return { ...seller, products: products.filter((item) => item.sellerId === seller.id) };
  }
}

export async function getCategories() {
  try {
    const { data } = await api.get<{ categories: typeof categories }>("/categories");
    return data.categories;
  } catch {
    if (!import.meta.env.DEV) return [];
    return categories;
  }
}
