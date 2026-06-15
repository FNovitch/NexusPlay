import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { getProducts } from "../lib/api";
import { useWishlist } from "../store/wishlist";
import type { Product } from "../types";

export function Favorites() {
  const favoriteIds = useWishlist((state) => state.ids);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const favorites = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [favoriteIds, products]
  );

  return (
    <main className="app-shell section-y">
      <p className="eyebrow mb-2">Cliente</p>
      <h1 className="text-3xl font-semibold leading-tight text-nexus-contrast">Favoritos</h1>
      <p className="mt-2 max-w-2xl text-nexus-muted">
        Produtos salvos neste navegador para comparar antes de adicionar ao carrinho.
      </p>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="panel overflow-hidden">
                <div className="aspect-[4/3] animate-pulse bg-nexus-paper" />
                <div className="space-y-4 p-4">
                  <div className="h-5 w-4/5 animate-pulse rounded-full bg-nexus-paper" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-nexus-paper" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Nenhum favorito salvo"
            description="Use o coração nos cards de produto para montar sua lista de comparação."
            action={<Link to="/#produtos" className="btn-primary">Explorar catálogo</Link>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
