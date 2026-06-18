import { Router, type Request } from "express";

export const demoRoutes = Router();

const now = () => new Date().toISOString();

const categories = [
  {
    id: "cat-hardware",
    name: "Hardware e perifericos",
    slug: "hardware-perifericos",
    description: "Teclados, mouses e upgrades para setup gamer.",
    active: true,
    _count: { products: 2 }
  },
  {
    id: "cat-audio",
    name: "Audio e streaming",
    slug: "audio-streaming",
    description: "Headsets, microfones e iluminacao para lives.",
    active: true,
    _count: { products: 1 }
  },
  {
    id: "cat-collectibles",
    name: "Colecionaveis e decoracao",
    slug: "colecionaveis-decoracao",
    description: "Pecas de vitrine para mesas e estantes geek.",
    active: true,
    _count: { products: 1 }
  }
];

const sellers = [
  {
    id: "seller-demo-1",
    storeName: "Nexus Gear",
    slug: "nexus-gear",
    bio: "Hardware gamer selecionado para performance, baixa latencia e acabamento premium.",
    story: "Uma loja demo focada em perifericos, streamers e criadores que precisam de um setup confiavel.",
    avatarUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1400&q=80",
    rating: 4.9,
    salesCount: 516,
    status: "APPROVED"
  },
  {
    id: "seller-demo-2",
    storeName: "Pixel Relic",
    slug: "pixel-relic",
    bio: "Colecionaveis, displays e decoracao para transformar qualquer mesa gamer.",
    story: "Curadoria demo de pecas visuais inspiradas por jogos, ficcao cientifica e cultura arcade.",
    avatarUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=1400&q=80",
    rating: 4.85,
    salesCount: 388,
    status: "APPROVED"
  }
];

const products = [
  product({
    id: "prod-demo-1",
    seller: sellers[0],
    category: categories[0],
    name: "Teclado Hall Effect NovaStrike 75",
    slug: "teclado-hall-effect-novastrike-75",
    description: "Teclado compacto 75% com switches magneticos, actuation ajustavel e keycaps PBT.",
    price: 589.9,
    stock: 14,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    rating: 4.95,
    salesCount: 152
  }),
  product({
    id: "prod-demo-2",
    seller: sellers[0],
    category: categories[0],
    name: "Mouse Helios Pro Wireless 8K",
    slug: "mouse-helios-pro-wireless-8k",
    description: "Mouse sem fio ultraleve com polling rate 8K, sensor de alta precisao e dock magnetico.",
    price: 429.9,
    stock: 18,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
    rating: 4.88,
    salesCount: 117
  }),
  product({
    id: "prod-demo-3",
    seller: sellers[0],
    category: categories[1],
    name: "Headset ArenaCast USB-C",
    slug: "headset-arenacast-usb-c",
    description: "Headset fechado com audio espacial, microfone removivel e almofadas respiraveis.",
    price: 369.9,
    stock: 10,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    salesCount: 103
  }),
  product({
    id: "prod-demo-4",
    seller: sellers[1],
    category: categories[2],
    name: "Estatua Boss Arena Dragao Neon",
    slug: "estatua-boss-arena-dragao-neon",
    description: "Peca decorativa de resina com pintura fosca, detalhes translcidos e base expositora.",
    price: 279.9,
    stock: 6,
    image: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=900&q=80",
    rating: 4.94,
    salesCount: 71
  })
];

const demoOrders = [
  {
    id: "demo-order-001",
    orderCode: "NP-DEMO-001",
    status: "PAID",
    paymentStatus: "APPROVED",
    total: 959.8,
    shippingTotal: 0,
    createdAt: now(),
    buyer: { id: "demo-customer", name: "Cliente Demo", email: "cliente@demo.nexusplay" },
    items: [
      { id: "demo-item-1", productName: products[0].name, quantity: 1, total: products[0].price },
      { id: "demo-item-2", productName: products[2].name, quantity: 1, total: products[2].price }
    ]
  }
];

const users = {
  customer: { id: "demo-customer", name: "Cliente Demo", email: "cliente@demo.nexusplay", role: "CUSTOMER" },
  artisan: {
    id: "demo-seller",
    name: "Nexus Seller",
    email: "vendedor@demo.nexusplay",
    role: "ARTISAN",
    storeId: sellers[0].id,
    status: "APPROVED"
  },
  admin: { id: "demo-admin", name: "Admin Demo", email: "admin@demo.nexusplay", role: "ADMIN" }
};

function product(input: {
  id: string;
  seller: typeof sellers[number];
  category: typeof categories[number];
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  salesCount: number;
}) {
  return {
    id: input.id,
    sellerId: input.seller.id,
    categoryId: input.category.id,
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: input.price,
    stock: input.stock,
    category: input.category,
    categoryDetails: input.category,
    images: [{ url: input.image, filename: `${input.slug}.jpg`, alt: input.name }],
    mainImage: { url: input.image, filename: `${input.slug}.jpg`, alt: input.name },
    artisanId: input.seller.id,
    artisanName: input.seller.storeName,
    artisanSlug: input.seller.slug,
    seller: input.seller,
    dimensions: { width: 20, height: 10, length: 15 },
    weight: 0.8,
    shippingAvailable: true,
    pickupAvailable: true,
    pickupAddress: "Retirada demo mediante confirmacao do pedido",
    status: "ACTIVE",
    averageRating: input.rating,
    totalReviews: 12,
    rating: input.rating,
    salesCount: input.salesCount,
    reviews: [],
    variations: [],
    customizationAvailable: false,
    personalizationPrompt: null,
    createdAt: now(),
    updatedAt: now()
  };
}

function tokenFor(role: keyof typeof users) {
  return `demo-${role}-token`;
}

function userFromRequest(req: Request) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token === tokenFor("artisan") || token === "demo-seller-token") return users.artisan;
  if (token === tokenFor("admin")) return users.admin;
  return users.customer;
}

function authResponse(role: keyof typeof users) {
  const user = users[role];
  const token = tokenFor(role);
  return { success: true, data: { token, user }, token, user };
}

demoRoutes.get("/demo/status", (_req, res) => {
  res.json({
    success: true,
    mode: "portfolio-demo",
    message: "Backend NexusPlay rodando em modo demonstracao sem banco externo.",
    services: {
      database: "mocked",
      payments: "mocked",
      shipping: "mocked"
    }
  });
});

demoRoutes.get("/categories", (_req, res) => {
  res.json({ categories });
});

demoRoutes.get("/products/autocomplete", (req, res) => {
  const query = String(req.query.q ?? "").toLowerCase();
  const suggestions = products
    .filter((item) => item.name.toLowerCase().includes(query) || item.slug.includes(query))
    .slice(0, 8)
    .map(({ id, name, slug, images }) => ({ id, name, slug, images }));
  res.json({ suggestions });
});

demoRoutes.get("/products", (req, res) => {
  const category = String(req.query.category ?? "");
  const q = String(req.query.q ?? "").toLowerCase();
  const filtered = products.filter((item) => {
    const matchesCategory = !category || item.category.slug === category;
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
  res.json({ products: filtered });
});

demoRoutes.get("/products/:slug", (req, res) => {
  const item = products.find((entry) => entry.slug === req.params.slug);
  if (!item) return res.status(404).json({ success: false, message: "Produto demo nao encontrado." });
  const related = products.filter((entry) => entry.id !== item.id && entry.sellerId === item.sellerId);
  res.json({ product: item, related });
});

demoRoutes.get("/sellers", (_req, res) => {
  res.json({ sellers });
});

demoRoutes.get("/sellers/:slug", (req, res) => {
  const seller = sellers.find((entry) => entry.slug === req.params.slug);
  if (!seller) return res.status(404).json({ success: false, message: "Loja demo nao encontrada." });
  res.json({ seller: { ...seller, products: products.filter((item) => item.sellerId === seller.id) } });
});

demoRoutes.post(["/login", "/customers/login"], (_req, res) => {
  res.json(authResponse("customer"));
});

demoRoutes.post("/sellers/login", (_req, res) => {
  res.json(authResponse("artisan"));
});

demoRoutes.post("/admin/login", (_req, res) => {
  res.json(authResponse("admin"));
});

demoRoutes.post(["/register", "/customers/register"], (_req, res) => {
  res.status(201).json({ ...authResponse("customer"), message: "Conta demo criada." });
});

demoRoutes.post("/sellers/register", (_req, res) => {
  res.status(201).json({
    success: true,
    message: "Vendedor demo cadastrado.",
    data: { id: users.artisan.id, nome: users.artisan.name, email: users.artisan.email, status: "APPROVED" },
    artisan: {
      id: users.artisan.id,
      name: users.artisan.name,
      email: users.artisan.email,
      status: "APPROVED",
      storeId: sellers[0].id
    }
  });
});

demoRoutes.get(["/me", "/customers/me"], (req, res) => {
  const user = userFromRequest(req);
  res.json({ success: true, user, data: { user, customer: user } });
});

demoRoutes.get("/sellers/me", (_req, res) => {
  res.json({
    success: true,
    artisan: { ...users.artisan, store: sellers[0] },
    data: { artisan: { ...users.artisan, store: sellers[0] } }
  });
});

demoRoutes.patch("/sellers/me", (_req, res) => {
  res.json({
    success: true,
    message: "Perfil demo atualizado para esta apresentacao.",
    data: { artisan: { ...users.artisan, store: sellers[0] } }
  });
});

demoRoutes.get("/subscriptions/plans", (_req, res) => {
  res.json({
    success: true,
    data: {
      plans: [
        { id: "plan-demo-starter", name: "Starter Demo", price: 0, interval: "monthly", description: "Plano ficticio para portifolio." },
        { id: "plan-demo-pro", name: "Pro Demo", price: 49.9, interval: "monthly", description: "Assinatura simulada para vendedores." }
      ]
    }
  });
});

demoRoutes.get("/seller/subscription/status", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ACTIVE",
      active: true,
      planName: "Pro Demo",
      nextBillingDate: null,
      trialEndsAt: null
    }
  });
});

demoRoutes.post("/seller/subscription/checkout", (_req, res) => {
  res.json({ success: true, data: { initPoint: "https://www.mercadopago.com.br/", subscriptionId: "sub-demo-001" } });
});

demoRoutes.post("/seller/subscription/cancel", (_req, res) => {
  res.json({ success: true, message: "Assinatura demo cancelada." });
});

demoRoutes.post(["/shipping/calculate", "/frete/calcular"], (_req, res) => {
  res.json({
    success: true,
    data: {
      grupos: [
        {
          groupId: "demo-freight-1",
          sellerId: sellers[0].id,
          sellerProfileId: sellers[0].id,
          loja: sellers[0].storeName,
          cepOrigem: "55900000",
          cepDestino: "01001000",
          opcoes: [
            {
              id: "demo-pickup",
              nome: "Retirada demo",
              empresa: "NexusPlay",
              preco: 0,
              prazo: 1,
              melhorEnvioServiceId: 0,
              tipo: "PICKUP",
              enderecoRetirada: "Retirada combinada na loja demo",
              instrucoesRetirada: "Fluxo simulado para apresentacao."
            },
            {
              id: "demo-shipping",
              nome: "Entrega demo expressa",
              empresa: "Nexus Express",
              preco: 19.9,
              prazo: 3,
              melhorEnvioServiceId: 99,
              tipo: "SHIPPING"
            }
          ]
        }
      ]
    }
  });
});

demoRoutes.get(["/orders", "/orders/my-orders", "/seller/orders"], (_req, res) => {
  res.json({ success: true, data: { pedidos: demoOrders, orders: demoOrders }, orders: demoOrders });
});

demoRoutes.get(["/orders/:id", "/seller/orders/:id"], (req, res) => {
  const order = demoOrders.find((entry) => entry.id === req.params.id) ?? demoOrders[0];
  res.json({ success: true, data: { pedido: order, order }, order });
});

demoRoutes.post(["/orders", "/orders/checkout", "/checkout"], (_req, res) => {
  res.status(201).json({
    success: true,
    data: {
      initPoint: "https://www.mercadopago.com.br/",
      orderId: "demo-order-new",
      pedido: demoOrders[0]
    },
    initPoint: "https://www.mercadopago.com.br/"
  });
});

demoRoutes.put(["/orders/:id/cancel", "/orders/:id/confirm-receipt", "/seller/orders/:id/status"], (req, res) => {
  const order = { ...demoOrders[0], id: req.params.id, status: "UPDATED" };
  res.json({ success: true, message: "Pedido demo atualizado.", data: { pedido: order, order }, order });
});

demoRoutes.get("/seller/me/dashboard", (_req, res) => {
  res.json({
    success: true,
    data: {
      seller: { ...sellers[0], user: users.artisan },
      metrics: { revenue: 8590.5, orders: 24, products: products.length, rating: 4.9 },
      products: products.filter((item) => item.sellerId === sellers[0].id),
      orders: demoOrders
    }
  });
});

demoRoutes.get("/admin/dashboard", (_req, res) => {
  res.json({
    success: true,
    data: {
      metrics: {
        customers: 128,
        sellers: sellers.length,
        products: products.length,
        orders: demoOrders.length,
        revenue: 24680.9
      },
      recentOrders: demoOrders,
      pendingSellers: [],
      pendingProducts: []
    }
  });
});

demoRoutes.use((req, res) => {
  res.status(200).json({
    success: true,
    mode: "portfolio-demo",
    message: `Rota ${req.method} ${req.originalUrl} simulada no modo demo.`,
    data: {}
  });
});
