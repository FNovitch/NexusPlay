import { CreditCard, Lock, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { EmptyState } from "../components/EmptyState";
import { createDemoOrder, isDemoToken } from "../data/demoOrders";
import { fetchAddressByCep, maskCep, onlyDigits, parseApiError } from "../lib/artisanForm";
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
  tipo?: "SHIPPING" | "PICKUP";
  enderecoRetirada?: string | null;
  instrucoesRetirada?: string | null;
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
  const token = useAuth((state) => state.token);
  const showToast = useToast((state) => state.show);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState("");
  const [freightGroups, setFreightGroups] = useState<FreightGroup[]>([]);
  const [selectedFreight, setSelectedFreight] = useState<Record<string, FreightOption>>({});
  const [freightLoading, setFreightLoading] = useState(false);
  const shippingTotal = Object.values(selectedFreight).reduce((sum, option) => sum + Number(option.preco), 0);
  const groups = groupedBySeller(items);
  const allSelectedForPickup =
    freightGroups.length > 0 &&
    freightGroups.every((group) => selectedFreight[group.groupId]?.tipo === "PICKUP" || selectedFreight[group.groupId]?.melhorEnvioServiceId === 0);

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
      setError("Informe um CEP válido para calcular a entrega.");
      return;
    }
    setFreightLoading(true);
    setError("");
    setSelectedFreight({});

    if (isDemoToken(token)) {
      const demoGroups = buildDemoFreightGroups(groups);
      setFreightGroups(demoGroups);
      setSelectedFreight(demoGroups.reduce<Record<string, FreightOption>>((acc, group) => ({ ...acc, [group.groupId]: group.opcoes[0] }), {}));
      showToast({ title: "Entrega Simulada", description: "Opção demo adicionada ao pedido.", variant: "success" });
      setFreightLoading(false);
      return;
    }

    try {
      const { data } = await api.post<{ success: boolean; data: { grupos: FreightGroup[] } }>("/frete/calcular", {
        cepDestino: onlyDigits(address.zipCode),
        itens: items.map((item) => ({ produtoId: item.product.id, quantidade: item.quantity, variacaoSelecionada: item.selectedVariations }))
      });
      const nextGroups = Array.isArray(data.data?.grupos) ? data.data.grupos : [];
      if (nextGroups.length === 0) {
        setFreightGroups([]);
        setError("Não encontramos opções de entrega ou retirada para este carrinho.");
        return;
      }

      setFreightGroups(nextGroups);
      setSelectedFreight(nextGroups.reduce<Record<string, FreightOption>>((acc, group) => {
        if (group.opcoes.length === 1) acc[group.groupId] = group.opcoes[0];
        return acc;
      }, {}));

      if (nextGroups.some((group) => group.opcoes.length === 0)) {
        setError("Não encontramos entrega ou retirada para uma das lojas do carrinho.");
      } else {
        showToast({ title: "Entrega Calculada", description: "Escolha a melhor opção para cada loja.", variant: "success" });
      }
    } catch (requestError: unknown) {
      if (import.meta.env.DEV) {
        const demoGroups = buildDemoFreightGroups(groups);
        setFreightGroups(demoGroups);
        setSelectedFreight(demoGroups.reduce<Record<string, FreightOption>>((acc, group) => ({ ...acc, [group.groupId]: group.opcoes[0] }), {}));
        setError("");
        showToast({ title: "Entrega Simulada", description: "A API de frete não respondeu, então usamos dados demo.", variant: "success" });
        return;
      }
      const parsed = parseApiError(requestError);
      const message = parsed.errors.cepDestino ?? parsed.errors.frete ?? parsed.errors.produto ?? parsed.errors.itens ?? parsed.message ?? "Não foi possível calcular o frete.";
      setFreightGroups([]);
      setSelectedFreight({});
      setError(message);
      showToast({ title: "Erro no Frete", description: message, variant: "warning" });
      if (import.meta.env.DEV || import.meta.env.VITE_FREIGHT_DEBUG === "true") {
        console.error("[checkout:freight:error]", requestError);
      }
    } finally {
      setFreightLoading(false);
    }
  }

  async function handleCheckout() {
    if (items.length === 0) {
      setError("Carrinho vazio.");
      return;
    }
    if (!allSelectedForPickup && (!address.zipCode || !address.street || !address.number || !address.neighborhood || !address.city || !address.state)) {
      setError("Informe o endereço de entrega completo.");
      return;
    }
    if (freightGroups.length === 0 || freightGroups.some((group) => !selectedFreight[group.groupId])) {
      setError("Calcule e selecione uma opção de entrega para cada loja.");
      return;
    }
    setLoading(true);
    setError("");

    if (isDemoToken(token)) {
      const order = createDemoOrder(items, shippingTotal);
      showToast({ title: "Pedido simulado criado", description: `${order.orderCode} foi aprovado na demo.`, variant: "success" });
      navigate(`/pedido/${order.id}/status?resultado=sucesso`);
      setLoading(false);
      return;
    }

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
      if (!initPoint) throw new Error("Link de pagamento não retornado.");
      window.location.href = initPoint;
    } catch (requestError: unknown) {
      const response = requestError && typeof requestError === "object" && "response" in requestError ? requestError.response as { data?: { message?: string; errors?: Record<string, string> } } : undefined;
      const message = response?.data?.errors ? Object.values(response.data.errors)[0] : response?.data?.message;
      setError(message ?? "Não foi possível concluir o pedido.");
      showToast({ title: "Erro no Pedido", description: message ?? "Confira os dados e tente novamente.", variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="app-shell grid min-h-[60vh] place-items-center py-16">
        <EmptyState icon={<PackageCheck className="h-6 w-6" />} title="Seu carrinho está vazio" description="Explore o catálogo para encontrar periféricos, colecionáveis e acessórios." action={<Link to="/" className="btn-primary">Ver produtos</Link>} />
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-8 py-10 lg:grid-cols-[1fr_390px]">
      <section>
        <p className="eyebrow mb-2">Checkout NexusPlay</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-normal text-nexus-contrast">Finalizar pedido</h1>
        <p className="mt-2 max-w-2xl text-nexus-muted">Revise itens, endereço e conclua um pedido simulado na demo.</p>
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

        <section className="panel mt-7 grid gap-3 p-5 md:grid-cols-2">
          <h2 className="text-xl font-semibold text-nexus-contrast md:col-span-2">Endereço de entrega</h2>
          <input className="input-field" placeholder="CEP" value={address.zipCode} onBlur={lookupCep} onChange={(e) => setAddress({ ...address, zipCode: maskCep(e.target.value) })} />
          <input className="input-field" placeholder="Rua" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <input className="input-field" placeholder="Número" value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
          <input className="input-field" placeholder="Complemento" value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} />
          <input className="input-field" placeholder="Bairro" value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} />
          <input className="input-field" placeholder="Cidade" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <input className="input-field" maxLength={2} placeholder="UF" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })} />
          <button type="button" className="btn-secondary md:w-max" onClick={calculateFreight} disabled={freightLoading}>
            <Truck className="h-5 w-5" /> {freightLoading ? "Calculando..." : "Calcular entrega"}
          </button>
        </section>

        {freightGroups.length > 0 && (
          <section className="panel mt-7 p-5">
            <h2 className="mb-4 text-xl font-semibold text-nexus-contrast">Escolha a entrega</h2>
            <div className="grid gap-5">
              {freightGroups.map((group) => (
                <div key={group.groupId} className="rounded-lg border border-nexus-line p-4">
                  <strong className="font-semibold text-nexus-contrast">{group.loja}</strong>
                  <div className="mt-3 grid gap-3">
                    {group.opcoes.map((option) => (
                      <label key={`${group.groupId}-${option.id}`} className="flex cursor-pointer items-center gap-3 rounded-lg bg-nexus-paper p-3">
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
                          <span className="block font-semibold text-nexus-contrast">{option.empresa} - {option.nome}</span>
                          {option.tipo === "PICKUP" || option.melhorEnvioServiceId === 0 ? (
                            <span className="block text-sm text-nexus-muted">
                              Retirada sem custo{option.enderecoRetirada ? ` · ${option.enderecoRetirada}` : ""}
                              {option.instrucoesRetirada ? ` · ${option.instrucoesRetirada}` : ""}
                            </span>
                          ) : (
                            <span className="text-sm text-nexus-muted">Prazo: {option.prazo} dias úteis</span>
                          )}
                        </span>
                        <span className="font-semibold text-nexus-contrast">{currency.format(option.preco)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-7 space-y-5">
          {Object.entries(groups).map(([seller, sellerItems]) => (
            <div key={seller} className="panel p-4 sm:p-5">
              <h2 className="mb-4 font-semibold text-nexus-contrast">{seller}</h2>
              <div className="space-y-3">
                {sellerItems.map((item) => (
                  <div key={`${item.product.id}-${JSON.stringify(item.selectedVariations ?? {})}`} className="flex items-center gap-3 rounded-lg bg-nexus-paper p-3">
                    <img
                      src={productImageUrl(item.product)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="line-clamp-1 text-nexus-contrast">{item.product.name}</strong>
                      <p className="text-sm text-nexus-muted">Quantidade: {item.quantity}</p>
                      {item.selectedVariations && <p className="text-xs font-medium text-nexus-muted">{Object.entries(item.selectedVariations).map(([n, o]) => `${n}: ${o}`).join(" · ")}</p>}
                    </div>
                    <span className="font-semibold text-nexus-contrast">{currency.format(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="panel h-max p-5 lg:sticky lg:top-24">
        <div className="mb-5 flex items-center gap-3 text-nexus-secondary"><Lock className="h-5 w-5" /><strong className="text-nexus-contrast">{isDemoToken(token) ? "Pedido simulado" : "Mercado Pago"}</strong></div>
        <div className="space-y-3 border-y border-nexus-line py-4 text-sm">
          <div className="flex justify-between"><span className="text-nexus-muted">Produtos</span><span className="font-medium">{currency.format(cartTotal(items))}</span></div>
          <div className="flex justify-between"><span className="text-nexus-muted">Entrega</span><span className="font-medium">{currency.format(shippingTotal)}</span></div>
        </div>
        <div className="my-5 flex items-center justify-between text-xl font-semibold text-nexus-contrast"><span>Total</span><span>{currency.format(cartTotal(items) + shippingTotal)}</span></div>
        <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full"><CreditCard className="h-5 w-5" />{loading ? "Criando pedido..." : isDemoToken(token) ? "Simular pedido" : "Finalizar pedido"}</button>
      </aside>
    </main>
  );
}

function buildDemoFreightGroups(groups: Record<string, ReturnType<typeof groupedBySeller>[string]>): FreightGroup[] {
  return Object.entries(groups).map(([sellerName, sellerItems], index) => ({
    groupId: `demo-freight-${index + 1}`,
    sellerId: sellerItems[0]?.product.sellerId ?? `seller-${index + 1}`,
    artesaoId: sellerItems[0]?.product.artisanId ?? null,
    loja: sellerName,
    cepOrigem: "01001000",
    cepDestino: "01001000",
    opcoes: [
      {
        id: `demo-option-${index + 1}`,
        nome: "Entrega Local Simulada",
        empresa: "NexusPlay Demo",
        preco: 17,
        prazo: 2,
        melhorEnvioServiceId: 0,
        tipo: "SHIPPING"
      }
    ]
  }));
}
