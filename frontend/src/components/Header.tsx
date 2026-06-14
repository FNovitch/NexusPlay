import { Boxes, Heart, LogOut, Menu, Search, ShoppingBag, Sparkles, Store, UserRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { products } from "../data/mock";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import { handleImageError } from "../utils/media";
import { Brand } from "./Brand";

export function Header() {
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const openCart = useCart((state) => state.open);
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlist((state) => state.ids.length);
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return products.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [query]);

  const accountPath = user?.role === "ADMIN" ? "/admin/dashboard" : user?.role === "ARTISAN" ? "/vendedor" : user?.role === "CUSTOMER" ? "/cliente" : "/login";
  const accountLabel = user ? "Minha Conta" : "Entrar";

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
    setQuery("");
    setMenu(false);
  }

  function goToProducts() {
    setMenu(false);
    if (window.location.pathname !== "/") {
      navigate("/#produtos");
      return;
    }
    window.history.replaceState(null, "", "/#produtos");
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition duration-200 ${
      isActive ? "bg-nexus-paper text-nexus-contrast" : "text-nexus-muted hover:bg-nexus-paper hover:text-nexus-contrast"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-nexus-line bg-white/92 backdrop-blur-xl">
      <div className="app-shell flex items-center gap-3 py-3 lg:gap-5">
        <Brand />

        <nav className="hidden items-center gap-1 lg:flex">
          <button type="button" className={navClass({ isActive: false })} onClick={goToProducts}>
            Catálogo
          </button>
          <NavLink className={navClass} to="/marcas">
            Marcas
          </NavLink>
          <NavLink className={navClass} to={user?.role === "ARTISAN" ? "/vendedor" : "/vendedor/cadastro"}>
            Vender Produtos
          </NavLink>
        </nav>

        <form onSubmit={submitSearch} className="relative hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field w-full border-transparent bg-nexus-paper pl-10 shadow-none focus:border-nexus-line focus:bg-white"
            placeholder="Buscar periféricos, colecionáveis e acessórios"
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-nexus-line bg-nexus-surface shadow-card">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/produto/${item.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-nexus-paper"
                  onClick={() => setQuery("")}
                >
                  <img
                    src={productImageUrl(item)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <span className="font-semibold text-nexus-contrast">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button className="btn-icon relative" aria-label="Favoritos">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && <Counter value={wishlistCount} />}
          </button>
          <button onClick={openCart} className="btn-icon relative" aria-label="Carrinho">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && <Counter value={cartCount} />}
          </button>
          <div className="relative">
            <button onClick={() => setAccountOpen((open) => !open)} className="btn-icon" aria-label={accountLabel} aria-expanded={accountOpen}>
              <UserRound className="h-5 w-5" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-nexus-line bg-nexus-surface p-2 shadow-card">
                <div className="border-b border-nexus-line px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-nexus-muted">{user ? "Conta Conectada" : "Conta NexusPlay"}</p>
                  <strong className="mt-1 block truncate text-sm font-semibold text-nexus-contrast">{user?.name ?? "Entre para Continuar"}</strong>
                </div>
                <div className="grid py-2 text-sm font-medium">
                  <AccountLink to={accountPath} onClick={() => setAccountOpen(false)}>{user ? "Minha Conta" : "Entrar"}</AccountLink>
                  {!user && <AccountLink to="/cliente/cadastro" onClick={() => setAccountOpen(false)}>Criar Conta</AccountLink>}
                  {user?.role === "CUSTOMER" && <AccountLink to="/meus-pedidos" onClick={() => setAccountOpen(false)}>Meus Pedidos</AccountLink>}
                  {user?.role === "ARTISAN" && <AccountLink to="/vendedor" onClick={() => setAccountOpen(false)}>Meus Produtos</AccountLink>}
                  {user?.role === "ADMIN" && <AccountLink to="/admin/dashboard" onClick={() => setAccountOpen(false)}>Painel Administrativo</AccountLink>}
                  {user && (
                    <button
                      className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-red-600 transition hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                        navigate("/");
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setMenu((open) => !open)} className="btn-icon lg:hidden" aria-label="Menu">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="border-t border-nexus-line bg-nexus-surface shadow-soft">
          <div className="app-shell grid gap-4 py-4 lg:grid-cols-[1fr_auto]">
            <form onSubmit={submitSearch} className="flex gap-2 md:hidden">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input-field min-w-0 flex-1"
                placeholder="Buscar Produtos"
              />
              <button className="btn-primary px-4" aria-label="Buscar">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <nav className="grid gap-1 text-sm font-medium sm:grid-cols-2 lg:flex lg:items-center">
              <button type="button" className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-left text-nexus-muted transition duration-200 hover:bg-nexus-paper hover:text-nexus-contrast" onClick={goToProducts}><Boxes className="h-4 w-4" /> Catálogo</button>
              <MenuLink icon={Store} to="/marcas" onClick={() => setMenu(false)}>Marcas</MenuLink>
              <MenuLink icon={UserRound} to={accountPath} onClick={() => setMenu(false)}>{accountLabel}</MenuLink>
              <button className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-left text-nexus-muted transition duration-200 hover:bg-nexus-paper hover:text-nexus-contrast" onClick={() => { openCart(); setMenu(false); }}><ShoppingBag className="h-4 w-4" /> Carrinho</button>
              <span className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-nexus-muted"><Heart className="h-4 w-4" /> Favoritos</span>
              {user?.role === "CUSTOMER" && <MenuLink to="/meus-pedidos" onClick={() => setMenu(false)}>Meus Pedidos</MenuLink>}
              {!user && <MenuLink to="/cliente/cadastro" onClick={() => setMenu(false)}>Criar Conta</MenuLink>}
              <MenuLink icon={Sparkles} to={user?.role === "ARTISAN" ? "/vendedor" : "/vendedor/cadastro"} onClick={() => setMenu(false)}>
                {user?.role === "ARTISAN" ? "Meus Produtos" : "Vender Produtos"}
              </MenuLink>
              {user?.role === "ARTISAN" && <MenuLink to="/vendedor/assinatura" onClick={() => setMenu(false)}>Assinatura</MenuLink>}
              {user?.role === "ADMIN" && <MenuLink to="/admin/dashboard" onClick={() => setMenu(false)}>Painel Administrativo</MenuLink>}
              {user && <button className="flex min-h-10 items-center rounded-lg px-3 py-2 text-left text-red-600 transition duration-200 hover:bg-red-50" onClick={() => { logout(); setMenu(false); navigate("/"); }}>Sair</button>}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function Counter({ value }: { value: number }) {
  return <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-nexus-secondary px-1 text-[10px] font-semibold text-white">{value}</span>;
}

function MenuLink({ to, onClick, children, icon: Icon }: { to: string; onClick: () => void; children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <Link className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-nexus-muted transition duration-200 hover:bg-nexus-paper hover:text-nexus-contrast" onClick={onClick} to={to}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}

function AccountLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link className="rounded-lg px-3 py-2 text-nexus-muted transition hover:bg-nexus-paper hover:text-nexus-contrast" onClick={onClick} to={to}>
      {children}
    </Link>
  );
}
