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
    return <main className="app-shell py-16 text-kriar-muted">Loja não encontrada.</main>;
  }

  if (!seller) {
    return <main className="app-shell py-16 text-kriar-muted">Carregando loja...</main>;
  }

  return (
    <main>
      <section className="relative min-h-[390px] overflow-hidden">
        <img
          src={resolveImageUrl(seller.coverUrl)}
          alt=""
          decoding="async"
          onError={handleImageError}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kriar-contrast/90 via-kriar-contrast/40 to-kriar-contrast/15" />
        <div className="app-shell relative flex min-h-[390px] flex-col justify-end py-9 text-white">
          <img
            src={resolveImageUrl(seller.avatarUrl)}
            alt={seller.storeName}
            decoding="async"
            onError={handleImageError}
            className="mb-5 h-24 w-24 rounded-[28px] border-4 border-kriar-surface object-cover shadow-lift"
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge bg-kriar-surface/95 text-kriar-primary shadow-sm backdrop-blur">
              <Store className="h-4 w-4" /> Loja própria
            </span>
            <Stars value={seller.rating} />
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{seller.storeName}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-white/80">{seller.bio}</p>
        </div>
      </section>

      <section className="app-shell grid gap-7 py-12 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-4">
          <div className="panel p-5">
            <HeartHandshake className="mb-3 h-6 w-6 text-kriar-secondary" />
            <h2 className="text-xl font-black tracking-tight text-kriar-contrast">História do criador</h2>
            <p className="mt-3 leading-7 text-kriar-muted">{seller.story}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="panel p-4">
              <strong className="block text-3xl font-black tracking-tight text-kriar-primary">{seller.salesCount}</strong>
              <span className="text-sm font-bold text-kriar-muted">vendas</span>
            </div>
            <div className="panel p-4">
              <BadgeCheck className="mb-2 h-5 w-5 text-kriar-primary" />
              <span className="text-sm font-black text-kriar-contrast">Aprovado pela KRIAR</span>
            </div>
          </div>
        </aside>
        <div>
          <SectionHeader title="Produtos da loja" description="Peças autorais disponíveis para compra ou personalização." />
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
