import { Boxes, Gamepad2, LogIn, PackageCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PasswordField } from "../components/PasswordField";
import { demoMode } from "../config/env";
import { demoCredentials } from "../data/demoOrders";
import { parseApiError } from "../lib/artisanForm";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

type LoginProps = {
  artisanMode?: boolean;
};

export function Login({ artisanMode = false }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const login = useAuth((state) => state.login);
  const setSession = useAuth((state) => state.setSession);
  const showToast = useToast((state) => state.show);
  const navigate = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!email.trim() || !password) {
      setMessage("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") {
        showToast({ title: "Login Realizado", description: "Bem-vindo ao Painel Administrativo.", variant: "success" });
        navigate("/admin/dashboard");
      } else if (user.role === "ARTISAN") {
        showToast({ title: "Login Realizado", description: "Bem-vindo ao Painel da Loja.", variant: "success" });
        navigate("/vendedor");
      } else {
        showToast({ title: "Login Realizado", description: "Bem-vindo à NexusPlay.", variant: "success" });
        navigate("/cliente");
      }
    } catch (requestError: unknown) {
      const parsed = parseApiError(requestError);
      const description = parsed.message || "Confira seu e-mail e sua senha.";
      setMessage(description);
      showToast({ title: "Não Foi Possível Entrar", description, variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  function enterDemo(role: "CUSTOMER" | "ARTISAN") {
    const session = demoCredentials(role);
    setSession(session.token, session.user);
    showToast({
      title: "Demo Iniciada",
      description: role === "ARTISAN" ? "Painel da Loja carregado com dados fictícios." : "Conta Cliente carregada para simular pedidos.",
      variant: "success"
    });
    navigate(role === "ARTISAN" ? "/vendedor" : "/");
  }

  return (
    <main className="app-shell grid min-h-[72vh] gap-8 py-12 lg:grid-cols-[1fr_420px] lg:items-center">
      <section>
        <img
          src="/brand/nexusplay-logo.png"
          alt="NexusPlay"
          className="mb-6 h-14 w-auto max-w-[260px] object-contain"
          decoding="async"
        />
        <p className="eyebrow mb-3">{artisanMode ? "Área da loja" : "Conta NexusPlay"}</p>
        <h1 className="display-title max-w-2xl text-6xl text-nexus-contrast sm:text-7xl">
          {artisanMode ? "Gerencie sua loja gamer com clareza." : "Acesse a experiência NexusPlay."}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-nexus-muted">
          {artisanMode
            ? "Use suas credenciais reais ou carregue a conta demo para revisar produtos, pedidos e métricas."
            : "Use sua conta ou carregue a demo de cliente para testar compra, checkout e acompanhamento de pedidos."}
        </p>
        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {[
            { label: "Catálogo", icon: Boxes },
            { label: "Pedidos", icon: PackageCheck },
            { label: "Setup", icon: Gamepad2 }
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex min-h-20 items-center gap-3 rounded-lg border border-nexus-line bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-nexus-paper text-nexus-secondary">
                <Icon className="h-5 w-5" />
              </span>
              <strong className="text-sm font-semibold text-nexus-contrast">{label}</strong>
            </div>
          ))}
        </div>
      </section>
      <form onSubmit={submit} className="panel h-max p-6">
        <h2 className="mb-5 text-xl font-semibold tracking-normal text-nexus-contrast">{artisanMode ? "Entrar como vendedor" : "Entrar"}</h2>
        {message && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{message}</div>}
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-nexus-contrast">E-mail</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="input-field w-full" />
        </label>
        <label className="mb-5 block">
          <span className="mb-1.5 block text-sm font-medium text-nexus-contrast">Senha</span>
          <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {!artisanMode && <Link to="/esqueci-minha-senha" className="mb-4 block text-right text-sm font-medium text-nexus-secondary">Esqueci minha senha</Link>}
        <button disabled={loading} className="btn-primary w-full">
          <LogIn className="h-5 w-5" /> {loading ? "Entrando..." : "Entrar"}
        </button>
        {demoMode && (
          <button type="button" className="btn-secondary mt-3 w-full" onClick={() => enterDemo(artisanMode ? "ARTISAN" : "CUSTOMER")}>
            Usar conta demo
          </button>
        )}
        <div className="mt-4 grid gap-2 text-sm">
          {artisanMode ? (
            <button type="button" className="min-h-10 rounded-lg px-3 py-2 text-left font-medium text-nexus-secondary transition duration-200 hover:bg-nexus-paper" onClick={() => navigate("/vendedor/cadastro")}>
              Cadastrar loja
            </button>
          ) : (
            <button type="button" className="min-h-10 rounded-lg px-3 py-2 text-left font-medium text-nexus-secondary transition duration-200 hover:bg-nexus-paper" onClick={() => navigate("/cliente/cadastro")}>
              Criar conta
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
