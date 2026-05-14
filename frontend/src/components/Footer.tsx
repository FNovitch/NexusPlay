import { Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-kriar-line/80 bg-kriar-surface/70">
      <div className="app-shell grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link to="/" className="inline-flex rounded-[20px] transition duration-[250ms] hover:opacity-90" aria-label="KRIAR início">
            <img
              src="/brand/kriar-logo.png"
              alt="KRIAR - Onde a arte encontra o futuro"
              className="h-16 w-auto max-w-[240px] object-contain"
            />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-kriar-muted">
            Marketplace para produtos artesanais com curadoria, pagamento seguro e lojas autorais brasileiras.
          </p>
        </div>

        <nav className="grid gap-2 text-sm">
          <strong className="mb-1 text-kriar-contrast">Explorar</strong>
          <Link className="text-kriar-muted hover:text-kriar-primary" to="/">Produtos</Link>
          <Link className="text-kriar-muted hover:text-kriar-primary" to="/artesaos">Artesãos</Link>
          <Link className="text-kriar-muted hover:text-kriar-primary" to="/vendedor">Vender na KRIAR</Link>
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
      <div className="border-t border-kriar-line/70 py-4 text-center text-xs text-kriar-muted">
        KRIAR © 2026. Experiência demonstrativa para marketplace artesanal.
      </div>
    </footer>
  );
}
