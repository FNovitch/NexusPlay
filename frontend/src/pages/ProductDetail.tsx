import { Heart, PackageCheck, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SectionHeader } from "../components/SectionHeader";
import { Stars } from "../components/Stars";
import { productImageUrl, productRating, productSalesCount, productSellerName, productSellerSlug } from "../api/products";
import { getProduct } from "../lib/api";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { useWishlist } from "../store/wishlist";
import type { Product } from "../types";
import { handleImageError } from "../utils/media";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductDetail() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<Product>();
  const [related, setRelated] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const addItem = useCart((state) => state.addItem);
  const toggle = useWishlist((state) => state.toggle);
  const isFavorite = useWishlist((state) => (product ? state.has(product.id) : false));
  const showToast = useToast((state) => state.show);

  useEffect(() => {
    setNotFound(false);
    getProduct(slug)
      .then((data) => {
        setProduct(data.product);
        setRelated(data.related);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return <main className="app-shell py-16 text-nexus-muted">Produto Não Encontrado.</main>;
  }

  if (!product) {
    return <main className="app-shell py-16 text-nexus-muted">Carregando produto...</main>;
  }

  const currentProduct = product;

  function handleAdd() {
    const missing = currentProduct.variations.find((variation) => !selectedVariations[variation.name]);
    if (missing) {
      showToast({ title: "Escolha uma Variação", description: `Selecione ${missing.name}.`, variant: "warning" });
      return;
    }
    addItem(currentProduct, 1, notes, selectedVariations);
    showToast({ title: "Produto Adicionado", description: currentProduct.name, variant: "success" });
  }

  function handleFavorite() {
    toggle(currentProduct.id);
    showToast({ title: isFavorite ? "Removido dos Favoritos" : "Salvo nos Favoritos", description: currentProduct.name, variant: "info" });
  }

  return (
    <main className="app-shell py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="overflow-hidden rounded-lg border border-nexus-line bg-nexus-paper shadow-soft">
          <img
            src={productImageUrl(product)}
            alt={product.name}
            decoding="async"
            onError={handleImageError}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <section className="rounded-lg border border-nexus-line bg-nexus-surface p-5 shadow-soft sm:p-7">
          <Link to={`/loja/${productSellerSlug(product)}`} className="text-sm font-medium text-nexus-secondary transition hover:text-nexus-contrast">
            {productSellerName(product)}
          </Link>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-nexus-contrast md:text-5xl">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Stars value={productRating(product)} />
            <span className="badge-soft">{productSalesCount(product)} Pedidos</span>
            <span className="badge-warm">Publicado</span>
          </div>
          <p className="mt-5 text-base leading-8 text-nexus-muted">{product.description}</p>
          <div className="mt-6 text-3xl font-semibold tracking-normal text-nexus-contrast">{currency.format(product.price)}</div>
          {product.stock <= 4 && <p className="mt-2 font-medium text-nexus-secondary">Estoque Baixo: restam {product.stock} unidades</p>}

          {product.customizationAvailable && (
            <label className="mt-7 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-nexus-contrast">
                <Sparkles className="h-4 w-4 text-nexus-secondary" /> Personalização
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="text-field min-h-28 w-full"
                placeholder={product.personalizationPrompt ?? undefined}
              />
            </label>
          )}

          {product.variations.length > 0 && (
            <div className="mt-7 grid gap-3">
              {product.variations.map((variation) => (
                <label key={variation.name} className="block">
                  <span className="mb-2 block text-sm font-medium text-nexus-contrast">{variation.name}</span>
                  <select
                    className="select-field w-full"
                    value={selectedVariations[variation.name] ?? ""}
                    onChange={(event) => setSelectedVariations((current) => ({ ...current, [variation.name]: event.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {variation.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}

          {product.reviews && product.reviews.length > 0 && (
            <div className="mt-7 border-t border-nexus-line pt-5">
              <h2 className="text-xl font-semibold text-nexus-contrast">Avaliações</h2>
              <div className="mt-3 grid gap-3">
                {product.reviews.map((review, index) => (
                  <div key={`${review.createdAt}-${index}`} className="rounded-lg bg-nexus-paper p-3">
                    <Stars value={review.rating} />
                    <p className="mt-2 text-sm text-nexus-muted">{review.comment}</p>
                    <strong className="mt-2 block text-xs text-nexus-contrast">{review.author?.name ?? "Cliente"}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAdd} className="btn-primary flex-1">
              <ShoppingBag className="h-5 w-5" /> Adicionar ao Carrinho
            </button>
            <button onClick={handleFavorite} className="btn-secondary">
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-nexus-secondary text-nexus-secondary" : ""}`} /> Favoritar
            </button>
          </div>

          <div className="mt-7 grid gap-3 border-t border-nexus-line pt-5 sm:grid-cols-2">
            <div className="rounded-lg border border-nexus-line bg-nexus-paper p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-nexus-secondary" />
              <strong className="font-semibold text-nexus-contrast">Compra Protegida na Demo</strong>
              <p className="mt-1 text-sm leading-6 text-nexus-muted">O fluxo cria pedidos fictícios para demonstrar carrinho, checkout e acompanhamento.</p>
            </div>
            <div className="rounded-lg border border-nexus-line bg-nexus-paper p-4">
              <PackageCheck className="mb-2 h-5 w-5 text-nexus-secondary" />
              <strong className="font-semibold text-nexus-contrast">{product.pickupAvailable ? "Retirada Local Disponível" : "Pedido pelo Negócio"}</strong>
              <p className="mt-1 text-sm leading-6 text-nexus-muted">
                {product.pickupAvailable
                  ? product.pickupAddress ?? "A loja combina a retirada após o pedido."
                  : "O carrinho separa itens por loja para preparo e entrega."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="section-y">
        <SectionHeader title="Mais da Mesma Loja" description="Continue explorando produtos do mesmo catálogo." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
