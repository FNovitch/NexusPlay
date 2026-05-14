import { CheckCircle2, Shield, Store, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { products, sellers } from "../data/mock";

export function AdminDashboard() {
  const metrics: Array<[LucideIcon, string | number, string]> = [
    [Users, "12.408", "usuários"],
    [Store, sellers.length, "vendedores aprovados"],
    [Shield, "23", "pendências"],
    [CheckCircle2, products.length, "produtos ativos"]
  ];

  return (
    <main className="app-shell section-y">
      <div className="mb-8">
        <p className="eyebrow mb-2">Gestão</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Painel admin</h1>
        <p className="mt-2 text-kriar-muted">Moderação da plataforma, vendedores, produtos e relatórios.</p>
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
          <h2 className="mb-1 text-xl font-black tracking-tight text-kriar-primary">Vendedores para aprovação</h2>
          <p className="mb-5 text-sm text-kriar-muted">Revise perfis antes de publicar novas lojas.</p>
          {sellers.map((seller) => (
            <div key={seller.id} className="flex items-center gap-3 border-t border-kriar-line py-4 first:border-t-0">
              <img src={seller.avatarUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-kriar-contrast">{seller.storeName}</strong>
                <p className="line-clamp-1 text-sm text-kriar-muted">{seller.bio}</p>
              </div>
              <button className="btn-primary min-h-10 px-3 py-2 text-xs">Aprovar</button>
            </div>
          ))}
        </section>
        <section className="panel p-5">
          <h2 className="mb-1 text-xl font-black tracking-tight text-kriar-primary">Moderação de produtos</h2>
          <p className="mb-5 text-sm text-kriar-muted">Acompanhe itens recentes e sinalizações.</p>
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="flex items-center gap-3 border-t border-kriar-line py-4 first:border-t-0">
              <img src={product.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-kriar-contrast">{product.name}</strong>
                <p className="text-sm text-kriar-muted">{product.seller.storeName}</p>
              </div>
              <button className="btn-secondary min-h-10 px-3 py-2 text-xs">Revisar</button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
