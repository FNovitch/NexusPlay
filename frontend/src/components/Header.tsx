import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
    navigate(`/?q=${encodeURIComponent(query)}`);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-kriar-support/30 bg-kriar-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Brand />

        <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kriar-primary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-kriar-support/50 bg-white pl-11 pr-4 text-sm shadow-sm transition focus:border-kriar-primary"
            placeholder="Buscar ceramica, joias, decoracao..."
          />
          {suggestions.length > 0 && (
            <div className="absolute mt-2 w-full overflow-hidden rounded-lg border border-kriar-support/30 bg-white shadow-soft">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/produto/${item.slug}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-kriar-support/20"
                  onClick={() => setQuery("")}
                >
                  <img src={item.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-kriar-support/20" to="/artesaos">
            Artesaos
          </NavLink>
          <NavLink className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-kriar-support/20" to="/vendedor">
            Vender
          </NavLink>
          <NavLink className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-kriar-support/20" to="/admin">
            Admin
          </NavLink>
        </nav>

        <button className="relative rounded-lg p-2 text-kriar-primary hover:bg-kriar-support/20" aria-label="Favoritos">
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-kriar-secondary px-1.5 text-xs text-white">{wishlistCount}</span>}
        </button>
        <button onClick={openCart} className="relative rounded-lg p-2 text-kriar-primary hover:bg-kriar-support/20" aria-label="Carrinho">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-kriar-secondary px-1.5 text-xs text-white">{cartCount}</span>}
        </button>
        <Link to="/login" className="hidden rounded-lg p-2 text-kriar-primary hover:bg-kriar-support/20 md:block" aria-label="Minha conta">
          <UserRound className="h-5 w-5" />
        </Link>
        <button onClick={() => setMenu((open) => !open)} className="rounded-lg p-2 text-kriar-primary md:hidden" aria-label="Menu">
          {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menu && (
        <div className="border-t border-kriar-support/30 px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="mb-3 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 flex-1 rounded-lg border border-kriar-support/50 px-3"
              placeholder="Buscar produtos"
            />
            <button className="rounded-lg bg-kriar-primary px-4 text-white">
              <Search className="h-4 w-4" />
            </button>
          </form>
          <div className="grid gap-2 text-sm font-semibold">
            <Link to="/artesaos">Artesaos</Link>
            <Link to="/vendedor">Vender na KRIAR</Link>
            <Link to="/login">{user ? user.name : "Entrar"}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
