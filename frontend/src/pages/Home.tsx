import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Gamepad2,
  Headphones,
  Monitor,
  MousePointer2,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productCategorySlug, productRating, productSalesCount } from "../api/products";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { SectionHeader } from "../components/SectionHeader";
import { SellerCard } from "../components/SellerCard";
import { getCategories, getProducts, getSellers } from "../lib/api";
import type { Category, Product, Seller } from "../types";

const heroImage = "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1800&q=82";

const buyerSteps = [
  {
    icon: Search,
    title: "Compare por contexto",
    description: "Filtre por categoria, preço e reputação para escolher acessórios, periféricos e colecionáveis com mais segurança."
  },
  {
    icon: ShoppingBag,
    title: "Carrinho organizado",
    description: "Itens ficam agrupados por vendedor, com variações, personalização e cálculo de entrega antes do checkout."
  },
  {
    icon: PackageCheck,
    title: "Pedido rastreável",
    description: "A demo registra pedidos, status e histórico para simular uma operação real de marketplace."
  }
];

const sellerFeatures = [
  ["Catálogo gamer", "Produtos, imagens, variações e estoque em uma rotina simples."],
  ["Assinatura", "Planos demonstrativos para liberar publicação e recorrência."],
  ["Operação", "Pedidos, métricas, status de aprovação e gestão de loja no painel."]
];

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
    const normalizedQuery = query.toLowerCase();
    return products
      .filter((product) => {
        if (!normalizedQuery) return true;
        const categoryName = typeof product.category === "string" ? product.category : product.category?.name;
        return [product.name, product.description, product.seller?.storeName, categoryName]
          .filter(Boolean)
          .some((field) => field?.toLowerCase().includes(normalizedQuery));
      })
      .filter((product) => category === "todos" || productCategorySlug(product) === category)
      .sort((a, b) => (sort === "best_sellers" ? productSalesCount(b) - productSalesCount(a) : sort === "price_asc" ? a.price - b.price : productRating(b) - productRating(a)));
  }, [products, category, sort, query]);

  const activeCategory = category === "todos" ? "Todos os produtos" : categories.find((item) => item.slug === category)?.name ?? "Categoria";

  return (
    <main className="overflow-hidden bg-nexus-background">
      <section className="relative min-h-[620px] overflow-hidden bg-nexus-primary text-white">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.5]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,31,42,0.95)_0%,rgba(31,31,42,0.84)_46%,rgba(31,31,42,0.38)_100%)]" />
        <div className="app-shell relative flex min-h-[620px] flex-col justify-center py-14 sm:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.18] bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-nexus-accent backdrop-blur">
              <Gamepad2 className="h-3.5 w-3.5" /> Marketplace SaaS Gamer
            </span>
            <h1 className="display-title mt-5 max-w-3xl text-6xl sm:text-7xl lg:text-8xl">
              Marketplace gamer com cara de operação real.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              A NexusPlay apresenta catálogo, lojas, carrinho, checkout, pedidos e painel de vendedor em uma experiência enxuta para demonstrar um produto SaaS gamer de ponta a ponta.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#produtos" className="btn bg-nexus-accent text-nexus-primary shadow-soft hover:-translate-y-0.5 hover:bg-white active:translate-y-0">
                Explorar Catálogo <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/vendedor/cadastro" className="btn border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/[0.16]">
                Criar Loja Demo
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-4">
            {[
              [MousePointer2, "Periféricos"],
              [Headphones, "Streaming"],
              [Monitor, "Setup"],
              [Truck, "Entrega simulada"]
            ].map(([Icon, label]) => (
              <div key={String(label)} className="rounded-lg border border-white/[0.14] bg-white/[0.08] p-4 backdrop-blur">
                <Icon className="mb-3 h-5 w-5 text-nexus-accent" />
                <strong className="text-sm font-semibold text-white">{String(label)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-nexus-line bg-white">
        <div className="app-shell grid gap-4 py-5 md:grid-cols-4">
          {[
            ["10", "produtos demo"],
            ["3", "lojas fictícias"],
            ["4,9/5", "avaliação média"],
            ["48h", "entrega simulada"]
          ].map(([value, label]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-nexus-paper text-nexus-secondary">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <strong className="block text-lg font-semibold text-nexus-contrast">{value}</strong>
                <span className="text-sm font-medium text-nexus-muted">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="produtos" className="app-shell section-y">
        <SectionHeader
          eyebrow="Catálogo"
          title="Produtos para jogar, streamar e montar setup"
          description="Itens de demonstração com imagens, preços, estoque, avaliações, variações e vendedores para apresentar um fluxo real de marketplace."
          action={
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="select-field">
              <option value="featured">Mais bem avaliados</option>
              <option value="best_sellers">Mais vendidos</option>
              <option value="price_asc">Menor preço</option>
            </select>
          }
        />
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="badge-soft">
            <Boxes className="h-3.5 w-3.5" /> {activeCategory}
          </span>
          {query && <span className="badge-warm">Busca: {query}</span>}
        </div>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setCategory("todos")} className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition ${category === "todos" ? "border-nexus-secondary bg-nexus-accent text-nexus-contrast" : "border-nexus-line bg-nexus-surface text-nexus-muted hover:border-nexus-secondary hover:text-nexus-contrast"}`}>
            Todos
          </button>
          {categories.slice(0, 8).map((item) => (
            <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition ${category === item.slug ? "border-nexus-secondary bg-nexus-accent text-nexus-contrast" : "border-nexus-line bg-nexus-surface text-nexus-muted hover:border-nexus-secondary hover:text-nexus-contrast"}`}>
              {item.name}
            </button>
          ))}
        </div>
        {productsLoading ? (
          <ProductSkeletonGrid />
        ) : visibleProducts.length === 0 ? (
          <EmptyState title="Nenhum produto encontrado" description="Ajuste a busca ou remova os filtros para ver mais produtos." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-nexus-line bg-white py-12">
        <div className="app-shell">
          <SectionHeader
            eyebrow="Experiência do comprador"
            title="Da descoberta ao pedido em poucos passos"
            description="A jornada prioriza comparação rápida, segurança visual e confirmação clara de cada ação."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {buyerSteps.map(({ icon: Icon, title, description }) => (
              <article key={title} className="panel p-5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-nexus-primary text-nexus-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-nexus-contrast">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-nexus-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="app-shell section-y">
        <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="eyebrow mb-2">Operação de Vendedores</p>
            <h2 className="text-3xl font-semibold leading-tight text-nexus-contrast">Um painel para lojas gamer venderem com mais controle.</h2>
            <p className="mt-4 text-base leading-7 text-nexus-muted">
              Cadastro de loja, aprovação administrativa, assinatura, produtos com imagens e variações, pedidos e métricas convivem no mesmo fluxo técnico.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/vendedor/cadastro" className="btn-primary">
                Cadastrar loja <Store className="h-4 w-4" />
              </Link>
              <Link to="/vendedor/login" className="btn-secondary">
                Entrar como vendedor
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {sellerFeatures.map(([title, description], index) => (
              <article key={title} className="panel p-5">
                <span className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-nexus-paper text-nexus-secondary">
                  {index === 0 ? <Boxes className="h-5 w-5" /> : index === 1 ? <ShieldCheck className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                </span>
                <h3 className="font-semibold text-nexus-contrast">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-nexus-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-nexus-line bg-white py-12">
        <div className="app-shell">
          <SectionHeader
            eyebrow="Lojas"
            title="Marcas prontas para demonstração"
            description="Vendedores fictícios com identidade própria, reputação, loja pública e produtos relacionados."
            action={
              <Link to="/marcas" className="btn-secondary">
                Ver todas
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

      <section className="app-shell py-10">
        <div className="relative grid gap-5 overflow-hidden rounded-lg border border-nexus-line bg-nexus-primary p-6 text-white md:grid-cols-[1fr_auto] md:items-center">
          <img
            src="/brand/nexusplay-mark.png"
            alt=""
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-lg object-contain opacity-[0.08] mix-blend-screen md:h-56 md:w-56"
            loading="lazy"
            decoding="async"
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-nexus-accent">Demo completa</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">Teste compra, venda, pedidos e assinatura no mesmo projeto.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/76">
              A experiência usa dados fictícios quando a API não está disponível, preservando os principais fluxos para apresentação em portfólio.
            </p>
          </div>
          <Link to="/login" className="btn relative bg-white text-nexus-primary hover:bg-nexus-accent md:w-max">
            Testar conta demo <Users className="h-4 w-4" />
          </Link>
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
          <div className="aspect-[4/3] animate-pulse bg-nexus-paper" />
          <div className="space-y-4 p-4">
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-nexus-paper" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-nexus-paper" />
            <div className="flex justify-between border-t border-nexus-line/70 pt-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-nexus-paper" />
              <div className="h-11 w-24 animate-pulse rounded-full bg-nexus-paper" />
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
          <div className="h-32 animate-pulse bg-nexus-paper" />
          <div className="space-y-4 p-4">
            <div className="-mt-10 h-14 w-14 animate-pulse rounded-lg bg-nexus-paper" />
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-nexus-paper" />
            <div className="h-4 w-full animate-pulse rounded-full bg-nexus-paper" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-nexus-paper" />
          </div>
        </div>
      ))}
    </div>
  );
}
