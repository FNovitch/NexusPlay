import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function OrderDetail() {
  const { id = "" } = useParams();
  const user = useAuth((state) => state.user);
  const [order, setOrder] = useState<any>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get(`/pedidos/${id}`).then(({ data }) => setOrder(data.data?.pedido)).catch(() => setMessage("Pedido nao encontrado."));
  }, [id]);

  if (!user) return <Navigate to="/login" replace />;
  if (!order) return <main className="app-shell py-16 text-kriar-muted">{message || "Carregando pedido..."}</main>;

  async function cancel() {
    await api.put(`/pedidos/${order.id}/cancelar`);
    const { data } = await api.get(`/pedidos/${order.id}`);
    setOrder(data.data.pedido);
  }

  return (
    <main className="app-shell section-y">
      <p className="eyebrow mb-2">Pedido</p>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black text-kriar-contrast">{order.orderCode}</h1>
        {["CREATED", "PENDING", "AWAITING_PAYMENT"].includes(order.status) && <button onClick={cancel} className="btn-secondary">Cancelar pedido</button>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel p-5">
          <h2 className="mb-4 text-xl font-black text-kriar-primary">Itens</h2>
          <div className="grid gap-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-kriar-background p-3">
                {item.productImage && <img src={item.productImage.startsWith("/uploads") ? `${new URL(import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").origin}${item.productImage}` : item.productImage} className="h-14 w-14 rounded-lg object-cover" alt="" />}
                <div className="flex-1"><strong>{item.productName || item.product?.name}</strong><p className="text-sm text-kriar-muted">Qtd. {item.quantity}</p>{item.selectedVariations && <p className="text-xs text-kriar-muted">{Object.entries(item.selectedVariations).map(([n, o]) => `${n}: ${o}`).join(" · ")}</p>}</div>
                <strong>{currency.format(Number(item.total))}</strong>
              </div>
            ))}
          </div>
        </section>
        <aside className="panel h-max p-5">
          <h2 className="mb-3 text-xl font-black text-kriar-primary">Resumo</h2>
          <p>Status: <strong>{order.status}</strong></p>
          <p>Pagamento: <strong>{order.paymentStatus}</strong></p>
          <p>Total: <strong>{currency.format(Number(order.total))}</strong></p>
          <h3 className="mt-5 font-black text-kriar-contrast">Historico</h3>
          <div className="mt-2 grid gap-2 text-sm text-kriar-muted">{order.history?.map((history: any) => <span key={history.id}>{history.newStatus} · {new Date(history.createdAt).toLocaleString("pt-BR")}</span>)}</div>
        </aside>
      </div>
    </main>
  );
}
