import { ClipboardList, ImagePlus, Package, TrendingUp, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { products } from "../data/mock";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function SellerDashboard() {
  const myProducts = products.filter((item) => item.seller.slug === "atelie-raiz-digital");
  const revenue = myProducts.reduce((sum, product) => sum + product.salesCount * product.price, 0);
  const metrics: Array<[LucideIcon, string | number, string]> = [
    [WalletCards, currency.format(revenue), "faturamento"],
    [Package, myProducts.length, "produtos ativos"],
    [ClipboardList, 38, "pedidos"],
    [TrendingUp, "4.9", "avaliação"]
  ];

  return (
    <main className="app-shell section-y">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow mb-2">Operação</p>
          <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Dashboard do artesão</h1>
          <p className="mt-2 text-kriar-muted">Produtos, pedidos e faturamento da sua loja.</p>
        </div>
        <button className="btn-primary">
          <ImagePlus className="h-5 w-5" /> Novo produto
        </button>
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

      <section className="panel mt-8 p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-kriar-primary">Produtos mais vendidos</h2>
            <p className="mt-1 text-sm text-kriar-muted">Visão rápida de estoque, vendas e status.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Vendas</th>
                <th>Preço</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <strong className="text-kriar-contrast">{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.stock}</td>
                  <td>{product.salesCount}</td>
                  <td className="font-bold text-kriar-primary">{currency.format(product.price)}</td>
                  <td><span className="badge-soft">Ativo</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
