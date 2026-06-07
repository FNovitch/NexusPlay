import { BadgeCheck, CreditCard, Instagram, Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../store/cart";

export function Footer() {
  const openCart = useCart((state) => state.open);

  return (
    <footer className="mt-10 border-t border-kriar-line/80 bg-kriar-surface/80">
      <div className="app-shell grid gap-8 py-9 md:grid-cols-[1.25fr_0.7fr_0.8fr_0.8fr]">
        <div>
          <Link to="/" className="inline-flex rounded-2xl transition duration-[250ms] hover:opacity-90" aria-label="KRIAR início">
            <img
              src="/brand/kriar-logo.png"
              alt="KRIAR - Onde a arte encontra o futuro"
              loading="lazy"
              decoding="async"
              className="h-12 w-auto max-w-[190px] object-contain"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-kriar-muted">
            Marketplace artesanal com curadoria, pagamento seguro e lojas autorais brasileiras.
          </p>
        </div>

        <nav className="grid gap-2 text-sm">
          <strong className="mb-1 text-kriar-contrast">Comprar</strong>
          <Link className="text-kriar-muted hover:text-kriar-primary" to="/#produtos">Produtos</Link>
          <Link className="text-kriar-muted hover:text-kriar-primary" to="/artesaos">Artesãos</Link>
          <button className="w-max text-left text-kriar-muted hover:text-kriar-primary" type="button" onClick={openCart}>Carrinho</button>
        </nav>

        <nav className="grid content-start gap-2 text-sm">
          <strong className="mb-1 text-kriar-contrast">Vender</strong>
          <Link className="text-kriar-muted hover:text-kriar-primary" to="/artesao/cadastro">Cadastrar loja</Link>
          <Link className="text-kriar-muted hover:text-kriar-primary" to="/vendedor">Painel do vendedor</Link>
        </nav>

        <div className="grid content-start gap-2 text-sm">
          <strong className="mb-1 text-kriar-contrast">Contato</strong>
          <a className="inline-flex items-center gap-2 text-kriar-muted hover:text-kriar-primary" href="mailto:contato@kriar.com">
            <Mail className="h-4 w-4" /> contato@kriar.com
          </a>
          <a className="inline-flex items-center gap-2 text-kriar-muted hover:text-kriar-primary" href="https://instagram.com" target="_blank" rel="noreferrer">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        </div>
      </div>
      <div className="border-t border-kriar-line/70">
        <div className="app-shell grid gap-3 py-4 text-xs font-bold text-kriar-muted sm:grid-cols-3">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-kriar-primary" /> Compra protegida</span>
          <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-kriar-primary" /> Pagamento seguro</span>
          <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-kriar-primary" /> Artesãos avaliados</span>
        </div>
      </div>
      <div className="border-t border-kriar-line/70 py-4 text-center text-xs text-kriar-muted">
        KRIAR © 2026. Experiência demonstrativa para marketplace artesanal.
      </div>
    </footer>
  );
}
