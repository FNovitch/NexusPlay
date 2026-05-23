import { ClipboardList, Star, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

export function CustomerDashboard() {
  const user = useAuth((state) => state.user);
  const [orders, setOrders] = useState<Array<{ id: string; status: string; items: unknown[] }>>([]);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data.orders ?? [])).catch(() => setOrders([]));
  }, []);

  if (!user || user.role !== "CUSTOMER") {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-shell section-y">
      <div className="mb-8">
        <p className="eyebrow mb-2">Cliente</p>
        <h1 className="text-3xl font-black text-kriar-contrast">Minha area</h1>
        <p className="mt-2 text-kriar-muted">{user.name}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><ClipboardList className="mb-3 h-5 w-5 text-kriar-primary" /><strong>{orders.length}</strong><p className="text-sm text-kriar-muted">pedidos</p></div>
        <div className="panel p-5"><Star className="mb-3 h-5 w-5 text-kriar-primary" /><strong>Avaliacoes</strong><p className="text-sm text-kriar-muted">Disponiveis apos entrega.</p></div>
        <Link to="/login" className="panel p-5"><UserRound className="mb-3 h-5 w-5 text-kriar-primary" /><strong>Perfil</strong><p className="text-sm text-kriar-muted">Dados da conta.</p></Link>
      </div>
      <section className="panel mt-8 p-5">
        <h2 className="mb-4 text-xl font-black text-kriar-primary">Pedidos</h2>
        {orders.length === 0 ? <p className="text-kriar-muted">Nenhum pedido encontrado.</p> : (
          <div className="grid gap-3">
            {orders.map((order) => <div key={order.id} className="rounded-xl bg-kriar-background p-3 font-bold text-kriar-contrast">{order.id} · {order.status}</div>)}
          </div>
        )}
      </section>
    </main>
  );
}
