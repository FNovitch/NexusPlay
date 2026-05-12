import { Minus, Plus, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cartTotal, groupedBySeller, useCart } from "../store/cart";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity } = useCart();
  const groups = groupedBySeller(items);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-kriar-contrast/30">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-kriar-paper shadow-soft">
        <div className="flex items-center justify-between border-b border-kriar-support/30 p-4">
          <h2 className="text-lg font-black text-kriar-primary">Carrinho</h2>
          <button onClick={close} className="rounded-lg p-2 hover:bg-kriar-support/20" aria-label="Fechar carrinho">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-kriar-contrast/70">
              <p>Seu carrinho esta esperando uma descoberta artesanal.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groups).map(([seller, sellerItems]) => (
                <section key={seller}>
                  <h3 className="mb-3 text-sm font-black uppercase tracking-normal text-kriar-secondary">{seller}</h3>
                  <div className="space-y-3">
                    {sellerItems.map((item) => (
                      <div key={item.product.id} className="flex gap-3 rounded-lg border border-kriar-support/30 bg-white p-3">
                        <img src={item.product.images[0]} alt="" className="h-20 w-20 rounded-md object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{item.product.name}</p>
                          <p className="text-sm text-kriar-primary">{currency.format(item.product.price)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button className="rounded-md border p-1" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Diminuir">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button className="rounded-md border p-1" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Aumentar">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button className="ml-auto rounded-md p-1 text-kriar-secondary" onClick={() => removeItem(item.product.id)} aria-label="Remover">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-kriar-support/30 p-4">
          <div className="mb-3 flex items-center justify-between text-lg font-black">
            <span>Total</span>
            <span>{currency.format(cartTotal(items))}</span>
          </div>
          <Link
            onClick={close}
            to="/checkout"
            className="block rounded-lg bg-kriar-primary px-4 py-3 text-center font-bold text-white transition hover:bg-kriar-secondary"
          >
            Finalizar compra
          </Link>
        </div>
      </aside>
    </div>
  );
}
