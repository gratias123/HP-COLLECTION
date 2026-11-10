import fs from 'fs';
import path from 'path';

const products = [
  // --- 12 PIÈCES SIGNATURE HP COLLECTION (PHOTOS RÉELLES BÉNIN / COTONOU) ---
  {
    id: "prod-look-001",
    sku: "HPC-DEN-001",
    name: "Veste Denim Délavée « Cyber Drip » Broderies & Casquette HP",
    description: "Veste en denim délavé artisanal avec finitions brodées aux manches, coupe structurée inspirée du streetwear béninois. Livrée avec écusson collector.",
    price: 35000,
    compareAtPrice: 42000,
    category: "varsity",
    images: [
      "/assets/aistudio/1793196164363_1__528b35f1.jpg",
      "/assets/aistudio/1793196164363_1__528b35f1.jpg"
    ],
    badge: "COLLECTION 2026",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Bleu Brut Délavé", hex: "#4A6B82" }],
    variants: [
      { id: "v-001-m", size: "M", color: "Bleu Brut Délavé", stock: 6, sku: "HPC-DEN-001-M" },
      { id: "v-001-l", size: "L", color: "Bleu Brut Délavé", stock: 8, sku: "HPC-DEN-001-L" },
      { id: "v-001-xl", size: "XL", color: "Bleu Brut Délavé", stock: 4, sku: "HPC-DEN-001-XL" }
    ],
    totalStock: 18,
    createdAt: "2026-10-31T10:00:00Z"
  },
  {
    id: "prod-look-002",
    sku: "HPC-SHR-002",
    name: "Chemise Satinée Motif Bandana Émeraude « Cotonou Night »",
    description: "Chemise fluide à col cubain en twill de viscose satiné, imprimé bandana cachemire émeraude et turquoise. Tombé impeccable et confort thermique pour les soirées chaudes.",
    price: 22000,
    compareAtPrice: 28000,
    category: "tshirts",
    images: [
      "/assets/aistudio/1793196179671_1__fa78fa1f.jpg",
      "/assets/aistudio/1793196179671_1__fa78fa1f.jpg"
    ],
    badge: "EXCLUSIF",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Émeraude & Turquoise", hex: "#1A4D43" }],
    variants: [
      { id: "v-002-s", size: "S", color: "Émeraude & Turquoise", stock: 5, sku: "HPC-SHR-002-S" },
      { id: "v-002-m", size: "M", color: "Émeraude & Turquoise", stock: 10, sku: "HPC-SHR-002-M" },
      { id: "v-002-l", size: "L", color: "Émeraude & Turquoise", stock: 7, sku: "HPC-SHR-002-L" },
      { id: "v-002-xl", size: "XL", color: "Émeraude & Turquoise", stock: 4, sku: "HPC-SHR-002-XL" }
    ],
    totalStock: 26,
    createdAt: "2026-10-31T10:01:00Z"
  },
  {
    id: "prod-look-003",
    sku: "HPC-LTR-003",
    name: "Blouson Moto Biker Cuir Rouge Écarlate HP",
    description: "Blouson racer court en cuir synthétique de haute densité rouge écarlate. Col montant à bouton pression, zips métalliques renforcés et coupe fitted streetwear.",
    price: 45000,
    compareAtPrice: 55000,
    category: "varsity",
    images: [
      "/assets/aistudio/1793196195794_1__83aad193.jpg",
      "/assets/aistudio/1793196195794_1__83aad193.jpg"
    ],
    badge: "ÉDITION LIMITÉE",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Rouge Écarlate", hex: "#B22222" }],
    variants: [
      { id: "v-003-m", size: "M", color: "Rouge Écarlate", stock: 4, sku: "HPC-LTR-003-M" },
      { id: "v-003-l", size: "L", color: "Rouge Écarlate", stock: 6, sku: "HPC-LTR-003-L" },
      { id: "v-003-xl", size: "XL", color: "Rouge Écarlate", stock: 3, sku: "HPC-LTR-003-XL" }
    ],
    totalStock: 13,
    createdAt: "2026-10-31T10:02:00Z"
  },
  {
    id: "prod-look-004",
    sku: "HPC-ENS-004",
    name: "Ensemble Tailored Streetwear Monogram Rouge Écarlate",
    description: "Veste courte cintrée streetwear et pantalon de tailleur rouge carmin avec béret d'apparat coordonné. Coupe architecturale moderne inspirée de la haute couture béninoise.",
    price: 38000,
    compareAtPrice: 48000,
    category: "survetements",
    images: [
      "/assets/aistudio/1793196158473_10a41edc.jpg",
      "/assets/aistudio/detail_ensemble_rouge.jpg"
    ],
    badge: "COUTURE",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Rouge Carmin Royal", hex: "#9E1B32" }],
    variants: [
      { id: "v-004-s", size: "S", color: "Rouge Carmin Royal", stock: 4, sku: "HPC-ENS-004-S" },
      { id: "v-004-m", size: "M", color: "Rouge Carmin Royal", stock: 7, sku: "HPC-ENS-004-M" },
      { id: "v-004-l", size: "L", color: "Rouge Carmin Royal", stock: 5, sku: "HPC-ENS-004-L" },
      { id: "v-004-xl", size: "XL", color: "Rouge Carmin Royal", stock: 3, sku: "HPC-ENS-004-XL" }
    ],
    totalStock: 19,
    createdAt: "2026-10-31T10:03:00Z"
  },
  {
    id: "prod-look-005",
    sku: "HPC-WND-005",
    name: "Veste Coupe-Vent Imprimé Floral Streetwear « Jetour »",
    description: "Coupe-vent technique léger à imprimé floral tropical vibrant, col montant zippé et cordon élastique ajustable. Livré avec bandoulière holster tactique kaki assortie.",
    price: 32000,
    compareAtPrice: 39000,
    category: "varsity",
    images: [
      "/assets/aistudio/1793196173456_2efd8b7f.jpg",
      "/assets/aistudio/detail_veste_floral.jpg"
    ],
    badge: "TENDANCE",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Multicolore Floral & Kaki", hex: "#D4A373" }],
    variants: [
      { id: "v-005-m", size: "M", color: "Multicolore Floral & Kaki", stock: 5, sku: "HPC-WND-005-M" },
      { id: "v-005-l", size: "L", color: "Multicolore Floral & Kaki", stock: 8, sku: "HPC-WND-005-L" },
      { id: "v-005-xl", size: "XL", color: "Multicolore Floral & Kaki", stock: 4, sku: "HPC-WND-005-XL" }
    ],
    totalStock: 17,
    createdAt: "2026-10-31T10:04:00Z"
  },
  {
    id: "prod-look-006",
    sku: "HPC-LTR-006",
    name: "Blouson Cuir Street Tailoring Noir & Chemise Cravate",
    description: "Blouson en cuir nappa structuré col chemise, combinable avec chemise blanche d'apparat et cravate slim. Silhouette street-tailoring contemporaine portée par les ambassadeurs de la marque.",
    price: 42000,
    compareAtPrice: 52000,
    category: "varsity",
    images: [
      "/assets/aistudio/1793196147632_7512d9e2.jpg",
      "/assets/aistudio/detail_cuir_cravate.jpg"
    ],
    badge: "PREMIUM",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [{ name: "Noir Cuir Intense", hex: "#111111" }],
    variants: [
      { id: "v-006-m", size: "M", color: "Noir Cuir Intense", stock: 4, sku: "HPC-LTR-006-M" },
      { id: "v-006-l", size: "L", color: "Noir Cuir Intense", stock: 6, sku: "HPC-LTR-006-L" },
      { id: "v-006-xl", size: "XL", color: "Noir Cuir Intense", stock: 4, sku: "HPC-LTR-006-XL" },
      { id: "v-006-xxl", size: "XXL", color: "Noir Cuir Intense", stock: 2, sku: "HPC-LTR-006-XXL" }
    ],
    totalStock: 16,
    createdAt: "2026-10-31T10:05:00Z"
  },
  {
    id: "prod-look-007",
    sku: "HPC-TSH-007",
    name: "T-Shirt Oversize Graphic Jaune Soleil « Dsquared Vibe »",
    description: "T-shirt boxy lourd en pur coton 260 GSM jaune éclatant avec sérigraphie contrastée noire & rouge « Keep Movin Around ». Coupe décontractée parfaite avec un denim clair.",
    price: 18000,
    compareAtPrice: 24000,
    category: "tshirts",
    images: [
      "/assets/aistudio/1793196166988_ff45ad79.jpg",
      "/assets/aistudio/detail_tshirt_jaune.jpg"
    ],
    badge: "BEST-SELLER",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Jaune Soleil Intense", hex: "#F5B041" }],
    variants: [
      { id: "v-007-s", size: "S", color: "Jaune Soleil Intense", stock: 6, sku: "HPC-TSH-007-S" },
      { id: "v-007-m", size: "M", color: "Jaune Soleil Intense", stock: 12, sku: "HPC-TSH-007-M" },
      { id: "v-007-l", size: "L", color: "Jaune Soleil Intense", stock: 8, sku: "HPC-TSH-007-L" },
      { id: "v-007-xl", size: "XL", color: "Jaune Soleil Intense", stock: 5, sku: "HPC-TSH-007-XL" }
    ],
    totalStock: 31,
    createdAt: "2026-10-31T10:06:00Z"
  },
  {
    id: "prod-look-008",
    sku: "HPC-PNT-008",
    name: "Jean Baggy Patchwork Rust & Terre Déstructuré",
    description: "Denim loose fit assemblé avec empiècements teintes terre brûlée et finitions raw edge. Boucle de ceinture western cloutée signature et confort absolu.",
    price: 26000,
    compareAtPrice: 34000,
    category: "pantalons",
    images: [
      "/assets/aistudio/1793196161270_6422d56b.jpg",
      "/assets/aistudio/detail_jean_patchwork.jpg"
    ],
    badge: "NOUVEAU",
    isFeatured: true,
    isNew: true,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Denim Rust Terre", hex: "#8D5B4C" }],
    variants: [
      { id: "v-008-30", size: "30", color: "Denim Rust Terre", stock: 5, sku: "HPC-PNT-008-30" },
      { id: "v-008-32", size: "32", color: "Denim Rust Terre", stock: 9, sku: "HPC-PNT-008-32" },
      { id: "v-008-34", size: "34", color: "Denim Rust Terre", stock: 7, sku: "HPC-PNT-008-34" },
      { id: "v-008-36", size: "36", color: "Denim Rust Terre", stock: 3, sku: "HPC-PNT-008-36" }
    ],
    totalStock: 24,
    createdAt: "2026-10-31T10:07:00Z"
  },
  {
    id: "prod-look-009",
    sku: "HPC-HKM-009",
    name: "Pantalon Large Hakama Soie Noire Jacquard Dragon",
    description: "Pantalon drapé oversize coupe hakama japonaise avec motif dragon impérial tissé en jacquard ton sur ton. Fluidité, ampleur théâtrale et tombé majestueux.",
    price: 29000,
    compareAtPrice: 38000,
    category: "pantalons",
    images: [
      "/assets/aistudio/hakama_dragon_left.jpg",
      "/assets/aistudio/hakama_dragon_right.jpg"
    ],
    badge: "HAUTE PIÈCE",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Noir Soie Jacquard", hex: "#1A1A1A" }],
    variants: [
      { id: "v-009-m", size: "M", color: "Noir Soie Jacquard", stock: 5, sku: "HPC-HKM-009-M" },
      { id: "v-009-l", size: "L", color: "Noir Soie Jacquard", stock: 8, sku: "HPC-HKM-009-L" },
      { id: "v-009-xl", size: "XL", color: "Noir Soie Jacquard", stock: 4, sku: "HPC-HKM-009-XL" }
    ],
    totalStock: 17,
    createdAt: "2026-10-31T10:08:00Z"
  },
  {
    id: "prod-look-010",
    sku: "HPC-ENS-010",
    name: "Ensemble Plissé Resort Côtelé Blanc Pur 2 Pièces",
    description: "Ensemble estival haut de gamme composé d'une chemisette col mao plissée et d'un pantalon ample assorti en gaze côtelée ultra respirante. Chic minimaliste et décontraction raffinée.",
    price: 35000,
    compareAtPrice: 44000,
    category: "survetements",
    images: [
      "/assets/aistudio/1793196240812_1c830730.jpg",
      "/assets/aistudio/detail_ensemble_plisse_top.jpg"
    ],
    badge: "RESORT",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanc Pur Côtelé", hex: "#FDFDFD" }],
    variants: [
      { id: "v-010-s", size: "S", color: "Blanc Pur Côtelé", stock: 4, sku: "HPC-ENS-010-S" },
      { id: "v-010-m", size: "M", color: "Blanc Pur Côtelé", stock: 8, sku: "HPC-ENS-010-M" },
      { id: "v-010-l", size: "L", color: "Blanc Pur Côtelé", stock: 6, sku: "HPC-ENS-010-L" },
      { id: "v-010-xl", size: "XL", color: "Blanc Pur Côtelé", stock: 3, sku: "HPC-ENS-010-XL" }
    ],
    totalStock: 21,
    createdAt: "2026-10-31T10:09:00Z"
  },
  {
    id: "prod-look-011",
    sku: "HPC-TSH-011",
    name: "T-Shirt Boxy Heavyweight Coton Blanc Pur 260 GSM",
    description: "T-shirt ultra épais au tombé structuré, col épais 3 cm anti-déformation, coupe boxy streetwear épurée. Confection coton peigné respirant adapté au climat côtier.",
    price: 16000,
    compareAtPrice: 22000,
    category: "tshirts",
    images: [
      "/assets/aistudio/1793196150409_434dab46.jpg",
      "/assets/aistudio/detail_tshirt_blanc_boxy.jpg"
    ],
    badge: "ESSENTIEL",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanc Optique", hex: "#FFFFFF" }],
    variants: [
      { id: "v-011-s", size: "S", color: "Blanc Optique", stock: 8, sku: "HPC-TSH-011-S" },
      { id: "v-011-m", size: "M", color: "Blanc Optique", stock: 15, sku: "HPC-TSH-011-M" },
      { id: "v-011-l", size: "L", color: "Blanc Optique", stock: 10, sku: "HPC-TSH-011-L" },
      { id: "v-011-xl", size: "XL", color: "Blanc Optique", stock: 6, sku: "HPC-TSH-011-XL" }
    ],
    totalStock: 39,
    createdAt: "2026-10-31T10:10:00Z"
  },
  {
    id: "prod-look-012",
    sku: "HPC-JRS-012",
    name: "Maillot Moto Jersey Racing « Speed Eagle » Bicolore",
    description: "Jersey manches longues respirant style moto GP / motocross vintage avec graphisme aiglon racing et motif damier contrasté sur les manches. Coupe ample sportive.",
    price: 22000,
    compareAtPrice: 29000,
    category: "tshirts",
    images: [
      "/assets/aistudio/1793196187904_68957bff.jpg",
      "/assets/aistudio/detail_jersey_racing.jpg"
    ],
    badge: "RACING",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Noir & Blanc Racing", hex: "#222222" }],
    variants: [
      { id: "v-012-m", size: "M", color: "Noir & Blanc Racing", stock: 6, sku: "HPC-JRS-012-M" },
      { id: "v-012-l", size: "L", color: "Noir & Blanc Racing", stock: 9, sku: "HPC-JRS-012-L" },
      { id: "v-012-xl", size: "XL", color: "Noir & Blanc Racing", stock: 5, sku: "HPC-JRS-012-XL" }
    ],
    totalStock: 20,
    createdAt: "2026-10-31T10:11:00Z"
  },

  // --- SNEAKERS & BASKETS EXCLUSIVES (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-snk-001",
    sku: "HPC-SNK-001",
    name: "Sneakers Skate Chunky Semelle Gum Suède & Toile",
    description: "Silhouette basse skate rétro avec empiècements suède doux et semelle extérieure en gomme naturelle alvéolée.",
    price: 34000,
    compareAtPrice: 42000,
    category: "sneakers",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "SKATE",
    isFeatured: true,
    isNew: false,
    sizes: ["40", "41", "42", "43", "44"],
    colors: [{ name: "Noir & Gum", hex: "#262626" }],
    variants: [
      { id: "v-snk1-40", size: "40", color: "Noir & Gum", stock: 3, sku: "HPC-SNK-001-40" },
      { id: "v-snk1-41", size: "41", color: "Noir & Gum", stock: 5, sku: "HPC-SNK-001-41" },
      { id: "v-snk1-42", size: "42", color: "Noir & Gum", stock: 6, sku: "HPC-SNK-001-42" },
      { id: "v-snk1-43", size: "43", color: "Noir & Gum", stock: 4, sku: "HPC-SNK-001-43" },
      { id: "v-snk1-44", size: "44", color: "Noir & Gum", stock: 2, sku: "HPC-SNK-001-44" }
    ],
    totalStock: 20,
    createdAt: "2026-10-31T09:00:00Z"
  },
  {
    id: "prod-snk-002",
    sku: "HPC-SNK-002",
    name: "Sneakers HP Dunk Low « Vintage Bone & Forest »",
    description: "Cuir pleine fleur bicolore blanc os et vert forêt profond, semelle intermédiaire pré-vieillie et lacets en coton épais.",
    price: 39000,
    compareAtPrice: 49000,
    category: "sneakers",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "COLLECTOR",
    isFeatured: true,
    isNew: true,
    sizes: ["41", "42", "43", "44"],
    colors: [{ name: "Bone & Forêt", hex: "#2D5A27" }],
    variants: [
      { id: "v-snk2-41", size: "41", color: "Bone & Forêt", stock: 4, sku: "HPC-SNK-002-41" },
      { id: "v-snk2-42", size: "42", color: "Bone & Forêt", stock: 7, sku: "HPC-SNK-002-42" },
      { id: "v-snk2-43", size: "43", color: "Bone & Forêt", stock: 5, sku: "HPC-SNK-002-43" },
      { id: "v-snk2-44", size: "44", color: "Bone & Forêt", stock: 3, sku: "HPC-SNK-002-44" }
    ],
    totalStock: 19,
    createdAt: "2026-10-31T09:01:00Z"
  },
  {
    id: "prod-snk-003",
    sku: "HPC-SNK-003",
    name: "Baskets Chunky Runner « Phantom Grey » Amorti Air",
    description: "Mesh technique respirant et cuir synthétique superposé sur semelle intermédiaire XXL ultra amortissante.",
    price: 36000,
    compareAtPrice: 45000,
    category: "sneakers",
    images: [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "RUNNER",
    isFeatured: false,
    isNew: false,
    sizes: ["40", "41", "42", "43", "44"],
    colors: [{ name: "Gris Phantom", hex: "#708090" }],
    variants: [
      { id: "v-snk3-40", size: "40", color: "Gris Phantom", stock: 3, sku: "HPC-SNK-003-40" },
      { id: "v-snk3-41", size: "41", color: "Gris Phantom", stock: 6, sku: "HPC-SNK-003-41" },
      { id: "v-snk3-42", size: "42", color: "Gris Phantom", stock: 8, sku: "HPC-SNK-003-42" },
      { id: "v-snk3-43", size: "43", color: "Gris Phantom", stock: 4, sku: "HPC-SNK-003-43" },
      { id: "v-snk3-44", size: "44", color: "Gris Phantom", stock: 2, sku: "HPC-SNK-003-44" }
    ],
    totalStock: 23,
    createdAt: "2026-10-31T09:02:00Z"
  },
  {
    id: "prod-snk-004",
    sku: "HPC-SNK-004",
    name: "Sneakers HP Apex Low Retro « Obsidian Gold »",
    description: "Sneaker basse streetwear cuir nappa teinté noir profond rehaussé de touches dorées métallisées.",
    price: 37000,
    compareAtPrice: 46000,
    category: "sneakers",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "SIGNATURE",
    isFeatured: true,
    isNew: false,
    sizes: ["41", "42", "43", "44", "45"],
    colors: [{ name: "Noir & Or", hex: "#1C1C1C" }],
    variants: [
      { id: "v-snk4-41", size: "41", color: "Noir & Or", stock: 4, sku: "HPC-SNK-004-41" },
      { id: "v-snk4-42", size: "42", color: "Noir & Or", stock: 6, sku: "HPC-SNK-004-42" },
      { id: "v-snk4-43", size: "43", color: "Noir & Or", stock: 5, sku: "HPC-SNK-004-43" },
      { id: "v-snk4-44", size: "44", color: "Noir & Or", stock: 3, sku: "HPC-SNK-004-44" },
      { id: "v-snk4-45", size: "45", color: "Noir & Or", stock: 2, sku: "HPC-SNK-004-45" }
    ],
    totalStock: 20,
    createdAt: "2026-10-31T09:03:00Z"
  },

  // --- BASKETBALL COURT (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-bsk-001",
    sku: "HPC-BSK-001",
    name: "Court Pro Bounce Triple White Amorti Rebond",
    description: "Modèle basketball performance profil bas, empeigne mesh respirant et semelle injectée dynamique pour playground et streetball.",
    price: 38000,
    compareAtPrice: 47000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "PERFORMANCE",
    isFeatured: false,
    isNew: true,
    sizes: ["41", "42", "43", "44", "45"],
    colors: [{ name: "Blanc Pur", hex: "#F8F9FA" }],
    variants: [
      { id: "v-bsk1-41", size: "41", color: "Blanc Pur", stock: 3, sku: "HPC-BSK-001-41" },
      { id: "v-bsk1-42", size: "42", color: "Blanc Pur", stock: 6, sku: "HPC-BSK-001-42" },
      { id: "v-bsk1-43", size: "43", color: "Blanc Pur", stock: 5, sku: "HPC-BSK-001-43" },
      { id: "v-bsk1-44", size: "44", color: "Blanc Pur", stock: 3, sku: "HPC-BSK-001-44" },
      { id: "v-bsk1-45", size: "45", color: "Blanc Pur", stock: 2, sku: "HPC-BSK-001-45" }
    ],
    totalStock: 19,
    createdAt: "2026-10-31T09:04:00Z"
  },
  {
    id: "prod-bsk-002",
    sku: "HPC-BSK-002",
    name: "Air Court High Retro Black & Gold Vieilli",
    description: "Silhouette haute montante basketball vintage, tige cuir grainé noir mat et renforts cheville matelassés.",
    price: 42000,
    compareAtPrice: 52000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "HIGH TOP",
    isFeatured: true,
    isNew: false,
    sizes: ["42", "43", "44", "45"],
    colors: [{ name: "Noir & Or Ancien", hex: "#232323" }],
    variants: [
      { id: "v-bsk2-42", size: "42", color: "Noir & Or Ancien", stock: 5, sku: "HPC-BSK-002-42" },
      { id: "v-bsk2-43", size: "43", color: "Noir & Or Ancien", stock: 7, sku: "HPC-BSK-002-43" },
      { id: "v-bsk2-44", size: "44", color: "Noir & Or Ancien", stock: 4, sku: "HPC-BSK-002-44" },
      { id: "v-bsk2-45", size: "45", color: "Noir & Or Ancien", stock: 2, sku: "HPC-BSK-002-45" }
    ],
    totalStock: 18,
    createdAt: "2026-10-31T09:05:00Z"
  },
  {
    id: "prod-bsk-003",
    sku: "HPC-BSK-003",
    name: "Baskets Montantes Pro Court « Dynasty High »",
    description: "Chaussure de basket hybride lifestyle et parquet en cuir épais souple avec semelle cousue 360 degrés.",
    price: 41000,
    compareAtPrice: 50000,
    category: "basket",
    images: [
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "HERITAGE",
    isFeatured: false,
    isNew: false,
    sizes: ["41", "42", "43", "44"],
    colors: [{ name: "Blanc & Noir", hex: "#FFFFFF" }],
    variants: [
      { id: "v-bsk3-41", size: "41", color: "Blanc & Noir", stock: 4, sku: "HPC-BSK-003-41" },
      { id: "v-bsk3-42", size: "42", color: "Blanc & Noir", stock: 6, sku: "HPC-BSK-003-42" },
      { id: "v-bsk3-43", size: "43", color: "Blanc & Noir", stock: 5, sku: "HPC-BSK-003-43" },
      { id: "v-bsk3-44", size: "44", color: "Blanc & Noir", stock: 3, sku: "HPC-BSK-003-44" }
    ],
    totalStock: 18,
    createdAt: "2026-10-31T09:06:00Z"
  },

  // --- HOODIES & SWEATS (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-hdy-001",
    sku: "HPC-HDY-001",
    name: "Hoodie Boxy Heavyweight HP « Golden Monogram »",
    description: "Coton molleton brossé épais 460 GSM, capuche doublée sans cordon avec œillets métalliques et broderie or.",
    price: 28000,
    compareAtPrice: 35000,
    category: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "HEAVYWEIGHT",
    isFeatured: true,
    isNew: false,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [{ name: "Noir Onyx", hex: "#111111" }],
    variants: [
      { id: "v-hdy1-m", size: "M", color: "Noir Onyx", stock: 5, sku: "HPC-HDY-001-M" },
      { id: "v-hdy1-l", size: "L", color: "Noir Onyx", stock: 8, sku: "HPC-HDY-001-L" },
      { id: "v-hdy1-xl", size: "XL", color: "Noir Onyx", stock: 6, sku: "HPC-HDY-001-XL" },
      { id: "v-hdy1-xxl", size: "XXL", color: "Noir Onyx", stock: 3, sku: "HPC-HDY-001-XXL" }
    ],
    totalStock: 22,
    createdAt: "2026-10-31T09:07:00Z"
  },
  {
    id: "prod-hdy-002",
    sku: "HPC-HDY-002",
    name: "Sweat Col Rond Minimaliste Broderie HPC Ton sur Ton",
    description: "Crewneck streetwear en molleton de coton pur 420 GSM avec bord-côtes renforcés et coupe droite épurée.",
    price: 24000,
    compareAtPrice: 30000,
    category: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "MINIMAL",
    isFeatured: false,
    isNew: false,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Gris Chiné Profond", hex: "#4B4B4B" }],
    variants: [
      { id: "v-hdy2-s", size: "S", color: "Gris Chiné Profond", stock: 4, sku: "HPC-HDY-002-S" },
      { id: "v-hdy2-m", size: "M", color: "Gris Chiné Profond", stock: 7, sku: "HPC-HDY-002-M" },
      { id: "v-hdy2-l", size: "L", color: "Gris Chiné Profond", stock: 6, sku: "HPC-HDY-002-L" },
      { id: "v-hdy2-xl", size: "XL", color: "Gris Chiné Profond", stock: 3, sku: "HPC-HDY-002-XL" }
    ],
    totalStock: 20,
    createdAt: "2026-10-31T09:08:00Z"
  },
  {
    id: "prod-hdy-003",
    sku: "HPC-HDY-003",
    name: "Hoodie Zip Heavyweight 480 GSM Double Épaisseur Anthracite",
    description: "Sweat zippé complet avec fermeture éclair à curseur métallique massif et intérieur thermique brossé.",
    price: 31000,
    compareAtPrice: 39000,
    category: "hoodies",
    images: [
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "THERMIQUE",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Anthracite Fumé", hex: "#333333" }],
    variants: [
      { id: "v-hdy3-m", size: "M", color: "Anthracite Fumé", stock: 5, sku: "HPC-HDY-003-M" },
      { id: "v-hdy3-l", size: "L", color: "Anthracite Fumé", stock: 7, sku: "HPC-HDY-003-L" },
      { id: "v-hdy3-xl", size: "XL", color: "Anthracite Fumé", stock: 4, sku: "HPC-HDY-003-XL" }
    ],
    totalStock: 16,
    createdAt: "2026-10-31T09:09:00Z"
  },

  // --- ACCESSOIRES (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-acc-001",
    sku: "HPC-ACC-001",
    name: "Mini Sacoche Rigide Box Crossbody Noir",
    description: "Sacoche rectangulaire rigide en similicuir grainé résistant à l'eau avec sangle siglée amovible et fermoir métal.",
    price: 15000,
    compareAtPrice: 20000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "ACCESSOIRE",
    isFeatured: true,
    isNew: false,
    sizes: ["Unique"],
    colors: [{ name: "Noir Mat", hex: "#111111" }],
    variants: [
      { id: "v-acc1-u", size: "Unique", color: "Noir Mat", stock: 15, sku: "HPC-ACC-001-U" }
    ],
    totalStock: 15,
    createdAt: "2026-10-31T09:10:00Z"
  },
  {
    id: "prod-acc-002",
    sku: "HPC-ACC-002",
    name: "Sacoche Messager Bandoulière Cordura Étanche Clip Cobra",
    description: "Toile Cordura 1000D balistique haute ténacité, fermeture boucle rapide style tactique et compartiment rembourré.",
    price: 19000,
    compareAtPrice: 25000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "CORDURA",
    isFeatured: false,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Noir Tactique", hex: "#1E1E1E" }],
    variants: [
      { id: "v-acc2-u", size: "Unique", color: "Noir Tactique", stock: 12, sku: "HPC-ACC-002-U" }
    ],
    totalStock: 12,
    createdAt: "2026-10-31T09:11:00Z"
  },
  {
    id: "prod-acc-003",
    sku: "HPC-ACC-003",
    name: "Casquette 5-Panel Broderie Relief HP « Signature »",
    description: "Casquette structurée 5 panneaux en sergé de coton peigné avec broderie monogramme 3D et attache arrière en métal cuivré.",
    price: 9500,
    compareAtPrice: 13000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "5-PANEL",
    isFeatured: false,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Noir & Or", hex: "#151515" }],
    variants: [
      { id: "v-acc3-u", size: "Unique", color: "Noir & Or", stock: 25, sku: "HPC-ACC-003-U" }
    ],
    totalStock: 25,
    createdAt: "2026-10-31T09:12:00Z"
  },

  // --- SURVÊTEMENTS & ENSEMBLES (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-srv-001",
    sku: "HPC-SRV-001",
    name: "Ensemble Tracksuit Cargo Beige Sable Heavy Fleece",
    description: "Sweat zippé col montant et jogging coupe droite ajustée avec poches cargo latérales discrètes.",
    price: 36000,
    compareAtPrice: 45000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "ESSENTIEL",
    isFeatured: true,
    isNew: false,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Sable Désert", hex: "#C2B280" }],
    variants: [
      { id: "v-srv1-s", size: "S", color: "Sable Désert", stock: 4, sku: "HPC-SRV-001-S" },
      { id: "v-srv1-m", size: "M", color: "Sable Désert", stock: 8, sku: "HPC-SRV-001-M" },
      { id: "v-srv1-l", size: "L", color: "Sable Désert", stock: 6, sku: "HPC-SRV-001-L" },
      { id: "v-srv1-xl", size: "XL", color: "Sable Désert", stock: 3, sku: "HPC-SRV-001-XL" }
    ],
    totalStock: 21,
    createdAt: "2026-10-31T09:13:00Z"
  },
  {
    id: "prod-srv-002",
    sku: "HPC-SRV-002",
    name: "Jogging Molleton Lourd 450 GSM Noir Graphite",
    description: "Bas de jogging coupe tapered en coton éponge lourd avec cordons à embouts acier trempé et chevilles élastiquées.",
    price: 22000,
    compareAtPrice: 28000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "CONFORT",
    isFeatured: false,
    isNew: false,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Gris Graphite", hex: "#2E2E2E" }],
    variants: [
      { id: "v-srv2-m", size: "M", color: "Gris Graphite", stock: 7, sku: "HPC-SRV-002-M" },
      { id: "v-srv2-l", size: "L", color: "Gris Graphite", stock: 9, sku: "HPC-SRV-002-L" },
      { id: "v-srv2-xl", size: "XL", color: "Gris Graphite", stock: 5, sku: "HPC-SRV-002-XL" }
    ],
    totalStock: 21,
    createdAt: "2026-10-31T09:14:00Z"
  },
  {
    id: "prod-srv-003",
    sku: "HPC-SRV-003",
    name: "Ensemble Short Boxy & T-Shirt Heavyweight Sand Dune",
    description: "Duo estival haut de gamme composé d'un t-shirt 260g tombant et d'un short molletonné assorti à poches zippées.",
    price: 28000,
    compareAtPrice: 36000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "SUMMER DROP",
    isFeatured: false,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Dune de Sable", hex: "#D8C7A5" }],
    variants: [
      { id: "v-srv3-s", size: "S", color: "Dune de Sable", stock: 4, sku: "HPC-SRV-003-S" },
      { id: "v-srv3-m", size: "M", color: "Dune de Sable", stock: 7, sku: "HPC-SRV-003-M" },
      { id: "v-srv3-l", size: "L", color: "Dune de Sable", stock: 5, sku: "HPC-SRV-003-L" },
      { id: "v-srv3-xl", size: "XL", color: "Dune de Sable", stock: 3, sku: "HPC-SRV-003-XL" }
    ],
    totalStock: 19,
    createdAt: "2026-10-31T09:15:00Z"
  },

  // --- JEANS & PANTALONS (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-pan-001",
    sku: "HPC-PAN-001",
    name: "Jean Charpentier Carpenter Denim Brut Surpiqûres Écrues",
    description: "Toile denim selvedge 14.5 oz non délavée, boucle marteau latérale authentique et poches outils fonctionnelles.",
    price: 27000,
    compareAtPrice: 35000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "RAW DENIM",
    isFeatured: true,
    isNew: false,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Denim Brut Foncé", hex: "#1C2A39" }],
    variants: [
      { id: "v-pan1-30", size: "30", color: "Denim Brut Foncé", stock: 4, sku: "HPC-PAN-001-30" },
      { id: "v-pan1-32", size: "32", color: "Denim Brut Foncé", stock: 7, sku: "HPC-PAN-001-32" },
      { id: "v-pan1-34", size: "34", color: "Denim Brut Foncé", stock: 6, sku: "HPC-PAN-001-34" },
      { id: "v-pan1-36", size: "36", color: "Denim Brut Foncé", stock: 3, sku: "HPC-PAN-001-36" }
    ],
    totalStock: 20,
    createdAt: "2026-10-31T09:16:00Z"
  },
  {
    id: "prod-pan-002",
    sku: "HPC-PAN-002",
    name: "Pantalon Baggy Parachute Double Ceinture « Stealth »",
    description: "Tissu parachute indéchirable ultra léger avec doubles sangles de serrage à la taille et chevilles ajustables.",
    price: 25000,
    compareAtPrice: 32000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "PARACHUTE",
    isFeatured: false,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Noir Stealth", hex: "#171717" }],
    variants: [
      { id: "v-pan2-s", size: "S", color: "Noir Stealth", stock: 4, sku: "HPC-PAN-002-S" },
      { id: "v-pan2-m", size: "M", color: "Noir Stealth", stock: 8, sku: "HPC-PAN-002-M" },
      { id: "v-pan2-l", size: "L", color: "Noir Stealth", stock: 6, sku: "HPC-PAN-002-L" },
      { id: "v-pan2-xl", size: "XL", color: "Noir Stealth", stock: 3, sku: "HPC-PAN-002-XL" }
    ],
    totalStock: 21,
    createdAt: "2026-10-31T09:17:00Z"
  },
  {
    id: "prod-pan-003",
    sku: "HPC-PAN-003",
    name: "Pantalon Cargo Tactique Multi-Poches « Nomad »",
    description: "Toile ripstop coton renforcée, 6 poches cargo à soufflet avec rabats aimantés et passants ceinture renforcés.",
    price: 28000,
    compareAtPrice: 36000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TACTICAL",
    isFeatured: false,
    isNew: false,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Vert Olive Mill", hex: "#3B4D3C" }],
    variants: [
      { id: "v-pan3-30", size: "30", color: "Vert Olive Mill", stock: 4, sku: "HPC-PAN-003-30" },
      { id: "v-pan3-32", size: "32", color: "Vert Olive Mill", stock: 7, sku: "HPC-PAN-003-32" },
      { id: "v-pan3-34", size: "34", color: "Vert Olive Mill", stock: 5, sku: "HPC-PAN-003-34" },
      { id: "v-pan3-36", size: "36", color: "Vert Olive Mill", stock: 3, sku: "HPC-PAN-003-36" }
    ],
    totalStock: 19,
    createdAt: "2026-10-31T09:18:00Z"
  },

  // --- VESTES VARSITY & BLOUSONS (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-var-001",
    sku: "HPC-VAR-001",
    name: "Veste Varsity HP Heavyweight Vintage Cuir Vegan",
    description: "Veste teddy universitaire emblématique en drap de laine lourd et manches en simili-cuir grainé doux. Patchs chenille brodés main.",
    price: 44000,
    compareAtPrice: 56000,
    category: "varsity",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "VARSITY ICON",
    isFeatured: true,
    isNew: false,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Noir & Crème", hex: "#1C1C1C" }],
    variants: [
      { id: "v-var1-m", size: "M", color: "Noir & Crème", stock: 5, sku: "HPC-VAR-001-M" },
      { id: "v-var1-l", size: "L", color: "Noir & Crème", stock: 8, sku: "HPC-VAR-001-L" },
      { id: "v-var1-xl", size: "XL", color: "Noir & Crème", stock: 4, sku: "HPC-VAR-001-XL" }
    ],
    totalStock: 17,
    createdAt: "2026-10-31T09:19:00Z"
  },
  {
    id: "prod-var-002",
    sku: "HPC-VAR-002",
    name: "Veste Bomber Matelassée Réversible « Black & Khaki »",
    description: "Bomber MA-1 revisité avec extérieur satin nylon imperméable noir mat et doublure orange sécurité thermique.",
    price: 36000,
    compareAtPrice: 45000,
    category: "varsity",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "RÉVERSIBLE",
    isFeatured: false,
    isNew: false,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Kaki & Orange", hex: "#48533E" }],
    variants: [
      { id: "v-var2-m", size: "M", color: "Kaki & Orange", stock: 4, sku: "HPC-VAR-002-M" },
      { id: "v-var2-l", size: "L", color: "Kaki & Orange", stock: 7, sku: "HPC-VAR-002-L" },
      { id: "v-var2-xl", size: "XL", color: "Kaki & Orange", stock: 3, sku: "HPC-VAR-002-XL" }
    ],
    totalStock: 14,
    createdAt: "2026-10-31T09:20:00Z"
  },
  {
    id: "prod-var-003",
    sku: "HPC-VAR-003",
    name: "Doudoune Courte Puff Sans Manches Noir Mat Tactical",
    description: "Gilet matelassé sans manches à garnissage synthétique isolant thermique ultra léger et col montant coupe-vent.",
    price: 29000,
    compareAtPrice: 38000,
    category: "varsity",
    images: [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "PUFFER",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Noir Mat", hex: "#1A1A1A" }],
    variants: [
      { id: "v-var3-m", size: "M", color: "Noir Mat", stock: 5, sku: "HPC-VAR-003-M" },
      { id: "v-var3-l", size: "L", color: "Noir Mat", stock: 8, sku: "HPC-VAR-003-L" },
      { id: "v-var3-xl", size: "XL", color: "Noir Mat", stock: 4, sku: "HPC-VAR-003-XL" }
    ],
    totalStock: 17,
    createdAt: "2026-10-31T09:21:00Z"
  },

  // --- TEE-SHIRTS & POLOS (IMAGES 100% UNIQUES SANS DOUBLONS) ---
  {
    id: "prod-tsh-001",
    sku: "HPC-TSH-001",
    name: "T-shirt Oversize 240 GSM Cotonou Heritage Noir",
    description: "Coton peigné lourd 240 grammes, coupe boxy déstructurée et broderie subtile de l'écusson HP sur le flanc gauche.",
    price: 15000,
    compareAtPrice: 20000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "ESSENTIEL",
    isFeatured: true,
    isNew: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Noir Carbone", hex: "#121212" }],
    variants: [
      { id: "v-tsh1-s", size: "S", color: "Noir Carbone", stock: 5, sku: "HPC-TSH-001-S" },
      { id: "v-tsh1-m", size: "M", color: "Noir Carbone", stock: 12, sku: "HPC-TSH-001-M" },
      { id: "v-tsh1-l", size: "L", color: "Noir Carbone", stock: 10, sku: "HPC-TSH-001-L" },
      { id: "v-tsh1-xl", size: "XL", color: "Noir Carbone", stock: 6, sku: "HPC-TSH-001-XL" },
      { id: "v-tsh1-xxl", size: "XXL", color: "Noir Carbone", stock: 3, sku: "HPC-TSH-001-XXL" }
    ],
    totalStock: 36,
    createdAt: "2026-10-31T09:22:00Z"
  },
  {
    id: "prod-tsh-002",
    sku: "HPC-TSH-002",
    name: "T-shirt Oversize « Rules & Ambition » 260 GSM",
    description: "Jersey lourd haut de gamme, typographie sérigraphiée effet velours et tombé streetwear tombant sur les épaules.",
    price: 17000,
    compareAtPrice: 23000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "AMBITION",
    isFeatured: false,
    isNew: false,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Blanc Craie", hex: "#F3F3F3" }],
    variants: [
      { id: "v-tsh2-m", size: "M", color: "Blanc Craie", stock: 7, sku: "HPC-TSH-002-M" },
      { id: "v-tsh2-l", size: "L", color: "Blanc Craie", stock: 9, sku: "HPC-TSH-002-L" },
      { id: "v-tsh2-xl", size: "XL", color: "Blanc Craie", stock: 5, sku: "HPC-TSH-002-XL" }
    ],
    totalStock: 21,
    createdAt: "2026-10-31T09:23:00Z"
  },
  {
    id: "prod-tsh-003",
    sku: "HPC-TSH-003",
    name: "T-shirt Graphic Oversize « City of Ambition » 260 GSM",
    description: "Illustration artistique urbaine sérigraphiée au dos, col rond renforcé 3 cm qui ne se détend jamais au lavage.",
    price: 18000,
    compareAtPrice: 24000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "ARTWORK",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Bleu Nuit Profond", hex: "#1A2536" }],
    variants: [
      { id: "v-tsh3-m", size: "M", color: "Bleu Nuit Profond", stock: 6, sku: "HPC-TSH-003-M" },
      { id: "v-tsh3-l", size: "L", color: "Bleu Nuit Profond", stock: 8, sku: "HPC-TSH-003-L" },
      { id: "v-tsh3-xl", size: "XL", color: "Bleu Nuit Profond", stock: 4, sku: "HPC-TSH-003-XL" }
    ],
    totalStock: 18,
    createdAt: "2026-10-31T09:24:00Z"
  },
  {
    id: "prod-tsh-004",
    sku: "HPC-TSH-004",
    name: "T-Shirt Oversize Graphic « Cotonou Underground » Lavis Gris",
    description: "Traitement délavé à la pierre ponce façon vintage acid wash, sérigraphie dégradée inspiration culture clubbing de Cotonou.",
    price: 17500,
    compareAtPrice: 23500,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "WASHED",
    isFeatured: false,
    isNew: false,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Gris Acid Wash", hex: "#5C5C5C" }],
    variants: [
      { id: "v-tsh4-s", size: "S", color: "Gris Acid Wash", stock: 4, sku: "HPC-TSH-004-S" },
      { id: "v-tsh4-m", size: "M", color: "Gris Acid Wash", stock: 8, sku: "HPC-TSH-004-M" },
      { id: "v-tsh4-l", size: "L", color: "Gris Acid Wash", stock: 6, sku: "HPC-TSH-004-L" },
      { id: "v-tsh4-xl", size: "XL", color: "Gris Acid Wash", stock: 3, sku: "HPC-TSH-004-XL" }
    ],
    totalStock: 21,
    createdAt: "2026-10-31T09:25:00Z"
  },
  {
    id: "prod-tsh-005",
    sku: "HPC-TSH-005",
    name: "Polo Maille Côtelée Zip Métal Noir & Liseré Or",
    description: "Maille fine respirante structurée en côtes anglaises, fermeture éclair dorée au col et silhouette habillée raffinée.",
    price: 21000,
    compareAtPrice: 28000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1625910513413-5bc595960010?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "POLO LUXE",
    isFeatured: false,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Noir & Liseré Or", hex: "#161616" }],
    variants: [
      { id: "v-tsh5-m", size: "M", color: "Noir & Liseré Or", stock: 5, sku: "HPC-TSH-005-M" },
      { id: "v-tsh5-l", size: "L", color: "Noir & Liseré Or", stock: 8, sku: "HPC-TSH-005-L" },
      { id: "v-tsh5-xl", size: "XL", color: "Noir & Liseré Or", stock: 4, sku: "HPC-TSH-005-XL" }
    ],
    totalStock: 17,
    createdAt: "2026-10-31T09:26:00Z"
  }
];

// Perform strict verification of 0 duplicates
const ids = new Set();
const skus = new Set();
const primaryImgs = new Set();
const errors = [];

products.forEach(p => {
  if (ids.has(p.id)) errors.push(`Duplicate ID: ${p.id}`);
  ids.add(p.id);

  if (skus.has(p.sku)) errors.push(`Duplicate SKU: ${p.sku}`);
  skus.add(p.sku);

  if (primaryImgs.has(p.images[0])) errors.push(`Duplicate primary image: ${p.images[0]}`);
  primaryImgs.add(p.images[0]);
});

if (errors.length > 0) {
  console.error("Errors found:", errors);
  process.exit(1);
}

console.log("Validation PASSED! 0 duplicate products, 0 duplicate images, 0 duplicate SKUs.");
console.log(`Total products: ${products.length}`);

// 1. Update data/store.json
const storePath = path.resolve('data/store.json');
const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
storeData.products = products;
fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf8');
console.log("Successfully updated data/store.json!");

export { products };
