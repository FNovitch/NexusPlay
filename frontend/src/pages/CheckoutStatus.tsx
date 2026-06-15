import { AlertCircle, CheckCircle2, Clock, PackageCheck, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { demoMode } from "../config/env";
import { findDemoOrder, lastDemoOrderId } from "../data/demoOrders";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const pendingPayments = new Set(["PENDING", "IN_PROCESS", "IN_MEDIATION"]);
const pendingOrders = new Set(["CREATED", "PENDING", "AWAITING_PAYMENT"]);

type Order = {
  id: string;
  orderCode: string;
  status: string;
  paymentStatus: string;
  total: number | string;
  items?: Array<{ id: string; productName?: string; product?: { name?: string }; quantity: number; total: number | string }>;
  history?: Array<{ id: string; newStatus: string; createdAt: string }>;
};

const legacyCopy = {
  sucesso: ["Pedido recebido", "O Mercado Pago confirmou ou está processando seu retorno. Acompanhe em meus pedidos.", CheckCircle2],
  falha: ["Pagamento não concluído", "Não foi possível concluir o pagamento. Você pode tentar novamente.", AlertCircle],
  pendente: ["Pagamento pendente", "Assim que o Mercado Pago confirmar, atualizaremos seu pedido.", Clock]
} as const;

export function CheckoutStatus() {
  const { id, status = "sucesso" } = useParams();
  const [searchParams] = useSearchParams();
  const user = useAuth((state) => state.user);
  const clear = useCart((state) => state.clear);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const result = searchParams.get("resultado") ?? status;
  const fallbackOrderId = demoMode ? lastDemoOrderId() : null;

  useEffect(() => {
    if (result === "sucesso") clear();
  }, [result, clear]);

  useEffect(() => {
    if (!id) return;
    loadOrder();
  }, [id]);

  useEffect(() => {
    if (!id || !order || !shouldPoll(order) || pollCount >= 8) return;
    const timer = window.setTimeout(async () => {
      await loadOrder(false);
      setPollCount((current) => current + 1);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [id, order?.paymentStatus, order?.status, pollCount]);

  async function loadOrder(showLoading = true) {
    if (!id) return;
    if (showLoading) setLoading(true);
    setError("");
    const demoOrder = demoMode ? findDemoOrder(id) : null;
    if (demoOrder) {
      setOrder(demoOrder);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data?.pedido);
    } catch {
      setError("Não foi possível carregar este pedido.");
    } finally {
      setLoading(false);
    }
  }

  const realOrderPath = id ? `/meus-pedidos/${id}` : "/meus-pedidos";
  const state = useMemo(() => resolveState(order, result), [order, result]);

  if (!id && fallbackOrderId) {
    return <Navigate to={`/pedido/${fallbackOrderId}/status?resultado=${encodeURIComponent(result)}`} replace />;
  }

  if (!id) {
    const [title, description, Icon] = legacyCopy[result as keyof typeof legacyCopy] ?? legacyCopy.sucesso;
    return (
      <main className="app-shell grid min-h-[70vh] place-items-center py-16">
        <EmptyState icon={<Icon className="h-6 w-6" />} title={title} description={description} action={<Link to="/meus-pedidos" className="btn-primary">Ver meus pedidos</Link>} />
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (loading && !order) {
    return <main className="app-shell py-16 text-nexus-muted">Carregando status do pedido...</main>;
  }

  if (error && !order) {
    return (
      <main className="app-shell grid min-h-[70vh] place-items-center py-16">
        <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="Pedido não encontrado" description={error} action={<Link to="/meus-pedidos" className="btn-primary">Ver meus pedidos</Link>} />
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="app-shell section-y">
      <section className="panel p-5 sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow mb-2">Status do pedido</p>
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-nexus-contrast">{state.title}</h1>
            <p className="mt-2 max-w-2xl text-nexus-muted">{state.description}</p>
            {shouldPoll(order) && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-nexus-paper px-3 py-1.5 text-xs font-medium text-nexus-muted">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Atualizando automaticamente
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={order.paymentStatus} tone="payment" />
            <StatusBadge value={order.status} tone="order" />
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-nexus-line bg-nexus-paper p-4">
            <div className="mb-4 flex items-center gap-3">
              <PackageCheck className="h-5 w-5 text-nexus-secondary" />
              <div>
                <strong className="block text-nexus-contrast">{order.orderCode}</strong>
                <span className="text-sm text-nexus-muted">{order.items?.length ?? 0} item(ns)</span>
              </div>
            </div>
            <div className="grid gap-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-nexus-surface p-3">
                  <div>
                    <strong className="text-sm text-nexus-contrast">{item.productName || item.product?.name}</strong>
                    <p className="text-xs font-medium text-nexus-muted">Quantidade: {item.quantity}</p>
                  </div>
                  <strong className="text-sm text-nexus-contrast">{currency.format(Number(item.total))}</strong>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-lg border border-nexus-line bg-nexus-paper p-4">
            <h2 className="text-lg font-semibold text-nexus-contrast">Resumo</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <p className="flex justify-between gap-3"><span className="text-nexus-muted">Total</span><strong>{currency.format(Number(order.total))}</strong></p>
              <p className="flex justify-between gap-3"><span className="text-nexus-muted">Pagamento</span><strong>{statusLabel(order.paymentStatus)}</strong></p>
              <p className="flex justify-between gap-3"><span className="text-nexus-muted">Pedido</span><strong>{statusLabel(order.status)}</strong></p>
            </div>
            {order.history && order.history.length > 0 && (
              <>
                <h3 className="mt-5 font-semibold text-nexus-contrast">Histórico</h3>
                <div className="mt-2 grid gap-2 text-xs text-nexus-muted">
                  {order.history.slice(-4).map((history) => (
                    <span key={history.id}>{statusLabel(history.newStatus)} · {new Date(history.createdAt).toLocaleString("pt-BR")}</span>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to={realOrderPath} className="btn-primary">Ver detalhes do pedido</Link>
          <Link to="/meus-pedidos" className="btn-secondary">Meus pedidos</Link>
        </div>
      </section>
    </main>
  );
}

function shouldPoll(order: Order) {
  return pendingPayments.has(order.paymentStatus) || pendingOrders.has(order.status);
}

function resolveState(order: Order | null, result: string) {
  if (order?.paymentStatus === "APPROVED" || order?.status === "PAID") {
    return { title: "Pedido confirmado", description: "O pedido foi registrado e a loja já pode preparar a entrega ou retirada." };
  }
  if (order?.paymentStatus === "REJECTED" || order?.status === "PAYMENT_REJECTED" || result === "falha") {
    return { title: "Pedido não concluído", description: "A simulação não foi aprovada. Você pode acompanhar este pedido ou tentar novamente em meus pedidos." };
  }
  if (result === "pendente") {
    return { title: "Pedido pendente", description: "A confirmação ainda está em processamento. Atualizaremos o pedido automaticamente quando houver retorno." };
  }
  return { title: "Estamos confirmando seu pedido", description: "A confirmação final pode levar alguns instantes quando a integração real estiver ativa." };
}

function StatusBadge({ value, tone }: { value: string; tone: "payment" | "order" }) {
  const positive = ["APPROVED", "PAID", "DELIVERED"].includes(value);
  const negative = ["REJECTED", "PAYMENT_REJECTED", "CANCELED", "REFUNDED"].includes(value);
  const className = negative ? "badge bg-red-50 text-red-700" : positive ? "badge-soft" : tone === "payment" ? "badge-warm" : "badge bg-nexus-background text-nexus-muted";
  return <span className={className}>{statusLabel(value)}</span>;
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    APPROVED: "Aprovado",
    PAID: "Pago",
    DELIVERED: "Entregue",
    PENDING: "Pendente",
    AWAITING_PAYMENT: "Aguardando pagamento",
    CREATED: "Criado",
    IN_PRODUCTION: "Em produção",
    SHIPPED: "Enviado",
    REJECTED: "Recusado",
    PAYMENT_REJECTED: "Pagamento recusado",
    CANCELED: "Cancelado",
    REFUNDED: "Reembolsado"
  };
  return labels[value] ?? value;
}
