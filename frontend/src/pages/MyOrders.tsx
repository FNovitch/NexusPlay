import { PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Order = { id: string; orderCode: string; status: string; paymentStatus: string; total: number | string; createdAt: string };

export function MyOrders() {
  const user = useAuth((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get("/pedidos/meus-pedidos").then(({ data }) => setOrders(data.data?.pedidos ?? data.orders ?? [])).catch(() => setOrders([]));
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="app-shell section-y">
      <p className="eyebrow mb-2">Cliente</p>
      <h1 className="mb-8 text-3xl font-black text-kriar-contrast">Meus pedidos</h1>
      <div className="grid gap-4">
        {orders.length === 0 ? <div className="panel p-6 text-kriar-muted">Nenhum pedido encontrado.</div> : orders.map((order) => (
          <Link key={order.id} to={`/meus-pedidos/${order.id}`} className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><PackageCheck className="mb-2 h-5 w-5 text-kriar-primary" /><strong className="text-kriar-contrast">{order.orderCode}</strong><p className="text-sm text-kriar-muted">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p></div>
            <div className="flex flex-wrap gap-2"><span className="badge-soft">{order.status}</span><span className="badge-warm">{order.paymentStatus}</span><strong className="text-kriar-primary">{currency.format(Number(order.total))}</strong></div>
          </Link>
        ))}
      </div>
    </main>
  );
}
