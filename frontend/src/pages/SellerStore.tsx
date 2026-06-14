import { BadgeCheck, HeartHandshake, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SectionHeader } from "../components/SectionHeader";
import { Stars } from "../components/Stars";
import { getSeller } from "../lib/api";
import type { Product, Seller } from "../types";
import { handleImageError, resolveImageUrl } from "../utils/media";

export function SellerStore() {
  const { slug = "" } = useParams();
  const [seller, setSeller] = useState<(Seller & { products: Product[] }) | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    getSeller(slug).then(setSeller).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return <main className="app-shell py-16 text-nexus-muted">Loja não encontrada.</main>;
  }

  if (!seller) {
    return <main className="app-shell py-16 text-nexus-muted">Carregando loja...</main>;
  }

  return (
    <main className="app-shell py-8 sm:py-12">
      <section className="panel overflow-hidden">
        <div className="h-40 border-b border-nexus-line bg-nexus-paper sm:h-52">
          <img
            src={resolveImageUrl(seller.coverUrl)}
            alt=""
            decoding="async"
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <img
                src={resolveImageUrl(seller.avatarUrl)}
                alt={seller.storeName}
                decoding="async"
                onError={handleImageError}
                className="-mt-14 mb-4 h-20 w-20 rounded-lg border-4 border-white object-cover shadow-soft"
              />
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-nexus-paper px-2 py-1 text-xs font-semibold text-nexus-secondary">
                  <Store className="h-4 w-4" /> Loja ativa
                </span>
                <Stars value={seller.rating} />
              </div>
              <h1 className="display-title mt-4 text-5xl text-nexus-contrast sm:text-6xl">{seller.storeName}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-nexus-muted">{seller.bio}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-7 py-10 lg:grid-cols-[0.66fr_1.34fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-nexus-line bg-nexus-surface p-5 shadow-soft">
            <HeartHandshake className="mb-3 h-6 w-6 text-nexus-secondary" />
            <h2 className="text-xl font-semibold tracking-normal text-nexus-contrast">Especialidade da loja</h2>
            <p className="mt-3 leading-7 text-nexus-muted">{seller.story}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-nexus-line bg-nexus-surface p-4 shadow-soft">
              <strong className="block text-2xl font-semibold tracking-normal text-nexus-contrast">{seller.salesCount}</strong>
              <span className="text-sm font-medium text-nexus-muted">Pedidos</span>
            </div>
            <div className="rounded-lg border border-nexus-line bg-nexus-surface p-4 shadow-soft">
              <BadgeCheck className="mb-2 h-5 w-5 text-nexus-secondary" />
              <span className="text-sm font-semibold text-nexus-contrast">Loja verificada</span>
            </div>
          </div>
        </aside>
        <div>
          <SectionHeader title="Produtos publicados" description="Itens disponíveis para compra, entrega simulada ou personalização." />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {seller.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
