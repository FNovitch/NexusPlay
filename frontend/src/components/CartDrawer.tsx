import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { cartItemKey, cartTotal, groupedBySeller, useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { handleImageError } from "../utils/media";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity } = useCart();
  const showToast = useToast((state) => state.show);
  const groups = groupedBySeller(items);

  if (!isOpen) return null;

  function handleRemove(productId: string, productName: string, selectedVariations?: Record<string, string>) {
    removeItem(productId, selectedVariations);
    showToast({ title: "Item Removido", description: productName, variant: "info" });
  }

  return (
    <div className="fixed inset-0 z-50 bg-nexus-primary/35 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-nexus-line bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-nexus-line p-5">
          <div>
            <p className="eyebrow">Sua seleção</p>
            <h2 className="text-xl font-semibold tracking-normal text-nexus-contrast">Carrinho</h2>
          </div>
          <button onClick={close} className="btn-icon" aria-label="Fechar carrinho">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-lg bg-nexus-paper text-nexus-secondary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <p className="font-semibold text-nexus-contrast">Seu carrinho está vazio</p>
                <p className="mt-2 text-sm leading-6 text-nexus-muted">Explore periféricos, colecionáveis e acessórios para montar a primeira seleção.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {Object.entries(groups).map(([seller, sellerItems]) => (
                <section key={seller}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-nexus-muted">{seller}</h3>
                  <div className="space-y-3">
                    {sellerItems.map((item) => (
                      <div key={cartItemKey(item.product.id, item.selectedVariations)} className="panel flex gap-3 p-3 shadow-none">
                        <img
                          src={productImageUrl(item.product)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={handleImageError}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-nexus-contrast">{item.product.name}</p>
                          <p className="text-sm font-medium text-nexus-contrast">{currency.format(item.product.price)}</p>
                          {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                            <p className="mt-1 text-xs font-medium text-nexus-muted">
                              {Object.entries(item.selectedVariations).map(([name, option]) => `${name}: ${option}`).join(" · ")}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-nexus-line text-nexus-muted transition hover:bg-nexus-paper hover:text-nexus-contrast" onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariations)} aria-label="Diminuir">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button className="grid h-8 w-8 place-items-center rounded-lg border border-nexus-line text-nexus-muted transition hover:bg-nexus-paper hover:text-nexus-contrast" onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariations)} aria-label="Aumentar">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-nexus-muted transition hover:bg-red-50 hover:text-red-600" onClick={() => handleRemove(item.product.id, item.product.name, item.selectedVariations)} aria-label="Remover">
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
        <div className="border-t border-nexus-line bg-white p-5">
          <div className="mb-4 flex items-center justify-between text-lg font-semibold text-nexus-contrast">
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
