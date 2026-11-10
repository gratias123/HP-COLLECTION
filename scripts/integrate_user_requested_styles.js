import fs from 'fs';
import path from 'path';

const store = JSON.parse(fs.readFileSync('data/store.json', 'utf8'));

// Existing products map
const existingMap = new Map();
store.products.forEach(p => existingMap.set(p.id, p));

const newStyles = [
  // ==========================================
  // 1. LES TRUCS DE LACOSTE / POLOS & SPORT-CHIC
  // ==========================================
  {
    id: "prod-pol-001",
    sku: "HPC-POL-001",
    name: "Polo Piqué Coton Peigné Sport-Chic Blanc Épuré",
    slug: "polo-pique-coton-peigne-sport-chic-blanc-epure",
    description: "Polo emblématique en maille piquée respirante 100% coton peigné, col côtelé structuré avec liseré contrasté discret et patte à deux boutons nacrés. Coupe sport-chic ajustée élégante.",
    price: 24000,
    compareAtPrice: 32000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "SPORT-CHIC",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Blanc Tennis Pur", hex: "#FFFFFF" }],
    variants: [
      { id: "v-pol1-s", size: "S", color: "Blanc Tennis Pur", stock: 5, sku: "HPC-POL-001-S" },
      { id: "v-pol1-m", size: "M", color: "Blanc Tennis Pur", stock: 10, sku: "HPC-POL-001-M" },
      { id: "v-pol1-l", size: "L", color: "Blanc Tennis Pur", stock: 8, sku: "HPC-POL-001-L" },
      { id: "v-pol1-xl", size: "XL", color: "Blanc Tennis Pur", stock: 6, sku: "HPC-POL-001-XL" },
      { id: "v-pol1-xxl", size: "XXL", color: "Blanc Tennis Pur", stock: 3, sku: "HPC-POL-001-XXL" }
    ],
    lowStockThreshold: 5,
    totalStock: 32,
    status: "published",
    createdAt: "2026-11-03T10:00:00Z",
    updatedAt: "2026-11-03T10:00:00Z"
  },
  {
    id: "prod-pol-002",
    sku: "HPC-POL-002",
    name: "Polo Maille Piquée Bleu Marine Liseré Tennis Club",
    slug: "polo-maille-piquee-bleu-marine-lisere-tennis-club",
    description: "Silhouette intemporelle court tennis en piqué lourd 240 GSM bleu marine avec liseré blanc optique aux manches et broderie monogramme discrète sur la poitrine.",
    price: 25000,
    compareAtPrice: 34000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TENNIS CLUB",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Bleu Marine Club", hex: "#1B2A4A" }],
    variants: [
      { id: "v-pol2-m", size: "M", color: "Bleu Marine Club", stock: 8, sku: "HPC-POL-002-M" },
      { id: "v-pol2-l", size: "L", color: "Bleu Marine Club", stock: 9, sku: "HPC-POL-002-L" },
      { id: "v-pol2-xl", size: "XL", color: "Bleu Marine Club", stock: 5, sku: "HPC-POL-002-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 22,
    status: "published",
    createdAt: "2026-11-03T10:01:00Z",
    updatedAt: "2026-11-03T10:01:00Z"
  },
  {
    id: "prod-pol-003",
    sku: "HPC-POL-003",
    name: "Veste de Survêtement Trackjacket Sport-Chic Blanc & Vert Bouteille",
    slug: "veste-survetement-trackjacket-sport-chic-blanc-vert",
    description: "Veste de survêtement rétro sport-chic esprit country club en polyester crêpé texturé avec bandes contrastées vert bouteille et fermeture à glissière intégrale.",
    price: 36000,
    compareAtPrice: 45000,
    category: "survetements",
    images: [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TRACKJACKET",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Blanc & Vert Bouteille", hex: "#1E4D2B" }],
    variants: [
      { id: "v-pol3-s", size: "S", color: "Blanc & Vert Bouteille", stock: 4, sku: "HPC-POL-003-S" },
      { id: "v-pol3-m", size: "M", color: "Blanc & Vert Bouteille", stock: 8, sku: "HPC-POL-003-M" },
      { id: "v-pol3-l", size: "L", color: "Blanc & Vert Bouteille", stock: 7, sku: "HPC-POL-003-L" },
      { id: "v-pol3-xl", size: "XL", color: "Blanc & Vert Bouteille", stock: 3, sku: "HPC-POL-003-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 22,
    status: "published",
    createdAt: "2026-11-03T10:02:00Z",
    updatedAt: "2026-11-03T10:02:00Z"
  },

  // ==========================================
  // 2. LES TRUCS DE JEANS & DENIM TENDANCE
  // ==========================================
  {
    id: "prod-jns-001",
    sku: "HPC-JNS-001",
    name: "Jean Baggy Skate Délavé Vintage Déstructuré",
    slug: "jean-baggy-skate-delave-vintage-destructure",
    description: "Denim ample ultra tendance coupe loose baggy 90s avec moustaches artisanales et délavage stone washed authentique. Tombé généreux sur les sneakers.",
    price: 28000,
    compareAtPrice: 36000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "BAGGY SKATE",
    isFeatured: true,
    isNew: true,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Bleu Vintage Délavé", hex: "#5C768D" }],
    variants: [
      { id: "v-jns1-30", size: "30", color: "Bleu Vintage Délavé", stock: 5, sku: "HPC-JNS-001-30" },
      { id: "v-jns1-32", size: "32", color: "Bleu Vintage Délavé", stock: 9, sku: "HPC-JNS-001-32" },
      { id: "v-jns1-34", size: "34", color: "Bleu Vintage Délavé", stock: 7, sku: "HPC-JNS-001-34" },
      { id: "v-jns1-36", size: "36", color: "Bleu Vintage Délavé", stock: 4, sku: "HPC-JNS-001-36" }
    ],
    lowStockThreshold: 5,
    totalStock: 25,
    status: "published",
    createdAt: "2026-11-03T10:03:00Z",
    updatedAt: "2026-11-03T10:03:00Z"
  },
  {
    id: "prod-jns-002",
    sku: "HPC-JNS-002",
    name: "Jean Selvedge Brut Coupe Droite Évasée 14oz",
    slug: "jean-selvedge-brut-coupe-droite-evasee-14oz",
    description: "Toile japonaise brute 14 oz ultra résistante non lavée, surpiqûres couleur tabac, rivets en cuivre vieilli et revers contrasté avec liseré selvedge rouge.",
    price: 32000,
    compareAtPrice: 42000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "14OZ SELVEDGE",
    isFeatured: true,
    isNew: true,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Denim Brut Indigo", hex: "#16233B" }],
    variants: [
      { id: "v-jns2-30", size: "30", color: "Denim Brut Indigo", stock: 4, sku: "HPC-JNS-002-30" },
      { id: "v-jns2-32", size: "32", color: "Denim Brut Indigo", stock: 8, sku: "HPC-JNS-002-32" },
      { id: "v-jns2-34", size: "34", color: "Denim Brut Indigo", stock: 6, sku: "HPC-JNS-002-34" },
      { id: "v-jns2-36", size: "36", color: "Denim Brut Indigo", stock: 3, sku: "HPC-JNS-002-36" }
    ],
    lowStockThreshold: 5,
    totalStock: 21,
    status: "published",
    createdAt: "2026-11-03T10:04:00Z",
    updatedAt: "2026-11-03T10:04:00Z"
  },
  {
    id: "prod-jns-003",
    sku: "HPC-JNS-003",
    name: "Jean Loose Classic Fit Bleu Moyen Raw Edge",
    slug: "jean-loose-classic-fit-bleu-moyen-raw-edge",
    description: "Jean polyvalent à jambe large et ourlets francs, confectionné dans une gabardine denim robuste et souple.",
    price: 27000,
    compareAtPrice: 35000,
    category: "pantalons",
    images: [
      "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "DENIM ESSENTIAL",
    isFeatured: false,
    isNew: true,
    sizes: ["30", "32", "34", "36"],
    colors: [{ name: "Bleu Moyen Classic", hex: "#3B5998" }],
    variants: [
      { id: "v-jns3-30", size: "30", color: "Bleu Moyen Classic", stock: 4, sku: "HPC-JNS-003-30" },
      { id: "v-jns3-32", size: "32", color: "Bleu Moyen Classic", stock: 7, sku: "HPC-JNS-003-32" },
      { id: "v-jns3-34", size: "34", color: "Bleu Moyen Classic", stock: 6, sku: "HPC-JNS-003-34" },
      { id: "v-jns3-36", size: "36", color: "Bleu Moyen Classic", stock: 3, sku: "HPC-JNS-003-36" }
    ],
    lowStockThreshold: 5,
    totalStock: 20,
    status: "published",
    createdAt: "2026-11-03T10:05:00Z",
    updatedAt: "2026-11-03T10:05:00Z"
  },

  // ==========================================
  // 3. LES T-SHIRTS QUI SONT À LA MODE
  // ==========================================
  {
    id: "prod-tsh-009",
    sku: "HPC-TSH-009",
    name: "T-Shirt Boxy Heavyweight Lavé Vintage Acid Wash Y2K 280 GSM",
    slug: "t-shirt-boxy-heavyweight-lave-vintage-acid-wash-y2k",
    description: "Coton ultra lourd 280 grammes traité au lavage minéral vintage avec emmanchures tombantes et col montant épais 3,5 cm. Pièce maîtresse de la tendance streetwear actuelle.",
    price: 19000,
    compareAtPrice: 26000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "Y2K ACID WASH",
    isFeatured: true,
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Gris Minéral Fumé", hex: "#4E4E4E" }],
    variants: [
      { id: "v-tsh9-s", size: "S", color: "Gris Minéral Fumé", stock: 6, sku: "HPC-TSH-009-S" },
      { id: "v-tsh9-m", size: "M", color: "Gris Minéral Fumé", stock: 12, sku: "HPC-TSH-009-M" },
      { id: "v-tsh9-l", size: "L", color: "Gris Minéral Fumé", stock: 10, sku: "HPC-TSH-009-L" },
      { id: "v-tsh9-xl", size: "XL", color: "Gris Minéral Fumé", stock: 7, sku: "HPC-TSH-009-XL" },
      { id: "v-tsh9-xxl", size: "XXL", color: "Gris Minéral Fumé", stock: 4, sku: "HPC-TSH-009-XXL" }
    ],
    lowStockThreshold: 5,
    totalStock: 39,
    status: "published",
    createdAt: "2026-11-03T10:06:00Z",
    updatedAt: "2026-11-03T10:06:00Z"
  },
  {
    id: "prod-tsh-010",
    sku: "HPC-TSH-010",
    name: "T-Shirt Oversize Graphic « Cotonou Fast Life » Sérigraphie 3D",
    slug: "t-shirt-oversize-graphic-cotonou-fast-life-serigraphie-3d",
    description: "T-shirt blanc lourd au tombé parfait avec illustration percutante au dos en sérigraphie relief gonflante, célébrant l'énergie nocturne de Cotonou.",
    price: 18500,
    compareAtPrice: 25000,
    category: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TRENDING GRAPHIC",
    isFeatured: true,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Blanc Pur Sérigraphié", hex: "#FAFAFA" }],
    variants: [
      { id: "v-tsh10-m", size: "M", color: "Blanc Pur Sérigraphié", stock: 8, sku: "HPC-TSH-010-M" },
      { id: "v-tsh10-l", size: "L", color: "Blanc Pur Sérigraphié", stock: 11, sku: "HPC-TSH-010-L" },
      { id: "v-tsh10-xl", size: "XL", color: "Blanc Pur Sérigraphié", stock: 6, sku: "HPC-TSH-010-XL" }
    ],
    lowStockThreshold: 5,
    totalStock: 25,
    status: "published",
    createdAt: "2026-11-03T10:07:00Z",
    updatedAt: "2026-11-03T10:07:00Z"
  },

  // ==========================================
  // 4. LES CEINTURES (BELTS)
  // ==========================================
  {
    id: "prod-bel-001",
    sku: "HPC-BEL-001",
    name: "Ceinture Cuir Western à Boucle Métal Gravée Vintage",
    slug: "ceinture-cuir-western-a-boucle-metal-gravee-vintage",
    description: "Cuir pleine fleur noir de 38 mm d'épaisseur avec boucle western ciselée argent vieilli, passants gravés et bout ferré sculpté. L'accessoire incontournable pour sublimer les jeans amples.",
    price: 14000,
    compareAtPrice: 19000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "WESTERN BUCKLE",
    isFeatured: true,
    isNew: true,
    sizes: ["85", "95", "105", "Unique"],
    colors: [{ name: "Noir & Argent Vieilli", hex: "#1C1C1C" }],
    variants: [
      { id: "v-bel1-85", size: "85", color: "Noir & Argent Vieilli", stock: 6, sku: "HPC-BEL-001-85" },
      { id: "v-bel1-95", size: "95", color: "Noir & Argent Vieilli", stock: 10, sku: "HPC-BEL-001-95" },
      { id: "v-bel1-105", size: "105", color: "Noir & Argent Vieilli", stock: 8, sku: "HPC-BEL-001-105" },
      { id: "v-bel1-u", size: "Unique", color: "Noir & Argent Vieilli", stock: 6, sku: "HPC-BEL-001-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 30,
    status: "published",
    createdAt: "2026-11-03T10:08:00Z",
    updatedAt: "2026-11-03T10:08:00Z"
  },
  {
    id: "prod-bel-002",
    sku: "HPC-BEL-002",
    name: "Ceinture Tactique Sangle Haute Ténacité Clip Boucle Cobra",
    slug: "ceinture-tactique-sangle-haute-tenacite-clip-cobra",
    description: "Sangle militaire en nylon balistique indéchirable avec boucle rapide cobra en alliage de zinc ultra robuste et réglage millimétrique sans trous.",
    price: 12000,
    compareAtPrice: 16000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TACTICAL CLIP",
    isFeatured: false,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Noir Militaire", hex: "#111111" }],
    variants: [
      { id: "v-bel2-u", size: "Unique", color: "Noir Militaire", stock: 24, sku: "HPC-BEL-002-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 24,
    status: "published",
    createdAt: "2026-11-03T10:09:00Z",
    updatedAt: "2026-11-03T10:09:00Z"
  },
  {
    id: "prod-bel-003",
    sku: "HPC-BEL-003",
    name: "Ceinture Cuir Noir Cloutée Étoiles & Strass Streetwear",
    slug: "ceinture-cuir-noir-cloutee-etoiles-strass-streetwear",
    description: "Inspiration street punk et défilé luxe : cuir noir souple orné de rangées de clous pyramidaux et d'étoiles métalliques chromées. Boucle carrée polie.",
    price: 16000,
    compareAtPrice: 22000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "PUNK ROCK CHIC",
    isFeatured: true,
    isNew: true,
    sizes: ["90", "100", "Unique"],
    colors: [{ name: "Noir Clouté Argent", hex: "#222222" }],
    variants: [
      { id: "v-bel3-90", size: "90", color: "Noir Clouté Argent", stock: 7, sku: "HPC-BEL-003-90" },
      { id: "v-bel3-100", size: "100", color: "Noir Clouté Argent", stock: 9, sku: "HPC-BEL-003-100" },
      { id: "v-bel3-u", size: "Unique", color: "Noir Clouté Argent", stock: 6, sku: "HPC-BEL-003-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 22,
    status: "published",
    createdAt: "2026-11-03T10:10:00Z",
    updatedAt: "2026-11-03T10:10:00Z"
  },

  // ==========================================
  // 5. LES CASQUETTES (CAPS & HATS)
  // ==========================================
  {
    id: "prod-cap-001",
    sku: "HPC-CAP-001",
    name: "Casquette Dad Hat Coton Délavé Visière Courbée HPC Club",
    slug: "casquette-dad-hat-coton-delave-visiere-courbee-hpc",
    description: "Casquette basse déstructurée en sergé de coton délavé doux avec visière précourbée, œillets de ventilation brodés et fermeture sangle en tissu avec boucle en laiton.",
    price: 11000,
    compareAtPrice: 15000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "DAD HAT VINTAGE",
    isFeatured: true,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Kaki Vintage & Écru", hex: "#4B5320" }],
    variants: [
      { id: "v-cap1-u", size: "Unique", color: "Kaki Vintage & Écru", stock: 20, sku: "HPC-CAP-001-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 20,
    status: "published",
    createdAt: "2026-11-03T10:11:00Z",
    updatedAt: "2026-11-03T10:11:00Z"
  },
  {
    id: "prod-cap-002",
    sku: "HPC-CAP-002",
    name: "Casquette Snapback 5-Panel Broderie Relief Noir & Or",
    slug: "casquette-snapback-5-panel-broderie-relief-noir-or",
    description: "Casquette structurée 5 panneaux à calotte haute et visière plate, ornée du monogramme HP brodé en 3D relief or satiné sur fond noir profond.",
    price: 13000,
    compareAtPrice: 18000,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "SNAPBACK 3D",
    isFeatured: true,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Noir & Or Signature", hex: "#151515" }],
    variants: [
      { id: "v-cap2-u", size: "Unique", color: "Noir & Or Signature", stock: 25, sku: "HPC-CAP-002-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 25,
    status: "published",
    createdAt: "2026-11-03T10:12:00Z",
    updatedAt: "2026-11-03T10:12:00Z"
  },
  {
    id: "prod-cap-003",
    sku: "HPC-CAP-003",
    name: "Casquette Trucker Filet Rétro Racing Motorsport",
    slug: "casquette-trucker-filet-retro-racing-motorsport",
    description: "Face avant en mousse rembourrée et dos en filet mesh respirant ultra aéré avec écusson brodé esprit courses automobiles et languette crantée ajustable.",
    price: 10500,
    compareAtPrice: 14500,
    category: "accessoires",
    images: [
      "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=80"
    ],
    badge: "TRUCKER MESH",
    isFeatured: false,
    isNew: true,
    sizes: ["Unique"],
    colors: [{ name: "Noir & Blanc Racing", hex: "#1A1A1A" }],
    variants: [
      { id: "v-cap3-u", size: "Unique", color: "Noir & Blanc Racing", stock: 18, sku: "HPC-CAP-003-U" }
    ],
    lowStockThreshold: 5,
    totalStock: 18,
    status: "published",
    createdAt: "2026-11-03T10:13:00Z",
    updatedAt: "2026-11-03T10:13:00Z"
  }
];

// Add all new styles
for (const p of newStyles) {
  existingMap.set(p.id, p);
}

const finalProducts = Array.from(existingMap.values());

// Strict deduplication verify
const seenIds = new Set();
const seenSkus = new Set();
const seenImgs = new Set();
const errors = [];

finalProducts.forEach(p => {
  if (seenIds.has(p.id)) errors.push(`Duplicate ID: ${p.id}`);
  seenIds.add(p.id);

  if (seenSkus.has(p.sku)) errors.push(`Duplicate SKU: ${p.sku}`);
  seenSkus.add(p.sku);

  if (p.images[0] && seenImgs.has(p.images[0])) errors.push(`Duplicate Primary Image: ${p.images[0]}`);
  if (p.images[0]) seenImgs.add(p.images[0]);
});

if (errors.length > 0) {
  console.error("Errors found:", errors);
  process.exit(1);
}

console.log(`Validation PASSED! Total unique products: ${finalProducts.length}`);
console.log(`Total unique primary images: ${seenImgs.size}`);

store.products = finalProducts;
fs.writeFileSync('data/store.json', JSON.stringify(store, null, 2), 'utf8');
console.log("data/store.json successfully updated!");
