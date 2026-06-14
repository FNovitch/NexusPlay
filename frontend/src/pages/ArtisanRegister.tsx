import { Store, UserPlus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PasswordField } from "../components/PasswordField";
import {
  fetchAddressByCep,
  isStrongPassword,
  isValidDocument,
  isValidPhone,
  maskCep,
  maskDocument,
  maskPhone,
  onlyDigits,
  parseApiError,
  type FieldErrors
} from "../lib/artisanForm";
import { registerArtisan } from "../services/artisans";
import { useToast } from "../store/toast";

const initialForm = {
  name: "",
  storeName: "",
  document: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  storeDescription: "",
  craftCategories: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  acceptsLocalPickup: false,
  pickupInstructions: ""
};

const fieldClass = (error?: string) => `${error ? "border-red-300 bg-red-50" : ""}`;

export function ArtisanRegister() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const showToast = useToast((state) => state.show);
  const navigate = useNavigate();

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      delete next[`address.${field}`];
      return next;
    });
  }

  function validateForm() {
    const next: FieldErrors = {};
    const categories = form.craftCategories.split(",").map((category) => category.trim()).filter(Boolean);

    if (form.name.trim().length < 3 || !/[A-Za-zÀ-ÿ]/.test(form.name)) next.name = "Informe seu nome completo.";
    if (form.storeName.trim().length < 3) next.storeName = "Informe o nome da loja.";
    if (!isValidDocument(form.document)) next.document = "Informe um CPF ou CNPJ válido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Informe um e-mail válido.";
    if (!isValidPhone(form.phone)) next.phone = "Informe um telefone com DDD válido.";
    if (!isStrongPassword(form.password)) next.password = "Use maiúscula, minúscula, número e caractere especial.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "A confirmação precisa ser igual à senha.";
    if (form.storeDescription.trim().length < 10) next.storeDescription = "Descreva sua loja com pelo menos 10 caracteres.";
    if (categories.length === 0) next.craftCategories = "Informe pelo menos uma categoria.";
    if (onlyDigits(form.zipCode).length !== 8) next["address.zipCode"] = "Informe um CEP com 8 dígitos.";
    if (form.street.trim().length < 2) next["address.street"] = "Informe a rua.";
    if (!form.number.trim()) next["address.number"] = "Informe o número.";
    if (form.neighborhood.trim().length < 2) next["address.neighborhood"] = "Informe o bairro.";
    if (form.city.trim().length < 2) next["address.city"] = "Informe a cidade.";
    if (!/^[A-Z]{2}$/.test(form.state)) next["address.state"] = "Informe uma UF válida.";
    if (form.acceptsLocalPickup && !form.pickupInstructions.trim()) next.pickupInstructions = "Informe as instruções de retirada.";

    setErrors(next);
    return { ok: Object.keys(next).length === 0, categories };
  }

  async function lookupCep() {
    if (onlyDigits(form.zipCode).length !== 8) return;
    setCepLoading(true);
    try {
      const address = await fetchAddressByCep(form.zipCode);
      setForm((current) => ({
        ...current,
        street: address.street || current.street,
        neighborhood: address.neighborhood || current.neighborhood,
        city: address.city || current.city,
        state: address.state || current.state
      }));
      setErrors((current) => {
        const next = { ...current };
        delete next["address.zipCode"];
        return next;
      });
    } catch (error) {
      setErrors((current) => ({ ...current, "address.zipCode": error instanceof Error ? error.message : "CEP inválido." }));
    } finally {
      setCepLoading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setMessage("");
    const validation = validateForm();
    if (!validation.ok) return;

    setLoading(true);
    try {
      await registerArtisan({
        name: form.name.trim(),
        storeName: form.storeName.trim(),
        document: onlyDigits(form.document),
        email: form.email.trim(),
        phone: onlyDigits(form.phone),
        password: form.password,
        storeDescription: form.storeDescription.trim(),
        craftCategories: validation.categories,
        address: {
          zipCode: onlyDigits(form.zipCode),
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim() || null,
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
          country: "BR",
          isDefault: true
        },
        acceptsLocalPickup: form.acceptsLocalPickup,
        pickupInstructions: form.acceptsLocalPickup ? form.pickupInstructions.trim() : null
      });
      showToast({ title: "Cadastro Enviado", description: "Aguarde aprovação para publicar seus produtos.", variant: "success" });
      setMessage("Cadastro de loja realizado com sucesso. Aguarde aprovação.");
      window.setTimeout(() => navigate("/vendedor/login"), 1200);
    } catch (requestError: unknown) {
      const parsed = parseApiError(requestError);
      setMessage(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setLoading(false);
    }
  }

  const errorText = (field: string) => errors[field] ? <span className="mt-1 block text-xs font-bold text-red-700">{errors[field]}</span> : null;

  return (
    <main className="app-shell section-y">
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow mb-2">Cadastrar Loja</p>
        <h1 className="text-3xl font-semibold tracking-normal text-nexus-contrast md:text-5xl">Venda Produtos Gamer na NexusPlay</h1>
        <p className="mt-4 text-base leading-7 text-nexus-muted">Crie sua loja, envie dados de operação e prepare o catálogo para publicar periféricos, colecionáveis e acessórios de setup.</p>
      </div>

      <form onSubmit={submit} className="panel grid gap-6 p-5 sm:p-7">
        {message && <div className="rounded-lg border border-nexus-line bg-nexus-paper px-4 py-3 text-sm font-medium text-nexus-contrast">{message}</div>}

        <section className="grid gap-4 md:grid-cols-2">
          <h2 className="flex items-center gap-2 border-b border-nexus-line pb-3 text-base font-semibold text-nexus-contrast md:col-span-2">
            <Store className="h-5 w-5" /> Dados da Loja
          </h2>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors.name)}`} placeholder="Nome Completo" value={form.name} onChange={(event) => update("name", event.target.value)} />
            {errorText("name")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors.storeName)}`} placeholder="Nome da Loja" value={form.storeName} onChange={(event) => update("storeName", event.target.value)} />
            {errorText("storeName")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors.document)}`} placeholder="CPF ou CNPJ" value={form.document} onChange={(event) => update("document", maskDocument(event.target.value))} />
            {errorText("document")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors.email)}`} type="email" placeholder="E-mail" value={form.email} onChange={(event) => update("email", event.target.value)} />
            {errorText("email")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors.phone)}`} placeholder="Telefone/WhatsApp" value={form.phone} onChange={(event) => update("phone", maskPhone(event.target.value))} />
            {errorText("phone")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors.craftCategories)}`} placeholder="Categorias: periféricos, colecionáveis, RGB..." value={form.craftCategories} onChange={(event) => update("craftCategories", event.target.value)} />
            {errorText("craftCategories")}
          </label>
          <label>
            <PasswordField required className={fieldClass(errors.password)} placeholder="Senha" value={form.password} onChange={(event) => update("password", event.target.value)} autoComplete="new-password" />
            {errorText("password")}
          </label>
          <label>
            <PasswordField required className={fieldClass(errors.confirmPassword)} placeholder="Confirmar Senha" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} autoComplete="new-password" />
            {errorText("confirmPassword")}
          </label>
          <label className="md:col-span-2">
            <textarea required className={`text-field min-h-28 w-full ${fieldClass(errors.storeDescription)}`} placeholder="Descrição da Loja" value={form.storeDescription} onChange={(event) => update("storeDescription", event.target.value)} />
            {errorText("storeDescription")}
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-6">
          <h2 className="border-b border-nexus-line pb-3 text-base font-semibold text-nexus-contrast md:col-span-6">Endereço de Origem</h2>
          <label className="md:col-span-2">
            <input required className={`input-field w-full ${fieldClass(errors["address.zipCode"])}`} placeholder={cepLoading ? "Buscando CEP..." : "CEP"} value={form.zipCode} onBlur={lookupCep} onChange={(event) => update("zipCode", maskCep(event.target.value))} />
            {errorText("address.zipCode")}
          </label>
          <label className="md:col-span-3">
            <input required className={`input-field w-full ${fieldClass(errors["address.street"])}`} placeholder="Rua" value={form.street} onChange={(event) => update("street", event.target.value)} />
            {errorText("address.street")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors["address.number"])}`} placeholder="Número" value={form.number} onChange={(event) => update("number", event.target.value)} />
            {errorText("address.number")}
          </label>
          <input className="input-field md:col-span-2" placeholder="Complemento" value={form.complement} onChange={(event) => update("complement", event.target.value)} />
          <label className="md:col-span-2">
            <input required className={`input-field w-full ${fieldClass(errors["address.neighborhood"])}`} placeholder="Bairro" value={form.neighborhood} onChange={(event) => update("neighborhood", event.target.value)} />
            {errorText("address.neighborhood")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors["address.city"])}`} placeholder="Cidade" value={form.city} onChange={(event) => update("city", event.target.value)} />
            {errorText("address.city")}
          </label>
          <label>
            <input required className={`input-field w-full ${fieldClass(errors["address.state"])}`} maxLength={2} placeholder="UF" value={form.state} onChange={(event) => update("state", event.target.value.toUpperCase())} />
            {errorText("address.state")}
          </label>
        </section>

        <section className="grid gap-4">
          <label className="flex items-center gap-3 text-sm font-medium text-nexus-contrast">
            <input type="checkbox" checked={form.acceptsLocalPickup} onChange={(event) => update("acceptsLocalPickup", event.target.checked)} className="h-4 w-4 accent-nexus-secondary" />
            Aceito Retirada Local
          </label>
          <label>
            <textarea className={`text-field min-h-24 w-full ${fieldClass(errors.pickupInstructions)}`} placeholder="Instruções de Retirada" value={form.pickupInstructions} onChange={(event) => update("pickupInstructions", event.target.value)} />
            {errorText("pickupInstructions")}
          </label>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button className="btn-primary" disabled={loading}>
            <UserPlus className="h-5 w-5" /> {loading ? "Enviando..." : "Cadastrar Loja"}
          </button>
          <Link to="/vendedor/login" className="btn-secondary">Entrar no Painel</Link>
        </div>
      </form>
    </main>
  );
}
