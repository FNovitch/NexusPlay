import { Heart, ShoppingBag, Sparkle } from "lucide-react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { productImageUrl, productRating, productSalesCount, productSellerName, productSellerSlug } from "../api/products";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import type { Product } from "../types";
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
<<<<<<< HEAD
          <img src={productImageUrl(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]" />
=======
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]" />
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
          <div className="absolute inset-0 bg-gradient-to-t from-kriar-contrast/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          {product.customizationAvailable && (
            <span className="badge bg-kriar-surface/95 text-kriar-primary shadow-sm backdrop-blur absolute left-3 top-3">
              <Sparkle className="h-3 w-3" /> Personaliza
            </span>
          )}
          {product.stock <= 4 && (
            <span className="badge bg-kriar-secondary text-kriar-light shadow-sm absolute bottom-3 left-3">Últimas {product.stock}</span>
          )}
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div>
          <Link to={`/produto/${product.slug}`} className="line-clamp-2 font-black leading-snug text-kriar-contrast transition hover:text-kriar-primary">
            {product.name}
          </Link>
<<<<<<< HEAD
          <Link to={`/loja/${productSellerSlug(product)}`} className="mt-1 block text-sm font-semibold text-kriar-muted transition hover:text-kriar-secondary">
            por {productSellerName(product)}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Stars value={productRating(product)} compact />
          <span className="rounded-full bg-kriar-paper px-2.5 py-1 text-xs font-bold text-kriar-muted">{productSalesCount(product)} vendas</span>
=======
          <Link to={`/loja/${product.seller.slug}`} className="mt-1 block text-sm font-semibold text-kriar-muted transition hover:text-kriar-secondary">
            por {product.seller.storeName}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Stars value={product.rating} compact />
          <span className="rounded-full bg-kriar-paper px-2.5 py-1 text-xs font-bold text-kriar-muted">{product.salesCount} vendas</span>
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-kriar-line/70 pt-4">
          <strong className="text-xl tracking-tight text-kriar-primary">{currency.format(product.price)}</strong>
          <div className="flex gap-1.5">
            <button
              onClick={handleFavorite}
              className={`btn-icon ${isFavorite ? "bg-kriar-secondary text-kriar-light hover:bg-kriar-secondary hover:text-kriar-light" : ""}`}
              aria-label="Favoritar"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleAdd}
              className="inline-grid h-11 w-11 place-items-center rounded-full bg-kriar-primary text-kriar-light shadow-sm transition duration-[250ms] hover:-translate-y-0.5 hover:bg-[#2f5360] hover:shadow-soft active:translate-y-0"
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
