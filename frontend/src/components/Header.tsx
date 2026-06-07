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
  const accountLabel = user ? "Minha conta" : "Entrar";

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
    `inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-black transition duration-[250ms] ${
      isActive ? "bg-kriar-primary/10 text-kriar-primary" : "text-kriar-muted hover:bg-kriar-primary/10 hover:text-kriar-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-kriar-line/90 bg-kriar-surface/95 backdrop-blur-xl">
      <div className="app-shell flex items-center gap-3 py-2.5 lg:gap-4">
        <Brand />

        <nav className="hidden items-center gap-1 lg:flex">
          <button type="button" className={navClass({ isActive: false })} onClick={goToProducts}>
            <Boxes className="h-4 w-4" /> Produtos
          </button>
          <NavLink className={navClass} to="/artesaos">
            <Store className="h-4 w-4" /> Artesãos
          </NavLink>
          <NavLink className={navClass} to={user?.role === "ARTISAN" ? "/vendedor" : "/artesao/cadastro"}>
            <Sparkles className="h-4 w-4" /> Vender
          </NavLink>
        </nav>

        <form onSubmit={submitSearch} className="relative hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kriar-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field w-full pl-11"
            placeholder="Buscar produtos artesanais"
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-kriar-line bg-kriar-surface shadow-card">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/produto/${item.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-kriar-primary/5"
                  onClick={() => setQuery("")}
                >
                  <img
                    src={productImageUrl(item)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                  <span className="font-semibold text-kriar-contrast">{item.name}</span>
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
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-kriar-line bg-kriar-surface p-2 shadow-card">
                <div className="border-b border-kriar-line px-3 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-kriar-secondary">{user ? "Conta conectada" : "Conta KRIAR"}</p>
                  <strong className="mt-1 block truncate text-sm text-kriar-contrast">{user?.name ?? "Entre para continuar"}</strong>
                </div>
                <div className="grid py-2 text-sm font-bold">
                  <AccountLink to={accountPath} onClick={() => setAccountOpen(false)}>{user ? "Minha conta" : "Entrar"}</AccountLink>
                  {!user && <AccountLink to="/cliente/cadastro" onClick={() => setAccountOpen(false)}>Criar conta</AccountLink>}
                  {user?.role === "CUSTOMER" && <AccountLink to="/meus-pedidos" onClick={() => setAccountOpen(false)}>Meus pedidos</AccountLink>}
                  {user?.role === "ARTISAN" && <AccountLink to="/vendedor" onClick={() => setAccountOpen(false)}>Meus produtos</AccountLink>}
                  {user?.role === "ADMIN" && <AccountLink to="/admin/dashboard" onClick={() => setAccountOpen(false)}>Painel administrativo</AccountLink>}
                  {user && (
                    <button
                      className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-kriar-secondary transition hover:bg-kriar-secondary/10"
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
        <div className="border-t border-kriar-line bg-kriar-surface/97 shadow-soft">
          <div className="app-shell grid gap-4 py-4 lg:grid-cols-[1fr_auto]">
            <form onSubmit={submitSearch} className="flex gap-2 md:hidden">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input-field min-w-0 flex-1"
                placeholder="Buscar produtos"
              />
              <button className="btn-primary px-4" aria-label="Buscar">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <nav className="grid gap-1 text-sm font-bold sm:grid-cols-2 lg:flex lg:items-center">
              <button type="button" className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-left text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={goToProducts}><Boxes className="h-4 w-4" /> Produtos</button>
              <MenuLink icon={Store} to="/artesaos" onClick={() => setMenu(false)}>Artesãos</MenuLink>
              <MenuLink icon={UserRound} to={accountPath} onClick={() => setMenu(false)}>{accountLabel}</MenuLink>
              <button className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-left text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => { openCart(); setMenu(false); }}><ShoppingBag className="h-4 w-4" /> Carrinho</button>
              <span className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-kriar-muted"><Heart className="h-4 w-4" /> Favoritos</span>
              {user?.role === "CUSTOMER" && <MenuLink to="/meus-pedidos" onClick={() => setMenu(false)}>Meus pedidos</MenuLink>}
              {!user && <MenuLink to="/cliente/cadastro" onClick={() => setMenu(false)}>Criar conta</MenuLink>}
              <MenuLink icon={Sparkles} to={user?.role === "ARTISAN" ? "/vendedor" : "/artesao/cadastro"} onClick={() => setMenu(false)}>
                {user?.role === "ARTISAN" ? "Meus produtos" : "Vender na KRIAR"}
              </MenuLink>
              {user?.role === "ARTISAN" && <MenuLink to="/artesao/assinatura" onClick={() => setMenu(false)}>Assinatura</MenuLink>}
              {user?.role === "ADMIN" && <MenuLink to="/admin/dashboard" onClick={() => setMenu(false)}>Painel administrativo</MenuLink>}
              {user && <button className="flex min-h-11 items-center rounded-full px-4 py-2 text-left text-kriar-secondary transition duration-[250ms] hover:bg-kriar-secondary/10" onClick={() => { logout(); setMenu(false); navigate("/"); }}>Sair</button>}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function Counter({ value }: { value: number }) {
  return <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-kriar-secondary px-1 text-[11px] font-black text-white">{value}</span>;
}

function MenuLink({ to, onClick, children, icon: Icon }: { to: string; onClick: () => void; children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <Link className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={onClick} to={to}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}

function AccountLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link className="rounded-xl px-3 py-2 text-kriar-muted transition hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={onClick} to={to}>
      {children}
    </Link>
  );
}
