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
    return <main className="app-shell py-16 text-kriar-muted">Produto não encontrado.</main>;
  }

  if (!product) {
    return <main className="app-shell py-16 text-kriar-muted">Carregando produto...</main>;
  }

  const currentProduct = product;

  function handleAdd() {
    const missing = currentProduct.variations.find((variation) => !selectedVariations[variation.name]);
    if (missing) {
      showToast({ title: "Escolha uma variação", description: `Selecione ${missing.name}.`, variant: "warning" });
      return;
    }
    addItem(currentProduct, 1, notes, selectedVariations);
    showToast({ title: "Produto adicionado", description: currentProduct.name, variant: "success" });
  }

  function handleFavorite() {
    toggle(currentProduct.id);
    showToast({ title: isFavorite ? "Removido dos favoritos" : "Salvo nos favoritos", description: currentProduct.name, variant: "info" });
  }

  return (
    <main className="app-shell py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-[28px] bg-kriar-background shadow-card">
          <img
            src={productImageUrl(product)}
            alt={product.name}
            decoding="async"
            onError={handleImageError}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <section className="panel p-5 sm:p-7">
          <Link to={`/loja/${productSellerSlug(product)}`} className="text-sm font-black text-kriar-secondary transition hover:text-kriar-primary">
            {productSellerName(product)}
          </Link>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-kriar-contrast md:text-5xl">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Stars value={productRating(product)} />
            <span className="badge-soft">{productSalesCount(product)} vendas</span>
            <span className="badge-warm">Feito à mão</span>
          </div>
          <p className="mt-6 text-base leading-8 text-kriar-muted sm:text-lg">{product.description}</p>
          <div className="mt-7 text-4xl font-black tracking-tight text-kriar-primary">{currency.format(product.price)}</div>
          {product.stock <= 4 && <p className="mt-2 font-bold text-kriar-secondary">Estoque baixo: restam {product.stock} unidades</p>}

          {product.customizationAvailable && (
            <label className="mt-7 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-kriar-contrast">
                <Sparkles className="h-4 w-4 text-kriar-secondary" /> Personalização
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
                  <span className="mb-2 block text-sm font-black text-kriar-contrast">{variation.name}</span>
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
            <div className="mt-7 border-t border-kriar-line pt-5">
              <h2 className="text-xl font-black text-kriar-primary">Avaliações</h2>
              <div className="mt-3 grid gap-3">
                {product.reviews.map((review, index) => (
                  <div key={`${review.createdAt}-${index}`} className="rounded-xl bg-kriar-background/70 p-3">
                    <Stars value={review.rating} />
                    <p className="mt-2 text-sm text-kriar-muted">{review.comment}</p>
                    <strong className="mt-2 block text-xs text-kriar-contrast">{review.author?.name ?? "Cliente"}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAdd} className="btn-primary flex-1">
              <ShoppingBag className="h-5 w-5" /> Adicionar ao carrinho
            </button>
            <button onClick={handleFavorite} className="btn-secondary">
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-kriar-secondary text-kriar-secondary" : ""}`} /> Favoritar
            </button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-kriar-line bg-kriar-background/70 p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-kriar-primary" />
              <strong className="text-kriar-contrast">Pagamento Mercado Pago</strong>
              <p className="mt-1 text-sm leading-6 text-kriar-muted">Preferência gerada pela API e confirmação via webhook.</p>
            </div>
            <div className="rounded-[20px] border border-kriar-line bg-kriar-background/70 p-4">
              <PackageCheck className="mb-2 h-5 w-5 text-kriar-primary" />
              <strong className="text-kriar-contrast">{product.pickupAvailable ? "Retirada local disponível" : "Pedido por vendedor"}</strong>
              <p className="mt-1 text-sm leading-6 text-kriar-muted">
                {product.pickupAvailable
                  ? product.pickupAddress ?? "O vendedor combina a retirada após a compra."
                  : "O carrinho separa itens por loja para produção e entrega."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="section-y">
        <SectionHeader title="Mais do mesmo artesão" description="Continue explorando peças da mesma loja." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
