import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { readDemoOrders } from "../data/demoOrders";
import { useAuth } from "../store/auth";

export function ArtisanOrders() {
  const user = useAuth((state) => state.user);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { api.get("/artesao/pedidos").then(({ data }) => setOrders(data.data?.pedidos ?? [])).catch(() => setOrders(readDemoOrders())); }, []);
  if (!user || user.role !== "ARTISAN") return <Navigate to="/vendedor/login" replace />;

  async function update(id: string, status: string) {
    await api.put(`/artesao/pedidos/${id}/status`, { status });
    const { data } = await api.get("/artesao/pedidos");
    setOrders(data.data?.pedidos ?? []);
  }

  return (
    <main className="app-shell section-y">
      <p className="eyebrow mb-2">Empreendedor</p>
      <h1 className="mb-8 text-3xl font-semibold text-nexus-contrast">Pedidos Recebidos</h1>
      <div className="panel overflow-x-auto p-4">
        <table className="table-modern">
          <thead><tr><th>Pedido</th><th>Status</th><th>Cliente</th><th>Itens</th><th>Atualizar</th></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id}><td>{order.orderCode}</td><td>{order.status}</td><td>{order.buyer?.name}</td><td>{order.items?.length}</td><td><select className="select-field" value={order.status} onChange={(e) => update(order.id, e.target.value)}>{["IN_PRODUCTION", "SHIPPED", "DELIVERED"].map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody>
        </table>
      </div>
    </main>
  );
}
