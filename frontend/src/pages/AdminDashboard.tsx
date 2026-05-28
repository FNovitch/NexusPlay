import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  CreditCard,
  Eye,
  Filter,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { adminDelete, adminGet, adminPost, adminPut } from "../services/admin";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";
import { handleImageError } from "../utils/media";

type AdminSection =
  | "dashboard"
  | "clientes"
  | "artesaos"
  | "produtos"
  | "pedidos"
  | "avaliacoes"
  | "categorias"
  | "assinaturas"
  | "repasses"
  | "pagamentos"
  | "configuracoes";
type ListData<T> = { items: T[]; total?: number };
type FilterState = Record<string, string>;
type ModalAction = {
  title: string;
  description: string;
  path: string;
  method: "put" | "delete";
  payload?: unknown;
  reasonRequired?: boolean;
  reasonLabel?: string;
};
type Column = {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const pageSize = 10;

const menu: Array<{ key: AdminSection; icon: LucideIcon; label: string; description: string }> = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", description: "Visão geral da operação." },
  { key: "clientes", icon: Users, label: "Clientes", description: "Contas, bloqueios e histórico básico." },
  { key: "artesaos", icon: Store, label: "Artesãos", description: "Cadastros, aprovações e status de loja." },
  { key: "produtos", icon: Boxes, label: "Produtos", description: "Curadoria, estoque e aprovação de peças." },
  { key: "pedidos", icon: ClipboardList, label: "Pedidos", description: "Acompanhamento e troca de status." },
  { key: "avaliacoes", icon: MessageSquare, label: "Avaliações", description: "Moderação de comentários e notas." },
  { key: "categorias", icon: FolderTree, label: "Categorias", description: "Organização do catálogo." },
  { key: "assinaturas", icon: CreditCard, label: "Assinaturas", description: "Planos dos artesãos." },
  { key: "repasses", icon: WalletCards, label: "Repasses", description: "Valores liberados e pagamentos." },
  { key: "pagamentos", icon: ShieldCheck, label: "Pagamentos", description: "Histórico financeiro do marketplace." },
  { key: "configuracoes", icon: ShieldCheck, label: "Configurações", description: "Perfil e segurança do painel." }
];

const detailSections = new Set<AdminSection>(["clientes", "artesaos", "produtos", "pedidos"]);

const filterConfig: Partial<Record<AdminSection, Array<{ key: string; label: string; type: "search" | "select"; placeholder?: string; options?: Array<[string, string]> }>>> = {
  clientes: [{ key: "q", label: "Busca", type: "search", placeholder: "Nome, CPF ou e-mail" }],
  artesaos: [
    { key: "q", label: "Busca", type: "search", placeholder: "Nome, loja, documento ou e-mail" },
    { key: "status", label: "Status", type: "select", options: [["", "Todos"], ["PENDING", "Pendente"], ["APPROVED", "Aprovado"], ["REJECTED", "Recusado"]] },
    { key: "blocked", label: "Bloqueio", type: "select", options: [["", "Todos"], ["true", "Bloqueados"]] }
  ],
  produtos: [
    { key: "q", label: "Busca", type: "search", placeholder: "Nome do produto" },
    { key: "status", label: "Status", type: "select", options: [["", "Todos"], ["PENDING", "Pendente"], ["ACTIVE", "Ativo"], ["INACTIVE", "Inativo"], ["SOLD_OUT", "Esgotado"], ["REJECTED", "Recusado"]] },
    { key: "categoryId", label: "Categoria", type: "search", placeholder: "ID da categoria" },
    { key: "sellerId", label: "Artesão", type: "search", placeholder: "ID da loja" }
  ],
  pedidos: [{ key: "status", label: "Status", type: "select", options: [["", "Todos"], ["CREATED", "Criado"], ["PENDING", "Pendente"], ["AWAITING_PAYMENT", "Aguardando pagamento"], ["PAID", "Pago"], ["IN_PRODUCTION", "Em produção"], ["SHIPPED", "Enviado"], ["DELIVERED", "Entregue"], ["CANCELED", "Cancelado"]] }],
  avaliacoes: [
    { key: "rating", label: "Nota", type: "select", options: [["", "Todas"], ["5", "5 estrelas"], ["4", "4 estrelas"], ["3", "3 estrelas"], ["2", "2 estrelas"], ["1", "1 estrela"]] },
    { key: "productId", label: "Produto", type: "search", placeholder: "ID do produto" },
    { key: "customerId", label: "Cliente", type: "search", placeholder: "ID do cliente" }
  ],
  assinaturas: [{ key: "status", label: "Status", type: "select", options: [["", "Todos"], ["TRIAL_ACTIVE", "Trial"], ["ACTIVE", "Ativa"], ["EXPIRED", "Expirada"], ["CANCELED", "Cancelada"], ["PENDING", "Pendente"], ["REJECTED", "Recusada"]] }],
  repasses: [{ key: "status", label: "Status", type: "select", options: [["", "Todos"], ["BLOCKED", "Bloqueado"], ["AVAILABLE", "Disponível"], ["PAID", "Pago"], ["CANCELED", "Cancelado"]] }]
};

const orderStatuses = ["CREATED", "PENDING", "AWAITING_PAYMENT", "PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELED", "PAYMENT_REJECTED", "REFUNDED"];

export function AdminDashboard() {
  const location = useLocation();
  const params = useParams();
  const section = resolveSection(params.section ?? location.pathname.split("/")[2]);
  const detailId = params.id;
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const showToast = useToast((state) => state.show);
  const [dashboard, setDashboard] = useState<any>();
  const [items, setItems] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<FilterState>({});
  const [filters, setFilters] = useState<FilterState>({});
  const [categoryName, setCategoryName] = useState("");
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);
  const [reason, setReason] = useState("");

  const activeMenu = menu.find((item) => item.key === section) ?? menu[0];
  const endpoint = useMemo(() => (section === "dashboard" || section === "configuracoes" ? null : `/admin/${section}`), [section]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeFilters = Object.entries(filters).filter(([, value]) => value);

  async function loadList() {
    setLoading(true);
    setError("");
    try {
      if (section === "dashboard") {
        setDashboard(await adminGet<any>("/admin/dashboard"));
        return;
      }
      if (!endpoint) return;
      const search = new URLSearchParams();
      search.set("take", String(pageSize));
      search.set("skip", String((page - 1) * pageSize));
      Object.entries(filters).forEach(([key, value]) => {
        if (value) search.set(key, value);
      });
      const data = await adminGet<ListData<any>>(`${endpoint}?${search.toString()}`);
      setItems(data.items ?? []);
      setTotal(data.total ?? data.items?.length ?? 0);
    } catch {
      setError("Não foi possível carregar os dados desta seção.");
      showToast({ title: "Erro no painel", description: "Tente novamente em alguns instantes.", variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail() {
    if (!detailId || !endpoint || !detailSections.has(section)) {
      setDetail(undefined);
      return;
    }
    setDetailLoading(true);
    try {
      setDetail(await adminGet<any>(`${endpoint}/${detailId}`));
    } catch {
      setDetail(undefined);
      showToast({ title: "Detalhe indisponível", description: "Não foi possível carregar o registro.", variant: "warning" });
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    setDraftFilters({});
    setFilters({});
    setPage(1);
    setItems([]);
    setTotal(0);
  }, [section]);

  useEffect(() => {
    loadList();
  }, [section, page, filters]);

  useEffect(() => {
    loadDetail();
  }, [section, detailId]);

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  function openAction(action: ModalAction) {
    setReason("");
    setModalAction(action);
  }

  async function confirmAction() {
    if (!modalAction) return;
    if (modalAction.reasonRequired && !reason.trim()) return;
    const payload = modalAction.reasonRequired ? { ...(modalAction.payload as object | undefined), reason: reason.trim() } : modalAction.payload;
    if (modalAction.method === "delete") {
      await adminDelete(modalAction.path);
    } else {
      await adminPut(modalAction.path, payload);
    }
    showToast({ title: "Operação realizada", variant: "success" });
    setModalAction(null);
    await loadList();
    await loadDetail();
  }

  async function createCategory() {
    if (!categoryName.trim()) return;
    await adminPost("/admin/categorias", { name: categoryName });
    setCategoryName("");
    showToast({ title: "Categoria criada", variant: "success" });
    await loadList();
  }

  function applyFilters(event?: React.FormEvent) {
    event?.preventDefault();
    setPage(1);
    setFilters(cleanFilters(draftFilters));
  }

  function clearFilters() {
    setDraftFilters({});
    setFilters({});
    setPage(1);
  }

  return (
    <main className="min-h-[75vh] bg-kriar-background">
      <div className="app-shell grid gap-6 py-6 lg:grid-cols-[260px_1fr] lg:py-8">
        <AdminSidebar section={section} userName={user.name} onLogout={logout} />

        <section className="min-w-0">
          <AdminToolbar title={activeMenu.label} description={activeMenu.description} section={section} detailId={detailId} />

          {section === "dashboard" && <DashboardView data={dashboard} loading={loading} onRetry={loadList} />}
          {section === "configuracoes" && <SettingsView userName={user.name} />}
          {endpoint && (
            <div className="grid gap-5">
              <AdminFilters
                section={section}
                draftFilters={draftFilters}
                activeFilters={activeFilters}
                onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
                onApply={applyFilters}
                onClear={clearFilters}
              />
              {section === "categorias" && (
                <form onSubmit={(event) => { event.preventDefault(); createCategory(); }} className="panel flex flex-col gap-3 p-4 sm:flex-row">
                  <input className="input-field flex-1" placeholder="Nova categoria" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
                  <button className="btn-primary">Criar categoria</button>
                </form>
              )}
              {error && <ErrorState message={error} onRetry={loadList} />}
              {detailId && (
              <AdminDetailPanel
                section={section}
                item={detail}
                loading={detailLoading}
                backTo={`/admin/${section}`}
                openAction={openAction}
                onStatusChange={(item, status) => openAction({ title: "Alterar status do pedido", description: `Atualizar o pedido ${item.orderCode ?? item.id} para ${status}.`, path: `/admin/pedidos/${item.id}/status`, method: "put", payload: { status } })}
              />
              )}
              <AdminListSection
                section={section}
                items={items}
                loading={loading}
                columns={columnsFor(section)}
                page={page}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                openAction={openAction}
                onStatusChange={(item, status) => openAction({ title: "Alterar status do pedido", description: `Atualizar o pedido ${item.orderCode ?? item.id} para ${status}.`, path: `/admin/pedidos/${item.id}/status`, method: "put", payload: { status } })}
                onClearFilters={clearFilters}
              />
            </div>
          )}
        </section>
      </div>

      {modalAction && (
        <ActionModal
          action={modalAction}
          reason={reason}
          onReasonChange={setReason}
          onClose={() => setModalAction(null)}
          onConfirm={confirmAction}
        />
      )}
    </main>
  );
}

function resolveSection(value?: string): AdminSection {
  return menu.some((item) => item.key === value) ? (value as AdminSection) : "dashboard";
}

function cleanFilters(filters: FilterState) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim()));
}

function AdminSidebar({ section, userName, onLogout }: { section: AdminSection; userName: string; onLogout: () => void }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-max">
      <div className="panel p-3">
        <div className="mb-3 hidden px-3 py-2 lg:block">
          <p className="eyebrow">Painel administrativo</p>
          <strong className="text-kriar-contrast">{userName}</strong>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
          {menu.map(({ key, icon: Icon, label }) => (
            <Link key={key} to={`/admin/${key}`} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ${section === key ? "bg-kriar-primary text-white shadow-sm" : "text-kriar-muted hover:bg-kriar-primary/10 hover:text-kriar-primary"}`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          <button onClick={onLogout} className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold text-kriar-secondary transition hover:bg-kriar-secondary/10 lg:mt-2">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </nav>
      </div>
    </aside>
  );
}

function AdminToolbar({ title, description, section, detailId }: { title: string; description: string; section: AdminSection; detailId?: string }) {
  return (
    <header className="mb-5 flex flex-col gap-2 rounded-[20px] border border-kriar-line bg-kriar-surface/80 p-5 shadow-soft">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-kriar-secondary">
        Administração / {title}{detailId ? " / Detalhe" : ""}
      </p>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-kriar-muted">{description}</p>
        </div>
        {detailId && <Link to={`/admin/${section}`} className="btn-secondary md:w-max">Voltar para lista</Link>}
      </div>
    </header>
  );
}

function AdminFilters({
  section,
  draftFilters,
  activeFilters,
  onChange,
  onApply,
  onClear
}: {
  section: AdminSection;
  draftFilters: FilterState;
  activeFilters: Array<[string, string]>;
  onChange: (key: string, value: string) => void;
  onApply: (event?: React.FormEvent) => void;
  onClear: () => void;
}) {
  const config = filterConfig[section] ?? [];
  if (config.length === 0) return null;

  return (
    <section className="panel p-4">
      <form onSubmit={onApply} className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {config.map((filter) => (
            <label key={filter.key} className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-kriar-muted">{filter.label}</span>
              {filter.type === "select" ? (
                <select className="select-field" value={draftFilters[filter.key] ?? ""} onChange={(event) => onChange(filter.key, event.target.value)}>
                  {filter.options?.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kriar-muted" />
                  <input className="input-field w-full pl-10" value={draftFilters[filter.key] ?? ""} placeholder={filter.placeholder} onChange={(event) => onChange(filter.key, event.target.value)} />
                </div>
              )}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <button className="btn-primary" type="submit"><Filter className="h-4 w-4" /> Aplicar</button>
          {activeFilters.length > 0 && <button className="btn-secondary" type="button" onClick={onClear}><X className="h-4 w-4" /> Limpar</button>}
        </div>
      </form>
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => <span key={key} className="badge-soft">{labelForFilter(key)}: {value}</span>)}
        </div>
      )}
    </section>
  );
}

function AdminListSection({
  section,
  items,
  loading,
  columns,
  page,
  total,
  totalPages,
  onPageChange,
  openAction,
  onStatusChange,
  onClearFilters
}: {
  section: AdminSection;
  items: any[];
  loading: boolean;
  columns: Column[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  openAction: (action: ModalAction) => void;
  onStatusChange: (item: any, status: string) => void;
  onClearFilters: () => void;
}) {
  if (loading) return <LoadingState />;
  if (items.length === 0) return <EmptyAdminState onClearFilters={onClearFilters} />;

  return (
    <section className="grid gap-4">
      <div className="hidden panel overflow-x-auto p-4 md:block">
        <table className="table-modern">
          <thead>
            <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>Ações</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(item) : displayValue(item, column.key)}</td>)}
                <td><ActionGroup section={section} item={item} openAction={openAction} onStatusChange={onStatusChange} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => <AdminMobileCard key={item.id} section={section} item={item} columns={columns} openAction={openAction} onStatusChange={onStatusChange} />)}
      </div>
      <AdminPagination page={page} total={total} totalPages={totalPages} onPageChange={onPageChange} />
    </section>
  );
}

function ActionGroup({ section, item, openAction, onStatusChange }: { section: AdminSection; item: any; openAction: (action: ModalAction) => void; onStatusChange: (item: any, status: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {detailSections.has(section) && <Link className="btn-secondary px-3 py-1 text-xs" to={`/admin/${section}/${item.id}`}><Eye className="h-3.5 w-3.5" /> Visualizar</Link>}
      {section === "clientes" && (
        <>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Bloquear cliente", description: "Informe o motivo do bloqueio para registrar a decisão.", path: `/admin/clientes/${item.id}/bloquear`, method: "put", reasonRequired: true })}>Bloquear</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Desbloquear cliente", description: "O cliente voltará a ter acesso à conta.", path: `/admin/clientes/${item.id}/desbloquear`, method: "put" })}>Desbloquear</button>
          <button className="btn-secondary px-3 py-1 text-xs text-kriar-secondary" onClick={() => openAction({ title: "Desativar cliente", description: "Esta ação desativa o cliente e o usuário vinculado.", path: `/admin/clientes/${item.id}`, method: "delete" })}>Desativar</button>
        </>
      )}
      {section === "artesaos" && (
        <>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Aprovar artesão", description: "A loja será liberada para operar.", path: `/admin/artesaos/${item.id}/aprovar`, method: "put" })}>Aprovar</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Recusar artesão", description: "Informe o motivo da recusa para orientar o artesão.", path: `/admin/artesaos/${item.id}/recusar`, method: "put", reasonRequired: true })}>Recusar</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Bloquear artesão", description: "Informe o motivo do bloqueio.", path: `/admin/artesaos/${item.id}/bloquear`, method: "put", reasonRequired: true })}>Bloquear</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Desbloquear artesão", description: "A loja volta a operar conforme o status atual.", path: `/admin/artesaos/${item.id}/desbloquear`, method: "put" })}>Desbloquear</button>
        </>
      )}
      {section === "produtos" && (
        <>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Aprovar produto", description: "O produto ficará ativo na vitrine.", path: `/admin/produtos/${item.id}/aprovar`, method: "put" })}>Aprovar</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Recusar produto", description: "Informe o motivo da recusa.", path: `/admin/produtos/${item.id}/recusar`, method: "put", reasonRequired: true })}>Recusar</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Desativar produto", description: "O produto deixará de aparecer como ativo.", path: `/admin/produtos/${item.id}/desativar`, method: "put" })}>Desativar</button>
        </>
      )}
      {section === "pedidos" && (
        <select className="select-field h-9" value={item.status} onChange={(event) => onStatusChange(item, event.target.value)}>
          {orderStatuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      )}
      {section === "avaliacoes" && (
        <>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Ocultar avaliação", description: "A avaliação deixará de aparecer publicamente.", path: `/admin/avaliacoes/${item.id}/ocultar`, method: "put" })}>Ocultar</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Exibir avaliação", description: "A avaliação voltará a ficar visível.", path: `/admin/avaliacoes/${item.id}/exibir`, method: "put" })}>Exibir</button>
        </>
      )}
      {section === "categorias" && (
        <>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: item.active ? "Desativar categoria" : "Ativar categoria", description: "A organização do catálogo será atualizada.", path: `/admin/categorias/${item.id}`, method: "put", payload: { active: !item.active } })}>{item.active ? "Desativar" : "Ativar"}</button>
          <button className="btn-secondary px-3 py-1 text-xs text-kriar-secondary" onClick={() => openAction({ title: "Excluir categoria", description: "Se houver produtos vinculados, a categoria será desativada.", path: `/admin/categorias/${item.id}`, method: "delete" })}>Excluir</button>
        </>
      )}
      {section === "assinaturas" && (
        <>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Ativar assinatura", description: "A assinatura será ativada manualmente.", path: `/admin/assinaturas/${item.id}/ativar`, method: "put" })}>Ativar</button>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Cancelar assinatura", description: "A assinatura será cancelada.", path: `/admin/assinaturas/${item.id}/cancelar`, method: "put" })}>Cancelar</button>
        </>
      )}
      {section === "repasses" && <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openAction({ title: "Marcar repasse como pago", description: "O status financeiro será atualizado.", path: `/admin/repasses/${item.id}/pagar`, method: "put" })}>Marcar pago</button>}
    </div>
  );
}

function AdminMobileCard({ section, item, columns, openAction, onStatusChange }: { section: AdminSection; item: any; columns: Column[]; openAction: (action: ModalAction) => void; onStatusChange: (item: any, status: string) => void }) {
  return (
    <article className="panel p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{menu.find((entry) => entry.key === section)?.label}</p>
          <strong className="line-clamp-2 text-kriar-contrast">{primaryLabel(item)}</strong>
        </div>
        {item.status && <StatusBadge value={item.status} />}
      </div>
      <dl className="grid gap-2 text-sm">
        {columns.slice(0, 4).map((column) => (
          <div key={column.key} className="flex justify-between gap-3 border-t border-kriar-line/60 pt-2 first:border-t-0 first:pt-0">
            <dt className="font-bold text-kriar-muted">{column.label}</dt>
            <dd className="text-right text-kriar-contrast">{column.render ? column.render(item) : displayValue(item, column.key)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <ActionGroup section={section} item={item} openAction={openAction} onStatusChange={onStatusChange} />
      </div>
    </article>
  );
}

function AdminPagination({ page, total, totalPages, onPageChange }: { page: number; total: number; totalPages: number; onPageChange: (page: number) => void }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <footer className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-kriar-muted">
        {total > 0 ? `Exibindo ${from}-${to} de ${total} itens` : "Sem itens para exibir"} · Página {page} de {totalPages}
      </p>
      <div className="grid grid-cols-4 gap-2 sm:flex">
        <PageButton label="Primeira" disabled={page <= 1} onClick={() => onPageChange(1)} icon={<ChevronsLeft className="h-4 w-4" />} />
        <PageButton label="Anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)} icon={<ChevronLeft className="h-4 w-4" />} />
        <PageButton label="Próxima" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} icon={<ChevronRight className="h-4 w-4" />} />
        <PageButton label="Última" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} icon={<ChevronsRight className="h-4 w-4" />} />
      </div>
    </footer>
  );
}

function PageButton({ label, disabled, onClick, icon }: { label: string; disabled: boolean; onClick: () => void; icon: React.ReactNode }) {
  return <button className="btn-secondary px-3 text-xs" type="button" disabled={disabled} onClick={onClick}>{icon}<span className="hidden sm:inline">{label}</span></button>;
}

function AdminDetailPanel({ section, item, loading, backTo, openAction, onStatusChange }: { section: AdminSection; item: any; loading: boolean; backTo: string; openAction: (action: ModalAction) => void; onStatusChange: (item: any, status: string) => void }) {
  if (loading) return <LoadingState compact />;
  if (!item) return <ErrorState message="Registro não encontrado." />;
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-kriar-line bg-kriar-surface/80 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Detalhe</p>
            <h2 className="mt-1 text-2xl font-black text-kriar-contrast">{primaryLabel(item)}</h2>
            <p className="mt-1 text-sm text-kriar-muted">{item.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={backTo} className="btn-secondary">Voltar</Link>
            <ActionGroup section={section} item={item} openAction={openAction} onStatusChange={onStatusChange} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr]">
        <DetailContent section={section} item={item} />
      </div>
    </section>
  );
}

function DetailContent({ section, item }: { section: AdminSection; item: any }) {
  if (section === "produtos") {
    return (
      <>
        <div className="grid gap-4">
          <img src={productImageUrl(item)} alt="" className="aspect-[4/3] w-full rounded-[20px] object-cover" loading="lazy" decoding="async" onError={handleImageError} />
          <InfoGrid items={[["Status", <StatusBadge value={item.status} />], ["Categoria", item.category?.name], ["Artesão", item.seller?.storeName], ["Preço", currency.format(Number(item.price ?? 0))], ["Estoque", item.stock], ["Avaliações", item.reviews?.length ?? item.totalReviews ?? 0]]} />
        </div>
        <div className="grid gap-4">
          <DetailBox title="Descrição">{item.description ?? "Sem descrição."}</DetailBox>
          <DetailBox title="Curadoria">{item.rejectionReason || "Sem observações registradas."}</DetailBox>
        </div>
      </>
    );
  }
  if (section === "pedidos") {
    return (
      <>
        <InfoGrid items={[["Status", <StatusBadge value={item.status} />], ["Pagamento", <StatusBadge value={item.paymentStatus} />], ["Comprador", item.buyer?.name ?? item.buyer?.email], ["Total", currency.format(Number(item.total ?? 0))], ["Criado em", formatDate(item.createdAt)], ["Itens", item.items?.length ?? 0]]} />
        <DetailBox title="Itens do pedido">
          <div className="grid gap-3">
            {(item.items ?? []).map((orderItem: any) => (
              <div key={orderItem.id} className="rounded-xl border border-kriar-line p-3">
                <strong className="text-kriar-contrast">{orderItem.product?.name}</strong>
                <p className="text-sm text-kriar-muted">{orderItem.seller?.storeName} · {orderItem.quantity} un. · {currency.format(Number(orderItem.total ?? 0))}</p>
              </div>
            ))}
          </div>
        </DetailBox>
      </>
    );
  }
  if (section === "artesaos") {
    return (
      <>
        <InfoGrid items={[["Status", <StatusBadge value={item.status} />], ["Loja", item.storeName], ["Documento", item.document], ["Telefone", item.phone], ["E-mail", item.user?.email], ["Bloqueado", item.blocked ? "Sim" : "Não"]]} />
        <DetailBox title="História e endereço">
          <p>{item.storeDescription || item.store?.story || "Sem descrição cadastrada."}</p>
          <AddressList addresses={item.addresses ?? []} />
        </DetailBox>
      </>
    );
  }
  return (
    <>
      <InfoGrid items={[["Nome", item.name], ["CPF", item.cpf], ["Telefone", item.phone], ["E-mail", item.user?.email], ["Ativo", item.active ? "Sim" : "Não"], ["Bloqueado", item.blocked ? "Sim" : "Não"]]} />
      <DetailBox title="Endereços">
        <AddressList addresses={item.addresses ?? []} />
      </DetailBox>
    </>
  );
}

function InfoGrid({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-[18px] border border-kriar-line bg-kriar-background/70 p-4">
          <dt className="text-xs font-black uppercase tracking-[0.12em] text-kriar-muted">{label}</dt>
          <dd className="mt-2 font-black text-kriar-contrast">{value ?? "Não informado"}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailBox({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[20px] border border-kriar-line bg-kriar-background/70 p-4"><h3 className="mb-3 text-lg font-black text-kriar-primary">{title}</h3><div className="text-sm leading-6 text-kriar-muted">{children}</div></section>;
}

function AddressList({ addresses }: { addresses: any[] }) {
  if (addresses.length === 0) return <p>Nenhum endereço cadastrado.</p>;
  return (
    <div className="mt-3 grid gap-2">
      {addresses.map((address) => <p key={address.id} className="rounded-xl bg-kriar-surface p-3">{address.street}, {address.number} · {address.city}/{address.state}</p>)}
    </div>
  );
}

function DashboardView({ data, loading, onRetry }: { data: any; loading: boolean; onRetry: () => void }) {
  if (loading && !data) return <LoadingState />;
  const metrics = data?.metrics ?? {};
  const cards = [
    ["Clientes", metrics.totalClientes],
    ["Artesãos", metrics.totalArtesaos],
    ["Artesãos pendentes", metrics.artesaosPendentes],
    ["Produtos", metrics.totalProdutos],
    ["Produtos pendentes", metrics.produtosPendentes],
    ["Pedidos", metrics.totalPedidos],
    ["Faturamento", currency.format(metrics.faturamentoTotal ?? 0)]
  ];
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => <div key={label} className="panel p-5"><PackageCheck className="mb-3 h-5 w-5 text-kriar-primary" /><strong className="block text-2xl text-kriar-contrast">{String(value ?? 0)}</strong><span className="text-sm text-kriar-muted">{label}</span></div>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <MiniList title="Últimos pedidos" items={data?.ultimosPedidos ?? []} empty="Sem pedidos recentes." />
        <MiniList title="Artesãos pendentes" items={data?.artesaosPendentesLista ?? []} empty="Sem pendências agora." />
      </div>
      {!data && <ErrorState message="Dashboard indisponível." onRetry={onRetry} />}
    </div>
  );
}

function MiniList({ title, items, empty }: { title: string; items: any[]; empty: string }) {
  return <section className="panel p-5"><h2 className="mb-3 text-xl font-black text-kriar-primary">{title}</h2>{items.length === 0 ? <p className="text-kriar-muted">{empty}</p> : items.map((item) => <div key={item.id} className="border-t border-kriar-line py-3 first:border-t-0"><strong className="text-kriar-contrast">{item.storeName ?? item.orderCode ?? item.id}</strong><p className="text-sm text-kriar-muted">{item.status ?? item.user?.email ?? item.buyer?.email}</p></div>)}</section>;
}

function SettingsView({ userName }: { userName: string }) {
  return (
    <div className="panel p-5">
      <p className="eyebrow">Perfil administrativo</p>
      <h2 className="mt-2 text-2xl font-black text-kriar-contrast">{userName}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-kriar-muted">Use os endpoints de perfil e alteração de senha para evoluir esta área. A tela já reserva espaço para preferências, segurança e dados do administrador.</p>
    </div>
  );
}

function LoadingState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`panel grid gap-3 p-5 ${compact ? "" : "min-h-56"}`}>
      {[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-kriar-line/50" />)}
    </div>
  );
}

function EmptyAdminState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="panel grid min-h-56 place-items-center p-6 text-center">
      <div>
        <PackageCheck className="mx-auto mb-3 h-8 w-8 text-kriar-primary" />
        <h2 className="text-xl font-black text-kriar-contrast">Nenhum registro encontrado</h2>
        <p className="mt-2 text-sm text-kriar-muted">Ajuste os filtros ou limpe a busca para ver mais resultados.</p>
        <button className="btn-secondary mt-4" onClick={onClearFilters}>Limpar filtros</button>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel flex flex-col gap-3 p-5 text-kriar-muted sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold">{message}</span>
      {onRetry && <button className="btn-secondary" onClick={onRetry}><RefreshCw className="h-4 w-4" /> Tentar novamente</button>}
    </div>
  );
}

function ActionModal({ action, reason, onReasonChange, onClose, onConfirm }: { action: ModalAction; reason: string; onReasonChange: (value: string) => void; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-kriar-contrast/40 p-4 backdrop-blur-sm">
      <section className="panel w-full max-w-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Confirmar ação</p>
            <h2 className="mt-2 text-2xl font-black text-kriar-contrast">{action.title}</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-sm leading-6 text-kriar-muted">{action.description}</p>
        {action.reasonRequired && (
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-black text-kriar-contrast">{action.reasonLabel ?? "Motivo obrigatório"}</span>
            <textarea className="text-field min-h-28 w-full" value={reason} onChange={(event) => onReasonChange(event.target.value)} placeholder="Explique a decisão para manter o histórico claro." />
          </label>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={onConfirm} disabled={action.reasonRequired && !reason.trim()}>Confirmar</button>
        </div>
      </section>
    </div>
  );
}

function columnsFor(section: AdminSection): Column[] {
  const statusColumn = (key = "status", label = "Status"): Column => ({ key, label, render: (item) => <StatusBadge value={item[key]} /> });
  const map: Partial<Record<AdminSection, Column[]>> = {
    clientes: [
      { key: "name", label: "Cliente", render: (item) => <NameCell title={item.name} subtitle={item.user?.email} /> },
      { key: "cpf", label: "CPF" },
      { key: "phone", label: "Telefone" },
      { key: "blocked", label: "Bloqueio", render: (item) => item.blocked ? <StatusBadge value="BLOCKED" /> : <StatusBadge value="ACTIVE" /> }
    ],
    artesaos: [
      { key: "storeName", label: "Loja", render: (item) => <NameCell title={item.storeName} subtitle={item.user?.email} /> },
      { key: "document", label: "Documento" },
      statusColumn(),
      { key: "blocked", label: "Bloqueio", render: (item) => item.blocked ? <StatusBadge value="BLOCKED" /> : <StatusBadge value="OK" /> }
    ],
    produtos: [
      { key: "name", label: "Produto", render: (item) => <ProductCell item={item} /> },
      { key: "seller", label: "Artesão", render: (item) => item.seller?.storeName ?? "Não informado" },
      statusColumn(),
      { key: "stock", label: "Estoque" }
    ],
    pedidos: [
      { key: "id", label: "Pedido", render: (item) => <NameCell title={item.orderCode ?? item.id} subtitle={item.buyer?.email} /> },
      statusColumn(),
      { key: "paymentStatus", label: "Pagamento", render: (item) => <StatusBadge value={item.paymentStatus} /> },
      { key: "total", label: "Total", render: (item) => currency.format(Number(item.total ?? 0)) }
    ],
    avaliacoes: [
      { key: "rating", label: "Nota", render: (item) => `${item.rating} estrelas` },
      { key: "comment", label: "Comentário", render: (item) => <span className="line-clamp-2 max-w-xs">{item.comment}</span> },
      { key: "hidden", label: "Visibilidade", render: (item) => item.hidden ? <StatusBadge value="HIDDEN" /> : <StatusBadge value="VISIBLE" /> }
    ],
    categorias: [
      { key: "name", label: "Categoria" },
      { key: "slug", label: "Slug" },
      { key: "active", label: "Status", render: (item) => item.active ? <StatusBadge value="ACTIVE" /> : <StatusBadge value="INACTIVE" /> },
      { key: "_count", label: "Produtos", render: (item) => item._count?.products ?? 0 }
    ],
    assinaturas: [
      statusColumn(),
      { key: "artisan", label: "Artesão", render: (item) => item.artisan?.storeName ?? item.artisan?.user?.email },
      { key: "startDate", label: "Início", render: (item) => formatDate(item.startDate) },
      { key: "expirationDate", label: "Expiração", render: (item) => formatDate(item.expirationDate) }
    ],
    repasses: [
      statusColumn(),
      { key: "artisan", label: "Artesão", render: (item) => item.artisan?.storeName ?? item.artisan?.user?.email },
      { key: "saleAmount", label: "Venda", render: (item) => currency.format(Number(item.saleAmount ?? 0)) },
      { key: "availableAmount", label: "Disponível", render: (item) => currency.format(Number(item.availableAmount ?? 0)) }
    ],
    pagamentos: [
      { key: "type", label: "Tipo" },
      statusColumn(),
      { key: "amount", label: "Valor", render: (item) => currency.format(Number(item.amount ?? 0)) },
      { key: "description", label: "Descrição" }
    ]
  };
  return map[section] ?? [];
}

function NameCell({ title, subtitle }: { title?: string; subtitle?: string }) {
  return <div><strong className="block text-kriar-contrast">{title ?? "Sem nome"}</strong>{subtitle && <span className="text-xs text-kriar-muted">{subtitle}</span>}</div>;
}

function ProductCell({ item }: { item: any }) {
  return <div className="flex items-center gap-3"><img src={productImageUrl(item)} className="h-12 w-12 rounded-xl object-cover" alt="" loading="lazy" decoding="async" onError={handleImageError} /><NameCell title={item.name} subtitle={item.category?.name} /></div>;
}

function StatusBadge({ value }: { value?: string | boolean | null }) {
  const text = String(value ?? "UNKNOWN");
  const positive = ["ACTIVE", "APPROVED", "PAID", "DELIVERED", "VISIBLE", "OK"].includes(text);
  const warning = ["PENDING", "CREATED", "AWAITING_PAYMENT", "IN_PRODUCTION", "BLOCKED", "TRIAL_ACTIVE"].includes(text);
  const tone = positive ? "bg-kriar-primary/10 text-kriar-primary" : warning ? "bg-kriar-secondary/10 text-kriar-secondary" : "bg-red-50 text-red-700";
  return <span className={`badge ${tone}`}>{statusLabel(text)}</span>;
}

function displayValue(item: any, key: string) {
  const value = item[key] ?? item.user?.[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (key.toLowerCase().includes("date") || key === "createdAt") return formatDate(value);
  return String(value);
}

function primaryLabel(item: any) {
  return item.name ?? item.storeName ?? item.orderCode ?? item.product?.name ?? item.user?.name ?? item.id ?? "Registro";
}

function labelForFilter(key: string) {
  const labels: Record<string, string> = { q: "Busca", status: "Status", blocked: "Bloqueio", rating: "Nota", productId: "Produto", customerId: "Cliente", categoryId: "Categoria", sellerId: "Artesão" };
  return labels[key] ?? key;
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Ativo",
    APPROVED: "Aprovado",
    PENDING: "Pendente",
    REJECTED: "Recusado",
    INACTIVE: "Inativo",
    SOLD_OUT: "Esgotado",
    BLOCKED: "Bloqueado",
    OK: "Regular",
    CREATED: "Criado",
    AWAITING_PAYMENT: "Aguardando pagamento",
    PAID: "Pago",
    IN_PRODUCTION: "Em produção",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
    PAYMENT_REJECTED: "Pagamento recusado",
    REFUNDED: "Reembolsado",
    VISIBLE: "Visível",
    HIDDEN: "Oculta",
    TRIAL_ACTIVE: "Trial",
    EXPIRED: "Expirada",
    AVAILABLE: "Disponível"
  };
  return labels[value] ?? value;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return dateFormat.format(date);
}
