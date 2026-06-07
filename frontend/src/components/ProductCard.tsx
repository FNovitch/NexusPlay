import { Heart, ShoppingBag, Sparkle } from "lucide-react";
import { Link } from "react-router-dom";
import { productImageUrl, productRating, productSalesCount, productSellerName, productSellerSlug } from "../api/products";
import type { Product } from "../types";
import { handleImageError } from "../utils/media";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { useWishlist } from "../store/wishlist";
import { Stars } from "./Stars";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);
  const toggle = useWishlist((state) => state.toggle);
  const isFavorite = useWishlist((state) => state.has(product.id));
  const showToast = useToast((state) => state.show);

  function handleAdd() {
    addItem(product);
    showToast({
      title: "Produto adicionado",
      description: `${product.name} foi para o carrinho.`,
      variant: "success"
    });
  }

  function handleFavorite() {
    toggle(product.id);
    showToast({
      title: isFavorite ? "Removido dos favoritos" : "Salvo nos favoritos",
      description: product.name,
      variant: "info"
    });
  }

  return (
    <article className="group panel overflow-hidden card-hover">
      <Link to={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-kriar-paper">
          <img
            src={productImageUrl(product)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kriar-contrast/16 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          {product.customizationAvailable && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-kriar-surface/95 px-2.5 py-1 text-xs font-bold text-kriar-primary shadow-sm backdrop-blur">
              <Sparkle className="h-3 w-3" /> Personalizável
            </span>
          )}
          {product.stock <= 4 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-kriar-secondary px-2.5 py-1 text-xs font-bold text-kriar-light shadow-sm">Últimas {product.stock}</span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link to={`/produto/${product.slug}`} className="line-clamp-2 text-base font-black leading-snug text-kriar-contrast transition hover:text-kriar-primary">
            {product.name}
          </Link>
          <Link to={`/loja/${productSellerSlug(product)}`} className="mt-1 block text-sm font-semibold text-kriar-muted transition hover:text-kriar-primary">
            por {productSellerName(product)}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <Stars value={productRating(product)} compact />
          <span className="font-bold text-kriar-muted">{productSalesCount(product)} vendas</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-kriar-line/70 pt-3">
          <strong className="text-2xl tracking-tight text-kriar-primary">{currency.format(product.price)}</strong>
          <div className="flex gap-1.5">
            <button
              onClick={handleFavorite}
              className={`btn-icon h-10 w-10 ${isFavorite ? "bg-kriar-secondary text-kriar-light hover:bg-kriar-secondary hover:text-kriar-light" : ""}`}
              aria-label="Favoritar"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleAdd}
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-kriar-primary text-kriar-light shadow-sm transition duration-[250ms] hover:-translate-y-0.5 hover:bg-[#2f5360] hover:shadow-soft active:translate-y-0"
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
