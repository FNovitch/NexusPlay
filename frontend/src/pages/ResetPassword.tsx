import { KeyRound } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PasswordField } from "../components/PasswordField";
import { isStrongPassword, parseApiError } from "../lib/artisanForm";
import { resetCustomerPassword } from "../services/customers";
import { useToast } from "../store/toast";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const showToast = useToast((state) => state.show);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Token de recuperação ausente.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Use uma senha com 8 caracteres, maiúscula, minúscula, número e caractere especial.");
      return;
    }
    if (password !== confirmPassword) {
      setError("A confirmação deve ser igual à nova senha.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const response = await resetCustomerPassword(token, password, confirmPassword);
      setMessage(response.message);
      showToast({ title: "Senha alterada", description: "Entre com sua nova senha.", variant: "success" });
      window.setTimeout(() => navigate("/cliente/login"), 1200);
    } catch (requestError) {
      const parsed = parseApiError(requestError);
      setError(parsed.errors.token ?? parsed.errors.password ?? parsed.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell grid min-h-[68vh] place-items-center py-12">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <p className="eyebrow mb-2">Cliente</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-normal text-nexus-contrast">Criar nova senha</h1>
        <p className="mt-3 text-sm leading-6 text-nexus-muted">Sua nova senha precisa ser forte para proteger compras, pedidos e avaliações.</p>
        {message && <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div>}
        {error && <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</div>}
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-nexus-contrast">Nova senha</span>
          <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-nexus-contrast">Confirmar nova senha</span>
          <PasswordField value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <button className="btn-primary mt-5 w-full" disabled={loading}>
          <KeyRound className="h-5 w-5" /> {loading ? "Salvando..." : "Alterar senha"}
        </button>
        <Link to="/esqueci-minha-senha" className="mt-4 block text-center text-sm font-bold text-nexus-primary">Solicitar novo link</Link>
      </form>
    </main>
  );
}
