import { ArrowRight, BadgeCheck, Boxes, ShieldCheck, SlidersHorizontal, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { SectionHeader } from "../components/SectionHeader";
import { SellerCard } from "../components/SellerCard";
import { getCategories, getProducts, getSellers } from "../lib/api";
import type { Category, Product, Seller } from "../types";

export function Home() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("todos");
  const [sort, setSort] = useState("featured");
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    getProducts().then(setProducts);
    getSellers().then(setSellers);
    getCategories().then(setCategories);
  }, []);

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => category === "todos" || product.category.slug === category)
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (sort === "best_sellers" ? b.salesCount - a.salesCount : sort === "price_asc" ? a.price - b.price : b.rating - a.rating));
  }, [products, category, sort, query]);

  return (
    <main>
      <section className="app-shell grid gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="badge-soft">
              <Sparkles className="h-4 w-4" /> Marketplace artesanal
            </span>
            <span className="badge-warm">Pagamento seguro</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-kriar-contrast sm:text-5xl lg:text-6xl">
            KRIAR, onde a arte encontra o futuro
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-kriar-muted">
            Compre peças únicas direto de artesãos brasileiros, acompanhe pedidos personalizados e descubra lojas com história, avaliação e curadoria.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#produtos" className="btn-primary">
              Explorar produtos <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/vendedor" className="btn-secondary">
              Abrir minha loja
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["12k+", "compras protegidas"],
              ["4.9", "avaliação média"],
              ["820", "lojas criativas"]
            ].map(([value, label]) => (
              <div key={label} className="border-l border-kriar-line pl-4 first:border-l-0 first:pl-0">
                <strong className="block text-2xl font-black tracking-tight text-kriar-primary sm:text-3xl">{value}</strong>
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-kriar-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[430px] overflow-hidden rounded-[28px] bg-kriar-background shadow-lift">
          <img
            src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1300&q=80"
            alt="Artesã trabalhando em cerâmica"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kriar-contrast/80 via-kriar-contrast/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/75">Ateliê em destaque</p>
            <h2 className="mt-2 max-w-md text-3xl font-black tracking-tight">Processo visível, autoria valorizada</h2>
          </div>
        </div>
      </section>

      <section className="border-y border-kriar-line/80 bg-kriar-surface/75">
        <div className="app-shell grid gap-3 py-5 md:grid-cols-4">
          {[
            [ShieldCheck, "Compra protegida"],
            [Truck, "Pedido rastreável"],
            [BadgeCheck, "Artesãos avaliados"],
            [Boxes, "Carrinho multi-vendedor"]
          ].map(([Icon, label]) => (
            <div key={String(label)} className="flex items-center gap-3 rounded-[20px] px-1 py-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-kriar-primary/10 text-kriar-primary">
                <Icon className="h-5 w-5" />
              </span>
              <strong className="text-sm text-kriar-contrast">{String(label)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="produtos" className="app-shell section-y">
        <SectionHeader
          eyebrow="Curadoria"
          title="Produtos em destaque"
          description="Feitos à mão, únicos e prontos para personalizar."
          action={
            <div className="flex flex-wrap gap-2">
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="select-field">
                <option value="todos">Todas categorias</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="select-field">
                <option value="featured">Mais bem avaliados</option>
                <option value="best_sellers">Mais vendidos</option>
                <option value="price_asc">Menor preço</option>
              </select>
              <span className="btn-icon bg-kriar-surface">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
            </div>
          }
        />
        {visibleProducts.length === 0 ? (
          <EmptyState title="Nenhum produto encontrado" description="Ajuste a busca ou remova os filtros para ver mais peças." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-kriar-contrast py-14 text-white">
        <div className="app-shell">
          <SectionHeader
            eyebrow="Lojas autorais"
            title="Artesãos em alta"
            description="Lojas com história, reputação e produtos autorais."
            action={
              <Link to="/artesaos" className="btn bg-kriar-surface/10 text-kriar-light hover:bg-kriar-surface/15">
                Ver todos
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {sellers.slice(0, 3).map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
