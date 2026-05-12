import { CheckCircle2, Shield, Store, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { products, sellers } from "../data/mock";

export function AdminDashboard() {
  const metrics: Array<[LucideIcon, string | number, string]> = [
    [Users, "12.408", "usuarios"],
    [Store, sellers.length, "vendedores aprovados"],
    [Shield, "23", "pendencias"],
    [CheckCircle2, products.length, "produtos ativos"]
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-kriar-contrast">Painel admin</h1>
        <p className="text-kriar-contrast/70">Moderacao da plataforma, vendedores, produtos e relatorios.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(([Icon, value, label]) => (
          <div key={String(label)} className="rounded-lg border border-kriar-support/30 bg-white p-5 shadow-sm">
            <Icon className="mb-3 h-6 w-6 text-kriar-primary" />
            <strong className="block text-2xl text-kriar-contrast">{String(value)}</strong>
            <span className="text-sm text-kriar-contrast/70">{String(label)}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-kriar-support/30 bg-white p-5">
          <h2 className="mb-4 text-xl font-black text-kriar-primary">Vendedores para aprovacao</h2>
          {sellers.map((seller) => (
            <div key={seller.id} className="flex items-center gap-3 border-t border-kriar-support/30 py-3 first:border-t-0">
              <img src={seller.avatarUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
              <div className="flex-1">
                <strong>{seller.storeName}</strong>
                <p className="text-sm text-kriar-contrast/70">{seller.bio}</p>
              </div>
              <button className="rounded-lg bg-kriar-primary px-3 py-2 text-sm font-bold text-white">Aprovar</button>
            </div>
          ))}
        </section>
        <section className="rounded-lg border border-kriar-support/30 bg-white p-5">
          <h2 className="mb-4 text-xl font-black text-kriar-primary">Moderacao de produtos</h2>
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="flex items-center gap-3 border-t border-kriar-support/30 py-3 first:border-t-0">
              <img src={product.images[0]} alt="" className="h-12 w-12 rounded-md object-cover" />
              <div className="flex-1">
                <strong>{product.name}</strong>
                <p className="text-sm text-kriar-contrast/70">{product.seller.storeName}</p>
              </div>
              <button className="rounded-lg border border-kriar-primary px-3 py-2 text-sm font-bold text-kriar-primary">Revisar</button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
