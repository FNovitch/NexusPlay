import { BadgeCheck, HeartHandshake, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { Stars } from "../components/Stars";
import { getSeller } from "../lib/api";
import type { Product, Seller } from "../types";

export function SellerStore() {
  const { slug = "" } = useParams();
  const [seller, setSeller] = useState<(Seller & { products: Product[] }) | null>(null);

  useEffect(() => {
    getSeller(slug).then(setSeller);
  }, [slug]);

  if (!seller) {
    return <main className="mx-auto max-w-7xl px-4 py-16">Carregando loja...</main>;
  }

  return (
    <main>
      <section className="relative min-h-[360px] overflow-hidden">
        <img src={seller.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-kriar-contrast/55" />
        <div className="relative mx-auto flex min-h-[360px] max-w-7xl flex-col justify-end px-4 py-8 text-white">
          <img src={seller.avatarUrl} alt={seller.storeName} className="mb-4 h-24 w-24 rounded-lg border-4 border-white object-cover" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-white/90 px-2 py-1 text-sm font-bold text-kriar-primary">
              <Store className="mr-1 inline h-4 w-4" /> Loja propria
            </span>
            <Stars value={seller.rating} />
          </div>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">{seller.storeName}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">{seller.bio}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-kriar-support/30 bg-white p-5 shadow-sm">
            <HeartHandshake className="mb-3 h-6 w-6 text-kriar-secondary" />
            <h2 className="text-xl font-black text-kriar-contrast">Historia do criador</h2>
            <p className="mt-3 leading-7 text-kriar-contrast/75">{seller.story}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-kriar-support/30 bg-white p-4">
              <strong className="block text-2xl text-kriar-primary">{seller.salesCount}</strong>
              <span className="text-sm text-kriar-contrast/70">vendas</span>
            </div>
            <div className="rounded-lg border border-kriar-support/30 bg-white p-4">
              <BadgeCheck className="mb-1 h-5 w-5 text-kriar-primary" />
              <span className="text-sm font-bold text-kriar-contrast">Aprovado pela KRIAR</span>
            </div>
          </div>
        </aside>
        <div>
          <h2 className="mb-4 text-2xl font-black text-kriar-contrast">Produtos da loja</h2>
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
