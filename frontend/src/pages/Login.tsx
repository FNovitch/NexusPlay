import { LogIn, ShieldCheck, Store, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

export function Login() {
  const [email, setEmail] = useState("cliente@kriar.com");
  const [password, setPassword] = useState("Kriar@12345");
  const [loading, setLoading] = useState(false);
  const login = useAuth((state) => state.login);
  const showToast = useToast((state) => state.show);
  const navigate = useNavigate();
  const accountTypes: Array<[LucideIcon, string]> = [
    [UserRound, "Cliente"],
<<<<<<< HEAD
    [Store, "Artesao"],
=======
    [Store, "Vendedor"],
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
    [ShieldCheck, "Admin"]
  ];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    showToast({ title: "Login realizado", description: "Bem-vindo à KRIAR.", variant: "success" });
    navigate("/");
  }

  return (
    <main className="app-shell grid min-h-[70vh] gap-8 py-12 lg:grid-cols-[1fr_440px]">
      <section className="flex flex-col justify-center">
        <p className="eyebrow mb-3">Conta KRIAR</p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-kriar-contrast md:text-5xl">
          Entre para comprar, vender e acompanhar pedidos.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-kriar-muted">
<<<<<<< HEAD
          A conta KRIAR usa JWT no backend, senhas com bcrypt e permissões para cliente, artesao e admin.
=======
          A conta KRIAR usa JWT no backend, senhas com bcrypt e permissões para cliente, vendedor e admin.
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
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
        <h2 className="mb-5 text-2xl font-black tracking-tight text-kriar-primary">Acessar conta</h2>
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
<<<<<<< HEAD
          <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setEmail("atelie@kriar.com")}>Usar demo artesao</button>
=======
          <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setEmail("atelie@kriar.com")}>Usar demo vendedor</button>
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
          <button type="button" className="min-h-11 rounded-full px-4 py-2 text-left font-bold text-kriar-muted transition duration-[250ms] hover:bg-kriar-primary/10 hover:text-kriar-primary" onClick={() => setEmail("admin@kriar.com")}>Usar demo admin</button>
        </div>
      </form>
    </main>
  );
}
