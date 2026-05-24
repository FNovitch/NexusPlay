import { ClipboardList, ImagePlus, Package, Settings, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { normalizeProduct, productImageUrl, productSalesCount, productSellerSlug } from "../api/products";
import { products } from "../data/mock";
import { api, getCategories } from "../lib/api";
import { getMyArtisanProfile } from "../services/artisans";
import { getSubscriptionStatus, type SubscriptionStatus } from "../services/subscriptions";
import { useAuth } from "../store/auth";
import type { Category, Product, ProductImage } from "../types";
import { Link, Navigate } from "react-router-dom";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function SellerDashboard() {
  const user = useAuth((state) => state.user);
  const fallbackProducts = useMemo(() => products.filter((item) => productSellerSlug(item) === "atelie-raiz-digital"), []);
  const [myProducts, setMyProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageError, setImageError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "1",
    categoryId: "",
    images: [] as File[],
    existingImages: [] as ProductImage[],
    removeImageIds: [] as string[],
    weight: "",
    width: "",
    height: "",
    length: "",
    variations: [] as Array<{ name: string; options: string }>
  });
  const [dashboard, setDashboard] = useState({
    revenue: fallbackProducts.reduce((sum, product) => sum + productSalesCount(product) * product.price, 0),
    orders: 38,
    rating: "4.9",
    status: "pendente",
    artisanName: user?.name ?? "Artesao",
    storeName: "Sua loja"
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
          rating: data.seller?.rating?.toFixed?.(1) ?? "0.0",
          status: data.seller?.status === "APPROVED" ? "aprovado" : data.seller?.status === "REJECTED" ? "recusado" : "pendente",
          artisanName: data.seller?.user?.name ?? user?.name ?? "Artesao",
          storeName: data.seller?.storeName ?? "Sua loja"
        });
        setMyProducts((data.topProducts ?? []).map(normalizeProduct));
      })
      .catch(() => {
        setMyProducts(fallbackProducts);
      });

    getMyArtisanProfile()
      .then((artisan) => {
        setDashboard((current) => ({
          ...current,
          status: artisan.status === "APPROVED" ? "aprovado" : artisan.status === "REJECTED" ? "recusado" : "pendente",
          artisanName: artisan.name,
          storeName: artisan.storeName
        }));
      })
      .catch(() => undefined);

    getSubscriptionStatus().then(setSubscription).catch(() => undefined);
  }, [fallbackProducts]);

  if (!user || user.role !== "ARTISAN") {
    return <Navigate to="/artesao/login" replace />;
  }

  function resetForm() {
    setEditingProduct(null);
    setImageError("");
    setForm({ name: "", description: "", price: "", stock: "1", categoryId: categories[0]?.id || "", images: [], existingImages: [], removeImageIds: [], weight: "", width: "", height: "", length: "", variations: [] });
  }

  function startCreateProduct() {
    resetForm();
    setShowForm((current) => !current || Boolean(editingProduct));
  }

  function startEditProduct(product: Product) {
    setEditingProduct(product);
    setImageError("");
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId,
      images: [],
      existingImages: product.images,
      removeImageIds: [],
      weight: product.weight ? String(product.weight) : "",
      width: product.dimensions?.width ? String(product.dimensions.width) : "",
      height: product.dimensions?.height ? String(product.dimensions.height) : "",
      length: product.dimensions?.length ? String(product.dimensions.length) : "",
      variations: product.variations.map((variation) => ({ name: variation.name, options: variation.options.join(", ") }))
    });
    setShowForm(true);
  }

  function selectImages(files: FileList | null) {
    const selected = Array.from(files ?? []);
    const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
    const visibleExisting = form.existingImages.length - form.removeImageIds.length;

    if (selected.some((file) => !allowed.has(file.type))) {
      setImageError("Envie apenas imagens jpg, jpeg, png ou webp.");
      return;
    }

    if (selected.some((file) => file.size > 5 * 1024 * 1024)) {
      setImageError("Cada imagem deve ter no maximo 5MB.");
      return;
    }

    if (visibleExisting + selected.length > 3) {
      setImageError("Selecione no maximo 3 imagens por produto.");
      return;
    }

    setImageError("");
    setForm({ ...form, images: selected });
  }

  function removeExistingImage(image: ProductImage) {
    if (!image.id) return;
    setForm({ ...form, removeImageIds: [...form.removeImageIds, image.id] });
  }

  async function submitProduct(event: React.FormEvent) {
    event.preventDefault();
    const category = categories.find((item) => item.id === form.categoryId);
    if (!category) {
      return;
    }
    if (form.existingImages.length - form.removeImageIds.length + form.images.length === 0) {
      setImageError("Mantenha pelo menos uma imagem do produto.");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("price", form.price);
      payload.append("stock", form.stock);
      payload.append("category", category.name);
      payload.append("categoryId", category.id);
      payload.append("shippingAvailable", "true");
      payload.append("weight", form.weight);
      payload.append("dimensions", JSON.stringify({ width: Number(form.width), height: Number(form.height), length: Number(form.length) }));
      payload.append("removeImageIds", JSON.stringify(form.removeImageIds));
      payload.append("variations", JSON.stringify(form.variations.map((variation) => ({
        name: variation.name,
        options: variation.options.split(",").map((option) => option.trim()).filter(Boolean)
      })).filter((variation) => variation.name.trim() && variation.options.length > 0)));
      form.images.forEach((image) => payload.append("images", image));

      const { data } = editingProduct
        ? await api.patch(`/seller/products/${editingProduct.id}`, payload, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.post("/seller/products", payload, { headers: { "Content-Type": "multipart/form-data" } });

      const savedProduct = normalizeProduct(data.product);
      setMyProducts((current) => editingProduct ? current.map((product) => product.id === savedProduct.id ? savedProduct : product) : [savedProduct, ...current]);
      setShowForm(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  const metrics: Array<[LucideIcon, string | number, string]> = [
    [WalletCards, currency.format(dashboard.revenue), "faturamento"],
    [Package, myProducts.length, "produtos ativos"],
    [ClipboardList, dashboard.orders, "pedidos"],
    [TrendingUp, dashboard.rating, "avaliacao"],
    [ShieldCheck, dashboard.status, "status da conta"]
  ];

  return (
    <main className="app-shell section-y">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow mb-2">Operacao</p>
          <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Dashboard do artesao</h1>
          <p className="mt-2 text-kriar-muted">{dashboard.artisanName} · {dashboard.storeName}</p>
          {dashboard.status !== "aprovado" && (
            <p className="mt-2 max-w-2xl rounded-xl border border-kriar-line bg-kriar-background px-4 py-3 text-sm font-bold text-kriar-contrast">
              {dashboard.status === "recusado"
                ? "Seu cadastro foi recusado. Atualize o perfil ou fale com o suporte antes de vender."
                : "Seu cadastro esta pendente de aprovacao. Voce pode preparar o perfil e produtos enquanto aguarda."}
            </p>
          )}
          {subscription && !subscription.canSell && (
            <p className="mt-2 max-w-2xl rounded-xl border border-kriar-line bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Seu periodo gratis terminou. Escolha um plano para continuar vendendo no Kriar.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/artesao/perfil" className="btn-secondary">
            <Settings className="h-5 w-5" /> Perfil
          </Link>
          <Link to="/artesao/pedidos" className="btn-secondary">Pedidos</Link>
          <Link to="/artesao/assinatura" className="btn-secondary">Assinatura</Link>
          <button className="btn-primary" onClick={startCreateProduct} disabled={subscription ? !subscription.canSell : false}>
            <ImagePlus className="h-5 w-5" /> {showForm && !editingProduct ? "Fechar cadastro" : "Cadastrar produto"}
          </button>
        </div>
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
          <input className="input-field" required type="number" min="0.001" step="0.001" placeholder="Peso (kg)" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="input-field" required type="number" min="1" step="0.1" placeholder="Largura (cm)" value={form.width} onChange={(event) => setForm({ ...form, width: event.target.value })} />
            <input className="input-field" required type="number" min="1" step="0.1" placeholder="Altura (cm)" value={form.height} onChange={(event) => setForm({ ...form, height: event.target.value })} />
            <input className="input-field" required type="number" min="1" step="0.1" placeholder="Comprimento (cm)" value={form.length} onChange={(event) => setForm({ ...form, length: event.target.value })} />
          </div>
          <input
            className="input-field md:col-span-2"
            required={!editingProduct}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={(event) => selectImages(event.target.files)}
          />
          {imageError && <p className="md:col-span-2 text-sm font-bold text-red-700">{imageError}</p>}
          {form.existingImages.filter((image) => !image.id || !form.removeImageIds.includes(image.id)).length > 0 && (
            <div className="grid gap-3 md:col-span-2 sm:grid-cols-3">
              {form.existingImages.filter((image) => !image.id || !form.removeImageIds.includes(image.id)).map((image) => (
                <div key={image.id ?? image.url} className="rounded-xl border border-kriar-line p-2">
                  <img src={image.url} alt="" className="aspect-video w-full rounded-lg object-cover" />
                  {image.id && <button type="button" className="mt-2 text-xs font-bold text-kriar-secondary" onClick={() => removeExistingImage(image)}>Remover imagem</button>}
                </div>
              ))}
            </div>
          )}
          {form.images.length > 0 && (
            <div className="grid gap-3 md:col-span-2 sm:grid-cols-3">
              {form.images.map((image) => (
                <div key={image.name} className="rounded-xl border border-kriar-line p-2">
                  <img src={URL.createObjectURL(image)} alt="" className="aspect-video w-full rounded-lg object-cover" />
                  <button type="button" className="mt-2 text-xs font-bold text-kriar-secondary" onClick={() => setForm({ ...form, images: form.images.filter((item) => item !== image) })}>Remover imagem</button>
                </div>
              ))}
            </div>
          )}
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <strong className="text-sm text-kriar-contrast">Variacoes</strong>
              <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => setForm({ ...form, variations: [...form.variations, { name: "", options: "" }] })}>Adicionar variacao</button>
            </div>
            <div className="grid gap-2">
              {form.variations.map((variation, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                  <input className="input-field" placeholder="Cor, tamanho..." value={variation.name} onChange={(event) => setForm({ ...form, variations: form.variations.map((item, current) => current === index ? { ...item, name: event.target.value } : item) })} />
                  <input className="input-field" placeholder="Opcoes separadas por virgula" value={variation.options} onChange={(event) => setForm({ ...form, variations: form.variations.map((item, current) => current === index ? { ...item, options: event.target.value } : item) })} />
                  <button type="button" className="btn-secondary px-3" onClick={() => setForm({ ...form, variations: form.variations.filter((_, current) => current !== index) })}>Remover</button>
                </div>
              ))}
            </div>
          </div>
          <textarea className="text-field min-h-28 md:col-span-2" required minLength={10} placeholder="Descricao" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <button className="btn-primary md:w-max" disabled={saving || categories.length === 0}>{saving ? "Salvando..." : editingProduct ? "Salvar produto" : "Cadastrar produto"}</button>
          {editingProduct && <button type="button" className="btn-secondary md:w-max" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar edicao</button>}
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-5">
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
                <th>Acoes</th>
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
                  <td><button className="btn-secondary px-3 py-1 text-xs" onClick={() => startEditProduct(product)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
