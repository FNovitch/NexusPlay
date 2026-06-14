import { Heart, Plus } from "lucide-react";
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
    <article className="group panel flex h-full flex-col overflow-hidden card-hover">
      <Link to={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden border-b border-nexus-line bg-nexus-paper">
          <img
            src={productImageUrl(product)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {product.customizationAvailable && <span className="badge-warm">Configurável</span>}
            {product.stock <= 4 && <span className="badge-soft">Estoque {product.stock}</span>}
          </div>
          <Link to={`/produto/${product.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug text-nexus-contrast transition hover:text-nexus-secondary">
            {product.name}
          </Link>
          <Link to={`/loja/${productSellerSlug(product)}`} className="mt-1 block text-xs font-medium text-nexus-muted transition hover:text-nexus-contrast">
            por {productSellerName(product)}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <Stars value={productRating(product)} compact />
          <span className="font-bold text-nexus-muted">{productSalesCount(product)} pedidos</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-nexus-line pt-3">
          <strong className="text-lg font-semibold tracking-normal text-nexus-contrast">{currency.format(product.price)}</strong>
          <div className="flex gap-1.5">
            <button
              onClick={handleFavorite}
              className={`btn-icon h-10 w-10 ${isFavorite ? "bg-nexus-paper text-nexus-secondary hover:bg-nexus-paper hover:text-nexus-secondary" : ""}`}
              aria-label={`${isFavorite ? "Remover dos favoritos" : "Favoritar"} ${product.name}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleAdd}
              className="inline-grid h-10 w-10 place-items-center rounded-lg bg-nexus-primary text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-[#343344] active:translate-y-0"
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
