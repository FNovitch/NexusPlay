import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productSellerName } from "../api/products";
import type { CartItem, Product } from "../types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, customizationNotes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, customizationNotes) =>
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock), customizationNotes }
                  : item
              ),
              isOpen: true
            };
          }
          return { items: [...state.items, { product, quantity, customizationNotes }], isOpen: true };
        }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) } : item
          )
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false })
    }),
    { name: "kriar-cart" }
  )
);

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function groupedBySeller(items: CartItem[]) {
  return items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const sellerName = productSellerName(item.product);
    acc[sellerName] = [...(acc[sellerName] ?? []), item];
    return acc;
  }, {});
}
