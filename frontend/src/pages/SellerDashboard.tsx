import { ClipboardList, ImagePlus, Package, TrendingUp, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { normalizeProduct, productImageUrl, productSalesCount, productSellerSlug } from "../api/products";
import { products } from "../data/mock";
import { api, getCategories } from "../lib/api";
import type { Category, Product } from "../types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function SellerDashboard() {
  const fallbackProducts = useMemo(() => products.filter((item) => productSellerSlug(item) === "atelie-raiz-digital"), []);
  const [myProducts, setMyProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "1",
    categoryId: "",
    imageUrl: ""
  });
  const [dashboard, setDashboard] = useState({
    revenue: fallbackProducts.reduce((sum, product) => sum + productSalesCount(product) * product.price, 0),
    orders: 38,
    rating: "4.9"
  });

  useEffect(() => {
    getCategories().then((items) => {
      setCategories(items);
      setForm((current) => ({ ...current, categoryId: current.categoryId || items[0]?.id || "" }));
    });

    api
      .get("/seller/me/dashboard")
      .then(({ data }) => {
        setDashboard({
          revenue: data.metrics?.revenue ?? 0,
          orders: data.metrics?.orders ?? 0,
          rating: data.seller?.rating?.toFixed?.(1) ?? "0.0"
        });
        setMyProducts((data.topProducts ?? []).map(normalizeProduct));
      })
      .catch(() => {
        setMyProducts(fallbackProducts);
      });
  }, [fallbackProducts]);

  async function submitProduct(event: React.FormEvent) {
    event.preventDefault();
    const category = categories.find((item) => item.id === form.categoryId);
    if (!category) {
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post("/seller/products", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: category.name,
        categoryId: category.id,
        images: [
          {
            url: form.imageUrl,
            filename: form.imageUrl.split("/").pop()?.split("?")[0] || "product-image",
            alt: form.name
          }
        ],
        shippingAvailable: true,
        pickupAvailable: false
      });

      setMyProducts((current) => [normalizeProduct(data.product), ...current]);
      setShowForm(false);
      setForm({ name: "", description: "", price: "", stock: "1", categoryId: categories[0]?.id || "", imageUrl: "" });
    } finally {
      setSaving(false);
    }
  }

  const metrics: Array<[LucideIcon, string | number, string]> = [
    [WalletCards, currency.format(dashboard.revenue), "faturamento"],
    [Package, myProducts.length, "produtos ativos"],
    [ClipboardList, dashboard.orders, "pedidos"],
    [TrendingUp, dashboard.rating, "avaliacao"]
  ];

  return (
    <main className="app-shell section-y">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow mb-2">Operacao</p>
          <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Dashboard do artesao</h1>
          <p className="mt-2 text-kriar-muted">Produtos, pedidos e faturamento da sua loja.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((current) => !current)}>
          <ImagePlus className="h-5 w-5" /> Novo produto
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitProduct} className="panel mb-8 grid gap-4 p-5 md:grid-cols-2">
          <input className="input-field" required placeholder="Nome do produto" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <select className="select-field" required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input className="input-field" required type="number" min="0.01" step="0.01" placeholder="Preco" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          <input className="input-field" required type="number" min="0" step="1" placeholder="Estoque" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
          <input className="input-field md:col-span-2" required type="url" placeholder="URL da imagem" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          <textarea className="text-field min-h-28 md:col-span-2" required minLength={10} placeholder="Descricao" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <button className="btn-primary md:w-max" disabled={saving || categories.length === 0}>{saving ? "Salvando..." : "Cadastrar produto"}</button>
        </form>
      )}

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
            <p className="mt-1 text-sm text-kriar-muted">Visao rapida de estoque, vendas e status.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Vendas</th>
                <th>Preco</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={productImageUrl(product)} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <strong className="text-kriar-contrast">{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.stock}</td>
                  <td>{productSalesCount(product)}</td>
                  <td className="font-bold text-kriar-primary">{currency.format(product.price)}</td>
                  <td><span className="badge-soft">{product.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
