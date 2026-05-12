import { LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export function Login() {
  const [email, setEmail] = useState("cliente@kriar.com");
  const [password, setPassword] = useState("Kriar@12345");
  const [loading, setLoading] = useState(false);
  const login = useAuth((state) => state.login);
  const navigate = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    navigate("/");
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_440px]">
      <section className="flex flex-col justify-center">
        <h1 className="text-4xl font-black text-kriar-contrast md:text-5xl">Entre para comprar, vender e acompanhar pedidos.</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-kriar-contrast/70">
          A conta KRIAR usa JWT no backend, senhas com bcrypt e permissoes para cliente, vendedor e admin.
        </p>
      </section>
      <form onSubmit={submit} className="h-max rounded-lg border border-kriar-support/30 bg-white p-5 shadow-soft">
        <h2 className="mb-5 text-2xl font-black text-kriar-primary">Acessar conta</h2>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-bold">E-mail</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border border-kriar-support/50 px-3" />
        </label>
        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-bold">Senha</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-kriar-support/50 px-3" />
        </label>
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-kriar-primary px-4 py-3 font-bold text-white hover:bg-kriar-secondary">
          <LogIn className="h-5 w-5" /> {loading ? "Entrando..." : "Entrar"}
        </button>
        <div className="mt-4 grid gap-1 text-sm text-kriar-contrast/70">
          <button type="button" className="text-left" onClick={() => setEmail("atelie@kriar.com")}>Usar demo vendedor</button>
          <button type="button" className="text-left" onClick={() => setEmail("admin@kriar.com")}>Usar demo admin</button>
        </div>
      </form>
    </main>
  );
}
