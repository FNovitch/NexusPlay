import { ArrowRight, BadgeCheck, Boxes, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { SectionHeader } from "../components/SectionHeader";
import { SellerCard } from "../components/SellerCard";
import { productCategorySlug, productRating, productSalesCount } from "../api/products";
import { getCategories, getProducts, getSellers } from "../lib/api";
import type { Category, Product, Seller } from "../types";
import { handleImageError } from "../utils/media";

export function Home() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [category, setCategory] = useState("todos");
  const [sort, setSort] = useState("featured");
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    let active = true;
    setProductsLoading(true);
    setSellersLoading(true);

    getProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    getSellers()
      .then((items) => {
        if (active) setSellers(items);
      })
      .finally(() => {
        if (active) setSellersLoading(false);
      });

    getCategories().then((items) => {
      if (active) setCategories(items);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (window.location.hash === "#produtos") {
      window.setTimeout(() => document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  }, []);

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
      .filter((product) => category === "todos" || productCategorySlug(product) === category)
      .sort((a, b) => (sort === "best_sellers" ? productSalesCount(b) - productSalesCount(a) : sort === "price_asc" ? a.price - b.price : productRating(b) - productRating(a)));
  }, [products, category, sort, query]);

  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[560px] overflow-hidden bg-kriar-contrast text-white lg:min-h-[680px]">
        <img
          src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1800&q=82"
          alt="Artesã trabalhando em cerâmica"
          onError={handleImageError}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-kriar-contrast/92 via-kriar-contrast/52 to-kriar-contrast/10" />
        <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_24%_50%,rgba(29,39,51,0.58),transparent_42%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-kriar-background to-transparent" />
        <div className="app-shell relative flex min-h-[560px] items-end pb-12 pt-24 sm:pb-16 lg:min-h-[680px] lg:items-center lg:pb-16 lg:pt-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/85 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Marketplace artesanal
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
              KRIAR, onde a arte encontra o futuro
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/90 sm:text-xl">
              Peças autorais, compra segura e histórias reais por trás de cada criação.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#produtos" className="btn-primary bg-kriar-light text-kriar-primary hover:bg-white">
                Explorar produtos <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/artesao/cadastro" className="btn border border-white/35 bg-kriar-contrast/35 text-white shadow-sm backdrop-blur hover:bg-kriar-contrast/50">
                Vender na KRIAR
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-8 relative z-10">
        <div className="app-shell">
          <div className="grid gap-3 rounded-2xl border border-kriar-line bg-kriar-surface/95 p-3 shadow-soft md:grid-cols-4">
          {[
            [ShieldCheck, "Compra protegida"],
            [Truck, "Pedido rastreável"],
            [BadgeCheck, "Artesãos avaliados"],
            [Boxes, "Carrinho multi-vendedor"]
          ].map(([Icon, label]) => (
            <div key={String(label)} className="flex items-center gap-3 rounded-xl px-2 py-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-kriar-primary/10 text-kriar-primary">
                <Icon className="h-5 w-5" />
              </span>
              <strong className="text-sm text-kriar-contrast">{String(label)}</strong>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section id="produtos" className="app-shell section-y">
        <SectionHeader
          eyebrow="Curadoria"
          title="Produtos em destaque"
          description="Uma vitrine enxuta de peças feitas à mão, com autoria e acabamento."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="select-field">
                <option value="featured">Mais bem avaliados</option>
                <option value="best_sellers">Mais vendidos</option>
                <option value="price_asc">Menor preço</option>
              </select>
            </div>
          }
        />
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setCategory("todos")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${category === "todos" ? "border-kriar-primary/35 bg-kriar-primary/10 text-kriar-primary" : "border-kriar-line bg-kriar-surface text-kriar-muted hover:border-kriar-primary/40 hover:text-kriar-primary"}`}>
            Todas
          </button>
          {categories.slice(0, 8).map((item) => (
            <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${category === item.slug ? "border-kriar-primary/35 bg-kriar-primary/10 text-kriar-primary" : "border-kriar-line bg-kriar-surface text-kriar-muted hover:border-kriar-primary/40 hover:text-kriar-primary"}`}>
              {item.name}
            </button>
          ))}
        </div>
        {productsLoading ? (
          <ProductSkeletonGrid />
        ) : visibleProducts.length === 0 ? (
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
            description="Ateliês brasileiros com peças autorais, atendimento próximo e reputação construída por compradores reais."
            tone="inverted"
            action={
              <Link to="/artesaos" className="btn border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15">
                Ver todos
              </Link>
            }
          />
          {sellersLoading ? (
            <SellerSkeletonGrid />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {sellers.slice(0, 3).map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="app-shell py-12">
        <div className="grid gap-5 rounded-2xl border border-kriar-line bg-kriar-surface p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow mb-2">Para vendedores</p>
            <h2 className="text-2xl font-black text-kriar-contrast">Transforme seu ateliê em uma loja autoral.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-kriar-muted">
              Cadastre sua loja, aguarde a aprovação e publique produtos com frete, pagamento e pedidos em um só lugar.
            </p>
          </div>
          <Link to="/artesao/cadastro" className="btn-secondary md:w-max">Começar cadastro</Link>
        </div>
      </section>
    </main>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="panel overflow-hidden">
          <div className="aspect-[4/3] animate-pulse bg-kriar-paper" />
          <div className="space-y-4 p-4">
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-kriar-paper" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-kriar-paper" />
            <div className="flex justify-between border-t border-kriar-line/70 pt-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-kriar-paper" />
              <div className="h-11 w-24 animate-pulse rounded-full bg-kriar-paper" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SellerSkeletonGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="panel overflow-hidden">
          <div className="h-36 animate-pulse bg-white/10" />
          <div className="space-y-4 p-4">
            <div className="-mt-12 h-16 w-16 animate-pulse rounded-2xl bg-white/20" />
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/20" />
            <div className="h-4 w-full animate-pulse rounded-full bg-white/15" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/15" />
          </div>
        </div>
      ))}
    </div>
  );
}
