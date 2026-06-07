import { CreditCard, Lock, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { EmptyState } from "../components/EmptyState";
import { fetchAddressByCep, maskCep, onlyDigits } from "../lib/artisanForm";
import { api } from "../lib/api";
import { cartTotal, groupedBySeller, useCart } from "../store/cart";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";
import { handleImageError, resolveImageUrl } from "../utils/media";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const initialAddress = { zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" };

type FreightOption = {
  id: string;
  nome: string;
  empresa: string;
  preco: number;
  prazo: number;
  imagem?: string | null;
  melhorEnvioServiceId: number;
};

type FreightGroup = {
  groupId: string;
  sellerId: string;
  artesaoId: string | null;
  loja: string;
  cepOrigem: string;
  cepDestino: string;
  opcoes: FreightOption[];
};

export function Checkout() {
  const { items } = useCart();
  const user = useAuth((state) => state.user);
  const showToast = useToast((state) => state.show);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState("");
  const [freightGroups, setFreightGroups] = useState<FreightGroup[]>([]);
  const [selectedFreight, setSelectedFreight] = useState<Record<string, FreightOption>>({});
  const [freightLoading, setFreightLoading] = useState(false);
  const shippingTotal = Object.values(selectedFreight).reduce((sum, option) => sum + Number(option.preco), 0);
  const groups = groupedBySeller(items);

  if (!user) return <Navigate to="/cliente/login" replace />;

  async function lookupCep() {
    if (onlyDigits(address.zipCode).length !== 8) return;
    try {
      const result = await fetchAddressByCep(address.zipCode);
      setAddress((current) => ({ ...current, street: result.street || current.street, neighborhood: result.neighborhood || current.neighborhood, city: result.city || current.city, state: result.state || current.state }));
      setFreightGroups([]);
      setSelectedFreight({});
    } catch {
      setError("CEP inválido ou inexistente.");
    }
  }

  async function calculateFreight() {
    if (items.length === 0) {
      setError("Carrinho vazio.");
      return;
    }
    if (onlyDigits(address.zipCode).length !== 8) {
      setError("Informe um CEP válido para calcular o frete.");
      return;
    }
    setFreightLoading(true);
    setError("");
    setSelectedFreight({});
    try {
      const { data } = await api.post<{ success: boolean; data: { grupos: FreightGroup[] } }>("/frete/calcular", {
        cepDestino: onlyDigits(address.zipCode),
        itens: items.map((item) => ({ produtoId: item.product.id, quantidade: item.quantity, variacaoSelecionada: item.selectedVariations }))
      });
      setFreightGroups(data.data.grupos);
      if (data.data.grupos.some((group) => group.opcoes.length === 0)) {
        setError("Não encontramos frete para um dos vendedores do carrinho.");
      }
    } catch (requestError: unknown) {
      const response = requestError && typeof requestError === "object" && "response" in requestError ? requestError.response as { data?: { message?: string; errors?: Record<string, string> } } : undefined;
      const message = response?.data?.errors ? Object.values(response.data.errors)[0] : response?.data?.message;
      setError(message ?? "Não foi possível calcular o frete.");
    } finally {
      setFreightLoading(false);
    }
  }

  async function handleCheckout() {
    if (items.length === 0) {
      setError("Carrinho vazio.");
      return;
    }
    if (!address.zipCode || !address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
      setError("Informe o endereço de entrega completo.");
      return;
    }
    if (freightGroups.length === 0 || freightGroups.some((group) => !selectedFreight[group.groupId])) {
      setError("Calcule e selecione uma opção de frete para cada vendedor.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/pedidos/checkout", {
        shippingAddress: { ...address, zipCode: onlyDigits(address.zipCode) },
        shippingTotal,
        shippingSelections: freightGroups.map((group) => {
          const option = selectedFreight[group.groupId];
          return {
            groupId: group.groupId,
            sellerId: group.sellerId,
            artesaoId: group.artesaoId,
            cepOrigem: group.cepOrigem,
            cepDestino: group.cepDestino,
            transportadora: option.empresa,
            servico: option.nome,
            servicoId: option.melhorEnvioServiceId,
            valor: option.preco,
            prazo: option.prazo,
            melhorEnvioId: option.id
          };
        }),
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, customizationNotes: item.customizationNotes, selectedVariations: item.selectedVariations }))
      });
      const initPoint = data.data?.initPoint ?? data.initPoint;
      const pedidoId = data.data?.pedidoId ?? data.pedidoId ?? data.data?.pedido?.id;
      if (!initPoint) throw new Error("Link de pagamento não retornado.");
      if (pedidoId) sessionStorage.setItem("kriar-last-order-id", String(pedidoId));
      window.location.href = initPoint;
    } catch (requestError: unknown) {
      const response = requestError && typeof requestError === "object" && "response" in requestError ? requestError.response as { data?: { message?: string; errors?: Record<string, string> } } : undefined;
      const message = response?.data?.errors ? Object.values(response.data.errors)[0] : response?.data?.message;
      setError(message ?? "Não foi possível concluir o pedido.");
      showToast({ title: "Erro no pedido", description: message ?? "Confira os dados e tente novamente.", variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="app-shell grid min-h-[60vh] place-items-center py-16">
        <EmptyState icon={<PackageCheck className="h-6 w-6" />} title="Seu carrinho está vazio" description="Explore a vitrine para encontrar peças artesanais selecionadas." action={<Link to="/" className="btn-primary">Ver produtos</Link>} />
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-8 py-10 lg:grid-cols-[1fr_390px]">
      <section>
        <p className="eyebrow mb-2">Checkout seguro</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Finalizar pedido</h1>
        <p className="mt-2 max-w-2xl text-kriar-muted">Revise itens, endereço e siga para o ambiente seguro do Mercado Pago.</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <StepPill number="1" label="Endereço" active />
          <StepPill number="2" label="Frete" active={freightGroups.length > 0} />
          <StepPill number="3" label="Pagamento" active={Object.keys(selectedFreight).length > 0} />
        </div>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

        <section className="panel mt-7 grid gap-3 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="eyebrow mb-1">Etapa 1</p>
            <h2 className="text-xl font-black text-kriar-primary">Endereço de entrega</h2>
          </div>
          <input className="input-field" placeholder="CEP" value={address.zipCode} onBlur={lookupCep} onChange={(e) => setAddress({ ...address, zipCode: maskCep(e.target.value) })} />
          <input className="input-field" placeholder="Rua" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <input className="input-field" placeholder="Número" value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
          <input className="input-field" placeholder="Complemento" value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
          <input className="input-field" placeholder="Bairro" value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} />
          <input className="input-field" placeholder="Cidade" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <input className="input-field" maxLength={2} placeholder="UF" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })} />
          <button type="button" className="btn-secondary md:w-max" onClick={calculateFreight} disabled={freightLoading}>
            <Truck className="h-5 w-5" /> {freightLoading ? "Calculando..." : "Calcular frete"}
          </button>
        </section>

        {freightGroups.length > 0 && (
          <section className="panel mt-7 p-5">
            <p className="eyebrow mb-1">Etapa 2</p>
            <h2 className="mb-4 text-xl font-black text-kriar-primary">Escolha o frete</h2>
            <div className="grid gap-5">
              {freightGroups.map((group) => (
                <div key={group.groupId} className="rounded-2xl border border-kriar-line p-4">
                  <strong className="text-kriar-contrast">{group.loja}</strong>
                  <div className="mt-3 grid gap-3">
                    {group.opcoes.map((option) => (
                      <label key={`${group.groupId}-${option.id}`} className="flex cursor-pointer items-center gap-3 rounded-xl bg-kriar-background/70 p-3">
                        <input
                          type="radio"
                          name={`freight-${group.groupId}`}
                          checked={selectedFreight[group.groupId]?.id === option.id}
                          onChange={() => setSelectedFreight((current) => ({ ...current, [group.groupId]: option }))}
                        />
                        {option.imagem && (
                          <img
                            src={resolveImageUrl(option.imagem)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            onError={handleImageError}
                            className="h-8 w-8 object-contain"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block font-black text-kriar-contrast">{option.empresa} - {option.nome}</span>
                          <span className="text-sm text-kriar-muted">Prazo: {option.prazo} dias úteis</span>
                        </span>
                        <span className="font-black text-kriar-primary">{currency.format(option.preco)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-7 space-y-5">
          <div>
            <p className="eyebrow mb-1">Revisão</p>
            <h2 className="text-xl font-black text-kriar-primary">Itens por vendedor</h2>
          </div>
          {Object.entries(groups).map(([seller, sellerItems]) => (
            <div key={seller} className="panel p-4 sm:p-5">
              <h2 className="mb-4 font-black text-kriar-primary">{seller}</h2>
              <div className="space-y-3">
                {sellerItems.map((item) => (
                  <div key={`${item.product.id}-${JSON.stringify(item.selectedVariations ?? {})}`} className="flex items-center gap-3 rounded-[20px] bg-kriar-background/70 p-3">
                    <img
                      src={productImageUrl(item.product)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
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
        <div className="mb-5 flex items-center gap-3 text-kriar-primary"><Lock className="h-5 w-5" /><strong className="text-kriar-contrast">Pagamento protegido</strong></div>
        <div className="space-y-3 border-y border-kriar-line py-4 text-sm">
          <div className="flex justify-between"><span className="text-kriar-muted">Produtos</span><span className="font-bold">{currency.format(cartTotal(items))}</span></div>
          <div className="flex justify-between"><span className="text-kriar-muted">Frete</span><span className="font-bold">{currency.format(shippingTotal)}</span></div>
        </div>
        <div className="my-5 flex items-center justify-between text-xl font-black text-kriar-contrast"><span>Total</span><span>{currency.format(cartTotal(items) + shippingTotal)}</span></div>
        <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full"><CreditCard className="h-5 w-5" />{loading ? "Criando pedido..." : "Finalizar pedido"}</button>
        <p className="mt-3 text-center text-xs leading-5 text-kriar-muted">Você será redirecionado para concluir o pagamento no Mercado Pago.</p>
      </aside>
    </main>
  );
}

function StepPill({ number, label, active }: { number: string; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${active ? "border-kriar-primary/25 bg-kriar-primary/10 text-kriar-primary" : "border-kriar-line bg-kriar-surface text-kriar-muted"}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${active ? "bg-kriar-primary text-white" : "bg-kriar-paper text-kriar-muted"}`}>{number}</span>
      {label}
    </div>
  );
}
