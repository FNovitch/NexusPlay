import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { productImageUrl } from "../api/products";
import { products } from "../data/mock";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import { Brand } from "./Brand";

export function Header() {
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const openCart = useCart((state) => state.open);
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlist((state) => state.ids.length);
  const user = useAuth((state) => state.user);
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return products.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [query]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/");
    }
    setQuery("");
    setMenu(false);
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold transition duration-[250ms] ${
      isActive ? "bg-kriar-primary text-kriar-light" : "text-kriar-muted hover:bg-kriar-primary/10 hover:text-kriar-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-kriar-line/80 bg-kriar-paper/90 backdrop-blur-xl">
      <div className="app-shell flex items-center gap-4 py-3">
        <Brand />

        <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kriar-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field w-full pl-11"
            placeholder="Buscar cerâmica, joias, decoração..."
          />
          {suggestions.length > 0 && (
            <div className="absolute mt-2 w-full overflow-hidden rounded-[20px] border border-kriar-line bg-kriar-surface shadow-lift">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/produto/${item.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-kriar-primary/5"
                  onClick={() => setQuery("")}
                >
                  <img src={productImageUrl(item)} alt="" className="h-11 w-11 rounded-xl object-cover" />
                  <span className="font-semibold text-kriar-contrast">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink className={navClass} to="/artesaos">
            Artesãos
          </NavLink>
          <NavLink className={navClass} to={user?.role === "CUSTOMER" ? "/cliente" : "/cliente/login"}>
            {user?.role === "CUSTOMER" ? "Area do cliente" : "Entrar como cliente"}
          </NavLink>
          {user?.role === "CUSTOMER" && <NavLink className={navClass} to="/meus-pedidos">Pedidos</NavLink>}
          {!user && (
            <NavLink className={navClass} to="/cliente/cadastro">
              Criar conta
            </NavLink>
          )}
          <NavLink className={navClass} to="/artesao/cadastro">
            Sou artesao
          </NavLink>
          <NavLink className={navClass} to={user?.role === "ARTISAN" ? "/vendedor" : "/artesao/login"}>
            {user?.role === "ARTISAN" ? "Dashboard do artesao" : "Entrar como artesao"}
          </NavLink>
          {user?.role === "ARTISAN" && <NavLink className={navClass} to="/artesao/assinatura">Assinatura</NavLink>}
          <NavLink className={navClass} to={user?.role === "ADMIN" ? "/admin/dashboard" : "/admin/login"}>
            Admin
          </NavLink>
        </nav>

        <button className="btn-icon relative" aria-label="Favoritos">
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-kriar-secondary px-1 text-[11px] font-black text-white">{wishlistCount}</span>}
        </button>
        <button onClick={openCart} className="btn-icon relative" aria-label="Carrinho">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-kriar-secondary px-1 text-[11px] font-black text-white">{cartCount}</span>}
        </button>
        <Link to={user?.role === "CUSTOMER" ? "/cliente" : "/cliente/login"} className="btn-icon hidden md:grid" aria-label="Minha conta">
          <UserRound className="h-5 w-5" />
        </Link>
        <button onClick={() => setMenu((open) => !open)} className="btn-icon md:hidden" aria-label="Menu">
          {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menu && (
        <div className="border-t border-kriar-line bg-kriar-surface/95 px-4 py-4 shadow-soft md:hidden">
          <form onSubmit={submitSearch} className="mb-3 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input-field flex-1"
              placeholder="Buscar produtos"
            />
            <button className="btn-primary px-4" aria-label="Buscar">
              <Search className="h-4 w-4" />
            </button>
          </form>
          <div className="grid gap-1 text-sm font-bold">
            <Link className="flex min-h-11 items-center rounded-full px-4 py-2 text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setMenu(false)} to="/artesaos">Artesãos</Link>
            <Link className="flex min-h-11 items-center rounded-full px-4 py-2 text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setMenu(false)} to={user?.role === "CUSTOMER" ? "/cliente" : "/cliente/login"}>{user?.role === "CUSTOMER" ? "Area do cliente" : "Entrar como cliente"}</Link>
            {!user && <Link className="flex min-h-11 items-center rounded-full px-4 py-2 text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setMenu(false)} to="/cliente/cadastro">Cadastrar como cliente</Link>}
            <Link className="flex min-h-11 items-center rounded-full px-4 py-2 text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setMenu(false)} to="/artesao/cadastro">Cadastrar como artesao</Link>
            <Link className="flex min-h-11 items-center rounded-full px-4 py-2 text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setMenu(false)} to={user?.role === "ARTISAN" ? "/vendedor" : "/artesao/login"}>{user?.role === "ARTISAN" ? "Dashboard do artesao" : "Entrar como artesao"}</Link>
            <Link className="flex min-h-11 items-center rounded-full px-4 py-2 text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setMenu(false)} to={user?.role === "CUSTOMER" ? "/cliente" : "/cliente/login"}>{user ? user.name : "Minha conta"}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
