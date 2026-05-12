import { Heart, ShoppingBag, Sparkle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import { Stars } from "./Stars";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);
  const toggle = useWishlist((state) => state.toggle);
  const isFavorite = useWishlist((state) => state.has(product.id));

  return (
    <article className="group overflow-hidden rounded-lg border border-kriar-support/30 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-kriar-support/20">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          {product.customizationAvailable && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-kriar-primary">
              <Sparkle className="h-3 w-3" /> Personaliza
            </span>
          )}
          {product.stock <= 4 && (
            <span className="absolute bottom-3 left-3 rounded-md bg-kriar-secondary px-2 py-1 text-xs font-bold text-white">Ultimas {product.stock}</span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link to={`/produto/${product.slug}`} className="font-bold text-kriar-contrast hover:text-kriar-primary">
            {product.name}
          </Link>
          <Link to={`/loja/${product.seller.slug}`} className="mt-1 block text-sm text-kriar-secondary">
            por {product.seller.storeName}
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <Stars value={product.rating} compact />
          <span className="text-xs font-semibold text-kriar-primary">{product.salesCount} vendas</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <strong className="text-lg text-kriar-primary">{currency.format(product.price)}</strong>
          <div className="flex gap-1">
            <button
              onClick={() => toggle(product.id)}
              className={`rounded-lg p-2 transition ${isFavorite ? "bg-kriar-secondary text-white" : "bg-kriar-support/20 text-kriar-primary hover:bg-kriar-support/40"}`}
              aria-label="Favoritar"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => addItem(product)}
              className="rounded-lg bg-kriar-primary p-2 text-white transition hover:bg-kriar-secondary"
              aria-label="Adicionar ao carrinho"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
