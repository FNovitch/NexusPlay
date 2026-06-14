import { ClipboardList, Star, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { readDemoOrders } from "../data/demoOrders";
import { useAuth } from "../store/auth";

export function CustomerDashboard() {
  const user = useAuth((state) => state.user);
  const [orders, setOrders] = useState<Array<{ id: string; status: string; items: unknown[] }>>([]);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data.orders ?? [])).catch(() => setOrders(readDemoOrders()));
  }, []);

  if (!user || user.role !== "CUSTOMER") {
    return <Navigate to="/cliente/login" replace />;
  }

  return (
    <main className="app-shell section-y">
      <div className="mb-8">
        <p className="eyebrow mb-2">Cliente</p>
        <h1 className="text-3xl font-semibold text-nexus-contrast">Minha conta</h1>
        <p className="mt-2 text-nexus-muted">{user.name}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><ClipboardList className="mb-3 h-5 w-5 text-nexus-primary" /><strong>{orders.length}</strong><p className="text-sm text-nexus-muted">pedidos</p></div>
        <div className="panel p-5"><Star className="mb-3 h-5 w-5 text-nexus-primary" /><strong>Avaliações</strong><p className="text-sm text-nexus-muted">Disponíveis após a entrega.</p></div>
        <Link to="/cliente" className="panel p-5"><UserRound className="mb-3 h-5 w-5 text-nexus-primary" /><strong>Perfil</strong><p className="text-sm text-nexus-muted">Dados da conta.</p></Link>
      </div>
      <section className="panel mt-8 p-5">
        <h2 className="mb-4 text-xl font-semibold text-nexus-contrast">Pedidos</h2>
        {orders.length === 0 ? <p className="text-nexus-muted">Nenhum pedido encontrado.</p> : (
          <div className="grid gap-3">
            {orders.map((order) => <div key={order.id} className="rounded-lg bg-nexus-background p-3 font-bold text-nexus-contrast">{order.id} · {order.status}</div>)}
          </div>
        )}
      </section>
    </main>
  );
}
