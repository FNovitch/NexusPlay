import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productSellerName } from "../api/products";
import type { CartItem, Product } from "../types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, customizationNotes?: string, selectedVariations?: Record<string, string>) => void;
  removeItem: (productId: string, selectedVariations?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariations?: Record<string, string>) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export function cartItemKey(productId: string, selectedVariations?: Record<string, string>) {
  return `${productId}:${JSON.stringify(selectedVariations ?? {})}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, customizationNotes, selectedVariations) =>
        set((state) => {
          const variationKey = cartItemKey(product.id, selectedVariations);
          const existing = state.items.find((item) => cartItemKey(item.product.id, item.selectedVariations) === variationKey);
          if (existing) {
            return {
              items: state.items.map((item) =>
                cartItemKey(item.product.id, item.selectedVariations) === variationKey
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock), customizationNotes, selectedVariations }
                  : item
              ),
              isOpen: true
            };
          }
          return { items: [...state.items, { product, quantity, customizationNotes, selectedVariations }], isOpen: true };
        }),
      removeItem: (productId, selectedVariations) => set((state) => ({ items: state.items.filter((item) => cartItemKey(item.product.id, item.selectedVariations) !== cartItemKey(productId, selectedVariations)) })),
      updateQuantity: (productId, quantity, selectedVariations) =>
        set((state) => ({
          items: state.items.map((item) =>
            cartItemKey(item.product.id, item.selectedVariations) === cartItemKey(productId, selectedVariations) ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) } : item
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
