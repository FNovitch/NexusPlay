import { MailCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { parseApiError } from "../lib/artisanForm";
import { requestCustomerPasswordReset } from "../services/customers";
import { useToast } from "../store/toast";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const showToast = useToast((state) => state.show);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const response = await requestCustomerPasswordReset(email.trim());
      setMessage(response.message);
      showToast({ title: "Verifique seu e-mail", description: response.message, variant: "success" });
    } catch (requestError) {
      const parsed = parseApiError(requestError);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell grid min-h-[68vh] place-items-center py-12">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <p className="eyebrow mb-2">Cliente</p>
        <h1 className="text-3xl font-semibold tracking-normal text-nexus-contrast">Esqueci minha senha</h1>
        <p className="mt-3 text-sm leading-6 text-nexus-muted">Informe o e-mail da sua conta para receber um link de recuperacao.</p>
        {message && <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div>}
        {error && <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</div>}
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-nexus-contrast">E-mail</span>
          <input className="input-field w-full" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <button className="btn-primary mt-5 w-full" disabled={loading}>
          <MailCheck className="h-5 w-5" /> {loading ? "Enviando..." : "Enviar instrucoes"}
        </button>
        <Link to="/cliente/login" className="mt-4 block text-center text-sm font-bold text-nexus-primary">Voltar para o login de cliente</Link>
      </form>
    </main>
  );
}
