import { ArrowRight, BadgeCheck, Boxes, ShieldCheck, SlidersHorizontal, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
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
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-12">
        <div className="flex flex-col justify-center">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-kriar-support/20 px-3 py-1 text-sm font-bold text-kriar-primary">
              <Sparkles className="h-4 w-4" /> Marketplace artesanal
            </span>
            <span className="rounded-md bg-white px-3 py-1 text-sm font-bold text-kriar-secondary shadow-sm">Pagamento seguro</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-kriar-contrast sm:text-5xl lg:text-6xl">
            KRIAR - Onde a Arte encontra o Futuro
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-kriar-contrast/75">
            Compre pecas unicas direto de artesaos brasileiros, acompanhe pedidos personalizados e descubra lojas com historia, avaliacao e curadoria.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#produtos" className="inline-flex items-center justify-center gap-2 rounded-lg bg-kriar-primary px-5 py-3 font-bold text-white transition hover:bg-kriar-secondary">
              Explorar produtos <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/vendedor" className="inline-flex items-center justify-center gap-2 rounded-lg border border-kriar-primary px-5 py-3 font-bold text-kriar-primary hover:bg-kriar-support/20">
              Abrir minha loja
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            {[
              ["12k+", "compras protegidas"],
              ["4.9", "avaliacao media"],
              ["820", "lojas criativas"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-kriar-support/30 bg-white p-3 shadow-sm">
                <strong className="block text-2xl text-kriar-primary">{value}</strong>
                <span className="text-kriar-contrast/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1565193298357-7eec95cb9bd2?auto=format&fit=crop&w=1300&q=80"
            alt="Artesa trabalhando em ceramica"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kriar-contrast/80 to-transparent p-5 text-white">
            <p className="text-sm font-bold uppercase tracking-normal">Atelie em destaque</p>
            <h2 className="mt-1 text-2xl font-black">Processo visivel, autoria valorizada</h2>
          </div>
        </div>
      </section>

      <section className="border-y border-kriar-support/30 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:grid-cols-4">
          {[
            [ShieldCheck, "Compra protegida"],
            [Truck, "Pedido rastreavel"],
            [BadgeCheck, "Artesaos avaliados"],
            [Boxes, "Carrinho multi-vendedor"]
          ].map(([Icon, label]) => (
            <div key={String(label)} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-kriar-support/20 text-kriar-primary">
                <Icon className="h-5 w-5" />
              </span>
              <strong className="text-sm text-kriar-contrast">{String(label)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-kriar-contrast">Produtos em destaque</h2>
            <p className="text-kriar-contrast/70">Feitos a mao, unicos e prontos para personalizar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-kriar-support/50 bg-white px-3 py-2 text-sm font-semibold">
              <option value="todos">Todas categorias</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-kriar-support/50 bg-white px-3 py-2 text-sm font-semibold">
              <option value="featured">Melhor avaliados</option>
              <option value="best_sellers">Mais vendidos</option>
              <option value="price_asc">Menor preco</option>
            </select>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-kriar-support/20 text-kriar-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
          </div>
        </div>
        {visibleProducts.length === 0 ? (
          <div className="rounded-lg border border-kriar-support/30 bg-white p-10 text-center text-kriar-contrast/70">Nenhum produto encontrado.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-kriar-primary py-10 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Artesaos em alta</h2>
              <p className="text-white/75">Lojas com historia, reputacao e produtos autorais.</p>
            </div>
            <Link to="/artesaos" className="hidden font-bold text-kriar-support sm:block">
              Ver todos
            </Link>
          </div>
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
