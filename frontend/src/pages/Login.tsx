import { LogIn, Store, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const showToast = useToast((state) => state.show);
  const navigate = useNavigate();
  const accountTypes: Array<[LucideIcon, string]> = [
    [UserRound, "Cliente"],
    [Store, "Vendedor"]
  ];

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
        showToast({ title: "Login realizado", description: "Bem-vindo ao painel administrativo.", variant: "success" });
        navigate("/admin/dashboard");
      } else if (user.role === "ARTISAN") {
        showToast({ title: "Login realizado", description: "Bem-vindo ao painel do vendedor.", variant: "success" });
        navigate("/vendedor");
      } else {
        showToast({ title: "Login realizado", description: "Bem-vindo à KRIAR.", variant: "success" });
        navigate("/cliente");
      }
    } catch (requestError: unknown) {
      const parsed = parseApiError(requestError);
      const description = parsed.message || "Confira seu e-mail e sua senha.";
      setMessage(description);
      showToast({ title: "Não foi possível entrar", description, variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell grid min-h-[70vh] gap-8 py-12 lg:grid-cols-[1fr_440px]">
      <section className="flex flex-col justify-center">
        <p className="eyebrow mb-3">{artisanMode ? "Área do vendedor" : "Conta KRIAR"}</p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-kriar-contrast md:text-5xl">
          {artisanMode ? "Entre para gerenciar sua loja, seus produtos e seus pedidos." : "Entre para comprar e acompanhar seus pedidos."}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-kriar-muted">
          {artisanMode
            ? "Use seu e-mail e sua senha para acessar o painel do vendedor."
            : "Use o acesso de cliente para comprar, acompanhar pedidos, confirmar recebimento e avaliar produtos."}
        </p>
        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {accountTypes.map(([Icon, label]) => (
            <div key={String(label)} className="panel-soft p-4">
              <Icon className="mb-2 h-5 w-5 text-kriar-primary" />
              <strong className="text-sm text-kriar-contrast">{String(label)}</strong>
            </div>
          ))}
        </div>
      </section>
      <form onSubmit={submit} className="panel h-max p-6">
        <h2 className="mb-5 text-2xl font-black tracking-tight text-kriar-primary">{artisanMode ? "Entrar como vendedor" : "Entrar"}</h2>
        {message && <div className="mb-4 rounded-xl border border-kriar-line bg-kriar-background px-4 py-3 text-sm font-bold text-kriar-contrast">{message}</div>}
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-black text-kriar-contrast">E-mail</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="input-field w-full" />
        </label>
        <label className="mb-5 block">
          <span className="mb-1.5 block text-sm font-black text-kriar-contrast">Senha</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-field w-full" />
        </label>
        {!artisanMode && <Link to="/esqueci-minha-senha" className="mb-4 block text-right text-sm font-bold text-kriar-primary">Esqueci minha senha</Link>}
        <button disabled={loading} className="btn-primary w-full">
          <LogIn className="h-5 w-5" /> {loading ? "Entrando..." : "Entrar"}
        </button>
        <div className="mt-4 grid gap-2 text-sm">
          {artisanMode ? (
            <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-primary transition duration-[250ms] hover:bg-kriar-primary/10" onClick={() => navigate("/artesao/cadastro")}>
              Cadastrar como vendedor
            </button>
          ) : (
            <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-primary transition duration-[250ms] hover:bg-kriar-primary/10" onClick={() => navigate("/cliente/cadastro")}>
              Criar conta de cliente
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
