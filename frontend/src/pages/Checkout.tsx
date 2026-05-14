import { CreditCard, Lock, PackageCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api";
import { cartTotal, groupedBySeller, useCart } from "../store/cart";
import { useToast } from "../store/toast";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function Checkout() {
  const { items, clear } = useCart();
  const showToast = useToast((state) => state.show);
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>();
  const groups = groupedBySeller(items);

  async function handleCheckout() {
    setLoading(true);
    showToast({ title: "Preparando pagamento", description: "Estamos gerando uma preferência segura.", variant: "info" });
    try {
      const { data } = await api.post("/checkout", {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          customizationNotes: item.customizationNotes
        }))
      });
      setCheckoutUrl(data.preference.init_point ?? data.preference.sandbox_init_point);
      showToast({ title: "Checkout pronto", description: "Você já pode seguir para o Mercado Pago.", variant: "success" });
    } catch {
      setCheckoutUrl("/checkout/sucesso?demo=true");
      showToast({ title: "Modo demonstração", description: "Geramos um checkout local para continuar o fluxo.", variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="app-shell grid min-h-[60vh] place-items-center py-16">
        <EmptyState
          icon={<PackageCheck className="h-6 w-6" />}
          title="Seu carrinho está vazio"
          description="Explore a vitrine para encontrar peças artesanais selecionadas."
          action={<Link to="/" className="btn-primary">Ver produtos</Link>}
        />
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-8 py-10 lg:grid-cols-[1fr_390px]">
      <section>
        <p className="eyebrow mb-2">Pagamento</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Checkout</h1>
        <p className="mt-2 max-w-2xl text-kriar-muted">Pedidos separados por vendedor para produção, faturamento e acompanhamento.</p>

        <div className="mt-7 space-y-5">
          {Object.entries(groups).map(([seller, sellerItems]) => (
            <div key={seller} className="panel p-4 sm:p-5">
              <h2 className="mb-4 font-black text-kriar-primary">{seller}</h2>
              <div className="space-y-3">
                {sellerItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 rounded-[20px] bg-kriar-background/70 p-3">
                    <img src={item.product.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <strong className="line-clamp-1 text-kriar-contrast">{item.product.name}</strong>
                      <p className="text-sm text-kriar-muted">Quantidade: {item.quantity}</p>
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
        <div className="mb-5 flex items-center gap-3 text-kriar-primary">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-kriar-primary/10">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <strong className="block text-kriar-contrast">Pagamento seguro</strong>
            <span className="text-sm text-kriar-muted">Mercado Pago</span>
          </div>
        </div>
        <div className="space-y-3 border-y border-kriar-line py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-kriar-muted">Produtos</span>
            <span className="font-bold text-kriar-contrast">{currency.format(cartTotal(items))}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-kriar-muted">Frete</span>
            <span className="text-right font-bold text-kriar-contrast">Calculado pelo vendedor</span>
          </div>
        </div>
        <div className="my-5 flex items-center justify-between text-xl font-black text-kriar-contrast">
          <span>Total</span>
          <span>{currency.format(cartTotal(items))}</span>
        </div>
        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            onClick={() => clear()}
            className="btn-primary w-full"
          >
            Ir para Mercado Pago
          </a>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary w-full"
          >
            <CreditCard className="h-5 w-5" />
            {loading ? "Gerando preferência..." : "Pagar com Mercado Pago"}
          </button>
        )}
      </aside>
    </main>
  );
}
