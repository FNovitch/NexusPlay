import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAddressByCep, isStrongPassword, isValidCpf, isValidPhone, maskCep, maskDocument, maskPhone, onlyDigits, parseApiError, type FieldErrors } from "../lib/artisanForm";
import { registerCustomer } from "../services/customers";
import { useToast } from "../store/toast";

const initial = {
  name: "", email: "", password: "", confirmPassword: "", cpf: "", phone: "", birthDate: "",
  zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: ""
};

export function CustomerRegister() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const showToast = useToast((state) => state.show);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      delete next[`address.${field}`];
      return next;
    });
  }

  function validate() {
    const next: FieldErrors = {};
    if (form.name.trim().length < 3) next.name = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Informe um e-mail valido.";
    if (!isStrongPassword(form.password)) next.password = "Use uma senha forte.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "A confirmacao deve ser igual a senha.";
    if (!isValidCpf(form.cpf)) next.cpf = "CPF invalido.";
    if (!isValidPhone(form.phone)) next.phone = "Telefone invalido.";
    if (!form.birthDate) next.birthDate = "Informe a data de nascimento.";
    if (onlyDigits(form.zipCode).length !== 8) next["address.zipCode"] = "CEP invalido.";
    if (!form.street.trim()) next["address.street"] = "Informe a rua.";
    if (!form.number.trim()) next["address.number"] = "Informe o numero.";
    if (!form.neighborhood.trim()) next["address.neighborhood"] = "Informe o bairro.";
    if (!form.city.trim()) next["address.city"] = "Informe a cidade.";
    if (!/^[A-Z]{2}$/.test(form.state)) next["address.state"] = "UF invalida.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function lookupCep() {
    if (onlyDigits(form.zipCode).length !== 8) return;
    try {
      const address = await fetchAddressByCep(form.zipCode);
      setForm((current) => ({ ...current, street: address.street || current.street, neighborhood: address.neighborhood || current.neighborhood, city: address.city || current.city, state: address.state || current.state }));
    } catch (error) {
      setErrors((current) => ({ ...current, "address.zipCode": error instanceof Error ? error.message : "CEP invalido." }));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    setMessage("");
    try {
      await registerCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        cpf: onlyDigits(form.cpf),
        phone: onlyDigits(form.phone),
        birthDate: form.birthDate,
        address: {
          zipCode: onlyDigits(form.zipCode), street: form.street.trim(), number: form.number.trim(), complement: form.complement || null,
          neighborhood: form.neighborhood.trim(), city: form.city.trim(), state: form.state.trim().toUpperCase(), country: "BR", isDefault: true
        }
      });
      showToast({ title: "Conta criada", description: "Entre para continuar.", variant: "success" });
      navigate("/cliente/login");
    } catch (error) {
      const parsed = parseApiError(error);
      setMessage(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setLoading(false);
    }
  }

  const errorText = (field: string) => errors[field] ? <span className="mt-1 block text-xs font-bold text-red-700">{errors[field]}</span> : null;

  return (
    <main className="app-shell section-y">
      <div className="mb-8">
        <p className="eyebrow mb-2">Cliente</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Criar conta</h1>
      </div>
      <form onSubmit={submit} className="panel grid gap-4 p-5 sm:p-7 md:grid-cols-2">
        {message && <div className="rounded-xl bg-kriar-background p-3 text-sm font-bold md:col-span-2">{message}</div>}
        <label><input className="input-field w-full" placeholder="Nome completo" value={form.name} onChange={(e) => update("name", e.target.value)} />{errorText("name")}</label>
        <label><input className="input-field w-full" type="email" placeholder="E-mail" value={form.email} onChange={(e) => update("email", e.target.value)} />{errorText("email")}</label>
        <label><input className="input-field w-full" type="password" placeholder="Senha" value={form.password} onChange={(e) => update("password", e.target.value)} />{errorText("password")}</label>
        <label><input className="input-field w-full" type="password" placeholder="Confirmar senha" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />{errorText("confirmPassword")}</label>
        <label><input className="input-field w-full" placeholder="CPF" value={form.cpf} onChange={(e) => update("cpf", maskDocument(e.target.value))} />{errorText("cpf")}</label>
        <label><input className="input-field w-full" placeholder="Telefone/WhatsApp" value={form.phone} onChange={(e) => update("phone", maskPhone(e.target.value))} />{errorText("phone")}</label>
        <label><input className="input-field w-full" type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />{errorText("birthDate")}</label>
        <label><input className="input-field w-full" placeholder="CEP" value={form.zipCode} onBlur={lookupCep} onChange={(e) => update("zipCode", maskCep(e.target.value))} />{errorText("address.zipCode")}</label>
        <label><input className="input-field w-full" placeholder="Rua" value={form.street} onChange={(e) => update("street", e.target.value)} />{errorText("address.street")}</label>
        <label><input className="input-field w-full" placeholder="Numero" value={form.number} onChange={(e) => update("number", e.target.value)} />{errorText("address.number")}</label>
        <input className="input-field" placeholder="Complemento" value={form.complement} onChange={(e) => update("complement", e.target.value)} />
        <label><input className="input-field w-full" placeholder="Bairro" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} />{errorText("address.neighborhood")}</label>
        <label><input className="input-field w-full" placeholder="Cidade" value={form.city} onChange={(e) => update("city", e.target.value)} />{errorText("address.city")}</label>
        <label><input className="input-field w-full" maxLength={2} placeholder="UF" value={form.state} onChange={(e) => update("state", e.target.value.toUpperCase())} />{errorText("address.state")}</label>
        <button className="btn-primary md:w-max" disabled={loading}><UserPlus className="h-5 w-5" />{loading ? "Criando..." : "Criar conta"}</button>
      </form>
    </main>
  );
}
