import { productSellerName } from "../api/products";
import type { CartItem } from "../types";
import { products } from "./mock";

const STORAGE_KEY = "nexusplay-demo-orders";
const LAST_ORDER_KEY = "nexusplay-last-order-id";

export type DemoOrder = {
  id: string;
  orderCode: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  buyer?: { id: string; name: string; email: string };
  sellerName?: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    total: number;
  }>;
  history: Array<{ id: string; newStatus: string; createdAt: string }>;
};

export const defaultDemoOrders: DemoOrder[] = [
  {
    id: "demo-order-001",
    orderCode: "NP-2026-001",
    status: "IN_PRODUCTION",
    paymentStatus: "APPROVED",
    total: 959.8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    buyer: { id: "demo-customer", name: "Cliente Demo", email: "cliente@demo.nexusplay" },
    sellerName: "Nexus Gear",
    items: [
      { id: "demo-item-1", productName: "Teclado Hall Effect NovaStrike 75", quantity: 1, total: 589.9 },
      { id: "demo-item-2", productName: "Headset ArenaCast USB-C", quantity: 1, total: 369.9 }
    ],
    history: [
      { id: "h-1", newStatus: "CREATED", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
      { id: "h-2", newStatus: "IN_PRODUCTION", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() }
    ]
  },
  {
    id: "demo-order-002",
    orderCode: "NP-2026-002",
    status: "DELIVERED",
    paymentStatus: "APPROVED",
    total: 409.8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    buyer: { id: "demo-customer", name: "Marina Costa", email: "marina@example.com" },
    sellerName: "Pixel Relic",
    items: [
      { id: "demo-item-3", productName: "Estátua Boss Arena Dragão Neon", quantity: 1, total: 279.9 },
      { id: "demo-item-4", productName: "Display Cartridge Frame", quantity: 1, total: 129.9 }
    ],
    history: [
      { id: "h-3", newStatus: "CREATED", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
      { id: "h-4", newStatus: "DELIVERED", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() }
    ]
  }
];

export function isDemoToken(token?: string) {
  return Boolean(token?.startsWith("demo-"));
}

export function demoCredentials(role: "CUSTOMER" | "ARTISAN" = "ARTISAN") {
  if (role === "CUSTOMER") {
    return {
      token: "demo-customer-token",
      user: { id: "demo-customer", name: "Cliente Demo", email: "cliente@demo.nexusplay", role }
    } as const;
  }

  return {
    token: "demo-seller-token",
    user: { id: "demo-seller", name: "Nexus Seller", email: "vendedor@demo.nexusplay", role, storeId: "seller-1", status: "APPROVED" }
  } as const;
}

export function readDemoOrders() {
  if (typeof window === "undefined") return defaultDemoOrders;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed as DemoOrder[] : defaultDemoOrders;
  } catch {
    return defaultDemoOrders;
  }
}

export function findDemoOrder(id: string) {
  return readDemoOrders().find((order) => order.id === id) ?? null;
}

export function createDemoOrder(items: CartItem[], shippingTotal: number) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const id = `demo-order-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const order: DemoOrder = {
    id,
    orderCode: `NP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    status: "IN_PRODUCTION",
    paymentStatus: "APPROVED",
    total: subtotal + shippingTotal,
    createdAt,
    buyer: { id: "demo-customer", name: "Cliente Demo", email: "cliente@demo.nexusplay" },
    sellerName: productSellerName(items[0]?.product ?? products[0]),
    items: items.map((item, index) => ({
      id: `${id}-item-${index + 1}`,
      productName: item.product.name,
      quantity: item.quantity,
      total: item.product.price * item.quantity
    })),
    history: [
      { id: `${id}-history-1`, newStatus: "CREATED", createdAt },
      { id: `${id}-history-2`, newStatus: "IN_PRODUCTION", createdAt }
    ]
  };

  const next = [order, ...readDemoOrders()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.sessionStorage.setItem(LAST_ORDER_KEY, id);
  return order;
}

export function lastDemoOrderId() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(LAST_ORDER_KEY);
}
