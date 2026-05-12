import { CreditCard, Lock, PackageCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { cartTotal, groupedBySeller, useCart } from "../store/cart";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function Checkout() {
  const { items, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>();
  const groups = groupedBySeller(items);

  async function handleCheckout() {
    setLoading(true);
    try {
      const { data } = await api.post("/checkout", {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          customizationNotes: item.customizationNotes
        }))
      });
      setCheckoutUrl(data.preference.init_point ?? data.preference.sandbox_init_point);
    } catch {
      setCheckoutUrl("/checkout/sucesso?demo=true");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-16 text-center">
        <div>
          <PackageCheck className="mx-auto mb-4 h-10 w-10 text-kriar-primary" />
          <h1 className="text-3xl font-black text-kriar-contrast">Seu carrinho esta vazio</h1>
          <Link to="/" className="mt-5 inline-block rounded-lg bg-kriar-primary px-5 py-3 font-bold text-white">
            Ver produtos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-3xl font-black text-kriar-contrast">Checkout</h1>
        <p className="mt-2 text-kriar-contrast/70">Pedidos separados por vendedor para producao, faturamento e acompanhamento.</p>

        <div className="mt-6 space-y-5">
          {Object.entries(groups).map(([seller, sellerItems]) => (
            <div key={seller} className="rounded-lg border border-kriar-support/30 bg-white p-4">
              <h2 className="mb-3 font-black text-kriar-primary">{seller}</h2>
              <div className="space-y-3">
                {sellerItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <img src={item.product.images[0]} alt="" className="h-16 w-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <strong>{item.product.name}</strong>
                      <p className="text-sm text-kriar-contrast/70">Quantidade: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-kriar-primary">{currency.format(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-max rounded-lg border border-kriar-support/30 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-kriar-primary">
          <Lock className="h-5 w-5" />
          <strong>Pagamento seguro</strong>
        </div>
        <div className="space-y-2 border-b border-kriar-support/30 pb-4 text-sm">
          <div className="flex justify-between">
            <span>Produtos</span>
            <span>{currency.format(cartTotal(items))}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete</span>
            <span>Calculado pelo vendedor</span>
          </div>
        </div>
        <div className="my-4 flex items-center justify-between text-xl font-black">
          <span>Total</span>
          <span>{currency.format(cartTotal(items))}</span>
        </div>
        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            onClick={() => clear()}
            className="block rounded-lg bg-kriar-primary px-4 py-3 text-center font-bold text-white hover:bg-kriar-secondary"
          >
            Ir para Mercado Pago
          </a>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-kriar-primary px-4 py-3 font-bold text-white hover:bg-kriar-secondary disabled:opacity-60"
          >
            <CreditCard className="h-5 w-5" />
            {loading ? "Gerando preferencia..." : "Pagar com Mercado Pago"}
          </button>
        )}
      </aside>
    </main>
  );
}
