import { LogIn, ShieldCheck, Store, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseApiError } from "../lib/artisanForm";
import { loginArtisan } from "../services/artisans";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

type LoginProps = {
  artisanMode?: boolean;
};

export function Login({ artisanMode = false }: LoginProps) {
  const [email, setEmail] = useState(artisanMode ? "atelie@kriar.com" : "cliente@kriar.com");
  const [password, setPassword] = useState("Kriar@12345");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const login = useAuth((state) => state.login);
  const setSession = useAuth((state) => state.setSession);
  const showToast = useToast((state) => state.show);
  const navigate = useNavigate();
  const accountTypes: Array<[LucideIcon, string]> = [
    [UserRound, "Cliente"],
    [Store, "Artesao"],
    [ShieldCheck, "Admin"]
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
      if (artisanMode) {
        const data = await loginArtisan(email, password);
        setSession(data.token, data.user);
        if (data.user.status === "pendente") {
          showToast({ title: "Cadastro pendente", description: "Seu cadastro ainda aguarda aprovacao.", variant: "warning" });
        } else if (data.user.status === "recusado") {
          showToast({ title: "Cadastro recusado", description: "Atualize seus dados ou fale com o suporte.", variant: "warning" });
        } else {
          showToast({ title: "Login de artesao realizado", description: "Bem-vindo ao seu painel.", variant: "success" });
        }
        navigate("/vendedor");
      } else {
        await login(email, password);
        showToast({ title: "Login realizado", description: "Bem-vindo a KRIAR.", variant: "success" });
        navigate("/cliente");
      }
    } catch (requestError: unknown) {
      const parsed = parseApiError(requestError);
      const description = artisanMode ? parsed.message : "Confira e-mail e senha.";
      setMessage(description);
      showToast({ title: "Nao foi possivel entrar", description, variant: "warning" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell grid min-h-[70vh] gap-8 py-12 lg:grid-cols-[1fr_440px]">
      <section className="flex flex-col justify-center">
        <p className="eyebrow mb-3">{artisanMode ? "Sou artesao" : "Conta KRIAR"}</p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-kriar-contrast md:text-5xl">
          {artisanMode ? "Entre para gerenciar sua loja, produtos e pedidos." : "Entre para comprar, vender e acompanhar pedidos."}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-kriar-muted">
          {artisanMode
            ? "Use o acesso exclusivo de artesao para entrar no dashboard da sua loja."
            : "A conta KRIAR usa JWT no backend, senhas com bcrypt e permissoes para cliente, artesao e admin."}
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
        <h2 className="mb-5 text-2xl font-black tracking-tight text-kriar-primary">{artisanMode ? "Entrar como artesao" : "Acessar conta"}</h2>
        {message && <div className="mb-4 rounded-xl border border-kriar-line bg-kriar-background px-4 py-3 text-sm font-bold text-kriar-contrast">{message}</div>}
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-black text-kriar-contrast">E-mail</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="input-field w-full" />
        </label>
        <label className="mb-5 block">
          <span className="mb-1.5 block text-sm font-black text-kriar-contrast">Senha</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-field w-full" />
        </label>
        <button disabled={loading} className="btn-primary w-full">
          <LogIn className="h-5 w-5" /> {loading ? "Entrando..." : "Entrar"}
        </button>
        <div className="mt-4 grid gap-2 text-sm">
          <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setEmail("atelie@kriar.com")}>
            Usar demo artesao
          </button>
          {!artisanMode && (
            <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setEmail("admin@kriar.com")}>
              Usar demo admin
            </button>
          )}
          {artisanMode && (
            <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-primary transition duration-[250ms] hover:bg-kriar-primary/10" onClick={() => navigate("/artesao/cadastro")}>
              Cadastrar como artesao
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
