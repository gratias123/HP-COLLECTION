import fs from 'fs';
import path from 'path';

// Load current store
const store = JSON.parse(fs.readFileSync('data/store.json', 'utf8'));

// First 12 are the authentic HP COLLECTION looks
const flagshipLooks = store.products.filter(p => p.id.startsWith('prod-look-'));

// Existing unique essentials
const existingOthers = store.products.filter(p => !p.id.startsWith('prod-look-'));

// New diverse styles to add (joggings, baskets, techwear, etc.)
const newDiverseProducts = [
  // --- NOUVEAUX JOGGINGS & SURVÊTEMENTS DE STYLE ---
  {
    id: "prod-srv-004",
    sku: "HPC-SRV-004",
    name: "Ensemble Tracksuit Techwear Cyber Noir & Cordons Réfléchissants",
    slug: "ensemble-tracksuit-techwear-cyber-noir",
    description: "Ensemble pantalon de jogging et veste zippée en nylon déperlant haute résistance avec bandes réfléchissantes 3M et multipoches ergonomiques.",
    price: 39000,
    compareAtPrice: 48000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TECHWEAR",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Noir Cyber", hex: "#111111" }],
    variants: [
      { id: "v-srv4-s", size: "S", color: "Noir Cyber", stock: 5, sku: "HPC-SRV-004-S" },
      { id: "v-srv4-m", size: "M", color: "Noir Cyber", stock: 8, sku: "HPC-SRV-004-M" },
      { id: "v-srv4-l", size: "L", color: "Noir Cyber", stock: 7, sku: "HPC-SRV-004-L" },
      { id: "v-srv4-xl", size: "XL", color: "Noir Cyber", stock: 4, sku: "HPC-SRV-004-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 24,
    status: "published",
    createdAt: "2026-10-31T11:00:00Z",
    updatedAt: "2026-10-31T11:00:00Z"
  },
  {
    id: "prod-srv-005",
    sku: "HPC-SRV-005",
    name: "Jogging Baggy Molleton 480 GSM « Heavy Heavy » Gris Chiné",
    slug: "jogging-baggy-molleton-480-gsm-heavy-heavy-gris",
    description: "Pantalon de jogging ultra lourd en pur coton brossé 480 GSM avec tombé ample streetwear, chevilles élastiquées et poches renforcées.",
    price: 24000,
    compareAtPrice: 30000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "HEAVY FLEECE",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [{ name: "Gris Chiné Lourd", hex: "#8A8D8F" }],
    variants: [
      { id: "v-srv5-m", size: "M", color: "Gris Chiné Lourd", stock: 6, sku: "HPC-SRV-005-M" },
      { id: "v-srv5-l", size: "L", color: "Gris Chiné Lourd", stock: 10, sku: "HPC-SRV-005-L" },
      { id: "v-srv5-xl", size: "XL", color: "Gris Chiné Lourd", stock: 7, sku: "HPC-SRV-005-XL" },
      { id: "v-srv5-xxl", size: "XXL", color: "Gris Chiné Lourd", stock: 3, sku: "HPC-SRV-005-XXL" }
    ],
    lowStockThreshold: 5,
    totalStock: 26,
    status: "published",
    createdAt: "2026-10-31T11:01:00Z",
    updatedAt: "2026-10-31T11:01:00Z"
  },
  {
    id: "prod-srv-006",
    sku: "HPC-SRV-006",
    name: "Ensemble Survêtement Velours Côtelé Émeraude & Or",
    slug: "ensemble-survetement-velours-cotele-emeraude-or",
    description: "Survêtement rétro chic en velours côtelé doux émeraude avec passepoils contrastés or vieilli et zip frontal métallique doré.",
    price: 42000,
    compareAtPrice: 52000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "VELOURS LUXE",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Émeraude Royal", hex: "#0F4D3C" }],
    variants: [
      { id: "v-srv6-s", size: "S", color: "Émeraude Royal", stock: 4, sku: "HPC-SRV-006-S" },
      { id: "v-srv6-m", size: "M", color: "Émeraude Royal", stock: 8, sku: "HPC-SRV-006-M" },
      { id: "v-srv6-l", size: "L", color: "Émeraude Royal", stock: 6, sku: "HPC-SRV-006-L" },
      { id: "v-srv6-xl", size: "XL", color: "Émeraude Royal", stock: 3, sku: "HPC-SRV-006-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 21,
    status: "published",
    createdAt: "2026-10-31T11:02:00Z",
    updatedAt: "2026-10-31T11:02:00Z"
  },
  {
    id: "prod-srv-007",
    sku: "HPC-SRV-007",
    name: "Pantalon de Jogging Cargo Multi-Sangles Streetwear Anthracite",
    slug: "pantalon-jogging-cargo-multi-sangles-anthracite",
    description: "Jogger techwear fusionnant le confort du molleton et les poches cargo à sangles ajustables, cordons élastiqués de serrage cheville.",
    price: 26000,
    compareAtPrice: 32000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TACTICAL JOGGER",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Anthracite Fumé", hex: "#2B2D2F" }],
    variants: [
      { id: "v-srv7-m", size: "M", color: "Anthracite Fumé", stock: 6, sku: "HPC-SRV-007-M" },
      { id: "v-srv7-l", size: "L", color: "Anthracite Fumé", stock: 9, sku: "HPC-SRV-007-L" },
      { id: "v-srv7-xl", size: "XL", color: "Anthracite Fumé", stock: 5, sku: "HPC-SRV-007-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 20,
    status: "published",
    createdAt: "2026-10-31T11:03:00Z",
    updatedAt: "2026-10-31T11:03:00Z"
  },

  // --- NOUVELLES CHAUSSURES DE BASKET & HIGH-TOPS ---
  {
    id: "prod-bsk-004",
    sku: "HPC-BSK-004-RED",
    name: "High Top Retro Court « Chicago Flame » Rouge & Blanc",
    slug: "high-top-retro-court-chicago-flame-rouge-blanc",
    description: "Silhouette haute montante basketball mythique bicolore rouge éclatant et cuir blanc cassé, semelle cousue cupsole et maintien optimal cheville.",
    price: 45000,
    compareAtPrice: 55000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "RETRO COURT",
    isFeatured: true,
    isNew: true,
    sizes: ["41", "42", "43", "44", "45"],
    colors: [{ name: "Rouge & Blanc Court", hex: "#C0392B" }],
    variants: [
      { id: "v-bsk4-41", size: "41", color: "Rouge & Blanc Court", stock: 4, sku: "HPC-BSK-004-41" },
      { id: "v-bsk4-42", size: "42", color: "Rouge & Blanc Court", stock: 7, sku: "HPC-BSK-004-42" },
      { id: "v-bsk4-43", size: "43", color: "Rouge & Blanc Court", stock: 6, sku: "HPC-BSK-004-43" },
      { id: "v-bsk4-44", size: "44", color: "Rouge & Blanc Court", stock: 4, sku: "HPC-BSK-004-44" },
      { id: "v-bsk4-45", size: "45", color: "Rouge & Blanc Court", stock: 2, sku: "HPC-BSK-004-45" }
    ],
    lowStockThreshold: 5,
    totalStock: 23,
    status: "published",
    createdAt: "2026-10-31T11:04:00Z",
    updatedAt: "2026-10-31T11:04:00Z"
  },
  {
    id: "prod-bsk-005",
    sku: "HPC-BSK-005-BLK",
    name: "Baskets Montantes Streetball Shadow Black & Gum",
    slug: "baskets-montantes-streetball-shadow-black-gum",
    description: "Cuir suédé noir mat et renforts texturés sur semelle gum anti-dérapante conçue pour les terrains extérieurs et le streetball intense.",
    price: 43000,
    compareAtPrice: 52000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "STREETBALL",
    isFeatured: false,
    isNew: true,
    sizes: ["41", "42", "43", "44"],
    colors: [{ name: "Shadow Black & Gum", hex: "#1C1C1C" }],
    variants: [
      { id: "v-bsk5-41", size: "41", color: "Shadow Black & Gum", stock: 3, sku: "HPC-BSK-005-41" },
      { id: "v-bsk5-42", size: "42", color: "Shadow Black & Gum", stock: 6, sku: "HPC-BSK-005-42" },
      { id: "v-bsk5-43", size: "43", color: "Shadow Black & Gum", stock: 5, sku: "HPC-BSK-005-43" },
      { id: "v-bsk5-44", size: "44", color: "Shadow Black & Gum", stock: 3, sku: "HPC-BSK-005-44" }
    ],
    lowStockThreshold: 5,
    totalStock: 17,
    status: "published",
    createdAt: "2026-10-31T11:05:00Z",
    updatedAt: "2026-10-31T11:05:00Z"
  },
  {
    id: "prod-bsk-006",
    sku: "HPC-BSK-006",
    name: "Court Master Pro Triple Black Cuir Pleine Fleur",
    slug: "court-master-pro-triple-black-cuir-pleine-fleur",
    description: "Modèle basketball performance profil mi-haut en cuir pleine fleur résistant avec coussin d'air intégré et laçage ghillie ultra sécurisé.",
    price: 46000,
    compareAtPrice: 58000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "PRO EDITION",
    isFeatured: true,
    isNew: true,
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: [{ name: "Triple Black", hex: "#0D0D0D" }],
    variants: [
      { id: "v-bsk6-40", size: "40", color: "Triple Black", stock: 3, sku: "HPC-BSK-006-40" },
      { id: "v-bsk6-41", size: "41", color: "Triple Black", stock: 6, sku: "HPC-BSK-006-41" },
      { id: "v-bsk6-42", size: "42", color: "Triple Black", stock: 8, sku: "HPC-BSK-006-42" },
      { id: "v-bsk6-43", size: "43", color: "Triple Black", stock: 5, sku: "HPC-BSK-006-43" },
      { id: "v-bsk6-44", size: "44", color: "Triple Black", stock: 4, sku: "HPC-BSK-006-44" },
      { id: "v-bsk6-45", size: "45", color: "Triple Black", stock: 2, sku: "HPC-BSK-006-45" }
    ],
    lowStockThreshold: 5,
    totalStock: 28,
    status: "published",
    createdAt: "2026-10-31T11:06:00Z",
    updatedAt: "2026-10-31T11:06:00Z"
  },
  {
    id: "prod-bsk-007",
    sku: "HPC-BSK-007",
    name: "Retro High 90s Heritage « Cyber Teal & White »",
    slug: "retro-high-90s-heritage-cyber-teal-white",
    description: "Clin d'œil aux légendes des playgrounds des années 90 : empiècements géométriques turquoise et col haut rembourré pour style urbain affirmé.",
    price: 44000,
    compareAtPrice: 54000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "90S HERITAGE",
    isFeatured: false,
    isNew: true,
    sizes: ["41", "42", "43", "44"],
    colors: [{ name: "Teal & White", hex: "#008080" }],
    variants: [
      { id: "v-bsk7-41", size: "41", color: "Teal & White", stock: 4, sku: "HPC-BSK-007-41" },
      { id: "v-bsk7-42", size: "42", color: "Teal & White", stock: 7, sku: "HPC-BSK-007-42" },
      { id: "v-bsk7-43", size: "43", color: "Teal & White", stock: 5, sku: "HPC-BSK-007-43" },
      { id: "v-bsk7-44", size: "44", color: "Teal & White", stock: 3, sku: "HPC-BSK-007-44" }
    ],
    lowStockThreshold: 5,
    totalStock: 19,
    status: "published",
    createdAt: "2026-10-31T11:07:00Z",
    updatedAt: "2026-10-31T11:07:00Z"
  },
  {
    id: "prod-bsk-008",
    sku: "HPC-BSK-008",
    name: "Dunk High Premium « Desert Sand & Khaki »",
    slug: "dunk-high-premium-desert-sand-khaki",
    description: "Sneaker montante profil basket en daim brossé teinte sable désert et cuir kaki texturé, parfaite à matcher avec les ensembles cargos.",
    price: 42000,
    compareAtPrice: 51000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "SUEDE COURT",
    isFeatured: false,
    isNew: true,
    sizes: ["41", "42", "43", "44"],
    colors: [{ name: "Sable & Kaki", hex: "#C2B280" }],
    variants: [
      { id: "v-bsk8-41", size: "41", color: "Sable & Kaki", stock: 4, sku: "HPC-BSK-008-41" },
      { id: "v-bsk8-42", size: "42", color: "Sable & Kaki", stock: 6, sku: "HPC-BSK-008-42" },
      { id: "v-bsk8-43", size: "43", color: "Sable & Kaki", stock: 5, sku: "HPC-BSK-008-43" },
      { id: "v-bsk8-44", size: "44", color: "Sable & Kaki", stock: 2, sku: "HPC-BSK-008-44" }
    ],
    lowStockThreshold: 5,
    totalStock: 17,
    status: "published",
    createdAt: "2026-10-31T11:08:00Z",
    updatedAt: "2026-10-31T11:08:00Z"
  },

  // --- NOUVELLES SNEAKERS LIFESTYLE ---
  {
    id: "prod-snk-005",
    sku: "HPC-SNK-005",
    name: "Sneakers Chunky Runner « Lunar Wave » Semelle Sculptée",
    slug: "sneakers-chunky-runner-lunar-wave-semelle-sculptee",
    description: "Silhouette avant-gardiste futuriste avec empeigne en maille respirante multicouche et semelle intermédiaire géométrique ultra absorbante.",
    price: 38000,
    compareAtPrice: 47000,
    category: "sneakers",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "FUTURISTE",
    isFeatured: true,
    isNew: true,
    sizes: ["40", "41", "42", "43", "44"],
    colors: [{ name: "Blanc Lunaire & Argent", hex: "#EAEAEA" }],
    variants: [
      { id: "v-snk5-40", size: "40", color: "Blanc Lunaire & Argent", stock: 3, sku: "HPC-SNK-005-40" },
      { id: "v-snk5-41", size: "41", color: "Blanc Lunaire & Argent", stock: 6, sku: "HPC-SNK-005-41" },
      { id: "v-snk5-42", size: "42", color: "Blanc Lunaire & Argent", stock: 8, sku: "HPC-SNK-005-42" },
      { id: "v-snk5-43", size: "43", color: "Blanc Lunaire & Argent", stock: 5, sku: "HPC-SNK-005-43" },
      { id: "v-snk5-44", size: "44", color: "Blanc Lunaire & Argent", stock: 3, sku: "HPC-SNK-005-44" }
    ],
    lowStockThreshold: 5,
    totalStock: 25,
    status: "published",
    createdAt: "2026-10-31T11:09:00Z",
    updatedAt: "2026-10-31T11:09:00Z"
  },
  {
    id: "prod-snk-006",
    sku: "HPC-SNK-006",
    name: "Sneakers Court Classic Low « Ivory & Forest Gum »",
    slug: "sneakers-court-classic-low-ivory-forest-gum",
    description: "Design intemporel en cuir nappa blanc ivoire, contrefort vert forêt et semelle en gomme vulcanisée au profil épuré.",
    price: 35000,
    compareAtPrice: 43000,
    category: "sneakers",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "CLASSIC LOW",
    isFeatured: false,
    isNew: true,
    sizes: ["40", "41", "42", "43", "44"],
    colors: [{ name: "Ivoire & Vert Forêt", hex: "#F5F5DC" }],
    variants: [
      { id: "v-snk6-40", size: "40", color: "Ivoire & Vert Forêt", stock: 3, sku: "HPC-SNK-006-40" },
      { id: "v-snk6-41", size: "41", color: "Ivoire & Vert Forêt", stock: 6, sku: "HPC-SNK-006-41" },
      { id: "v-snk6-42", size: "42", color: "Ivoire & Vert Forêt", stock: 7, sku: "HPC-SNK-006-42" },
      { id: "v-snk6-43", size: "43", color: "Ivoire & Vert Forêt", stock: 5, sku: "HPC-SNK-006-43" },
      { id: "v-snk6-44", size: "44", color: "Ivoire & Vert Forêt", stock: 3, sku: "HPC-SNK-006-44" }
    ],
    lowStockThreshold: 5,
    totalStock: 24,
    status: "published",
    createdAt: "2026-10-31T11:10:00Z",
    updatedAt: "2026-10-31T11:10:00Z"
  },

  // --- NOUVELLES VESTES VARSITY, BOMBERS & BLOUSONS ---
  {
    id: "prod-var-004",
    sku: "HPC-VAR-004",
    name: "Veste Varsity Cuir Vegan Bicolore Bleu Nuit & Manches Crème",
    slug: "veste-varsity-cuir-vegan-bleu-nuit-manches-creme",
    description: "Veste teddy collégiale d'inspiration vintage en drap de laine bleu marine avec manches contrastées en similicuir crème et écussons brodés chenille.",
    price: 45000,
    compareAtPrice: 56000,
    category: "varsity",
    images: [
      "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "VARSITY ROYAL",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Bleu Nuit & Crème", hex: "#1A2536" }],
    variants: [
      { id: "v-var4-m", size: "M", color: "Bleu Nuit & Crème", stock: 5, sku: "HPC-VAR-004-M" },
      { id: "v-var4-l", size: "L", color: "Bleu Nuit & Crème", stock: 8, sku: "HPC-VAR-004-L" },
      { id: "v-var4-xl", size: "XL", color: "Bleu Nuit & Crème", stock: 4, sku: "HPC-VAR-004-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 17,
    status: "published",
    createdAt: "2026-10-31T11:11:00Z",
    updatedAt: "2026-10-31T11:11:00Z"
  },
  {
    id: "prod-var-005",
    sku: "HPC-VAR-005",
    name: "Blouson Bomber Oversize Matelassé Kaki Militaire & Doublure Cuivrée",
    slug: "blouson-bomber-oversize-matelasse-kaki-militaire",
    description: "Coupe oversize inspirée des blousons de vol MA-1 avec poche utilitaire zippée sur la manche, finitions bord-côtes lourdes et isolation légère.",
    price: 37000,
    compareAtPrice: 46000,
    category: "varsity",
    images: [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "MA-1 BOMBER",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Kaki Armée", hex: "#4B5320" }],
    variants: [
      { id: "v-var5-m", size: "M", color: "Kaki Armée", stock: 5, sku: "HPC-VAR-005-M" },
      { id: "v-var5-l", size: "L", color: "Kaki Armée", stock: 7, sku: "HPC-VAR-005-L" },
      { id: "v-var5-xl", size: "XL", color: "Kaki Armée", stock: 4, sku: "HPC-VAR-005-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 16,
    status: "published",
    createdAt: "2026-10-31T11:12:00Z",
    updatedAt: "2026-10-31T11:12:00Z"
  },
  {
    id: "prod-var-006",
    sku: "HPC-VAR-006",
    name: "Veste Moto Racer Cuir Noir Souple Finitions Métal Vieilli",
    slug: "veste-moto-racer-cuir-noir-souple-finitions-metal",
    description: "Blouson motard contemporain taillé pour la route et la ville avec zips asymétriques en métal brossé et matelassage ergonomique aux épaules.",
    price: 48000,
    compareAtPrice: 60000,
    category: "varsity",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "LEATHER RACER",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Noir Cuir Nappa", hex: "#141414" }],
    variants: [
      { id: "v-var6-m", size: "M", color: "Noir Cuir Nappa", stock: 4, sku: "HPC-VAR-006-M" },
      { id: "v-var6-l", size: "L", color: "Noir Cuir Nappa", stock: 6, sku: "HPC-VAR-006-L" },
      { id: "v-var6-xl", size: "XL", color: "Noir Cuir Nappa", stock: 3, sku: "HPC-VAR-006-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 13,
    status: "published",
    createdAt: "2026-10-31T11:13:00Z",
    updatedAt: "2026-10-31T11:13:00Z"
  },

  // --- NOUVEAUX PANTALONS CARGOS & DENIMS ---
  {
    id: "prod-pan-004",
    sku: "HPC-PAN-004",
    name: "Pantalon Parachute Oversize Cordons Réglables Noir Mat",
    slug: "pantalon-parachute-oversize-cordons-reglables-noir",
    description: "Coupe baggy ballon en tissu technique indéchirable parachute avec cordons de serrage à stoppeurs chromés aux chevilles et à la taille.",
    price: 26000,
    compareAtPrice: 33000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "PARACHUTE FIT",
    isFeatured: false,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Noir Mat", hex: "#181818" }],
    variants: [
      { id: "v-pan4-s", size: "S", color: "Noir Mat", stock: 4, sku: "HPC-PAN-004-S" },
      { id: "v-pan4-m", size: "M", color: "Noir Mat", stock: 8, sku: "HPC-PAN-004-M" },
      { id: "v-pan4-l", size: "L", color: "Noir Mat", stock: 6, sku: "HPC-PAN-004-L" },
      { id: "v-pan4-xl", size: "XL", color: "Noir Mat", stock: 3, sku: "HPC-PAN-004-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 21,
    status: "published",
    createdAt: "2026-10-31T11:14:00Z",
    updatedAt: "2026-10-31T11:14:00Z"
  },
  {
    id: "prod-pan-005",
    sku: "HPC-PAN-005",
    name: "Jean Loose Fit Brut Selvedge 14oz Coupe Skate",
    slug: "jean-loose-fit-brut-selvedge-14oz-coupe-skate",
    description: "Denim authentique rigide 14 onces à liseré selvedge blanc et rouge, coupe ultra large skate inspirée des années 90 et coutures ultra solides.",
    price: 29000,
    compareAtPrice: 38000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "RAW SELVEDGE",
    isFeatured: true,
    isNew: true,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Indigo Brut Profond", hex: "#1A2238" }],
    variants: [
      { id: "v-pan5-30", size: "30", color: "Indigo Brut Profond", stock: 4, sku: "HPC-PAN-005-30" },
      { id: "v-pan5-32", size: "32", color: "Indigo Brut Profond", stock: 7, sku: "HPC-PAN-005-32" },
      { id: "v-pan5-34", size: "34", color: "Indigo Brut Profond", stock: 6, sku: "HPC-PAN-005-34" },
      { id: "v-pan5-36", size: "36", color: "Indigo Brut Profond", stock: 3, sku: "HPC-PAN-005-36" }
    ],
    lowStockThreshold: 5,
    totalStock: 20,
    status: "published",
    createdAt: "2026-10-31T11:15:00Z",
    updatedAt: "2026-10-31T11:15:00Z"
  },
  {
    id: "prod-pan-006",
    sku: "HPC-PAN-006",
    name: "Pantalon Cargo Tactique 8 Poches Toile Armée Kaki",
    slug: "pantalon-cargo-tactique-8-poches-toile-armee-kaki",
    description: "Coton ripstop haute densité résistant aux frottements avec poches à soufflet fermées par boutons pression et renforts genoux.",
    price: 28000,
    compareAtPrice: 35000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "MILITARY CARGO",
    isFeatured: false,
    isNew: true,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Kaki Militaire", hex: "#4A5240" }],
    variants: [
      { id: "v-pan6-30", size: "30", color: "Kaki Militaire", stock: 4, sku: "HPC-PAN-006-30" },
      { id: "v-pan6-32", size: "32", color: "Kaki Militaire", stock: 8, sku: "HPC-PAN-006-32" },
      { id: "v-pan6-34", size: "34", color: "Kaki Militaire", stock: 6, sku: "HPC-PAN-006-34" },
      { id: "v-pan6-36", size: "36", color: "Kaki Militaire", stock: 3, sku: "HPC-PAN-006-36" }
    ],
    lowStockThreshold: 5,
    totalStock: 21,
    status: "published",
    createdAt: "2026-10-31T11:16:00Z",
    updatedAt: "2026-10-31T11:16:00Z"
  },

  // --- NOUVEAUX HOODIES DESIGNER & HEAVYWEIGHT ---
  {
    id: "prod-hdy-004",
    sku: "HPC-HDY-004",
    name: "Hoodie Heavyweight Boxy 500 GSM « No Compromise » Crème",
    slug: "hoodie-heavyweight-boxy-500-gsm-no-compromise-creme",
    description: "Grammage d'exception 500 GSM en molleton pur coton peigné non gratté, tombé lourd sculptural, sans cordon de serrage avec logo brodé ton sur ton.",
    price: 32000,
    compareAtPrice: 40000,
    category: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "500 GSM HEAVY",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [{ name: "Crème Vintage", hex: "#F5F2EB" }],
    variants: [
      { id: "v-hdy4-m", size: "M", color: "Crème Vintage", stock: 5, sku: "HPC-HDY-004-M" },
      { id: "v-hdy4-l", size: "L", color: "Crème Vintage", stock: 8, sku: "HPC-HDY-004-L" },
      { id: "v-hdy4-xl", size: "XL", color: "Crème Vintage", stock: 6, sku: "HPC-HDY-004-XL" },
      { id: "v-hdy4-xxl", size: "XXL", color: "Crème Vintage", stock: 3, sku: "HPC-HDY-004-XXL" }
    ],
    lowStockThreshold: 5,
    totalStock: 22,
    status: "published",
    createdAt: "2026-10-31T11:17:00Z",
    updatedAt: "2026-10-31T11:17:00Z"
  },
  {
    id: "prod-hdy-005",
    sku: "HPC-HDY-005",
    name: "Sweat Crewneck Minimaliste Écru Relief Écusson HPC",
    slug: "sweat-crewneck-minimaliste-ecru-relief-ecusson-hpc",
    description: "Col rond renforcé à double surpiqûre, intérieur gratté ultra doux et coupe ample streetwear adaptée aux climats frais du soir.",
    price: 25000,
    compareAtPrice: 32000,
    category: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "MINIMAL CREW",
    isFeatured: false,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Écru Naturel", hex: "#EAE6DF" }],
    variants: [
      { id: "v-hdy5-s", size: "S", color: "Écru Naturel", stock: 4, sku: "HPC-HDY-005-S" },
      { id: "v-hdy5-m", size: "M", color: "Écru Naturel", stock: 7, sku: "HPC-HDY-005-M" },
      { id: "v-hdy5-l", size: "L", color: "Écru Naturel", stock: 6, sku: "HPC-HDY-005-L" },
      { id: "v-hdy5-xl", size: "XL", color: "Écru Naturel", stock: 3, sku: "HPC-HDY-005-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 20,
    status: "published",
    createdAt: "2026-10-31T11:18:00Z",
    updatedAt: "2026-10-31T11:18:00Z"
  },

  // --- NOUVEAUX TEE-SHIRTS & MAILLOTS STREETWEAR ---
  {
    id: "prod-tsh-006",
    sku: "HPC-TSH-006",
    name: "T-Shirt Boxy Heavyweight Noir « West Africa Heritage »",
    slug: "t-shirt-boxy-heavyweight-noir-west-africa-heritage",
    description: "Coton peigné 260 GSM au toucher sec américain, typographie sérigraphiée à l'encre gonflante 3D célébrant la créativité ouest-africaine.",
    price: 18000,
    compareAtPrice: 24000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "HERITAGE GRAPHIC",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Noir Intense", hex: "#111111" }],
    variants: [
      { id: "v-tsh6-s", size: "S", color: "Noir Intense", stock: 6, sku: "HPC-TSH-006-S" },
      { id: "v-tsh6-m", size: "M", color: "Noir Intense", stock: 12, sku: "HPC-TSH-006-M" },
      { id: "v-tsh6-l", size: "L", color: "Noir Intense", stock: 10, sku: "HPC-TSH-006-L" },
      { id: "v-tsh6-xl", size: "XL", color: "Noir Intense", stock: 6, sku: "HPC-TSH-006-XL" },
      { id: "v-tsh6-xxl", size: "XXL", color: "Noir Intense", stock: 3, sku: "HPC-TSH-006-XXL" }
    ],
    lowStockThreshold: 5,
    totalStock: 37,
    status: "published",
    createdAt: "2026-10-31T11:19:00Z",
    updatedAt: "2026-10-31T11:19:00Z"
  },
  {
    id: "prod-tsh-007-alt",
    sku: "HPC-TSH-008-LUX",
    name: "Chemise Manches Courtes Viscose Émeraude Motifs Baroque",
    slug: "chemise-manches-courtes-viscose-emeraude-baroque",
    description: "Tissu soyeux ultra respirant aux drapés luxueux avec motifs arabesques dorées sur fond vert impérial, col cubain décontracté.",
    price: 23000,
    compareAtPrice: 30000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "RESORT SILK",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Émeraude & Or Baroque", hex: "#124E3F" }],
    variants: [
      { id: "v-tsh7-m", size: "M", color: "Émeraude & Or Baroque", stock: 5, sku: "HPC-TSH-008-M" },
      { id: "v-tsh7-l", size: "L", color: "Émeraude & Or Baroque", stock: 8, sku: "HPC-TSH-008-L" },
      { id: "v-tsh7-xl", size: "XL", color: "Émeraude & Or Baroque", stock: 4, sku: "HPC-TSH-008-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 17,
    status: "published",
    createdAt: "2026-10-31T11:20:00Z",
    updatedAt: "2026-10-31T11:20:00Z"
  },

  // --- NOUVEAUX ACCESSOIRES COORDONNÉS ---
  {
    id: "prod-acc-004",
    sku: "HPC-ACC-004",
    name: "Sacoche Holster Poitrine Double Poche Tactique Cordura",
    slug: "sacoche-holster-poitrine-double-poche-tactique-cordura",
    description: "Harnais de poitrine tactique streetwear réglable en Cordura étanche avec double compartiment zippé et boucles rapides.",
    price: 18000,
    compareAtPrice: 24000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "CHEST RIG",
    isFeatured: true,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Noir Mat Tactique", hex: "#171717" }],
    variants: [
      { id: "v-acc4-u", size: "Unique", color: "Noir Mat Tactique", stock: 18, sku: "HPC-ACC-004-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 18,
    status: "published",
    createdAt: "2026-10-31T11:21:00Z",
    updatedAt: "2026-10-31T11:21:00Z"
  },
  {
    id: "prod-acc-005",
    sku: "HPC-ACC-005",
    name: "Sacoche Bandoulière Crossbody Modular Clip Cobra",
    slug: "sacoche-bandouliere-crossbody-modular-clip-cobra",
    description: "Format compact idéal pour smartphone, portefeuille et clés avec boucle métallique style alpinisme et sangle renforcée.",
    price: 16000,
    compareAtPrice: 22000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "CROSSBODY",
    isFeatured: false,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Noir Profond", hex: "#111111" }],
    variants: [
      { id: "v-acc5-u", size: "Unique", color: "Noir Profond", stock: 20, sku: "HPC-ACC-005-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 20,
    status: "published",
    createdAt: "2026-10-31T11:22:00Z",
    updatedAt: "2026-10-31T11:22:00Z"
  }
];

// Combine all products: Flagship Looks first, then existing clean essentials, then newly added diverse styles
const allCombined = [...flagshipLooks, ...existingOthers, ...newDiverseProducts];

// Strict deduplication check
const uniqueProducts = [];
const seenIds = new Set();
const seenSkus = new Set();
const seenPrimaryImages = new Set();

for (const p of allCombined) {
  if (seenIds.has(p.id)) {
    console.warn(`Skipping duplicate ID: ${p.id}`);
    continue;
  }
  if (seenSkus.has(p.sku)) {
    console.warn(`Skipping duplicate SKU: ${p.sku}`);
    continue;
  }
  if (p.images[0] && seenPrimaryImages.has(p.images[0])) {
    console.warn(`Skipping duplicate primary image on ${p.id}: ${p.images[0]}`);
    continue;
  }

  seenIds.add(p.id);
  seenSkus.add(p.sku);
  if (p.images[0]) seenPrimaryImages.add(p.images[0]);
  uniqueProducts.push(p);
}

console.log(`Total unique catalog items after expansion: ${uniqueProducts.length}`);
console.log(`Unique primary images count: ${seenPrimaryImages.size}`);

// Write to store.json
store.products = uniqueProducts;
fs.writeFileSync('data/store.json', JSON.stringify(store, null, 2), 'utf8');
console.log('Successfully updated data/store.json with rich diverse streetwear styles!');
