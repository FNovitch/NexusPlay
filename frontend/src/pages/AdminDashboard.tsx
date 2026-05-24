import { Boxes, ClipboardList, CreditCard, FolderTree, LayoutDashboard, LogOut, MessageSquare, PackageCheck, ShieldCheck, Store, Users, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { adminDelete, adminGet, adminPost, adminPut } from "../services/admin";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

type AdminSection = "dashboard" | "clientes" | "artesaos" | "produtos" | "pedidos" | "avaliacoes" | "categorias" | "assinaturas" | "repasses" | "pagamentos" | "configuracoes";
type ListData<T> = { items: T[]; total?: number };

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const menu: Array<[AdminSection, LucideIcon, string]> = [
  ["dashboard", LayoutDashboard, "Dashboard"],
  ["clientes", Users, "Clientes"],
  ["artesaos", Store, "Artesaos"],
  ["produtos", Boxes, "Produtos"],
  ["pedidos", ClipboardList, "Pedidos"],
  ["avaliacoes", MessageSquare, "Avaliacoes"],
  ["categorias", FolderTree, "Categorias"],
  ["assinaturas", CreditCard, "Assinaturas"],
  ["repasses", WalletCards, "Repasses"],
  ["pagamentos", ShieldCheck, "Pagamentos"],
  ["configuracoes", ShieldCheck, "Configuracoes"]
];

export function AdminDashboard() {
  const location = useLocation();
  const section = (location.pathname.split("/")[2] || "dashboard") as AdminSection;
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const showToast = useToast((state) => state.show);
  const [dashboard, setDashboard] = useState<any>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const endpoint = useMemo(() => {
    if (section === "dashboard" || section === "configuracoes") return null;
    return `/admin/${section}`;
  }, [section]);

  async function load() {
    setLoading(true);
    try {
      if (section === "dashboard") {
        setDashboard(await adminGet<any>("/admin/dashboard"));
      } else if (endpoint) {
        const params = query ? `?q=${encodeURIComponent(query)}` : "";
        const data = await adminGet<ListData<any>>(`${endpoint}${params}`);
        setItems(data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => showToast({ title: "Erro no admin", description: "Nao foi possivel carregar os dados.", variant: "warning" }));
  }, [section]);

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  async function action(path: string, payload?: unknown) {
    const reasonActions = ["recusar", "bloquear"];
    const needsReason = reasonActions.some((item) => path.includes(item));
    const body = needsReason ? { reason: window.prompt("Informe o motivo") || "" } : payload;
    await adminPut(path, body);
    showToast({ title: "Operacao realizada", variant: "success" });
    await load();
  }

  async function remove(path: string) {
    await adminDelete(path);
    showToast({ title: "Registro atualizado", variant: "success" });
    await load();
  }

  async function createCategory() {
    if (!categoryName.trim()) return;
    await adminPost("/admin/categorias", { name: categoryName });
    setCategoryName("");
    await load();
  }

  return (
    <main className="min-h-[75vh] bg-kriar-background">
      <div className="app-shell grid gap-6 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="panel h-max p-3 lg:sticky lg:top-24">
          <div className="mb-3 px-3 py-2">
            <p className="eyebrow">KRIAR Admin</p>
            <strong className="text-kriar-contrast">{user.name}</strong>
          </div>
          <nav className="grid gap-1">
            {menu.map(([key, Icon, label]) => (
              <Link key={key} to={`/admin/${key}`} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold ${section === key ? "bg-kriar-primary text-white" : "text-kriar-muted hover:bg-kriar-primary/10"}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <button onClick={logout} className="mt-2 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-kriar-secondary hover:bg-kriar-secondary/10">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </nav>
        </aside>

        <section>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow mb-1">Administracao</p>
              <h1 className="text-3xl font-black capitalize text-kriar-contrast">{section}</h1>
            </div>
            {endpoint && (
              <form onSubmit={(event) => { event.preventDefault(); load(); }} className="flex gap-2">
                <input className="input-field" placeholder="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} />
                <button className="btn-secondary">Buscar</button>
              </form>
            )}
          </div>

          {section === "dashboard" && <DashboardView data={dashboard} />}
          {section === "clientes" && <AdminTable items={items} loading={loading} columns={["name", "cpf", "phone", "blocked"]} renderActions={(item) => (
            <>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/clientes/${item.id}/bloquear`)}>Bloquear</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/clientes/${item.id}/desbloquear`)}>Desbloquear</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => remove(`/admin/clientes/${item.id}`)}>Desativar</button>
            </>
          )} />}
          {section === "artesaos" && <AdminTable items={items} loading={loading} columns={["storeName", "document", "status", "blocked"]} renderActions={(item) => (
            <>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/artesaos/${item.id}/aprovar`)}>Aprovar</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/artesaos/${item.id}/recusar`)}>Recusar</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/artesaos/${item.id}/bloquear`)}>Bloquear</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/artesaos/${item.id}/desbloquear`)}>Desbloquear</button>
            </>
          )} />}
          {section === "produtos" && <ProductAdminTable items={items} loading={loading} action={action} remove={remove} />}
          {section === "pedidos" && <AdminTable items={items} loading={loading} columns={["id", "status", "paymentStatus", "total"]} renderActions={(item) => (
            <select className="select-field" value={item.status} onChange={(event) => action(`/admin/pedidos/${item.id}/status`, { status: event.target.value })}>
              {["CREATED", "PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELED"].map((status) => <option key={status}>{status}</option>)}
            </select>
          )} />}
          {section === "avaliacoes" && <AdminTable items={items} loading={loading} columns={["rating", "comment", "hidden"]} renderActions={(item) => (
            <>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/avaliacoes/${item.id}/ocultar`)}>Ocultar</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/avaliacoes/${item.id}/exibir`)}>Exibir</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => remove(`/admin/avaliacoes/${item.id}`)}>Excluir</button>
            </>
          )} />}
          {section === "categorias" && (
            <>
              <form onSubmit={(event) => { event.preventDefault(); createCategory(); }} className="panel mb-4 flex gap-2 p-4">
                <input className="input-field flex-1" placeholder="Nova categoria" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
                <button className="btn-primary">Criar</button>
              </form>
              <AdminTable items={items} loading={loading} columns={["name", "slug", "active"]} renderActions={(item) => (
                <>
                  <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/categorias/${item.id}`, { active: !item.active })}>{item.active ? "Desativar" : "Ativar"}</button>
                  <button className="btn-secondary px-3 py-1 text-xs" onClick={() => remove(`/admin/categorias/${item.id}`)}>Excluir</button>
                </>
              )} />
            </>
          )}
          {section === "assinaturas" && <AdminTable items={items} loading={loading} columns={["status", "startDate", "expirationDate"]} renderActions={(item) => (
            <>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/assinaturas/${item.id}/ativar`)}>Ativar</button>
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/assinaturas/${item.id}/cancelar`)}>Cancelar</button>
            </>
          )} />}
          {section === "repasses" && <AdminTable items={items} loading={loading} columns={["status", "saleAmount", "availableAmount"]} renderActions={(item) => (
            <button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/repasses/${item.id}/pagar`)}>Marcar pago</button>
          )} />}
          {section === "pagamentos" && <AdminTable items={items} loading={loading} columns={["type", "status", "amount", "description"]} renderActions={() => null} />}
          {section === "configuracoes" && <div className="panel p-5 text-kriar-muted">Use esta area para atualizar perfil e senha do administrador via API `/admin/perfil` e `/admin/alterar-senha`.</div>}
        </section>
      </div>
    </main>
  );
}

function DashboardView({ data }: { data: any }) {
  const metrics = data?.metrics ?? {};
  const cards = [
    ["Clientes", metrics.totalClientes],
    ["Artesaos", metrics.totalArtesaos],
    ["Artesaos pendentes", metrics.artesaosPendentes],
    ["Produtos", metrics.totalProdutos],
    ["Produtos pendentes", metrics.produtosPendentes],
    ["Pedidos", metrics.totalPedidos],
    ["Faturamento", currency.format(metrics.faturamentoTotal ?? 0)]
  ];
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => <div key={label} className="panel p-5"><PackageCheck className="mb-3 h-5 w-5 text-kriar-primary" /><strong className="block text-2xl text-kriar-contrast">{String(value ?? 0)}</strong><span className="text-sm text-kriar-muted">{label}</span></div>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <MiniList title="Ultimos pedidos" items={data?.ultimosPedidos ?? []} />
        <MiniList title="Artesaos pendentes" items={data?.artesaosPendentesLista ?? []} />
      </div>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: any[] }) {
  return <section className="panel p-5"><h2 className="mb-3 text-xl font-black text-kriar-primary">{title}</h2>{items.length === 0 ? <p className="text-kriar-muted">Nada por aqui.</p> : items.map((item) => <div key={item.id} className="border-t border-kriar-line py-3 first:border-t-0"><strong className="text-kriar-contrast">{item.storeName ?? item.id}</strong><p className="text-sm text-kriar-muted">{item.status ?? item.user?.email ?? item.buyer?.email}</p></div>)}</section>;
}

function AdminTable({ items, loading, columns, renderActions }: { items: any[]; loading: boolean; columns: string[]; renderActions: (item: any) => React.ReactNode }) {
  if (loading) return <div className="panel p-5 text-kriar-muted">Carregando...</div>;
  return (
    <div className="panel overflow-x-auto p-4">
      <table className="table-modern">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}<th>Acoes</th></tr></thead>
        <tbody>
          {items.map((item) => <tr key={item.id}>{columns.map((column) => <td key={column}>{String(item[column] ?? item.user?.[column] ?? "")}</td>)}<td><div className="flex flex-wrap gap-2">{renderActions(item)}</div></td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

function ProductAdminTable({ items, loading, action, remove }: { items: any[]; loading: boolean; action: (path: string, payload?: unknown) => Promise<void>; remove: (path: string) => Promise<void> }) {
  if (loading) return <div className="panel p-5 text-kriar-muted">Carregando...</div>;
  return (
    <div className="panel overflow-x-auto p-4">
      <table className="table-modern">
        <thead><tr><th>Produto</th><th>Artesao</th><th>Status</th><th>Variacoes</th><th>Acoes</th></tr></thead>
        <tbody>
          {items.map((item) => <tr key={item.id}><td><div className="flex items-center gap-3"><img src={productImageUrl(item)} className="h-12 w-12 rounded-xl object-cover" alt="" />{item.name}</div></td><td>{item.seller?.storeName}</td><td>{item.status}</td><td>{Array.isArray(item.variations) ? item.variations.map((v: any) => v.name).join(", ") : ""}</td><td><div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/produtos/${item.id}/aprovar`)}>Aprovar</button><button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/produtos/${item.id}/recusar`)}>Recusar</button><button className="btn-secondary px-3 py-1 text-xs" onClick={() => action(`/admin/produtos/${item.id}/desativar`)}>Desativar</button><button className="btn-secondary px-3 py-1 text-xs" onClick={() => remove(`/admin/produtos/${item.id}`)}>Excluir</button></div></td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
