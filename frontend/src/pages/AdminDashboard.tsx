import { CheckCircle2, Shield, Store, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { productImageUrl, productSellerName } from "../api/products";
import { products, sellers } from "../data/mock";
import { api, getProducts, getSellers } from "../lib/api";
import type { Product, Seller } from "../types";

type GroupCount = {
  status: string;
  _count: number;
};

export function AdminDashboard() {
  const [adminProducts, setAdminProducts] = useState<Product[]>(products);
  const [adminSellers, setAdminSellers] = useState<Seller[]>(sellers);
  const [overview, setOverview] = useState({
    users: "12.408",
    pending: "23",
    activeProducts: products.length
  });

  useEffect(() => {
    getProducts().then(setAdminProducts);
    getSellers().then(setAdminSellers);
    api
      .get("/admin/overview")
      .then(({ data }) => {
        const sellerGroups = (data.sellers ?? []) as GroupCount[];
        const productGroups = (data.products ?? []) as GroupCount[];
        const pendingSellers = sellerGroups.find((item) => item.status === "PENDING")?._count ?? 0;
        const pendingProducts = productGroups.find((item) => item.status === "PENDING")?._count ?? 0;
        const activeProducts = productGroups.find((item) => item.status === "ACTIVE")?._count ?? 0;

        setOverview({
          users: String(data.users ?? 0),
          pending: String(pendingSellers + pendingProducts),
          activeProducts
        });
      })
      .catch(() => undefined);
  }, []);

  const visibleSellers = useMemo(() => adminSellers.slice(0, 4), [adminSellers]);
  const visibleProducts = useMemo(() => adminProducts.slice(0, 4), [adminProducts]);
  const metrics: Array<[LucideIcon, string | number, string]> = [
    [Users, overview.users, "usuarios"],
    [Store, adminSellers.length, "vendedores aprovados"],
    [Shield, overview.pending, "pendencias"],
    [CheckCircle2, overview.activeProducts, "produtos ativos"]
=======
import { products, sellers } from "../data/mock";

export function AdminDashboard() {
  const metrics: Array<[LucideIcon, string | number, string]> = [
    [Users, "12.408", "usuários"],
    [Store, sellers.length, "vendedores aprovados"],
    [Shield, "23", "pendências"],
    [CheckCircle2, products.length, "produtos ativos"]
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
  ];

  return (
    <main className="app-shell section-y">
      <div className="mb-8">
<<<<<<< HEAD
        <p className="eyebrow mb-2">Gestao</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Painel admin</h1>
        <p className="mt-2 text-kriar-muted">Moderacao da plataforma, vendedores, produtos e relatorios.</p>
=======
        <p className="eyebrow mb-2">Gestão</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Painel admin</h1>
        <p className="mt-2 text-kriar-muted">Moderação da plataforma, vendedores, produtos e relatórios.</p>
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(([Icon, value, label]) => (
          <div key={String(label)} className="panel p-5">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-kriar-primary/10 text-kriar-primary">
              <Icon className="h-5 w-5" />
            </span>
            <strong className="block text-2xl font-black tracking-tight text-kriar-contrast">{String(value)}</strong>
            <span className="text-sm font-bold text-kriar-muted">{String(label)}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
<<<<<<< HEAD
          <h2 className="mb-1 text-xl font-black tracking-tight text-kriar-primary">Vendedores para aprovacao</h2>
          <p className="mb-5 text-sm text-kriar-muted">Revise perfis antes de publicar novas lojas.</p>
          {visibleSellers.map((seller) => (
            <div key={seller.id} className="flex items-center gap-3 border-t border-kriar-line py-4 first:border-t-0">
              <img src={seller.avatarUrl ?? ""} alt="" className="h-12 w-12 rounded-xl object-cover" />
=======
          <h2 className="mb-1 text-xl font-black tracking-tight text-kriar-primary">Vendedores para aprovação</h2>
          <p className="mb-5 text-sm text-kriar-muted">Revise perfis antes de publicar novas lojas.</p>
          {sellers.map((seller) => (
            <div key={seller.id} className="flex items-center gap-3 border-t border-kriar-line py-4 first:border-t-0">
              <img src={seller.avatarUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-kriar-contrast">{seller.storeName}</strong>
                <p className="line-clamp-1 text-sm text-kriar-muted">{seller.bio}</p>
              </div>
              <button className="btn-primary min-h-10 px-3 py-2 text-xs">Aprovar</button>
            </div>
          ))}
        </section>
        <section className="panel p-5">
<<<<<<< HEAD
          <h2 className="mb-1 text-xl font-black tracking-tight text-kriar-primary">Moderacao de produtos</h2>
          <p className="mb-5 text-sm text-kriar-muted">Acompanhe itens recentes e sinalizacoes.</p>
          {visibleProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-3 border-t border-kriar-line py-4 first:border-t-0">
              <img src={productImageUrl(product)} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-kriar-contrast">{product.name}</strong>
                <p className="text-sm text-kriar-muted">{productSellerName(product)}</p>
=======
          <h2 className="mb-1 text-xl font-black tracking-tight text-kriar-primary">Moderação de produtos</h2>
          <p className="mb-5 text-sm text-kriar-muted">Acompanhe itens recentes e sinalizações.</p>
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="flex items-center gap-3 border-t border-kriar-line py-4 first:border-t-0">
              <img src={product.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-kriar-contrast">{product.name}</strong>
                <p className="text-sm text-kriar-muted">{product.seller.storeName}</p>
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
              </div>
              <button className="btn-secondary min-h-10 px-3 py-2 text-xs">Revisar</button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
