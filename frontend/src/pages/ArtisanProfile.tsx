import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  fetchAddressByCep,
  isValidDocument,
  isValidPhone,
  maskCep,
  maskDocument,
  maskPhone,
  onlyDigits,
  parseApiError,
  type FieldErrors
} from "../lib/artisanForm";
import { getMyArtisanProfile, updateMyArtisanProfile } from "../services/artisans";
import { useAuth } from "../store/auth";
import { useToast } from "../store/toast";

const emptyForm = {
  name: "",
  storeName: "",
  document: "",
  phone: "",
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

export function ArtisanProfile() {
  const user = useAuth((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState(emptyForm);
  const showToast = useToast((state) => state.show);

  useEffect(() => {
    getMyArtisanProfile()
      .then((artisan) => {
        setForm({
          name: artisan.name,
          storeName: artisan.storeName,
          document: maskDocument(artisan.document),
          phone: maskPhone(artisan.phone),
          storeDescription: artisan.storeDescription,
          craftCategories: artisan.craftCategories.join(", "),
          zipCode: maskCep(artisan.address?.zipCode ?? ""),
          street: artisan.address?.street ?? "",
          number: artisan.address?.number ?? "",
          complement: artisan.address?.complement ?? "",
          neighborhood: artisan.address?.neighborhood ?? "",
          city: artisan.address?.city ?? "",
          state: artisan.address?.state ?? "",
          acceptsLocalPickup: artisan.acceptsLocalPickup,
          pickupInstructions: artisan.pickupInstructions ?? ""
        });
      })
      .catch(() => setMessage("Nao foi possivel carregar o perfil do artesao."))
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== "ARTISAN") {
    return <Navigate to="/artesao/login" replace />;
  }

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
    if (!isValidDocument(form.document)) next.document = "Informe um CPF ou CNPJ valido.";
    if (!isValidPhone(form.phone)) next.phone = "Informe um telefone com DDD valido.";
    if (form.storeDescription.trim().length < 10) next.storeDescription = "Descreva sua loja.";
    if (categories.length === 0) next.craftCategories = "Informe pelo menos uma categoria.";
    if (onlyDigits(form.zipCode).length !== 8) next["address.zipCode"] = "Informe um CEP com 8 digitos.";
    if (form.street.trim().length < 2) next["address.street"] = "Informe a rua.";
    if (!form.number.trim()) next["address.number"] = "Informe o numero.";
    if (form.neighborhood.trim().length < 2) next["address.neighborhood"] = "Informe o bairro.";
    if (form.city.trim().length < 2) next["address.city"] = "Informe a cidade.";
    if (!/^[A-Z]{2}$/.test(form.state)) next["address.state"] = "Informe uma UF valida.";
    if (form.acceptsLocalPickup && !form.pickupInstructions.trim()) next.pickupInstructions = "Informe as instrucoes de retirada.";
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
    } catch (error) {
      setErrors((current) => ({ ...current, "address.zipCode": error instanceof Error ? error.message : "CEP invalido." }));
    } finally {
      setCepLoading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setMessage("");
    const validation = validateForm();
    if (!validation.ok) return;
    setSaving(true);
    try {
      await updateMyArtisanProfile({
        name: form.name.trim(),
        storeName: form.storeName.trim(),
        document: onlyDigits(form.document),
        phone: onlyDigits(form.phone),
        storeDescription: form.storeDescription.trim(),
        craftCategories: validation.categories,
        acceptsLocalPickup: form.acceptsLocalPickup,
        pickupInstructions: form.acceptsLocalPickup ? form.pickupInstructions.trim() : null,
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
        }
      });
      setMessage("Perfil atualizado com sucesso.");
      showToast({ title: "Perfil atualizado", description: "Dados da loja salvos com sucesso.", variant: "success" });
    } catch (requestError: unknown) {
      const parsed = parseApiError(requestError);
      setMessage(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="app-shell py-16 text-kriar-muted">Carregando perfil...</main>;
  }

  const errorText = (field: string) => errors[field] ? <span className="mt-1 block text-xs font-bold text-red-700">{errors[field]}</span> : null;

  return (
    <main className="app-shell section-y">
      <div className="mb-8">
        <p className="eyebrow mb-2">Configuracoes</p>
        <h1 className="text-3xl font-black tracking-tight text-kriar-contrast">Perfil do artesao</h1>
      </div>

      <form onSubmit={submit} className="panel grid gap-4 p-5 sm:p-7 md:grid-cols-2">
        {message && <div className="rounded-xl border border-kriar-line bg-kriar-background px-4 py-3 text-sm font-bold text-kriar-contrast md:col-span-2">{message}</div>}
        <label>
          <input required className="input-field w-full" placeholder="Nome completo" value={form.name} onChange={(event) => update("name", event.target.value)} />
          {errorText("name")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder="Nome da loja/atelie" value={form.storeName} onChange={(event) => update("storeName", event.target.value)} />
          {errorText("storeName")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder="CPF ou CNPJ" value={form.document} onChange={(event) => update("document", maskDocument(event.target.value))} />
          {errorText("document")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder="Telefone/WhatsApp" value={form.phone} onChange={(event) => update("phone", maskPhone(event.target.value))} />
          {errorText("phone")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder="Categorias" value={form.craftCategories} onChange={(event) => update("craftCategories", event.target.value)} />
          {errorText("craftCategories")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder={cepLoading ? "Buscando CEP..." : "CEP"} value={form.zipCode} onBlur={lookupCep} onChange={(event) => update("zipCode", maskCep(event.target.value))} />
          {errorText("address.zipCode")}
        </label>
        <label className="md:col-span-2">
          <textarea required className="text-field min-h-28 w-full" placeholder="Descricao da loja" value={form.storeDescription} onChange={(event) => update("storeDescription", event.target.value)} />
          {errorText("storeDescription")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder="Rua" value={form.street} onChange={(event) => update("street", event.target.value)} />
          {errorText("address.street")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder="Numero" value={form.number} onChange={(event) => update("number", event.target.value)} />
          {errorText("address.number")}
        </label>
        <input className="input-field" placeholder="Complemento" value={form.complement} onChange={(event) => update("complement", event.target.value)} />
        <label>
          <input required className="input-field w-full" placeholder="Bairro" value={form.neighborhood} onChange={(event) => update("neighborhood", event.target.value)} />
          {errorText("address.neighborhood")}
        </label>
        <label>
          <input required className="input-field w-full" placeholder="Cidade" value={form.city} onChange={(event) => update("city", event.target.value)} />
          {errorText("address.city")}
        </label>
        <label>
          <input required className="input-field w-full" maxLength={2} placeholder="UF" value={form.state} onChange={(event) => update("state", event.target.value.toUpperCase())} />
          {errorText("address.state")}
        </label>
        <label className="flex items-center gap-3 text-sm font-black text-kriar-contrast">
          <input type="checkbox" checked={form.acceptsLocalPickup} onChange={(event) => update("acceptsLocalPickup", event.target.checked)} className="h-5 w-5 accent-kriar-primary" />
          Aceito retirada local
        </label>
        <label className="md:col-span-2">
          <textarea className="text-field min-h-24 w-full" placeholder="Instrucoes de retirada" value={form.pickupInstructions} onChange={(event) => update("pickupInstructions", event.target.value)} />
          {errorText("pickupInstructions")}
        </label>

        <button className="btn-primary md:w-max" disabled={saving}>
          <Save className="h-5 w-5" /> {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </main>
  );
}
