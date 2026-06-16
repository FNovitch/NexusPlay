import { normalizeProduct } from "../api/products";
import type { Category, Product, Seller } from "../types";

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Hardware e periféricos",
    slug: "hardware-perifericos",
    description: "Teclados, mouses, mousepads e upgrades de precisão para PC gamer."
  },
  {
    id: "cat-2",
    name: "Áudio e streaming",
    slug: "audio-streaming",
    description: "Headsets, microfones, iluminação e acessórios para partidas, lives e calls."
  },
  {
    id: "cat-3",
    name: "Consoles e controles",
    slug: "consoles-controles",
    description: "Controles, docks, carregadores e acessórios multiplataforma."
  },
  {
    id: "cat-4",
    name: "Setup e ergonomia",
    slug: "setup-ergonomia",
    description: "Suportes, cadeiras, organização e iluminação para mesas confortáveis."
  },
  {
    id: "cat-5",
    name: "Colecionáveis e decoração",
    slug: "colecionaveis-decoracao",
    description: "Displays, estátuas, quadros e peças para personalizar o espaço gamer."
  },
  {
    id: "cat-6",
    name: "Moda e lifestyle geek",
    slug: "moda-lifestyle-geek",
    description: "Camisetas, pins, mochilas e itens de uso diário com identidade geek."
  }
];

export const sellers: Seller[] = [
  {
    id: "seller-1",
    storeName: "Nexus Gear",
    slug: "nexus-gear",
    bio: "Hardware gamer selecionado para quem busca precisão, baixa latência e acabamento premium.",
    story:
      "A Nexus Gear foca em periféricos e equipamentos de performance para PC gamers, streamers e criadores que precisam de resposta rápida sem abrir mão de um setup limpo.",
    avatarUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1400&q=80",
    rating: 4.9,
    salesCount: 516,
    status: "APPROVED"
  },
  {
    id: "seller-2",
    storeName: "Pixel Relic",
    slug: "pixel-relic",
    bio: "Colecionáveis, displays e decoração para transformar mesa, estante e sala gamer.",
    story:
      "A Pixel Relic cria uma curadoria de peças visuais inspiradas por jogos, ficção científica e cultura arcade, com foco em acabamento e presença de coleção.",
    avatarUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=1400&q=80",
    rating: 4.85,
    salesCount: 388,
    status: "APPROVED"
  },
  {
    id: "seller-3",
    storeName: "Arcade Vault",
    slug: "arcade-vault",
    bio: "Acessórios para consoles, iluminação e ergonomia para sessões longas de gameplay.",
    story:
      "A Arcade Vault reúne controles, bases, suportes e itens de conforto para jogadores que alternam entre PC, console e mobile sem bagunçar a estação.",
    avatarUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80",
    rating: 4.92,
    salesCount: 642,
    status: "APPROVED"
  },
  {
    id: "seller-4",
    storeName: "ByteForge Mods",
    slug: "byteforge-mods",
    bio: "Upgrades, refrigeração e peças de modding para PCs com visual limpo e desempenho estável.",
    story:
      "A ByteForge Mods nasceu para aproximar customização de PC, airflow e estética premium de quem monta setups autorais para jogar, estudar e criar.",
    avatarUrl: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1400&q=80",
    rating: 4.87,
    salesCount: 274,
    status: "APPROVED"
  },
  {
    id: "seller-5",
    storeName: "Critical Loot",
    slug: "critical-loot",
    bio: "Presentes geek, RPG, card games e colecionáveis para mesas com personalidade.",
    story:
      "A Critical Loot combina curadoria de RPG, board games, cards e peças decorativas para quem gosta de transformar fandom em objeto de coleção.",
    avatarUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1400&q=80",
    rating: 4.8,
    salesCount: 331,
    status: "APPROVED"
  },
  {
    id: "seller-6",
    storeName: "StreamLab Station",
    slug: "streamlab-station",
    bio: "Equipamentos de streaming, áudio, luz e organização para criadores de conteúdo.",
    story:
      "A StreamLab Station seleciona acessórios para transformar uma mesa comum em uma estação de gravação confiável, bonita e prática.",
    avatarUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=80",
    rating: 4.89,
    salesCount: 429,
    status: "APPROVED"
  }
];

type DemoProduct = {
  seller: number;
  category: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  salesCount: number;
  weight: number;
  dimensions: { width: number; height: number; length: number };
  customizationAvailable?: boolean;
  personalizationPrompt?: string;
  variations?: Array<{ name: string; options: string[] }>;
};

const demoProducts: DemoProduct[] = [
  {
    seller: 0,
    category: 0,
    name: "Teclado Hall Effect NovaStrike 75",
    slug: "teclado-hall-effect-novastrike-75",
    description: "Teclado compacto 75% com switches magnéticos, actuation ajustável, keycaps PBT e perfil pensado para FPS competitivo.",
    price: 589.9,
    stock: 14,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    rating: 4.95,
    salesCount: 152,
    weight: 0.86,
    dimensions: { width: 32, height: 4, length: 14 },
    customizationAvailable: true,
    personalizationPrompt: "Escolha cor do case, força de atuação e layout ABNT2 ou ANSI",
    variations: [{ name: "Layout", options: ["ABNT2", "ANSI"] }]
  },
  {
    seller: 0,
    category: 0,
    name: "Mouse Helios Pro Wireless 8K",
    slug: "mouse-helios-pro-wireless-8k",
    description: "Mouse sem fio ultraleve com polling rate 8K, sensor de alta precisão, skates PTFE e dock de recarga magnético.",
    price: 429.9,
    stock: 18,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
    rating: 4.88,
    salesCount: 117,
    weight: 0.21,
    dimensions: { width: 7, height: 4, length: 12 },
    variations: [{ name: "Cor", options: ["Preto fosco", "Branco gelo"] }]
  },
  {
    seller: 0,
    category: 1,
    name: "Headset ArenaCast USB-C",
    slug: "headset-arenacast-usb-c",
    description: "Headset fechado com áudio espacial, microfone removível, cabo USB-C/P2 e almofadas respiráveis para maratonas online.",
    price: 369.9,
    stock: 10,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    salesCount: 103,
    weight: 0.58,
    dimensions: { width: 20, height: 22, length: 10 },
    customizationAvailable: true,
    personalizationPrompt: "Informe a plataforma principal para receber o cabo indicado",
    variations: [{ name: "Plataforma", options: ["PC", "PlayStation", "Xbox", "Switch"] }]
  },
  {
    seller: 0,
    category: 1,
    name: "Microfone WaveForge RGB",
    slug: "microfone-waveforge-rgb",
    description: "Microfone condensador USB com padrão cardioide, filtro pop integrado, mute por toque e iluminação discreta para streaming.",
    price: 299.9,
    stock: 11,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
    rating: 4.82,
    salesCount: 86,
    weight: 0.74,
    dimensions: { width: 12, height: 24, length: 12 }
  },
  {
    seller: 0,
    category: 3,
    name: "Deskmat SpeedGrid XXL",
    slug: "deskmat-speedgrid-xxl",
    description: "Deskmat de baixa fricção com base emborrachada, costura reforçada e área ampla para mouse, teclado e controle.",
    price: 149.9,
    stock: 21,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    rating: 4.77,
    salesCount: 94,
    weight: 0.62,
    dimensions: { width: 90, height: 0.4, length: 40 },
    variations: [{ name: "Tema", options: ["Cyber", "Minimal", "Nebula"] }]
  },
  {
    seller: 0,
    category: 0,
    name: "Kit Keycaps Prism PBT",
    slug: "kit-keycaps-prism-pbt",
    description: "Conjunto de keycaps PBT double-shot com perfil confortável e compatibilidade com layouts compactos e full size.",
    price: 219.9,
    stock: 12,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    rating: 4.83,
    salesCount: 68,
    weight: 0.38,
    dimensions: { width: 23, height: 6, length: 14 },
    variations: [{ name: "Paleta", options: ["Carbon", "Pastel", "Arcade"] }]
  },
  {
    seller: 1,
    category: 4,
    name: "Estátua Boss Arena Dragão Neon",
    slug: "estatua-boss-arena-dragao-neon",
    description: "Peça decorativa de resina com pintura fosca, detalhes translúcidos e base expositora inspirada em arenas de RPG.",
    price: 279.9,
    stock: 6,
    image: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=900&q=80",
    rating: 4.94,
    salesCount: 71,
    weight: 0.95,
    dimensions: { width: 18, height: 26, length: 18 }
  },
  {
    seller: 1,
    category: 4,
    name: "Display Cartridge Frame",
    slug: "display-cartridge-frame",
    description: "Display acrílico com base magnética para cartuchos, cards ou miniaturas, ideal para organizar uma coleção retrô.",
    price: 129.9,
    stock: 20,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
    rating: 4.81,
    salesCount: 92,
    weight: 0.32,
    dimensions: { width: 14, height: 10, length: 8 },
    customizationAvailable: true,
    personalizationPrompt: "Informe se o display será usado para cartucho, card ou miniatura",
    variations: [{ name: "Tamanho", options: ["Individual", "Trio"] }]
  },
  {
    seller: 1,
    category: 4,
    name: "Quadro Pixel Quest Metal",
    slug: "quadro-pixel-quest-metal",
    description: "Quadro metálico com arte pixelada, acabamento fosco e suporte para parede ou prateleira.",
    price: 159.9,
    stock: 17,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    rating: 4.76,
    salesCount: 63,
    weight: 0.7,
    dimensions: { width: 30, height: 2, length: 40 }
  },
  {
    seller: 1,
    category: 5,
    name: "Camiseta Save Point Oversized",
    slug: "camiseta-save-point-oversized",
    description: "Camiseta oversized em algodão penteado com estampa discreta para quem quer visual geek sem exagero.",
    price: 119.9,
    stock: 28,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    rating: 4.74,
    salesCount: 105,
    weight: 0.26,
    dimensions: { width: 24, height: 4, length: 32 },
    variations: [{ name: "Tamanho", options: ["P", "M", "G", "GG"] }]
  },
  {
    seller: 1,
    category: 5,
    name: "Pin Set Guild Icons",
    slug: "pin-set-guild-icons",
    description: "Kit com seis pins esmaltados inspirados em classes de RPG, ótimo para mochila, jaqueta ou painel de coleção.",
    price: 69.9,
    stock: 35,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    rating: 4.72,
    salesCount: 88,
    weight: 0.12,
    dimensions: { width: 10, height: 3, length: 14 }
  },
  {
    seller: 1,
    category: 4,
    name: "Luminária Portal Core",
    slug: "luminaria-portal-core",
    description: "Luminária circular de mesa com luz suave, base antiderrapante e visual inspirado em portais sci-fi.",
    price: 199.9,
    stock: 9,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
    rating: 4.84,
    salesCount: 59,
    weight: 0.54,
    dimensions: { width: 18, height: 22, length: 10 }
  },
  {
    seller: 2,
    category: 2,
    name: "Controle FluxPad Pro Multiplataforma",
    slug: "controle-fluxpad-pro-multiplataforma",
    description: "Controle sem fio com gatilhos hall effect, conexão Bluetooth/2.4 GHz, grip texturizado e perfis para PC, console e mobile.",
    price: 399.9,
    stock: 16,
    image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80",
    rating: 4.86,
    salesCount: 132,
    weight: 0.36,
    dimensions: { width: 16, height: 7, length: 11 },
    variations: [{ name: "Cor", options: ["Noite", "Cobalto"] }]
  },
  {
    seller: 2,
    category: 2,
    name: "Base DualCharge Station",
    slug: "base-dualcharge-station",
    description: "Dock de carregamento para dois controles com indicadores LED, proteção contra sobrecarga e acabamento baixo perfil.",
    price: 189.9,
    stock: 22,
    image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=900&q=80",
    rating: 4.73,
    salesCount: 79,
    weight: 0.44,
    dimensions: { width: 18, height: 7, length: 14 }
  },
  {
    seller: 2,
    category: 3,
    name: "Braço Titan Arm para monitor",
    slug: "braco-titan-arm-monitor",
    description: "Suporte articulado para monitor de até 32 polegadas, com ajuste de altura, rotação e passagem interna de cabos.",
    price: 259.9,
    stock: 9,
    image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=900&q=80",
    rating: 4.79,
    salesCount: 64,
    weight: 2.4,
    dimensions: { width: 43, height: 12, length: 18 }
  },
  {
    seller: 2,
    category: 3,
    name: "Painel PixelWall Mini RGB",
    slug: "painel-pixelwall-mini-rgb",
    description: "Kit modular de painéis luminosos para fundo de live, iluminação ambiente e cenas sincronizadas com o setup.",
    price: 329.9,
    stock: 7,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
    rating: 4.91,
    salesCount: 98,
    weight: 1.2,
    dimensions: { width: 28, height: 8, length: 28 },
    customizationAvailable: true,
    personalizationPrompt: "Informe o formato de montagem desejado: linha, colmeia ou canto",
    variations: [{ name: "Kit", options: ["6 painéis", "9 painéis"] }]
  },
  {
    seller: 2,
    category: 2,
    name: "Grip Mobile RaidClip",
    slug: "grip-mobile-raidclip",
    description: "Suporte gamer para celular com pegada confortável, gatilhos mecânicos e ventilação para partidas longas.",
    price: 139.9,
    stock: 26,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    rating: 4.69,
    salesCount: 73,
    weight: 0.28,
    dimensions: { width: 17, height: 5, length: 12 }
  },
  {
    seller: 2,
    category: 3,
    name: "Suporte Headset DockTower",
    slug: "suporte-headset-docktower",
    description: "Suporte de headset com hub USB, base pesada e iluminação ajustável para manter o setup organizado.",
    price: 229.9,
    stock: 13,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80",
    rating: 4.75,
    salesCount: 58,
    weight: 0.68,
    dimensions: { width: 16, height: 28, length: 14 }
  },
  {
    seller: 3,
    category: 0,
    name: "Kit Fans FrostByte ARGB 120",
    slug: "kit-fans-frostbyte-argb-120",
    description: "Trio de fans ARGB de 120 mm com controladora, bom fluxo de ar e ruído reduzido para gabinetes gamer.",
    price: 249.9,
    stock: 19,
    image: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    salesCount: 84,
    weight: 0.76,
    dimensions: { width: 14, height: 12, length: 18 }
  },
  {
    seller: 3,
    category: 0,
    name: "Sleeve Cable Set Aurora",
    slug: "sleeve-cable-set-aurora",
    description: "Extensões sleeved para fonte com pente organizador e acabamento premium para builds com lateral de vidro.",
    price: 189.9,
    stock: 24,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80",
    rating: 4.71,
    salesCount: 57,
    weight: 0.42,
    dimensions: { width: 18, height: 5, length: 24 },
    variations: [{ name: "Cor", options: ["Preto", "Branco", "Roxo"] }]
  },
  {
    seller: 3,
    category: 0,
    name: "Suporte GPU Atlas Brace",
    slug: "suporte-gpu-atlas-brace",
    description: "Suporte ajustável para placa de vídeo com base magnética, visual discreto e acabamento em alumínio.",
    price: 119.9,
    stock: 31,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80",
    rating: 4.66,
    salesCount: 49,
    weight: 0.22,
    dimensions: { width: 6, height: 18, length: 6 }
  },
  {
    seller: 3,
    category: 3,
    name: "Organizador CableRun Pro",
    slug: "organizador-cablerun-pro",
    description: "Kit de canaletas, velcros e presilhas para esconder cabos em setups de mesa, streaming ou home office.",
    price: 89.9,
    stock: 40,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    rating: 4.64,
    salesCount: 116,
    weight: 0.36,
    dimensions: { width: 18, height: 7, length: 28 }
  },
  {
    seller: 3,
    category: 0,
    name: "Pasta Térmica CryoForge X",
    slug: "pasta-termica-cryoforge-x",
    description: "Pasta térmica de alta condutividade para manutenção de processadores, notebooks e consoles.",
    price: 59.9,
    stock: 52,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    salesCount: 143,
    weight: 0.05,
    dimensions: { width: 3, height: 12, length: 3 }
  },
  {
    seller: 3,
    category: 3,
    name: "Riser Stand AirFlow",
    slug: "riser-stand-airflow",
    description: "Base elevada para notebook ou console portátil com ventilação passiva e ângulo confortável.",
    price: 169.9,
    stock: 15,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    rating: 4.68,
    salesCount: 51,
    weight: 0.84,
    dimensions: { width: 28, height: 7, length: 24 }
  },
  {
    seller: 4,
    category: 4,
    name: "Dados RPG Arcane Dice Set",
    slug: "dados-rpg-arcane-dice-set",
    description: "Set de sete dados translúcidos com numeração contrastante, estojo rígido e visual de mesa premium.",
    price: 99.9,
    stock: 33,
    image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=80",
    rating: 4.87,
    salesCount: 124,
    weight: 0.18,
    dimensions: { width: 9, height: 4, length: 12 }
  },
  {
    seller: 4,
    category: 4,
    name: "Deck Box ManaVault",
    slug: "deck-box-manavault",
    description: "Deck box rígida para card games com divisórias, fecho magnético e espaço para sleeves.",
    price: 139.9,
    stock: 27,
    image: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=900&q=80",
    rating: 4.78,
    salesCount: 76,
    weight: 0.3,
    dimensions: { width: 11, height: 9, length: 12 }
  },
  {
    seller: 4,
    category: 4,
    name: "Miniatura Mech Sentinel",
    slug: "miniatura-mech-sentinel",
    description: "Miniatura de mecha em resina para pintura, diorama ou decoração de prateleira sci-fi.",
    price: 179.9,
    stock: 11,
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    rating: 4.82,
    salesCount: 44,
    weight: 0.24,
    dimensions: { width: 9, height: 14, length: 9 }
  },
  {
    seller: 4,
    category: 5,
    name: "Mochila LootPack Compact",
    slug: "mochila-lootpack-compact",
    description: "Mochila compacta com divisória acolchoada, bolsos para acessórios e visual urbano com detalhes geek.",
    price: 249.9,
    stock: 18,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    rating: 4.73,
    salesCount: 67,
    weight: 0.68,
    dimensions: { width: 30, height: 44, length: 14 }
  },
  {
    seller: 4,
    category: 5,
    name: "Caneca Critical Hit 500ml",
    slug: "caneca-critical-hit-500ml",
    description: "Caneca grande com acabamento fosco, tampa de silicone e arte minimalista inspirada em RPG.",
    price: 79.9,
    stock: 42,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    rating: 4.67,
    salesCount: 138,
    weight: 0.48,
    dimensions: { width: 10, height: 14, length: 10 }
  },
  {
    seller: 4,
    category: 4,
    name: "Playmat Dungeon Grid",
    slug: "playmat-dungeon-grid",
    description: "Playmat dobrável com grid discreto para RPG, cards e board games, com superfície macia e antiderrapante.",
    price: 159.9,
    stock: 14,
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=900&q=80",
    rating: 4.79,
    salesCount: 62,
    weight: 0.52,
    dimensions: { width: 60, height: 0.3, length: 35 }
  },
  {
    seller: 5,
    category: 1,
    name: "Ring Light HaloCast 12",
    slug: "ring-light-halocast-12",
    description: "Ring light de 12 polegadas com tripé, controle de temperatura e suporte para smartphone.",
    price: 219.9,
    stock: 23,
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=900&q=80",
    rating: 4.81,
    salesCount: 111,
    weight: 1.1,
    dimensions: { width: 34, height: 8, length: 36 }
  },
  {
    seller: 5,
    category: 1,
    name: "Interface Audio MiniMix USB",
    slug: "interface-audio-minimix-usb",
    description: "Interface compacta para microfone e fone com controles físicos, monitoramento direto e conexão USB-C.",
    price: 449.9,
    stock: 8,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80",
    rating: 4.86,
    salesCount: 52,
    weight: 0.62,
    dimensions: { width: 18, height: 6, length: 14 }
  },
  {
    seller: 5,
    category: 1,
    name: "Braço BoomCast Pro",
    slug: "braco-boomcast-pro",
    description: "Braço articulado para microfone com molas internas, presilha firme e passagem discreta de cabo.",
    price: 199.9,
    stock: 16,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
    rating: 4.77,
    salesCount: 74,
    weight: 1.04,
    dimensions: { width: 45, height: 7, length: 12 }
  },
  {
    seller: 5,
    category: 1,
    name: "Stream Deck MacroPad 15",
    slug: "stream-deck-macropad-15",
    description: "Macro pad com 15 teclas programáveis para cenas, atalhos, comandos de edição e automações de live.",
    price: 389.9,
    stock: 12,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    rating: 4.83,
    salesCount: 69,
    weight: 0.4,
    dimensions: { width: 14, height: 4, length: 10 }
  },
  {
    seller: 5,
    category: 3,
    name: "Acoustic Foam Starter Kit",
    slug: "acoustic-foam-starter-kit",
    description: "Kit com placas acústicas leves para reduzir reflexões em gravações, lives e calls.",
    price: 179.9,
    stock: 20,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
    rating: 4.65,
    salesCount: 46,
    weight: 0.9,
    dimensions: { width: 32, height: 18, length: 32 }
  },
  {
    seller: 5,
    category: 1,
    name: "Webcam FocusCam 2K",
    slug: "webcam-focuscam-2k",
    description: "Webcam 2K com foco automático, tampa de privacidade e ajuste de luz para streams e reuniões.",
    price: 329.9,
    stock: 19,
    image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=900&q=80",
    rating: 4.74,
    salesCount: 83,
    weight: 0.22,
    dimensions: { width: 9, height: 6, length: 5 }
  }
];

export const products: Product[] = demoProducts.map((product, index) => {
  const seller = sellers[product.seller];
  const category = categories[product.category];

  return normalizeProduct({
    id: `prod-${index + 1}`,
    sellerId: seller.id,
    categoryId: category.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    stock: product.stock,
    images: [product.image],
    mainImage: product.image,
    customizationAvailable: product.customizationAvailable ?? false,
    personalizationPrompt: product.personalizationPrompt,
    variations: product.variations ?? [],
    weight: product.weight,
    dimensions: product.dimensions,
    rating: product.rating,
    averageRating: product.rating,
    salesCount: product.salesCount,
    seller,
    category,
    categoryDetails: category,
    artisanId: seller.id,
    artisanName: seller.storeName,
    artisanSlug: seller.slug,
    shippingAvailable: true,
    pickupAvailable: true,
    pickupAddress: "Retirada demo mediante confirmacao do pedido"
  });
});
