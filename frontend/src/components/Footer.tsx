import { Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../store/cart";
import { Brand } from "./Brand";

export function Footer() {
  const openCart = useCart((state) => state.open);

  return (
    <footer className="mt-10 border-t border-nexus-line bg-white">
      <div className="app-shell grid gap-8 py-10 md:grid-cols-[1.35fr_0.7fr_0.8fr_0.8fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-sm text-sm leading-6 text-nexus-muted">
            SaaS demonstrativo de Marketplace Gamer com Catálogo, Lojas, Carrinho, Checkout, Pedidos e Painel de Vendedor.
          </p>
        </div>

        <nav className="grid content-start gap-2 text-sm">
          <strong className="mb-1 text-sm font-semibold text-nexus-contrast">Comprar</strong>
          <Link className="text-nexus-muted hover:text-nexus-contrast" to="/#produtos">Catálogo</Link>
          <Link className="text-nexus-muted hover:text-nexus-contrast" to="/marcas">Marcas</Link>
          <button className="w-max text-left text-nexus-muted hover:text-nexus-contrast" type="button" onClick={openCart}>Abrir Carrinho</button>
        </nav>

        <nav className="grid content-start gap-2 text-sm">
          <strong className="mb-1 text-sm font-semibold text-nexus-contrast">Vender</strong>
          <Link className="text-nexus-muted hover:text-nexus-contrast" to="/vendedor/cadastro">Cadastrar Loja</Link>
          <Link className="text-nexus-muted hover:text-nexus-contrast" to="/vendedor">Painel</Link>
        </nav>

        <div className="grid content-start gap-2 text-sm">
          <strong className="mb-1 text-sm font-semibold text-nexus-contrast">Contato</strong>
          <a className="inline-flex items-center gap-2 text-nexus-muted hover:text-nexus-contrast" href="mailto:contato@nexusplay.demo">
            <Mail className="h-4 w-4" /> contato@nexusplay.demo
          </a>
          <a className="inline-flex items-center gap-2 text-nexus-muted hover:text-nexus-contrast" href="https://instagram.com" target="_blank" rel="noreferrer">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        </div>
      </div>
      <div className="border-t border-nexus-line py-4 text-center text-xs text-nexus-muted">
        NexusPlay © 2026. Projeto demonstrativo de Marketplace Gamer para portfólio.
      </div>
    </footer>
  );
}
