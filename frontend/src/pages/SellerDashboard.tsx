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
    [TrendingUp, "4.9", "avaliacao"]
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-kriar-contrast">Dashboard do artesao</h1>
          <p className="text-kriar-contrast/70">Produtos, pedidos e faturamento da sua loja.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-kriar-primary px-4 py-3 font-bold text-white">
          <ImagePlus className="h-5 w-5" /> Novo produto
        </button>
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

      <section className="mt-8 rounded-lg border border-kriar-support/30 bg-white p-5">
        <h2 className="mb-4 text-xl font-black text-kriar-primary">Produtos mais vendidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-kriar-contrast/60">
              <tr>
                <th className="py-3">Produto</th>
                <th>Estoque</th>
                <th>Vendas</th>
                <th>Preco</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((product) => (
                <tr key={product.id} className="border-t border-kriar-support/30">
                  <td className="flex items-center gap-3 py-3">
                    <img src={product.images[0]} alt="" className="h-12 w-12 rounded-md object-cover" />
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.stock}</td>
                  <td>{product.salesCount}</td>
                  <td>{currency.format(product.price)}</td>
                  <td><span className="rounded-md bg-kriar-support/20 px-2 py-1 font-bold text-kriar-primary">Ativo</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
