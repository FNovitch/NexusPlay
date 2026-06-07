import { AlertCircle, CheckCircle2, Clock, PackageCheck, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
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
  sucesso: ["Pedido recebido", "O Mercado Pago confirmou ou está processando seu retorno. Acompanhe em Meus pedidos.", CheckCircle2],
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
  const fallbackOrderId = typeof window !== "undefined" ? sessionStorage.getItem("kriar-last-order-id") : null;

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
    try {
      const { data } = await api.get(`/pedidos/${id}`);
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
    return <main className="app-shell py-16 text-kriar-muted">Carregando status do pedido...</main>;
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
            <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">{state.title}</h1>
            <p className="mt-2 max-w-2xl text-kriar-muted">{state.description}</p>
            {shouldPoll(order) && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-kriar-background px-3 py-1.5 text-xs font-black text-kriar-muted">
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
          <section className="rounded-[20px] border border-kriar-line bg-kriar-background/70 p-4">
            <div className="mb-4 flex items-center gap-3">
              <PackageCheck className="h-5 w-5 text-kriar-primary" />
              <div>
                <strong className="block text-kriar-contrast">{order.orderCode}</strong>
                <span className="text-sm text-kriar-muted">{order.items?.length ?? 0} item(ns)</span>
              </div>
            </div>
            <div className="grid gap-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-kriar-surface p-3">
                  <div>
                    <strong className="text-sm text-kriar-contrast">{item.productName || item.product?.name}</strong>
                    <p className="text-xs font-bold text-kriar-muted">Quantidade: {item.quantity}</p>
                  </div>
                  <strong className="text-sm text-kriar-primary">{currency.format(Number(item.total))}</strong>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[20px] border border-kriar-line bg-kriar-background/70 p-4">
            <h2 className="text-lg font-black text-kriar-primary">Resumo</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <p className="flex justify-between gap-3"><span className="text-kriar-muted">Total</span><strong>{currency.format(Number(order.total))}</strong></p>
              <p className="flex justify-between gap-3"><span className="text-kriar-muted">Pagamento</span><strong>{statusLabel(order.paymentStatus)}</strong></p>
              <p className="flex justify-between gap-3"><span className="text-kriar-muted">Pedido</span><strong>{statusLabel(order.status)}</strong></p>
            </div>
            {order.history && order.history.length > 0 && (
              <>
                <h3 className="mt-5 font-black text-kriar-contrast">Histórico</h3>
                <div className="mt-2 grid gap-2 text-xs text-kriar-muted">
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
    return { title: "Pagamento confirmado", description: "Recebemos a confirmação do pagamento e o vendedor já pode preparar seu pedido." };
  }
  if (order?.paymentStatus === "REJECTED" || order?.status === "PAYMENT_REJECTED" || result === "falha") {
    return { title: "Pagamento não concluído", description: "O pagamento não foi aprovado. Você pode acompanhar este pedido ou tentar novamente em Meus pedidos." };
  }
  if (result === "pendente") {
    return { title: "Pagamento pendente", description: "O Mercado Pago ainda está processando a transação. Atualizaremos o pedido automaticamente quando houver confirmação." };
  }
  return { title: "Estamos confirmando seu pagamento", description: "O retorno do Mercado Pago chegou, mas a confirmação final pode levar alguns instantes pelo webhook." };
}

function StatusBadge({ value, tone }: { value: string; tone: "payment" | "order" }) {
  const positive = ["APPROVED", "PAID", "DELIVERED"].includes(value);
  const negative = ["REJECTED", "PAYMENT_REJECTED", "CANCELED", "REFUNDED"].includes(value);
  const className = negative ? "badge bg-red-50 text-red-700" : positive ? "badge-soft" : tone === "payment" ? "badge-warm" : "badge bg-kriar-background text-kriar-muted";
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
