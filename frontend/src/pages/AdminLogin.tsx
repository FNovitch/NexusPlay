import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/admin";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

export function AdminLogin() {
  const [email, setEmail] = useState("admin@kriar.com");
  const [password, setPassword] = useState("Admin@123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setSession = useAuth((state) => state.setSession);
  const showToast = useToast((state) => state.show);
  const navigate = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await adminLogin(email, password);
      setSession(data.token, data.user);
      showToast({ title: "Admin conectado", description: "Bem-vindo ao painel administrativo.", variant: "success" });
      navigate("/admin/dashboard");
    } catch {
      setError("E-mail ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-kriar-primary/10 text-kriar-primary"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="text-2xl font-black text-kriar-contrast">Entrar no painel</h1>
          </div>
        </div>
        {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
        <input className="input-field mb-3 w-full" type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="input-field mb-5 w-full" type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
