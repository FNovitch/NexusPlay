import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cartTotal, groupedBySeller, useCart } from "../store/cart";
import { useToast } from "../store/toast";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity } = useCart();
  const showToast = useToast((state) => state.show);
  const groups = groupedBySeller(items);

  if (!isOpen) return null;

  function handleRemove(productId: string, productName: string) {
    removeItem(productId);
    showToast({ title: "Item removido", description: productName, variant: "info" });
  }

  return (
    <div className="fixed inset-0 z-50 bg-kriar-contrast/30 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-kriar-line bg-kriar-background shadow-lift">
        <div className="flex items-center justify-between border-b border-kriar-line p-5">
          <div>
            <p className="eyebrow">Sua seleção</p>
            <h2 className="text-xl font-black tracking-tight text-kriar-contrast">Carrinho</h2>
          </div>
          <button onClick={close} className="btn-icon" aria-label="Fechar carrinho">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[20px] bg-kriar-primary/10 text-kriar-primary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <p className="font-black text-kriar-contrast">Seu carrinho está vazio</p>
                <p className="mt-2 text-sm leading-6 text-kriar-muted">Ele está esperando uma descoberta artesanal.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {Object.entries(groups).map(([seller, sellerItems]) => (
                <section key={seller}>
                  <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-kriar-secondary">{seller}</h3>
                  <div className="space-y-3">
                    {sellerItems.map((item) => (
                      <div key={item.product.id} className="panel flex gap-3 p-3 shadow-none">
                        <img src={item.product.images[0]} alt="" className="h-20 w-20 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-kriar-contrast">{item.product.name}</p>
                          <p className="text-sm font-bold text-kriar-primary">{currency.format(item.product.price)}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-kriar-line text-kriar-muted transition hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Diminuir">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-kriar-line text-kriar-muted transition hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Aumentar">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-kriar-muted transition hover:bg-kriar-secondary/10 hover:text-kriar-secondary" onClick={() => handleRemove(item.product.id, item.product.name)} aria-label="Remover">
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
        <div className="border-t border-kriar-line bg-kriar-surface/70 p-5">
          <div className="mb-4 flex items-center justify-between text-lg font-black text-kriar-contrast">
            <span>Total</span>
            <span>{currency.format(cartTotal(items))}</span>
          </div>
          <Link
            onClick={close}
            to="/checkout"
            className="btn-primary w-full"
          >
            Finalizar compra
          </Link>
        </div>
      </aside>
    </div>
  );
}
