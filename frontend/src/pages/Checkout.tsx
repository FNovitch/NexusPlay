import { CreditCard, Lock, PackageCheck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { EmptyState } from "../components/EmptyState";
import { fetchAddressByCep, maskCep, onlyDigits } from "../lib/artisanForm";
import { api } from "../lib/api";
import { cartTotal, groupedBySeller, useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const initialAddress = { zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" };

export function Checkout() {
  const { items } = useCart();
  const user = useAuth((state) => state.user);
  const showToast = useToast((state) => state.show);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState("");
  const shippingTotal = 0;
  const groups = groupedBySeller(items);

  if (!user) return <Navigate to="/login" replace />;

  async function lookupCep() {
    if (onlyDigits(address.zipCode).length !== 8) return;
    try {
      const result = await fetchAddressByCep(address.zipCode);
      setAddress((current) => ({ ...current, street: result.street || current.street, neighborhood: result.neighborhood || current.neighborhood, city: result.city || current.city, state: result.state || current.state }));
    } catch {
      setError("CEP invalido ou inexistente.");
    }
  }

  async function handleCheckout() {
    if (items.length === 0) {
      setError("Carrinho vazio.");
      return;
    }
    if (!address.zipCode || !address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
      setError("Informe o endereco de entrega completo.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/pedidos/checkout", {
        shippingAddress: { ...address, zipCode: onlyDigits(address.zipCode) },
        shippingTotal,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, customizationNotes: item.customizationNotes, selectedVariations: item.selectedVariations }))
      });
      const initPoint = data.data?.initPoint ?? data.initPoint;
      if (!initPoint) throw new Error("Link de pagamento nao retornado.");
      window.location.href = initPoint;
    } catch (requestError: unknown) {
      const response = requestError && typeof requestError === "object" && "response" in requestError ? requestError.response as { data?: { message?: string; errors?: Record<string, string> } } : undefined;
      const message = response?.data?.errors ? Object.values(response.data.errors)[0] : response?.data?.message;
      setError(message ?? "Nao foi possivel concluir o pedido.");
      showToast({ title: "Erro no pedido", description: message ?? "Confira os dados e tente novamente.", variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="app-shell grid min-h-[60vh] place-items-center py-16">
        <EmptyState icon={<PackageCheck className="h-6 w-6" />} title="Seu carrinho esta vazio" description="Explore a vitrine para encontrar pecas artesanais selecionadas." action={<Link to="/" className="btn-primary">Ver produtos</Link>} />
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-8 py-10 lg:grid-cols-[1fr_390px]">
      <section>
        <p className="eyebrow mb-2">Checkout Pro</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Finalizar pedido</h1>
        <p className="mt-2 max-w-2xl text-kriar-muted">Revise itens, endereco e siga para o ambiente seguro do Mercado Pago.</p>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

        <section className="panel mt-7 grid gap-3 p-5 md:grid-cols-2">
          <h2 className="text-xl font-black text-kriar-primary md:col-span-2">Endereco de entrega</h2>
          <input className="input-field" placeholder="CEP" value={address.zipCode} onBlur={lookupCep} onChange={(e) => setAddress({ ...address, zipCode: maskCep(e.target.value) })} />
          <input className="input-field" placeholder="Rua" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <input className="input-field" placeholder="Numero" value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
          <input className="input-field" placeholder="Complemento" value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
          <input className="input-field" placeholder="Bairro" value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} />
          <input className="input-field" placeholder="Cidade" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <input className="input-field" maxLength={2} placeholder="UF" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })} />
        </section>

        <div className="mt-7 space-y-5">
          {Object.entries(groups).map(([seller, sellerItems]) => (
            <div key={seller} className="panel p-4 sm:p-5">
              <h2 className="mb-4 font-black text-kriar-primary">{seller}</h2>
              <div className="space-y-3">
                {sellerItems.map((item) => (
                  <div key={`${item.product.id}-${JSON.stringify(item.selectedVariations ?? {})}`} className="flex items-center gap-3 rounded-[20px] bg-kriar-background/70 p-3">
                    <img src={productImageUrl(item.product)} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <strong className="line-clamp-1 text-kriar-contrast">{item.product.name}</strong>
                      <p className="text-sm text-kriar-muted">Quantidade: {item.quantity}</p>
                      {item.selectedVariations && <p className="text-xs font-bold text-kriar-muted">{Object.entries(item.selectedVariations).map(([n, o]) => `${n}: ${o}`).join(" · ")}</p>}
                    </div>
                    <span className="font-black text-kriar-primary">{currency.format(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="panel h-max p-5 lg:sticky lg:top-24">
        <div className="mb-5 flex items-center gap-3 text-kriar-primary"><Lock className="h-5 w-5" /><strong className="text-kriar-contrast">Mercado Pago</strong></div>
        <div className="space-y-3 border-y border-kriar-line py-4 text-sm">
          <div className="flex justify-between"><span className="text-kriar-muted">Produtos</span><span className="font-bold">{currency.format(cartTotal(items))}</span></div>
          <div className="flex justify-between"><span className="text-kriar-muted">Frete</span><span className="font-bold">{currency.format(shippingTotal)}</span></div>
        </div>
        <div className="my-5 flex items-center justify-between text-xl font-black text-kriar-contrast"><span>Total</span><span>{currency.format(cartTotal(items) + shippingTotal)}</span></div>
        <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full"><CreditCard className="h-5 w-5" />{loading ? "Criando pedido..." : "Finalizar pedido"}</button>
      </aside>
    </main>
  );
}
