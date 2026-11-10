import fs from 'fs';
import https from 'https';

const store = JSON.parse(fs.readFileSync('data/store.json', 'utf8'));

// Fix prod-look-001, 002, 003 duplicate images
const look1 = store.products.find(p => p.id === 'prod-look-001');
if (look1) look1.images = ['/assets/aistudio/1793196164363_1__528b35f1.jpg', '/assets/aistudio/veste_denim_detail.jpg'];

const look2 = store.products.find(p => p.id === 'prod-look-002');
if (look2) look2.images = ['/assets/aistudio/1793196179671_1__fa78fa1f.jpg', '/assets/aistudio/chemise_bandana_detail.jpg'];

const look3 = store.products.find(p => p.id === 'prod-look-003');
if (look3) look3.images = ['/assets/aistudio/1793196195794_1__83aad193.jpg', '/assets/aistudio/blouson_cuir_rouge_detail.jpg'];

fs.writeFileSync('data/store.json', JSON.stringify(store, null, 2), 'utf8');
console.log('Fixed store.json look 1-3 images.');

// Now write updated scripts/sync_initial_data.js with all 18 outfits
const syncScriptContent = `import fs from 'fs';
import path from 'path';

const store = JSON.parse(fs.readFileSync("data/store.json", "utf8"));

const lookbook = [
  {
    id: "look-1",
    title: "Cyber Denim & Casquette HP Signature",
    subtitle: "Veste délavée brodée, chaînes métalliques et casquette 5-panel",
    image: "/assets/aistudio/1793196164363_1__528b35f1.jpg",
    tag: "Look #01 — Urban Tech",
    category: "varsity",
    productId: "prod-look-001",
    description: "Veste en denim délavé avec finitions brodées aux manches, pantalon skate baggy orné de chaînes et de croix métalliques."
  },
  {
    id: "look-2",
    title: "Paisley Bandana & Cotonou Night",
    subtitle: "Chemise satinée émeraude et boots vert olive",
    image: "/assets/aistudio/1793196179671_1__fa78fa1f.jpg",
    tag: "Look #02 — Tropical Rebel",
    category: "tshirts",
    productId: "prod-look-002",
    description: "Chemise fluide à motif bandana vert d’eau et turquoise, ceinture fluo avec chaînes pendantes, pantalon ultra-large noir clouté."
  },
  {
    id: "look-3",
    title: "Scarlet Biker Racer & Custom Splatter",
    subtitle: "Blouson cuir rouge éclatant et sacoche holster",
    image: "/assets/aistudio/1793196195794_1__83aad193.jpg",
    tag: "Look #03 — High Speed",
    category: "varsity",
    productId: "prod-look-003",
    description: "Blouson court en cuir rouge racing avec sacoche coordonnée, jean skate déstructuré avec effet de lavis acide et projections de peinture."
  },
  {
    id: "look-4",
    title: "Ensemble Tailored Rouge & Béret d’Apparat",
    subtitle: "Veste courte structurée et pantalon carmin",
    image: "/assets/aistudio/1793196158473_10a41edc.jpg",
    tag: "Look #04 — Couture Cotonou",
    category: "survetements",
    productId: "prod-look-004",
    description: "Veste courte cintrée streetwear et pantalon de tailleur rouge carmin avec béret d’apparat coordonné. Coupe architecturale haute couture béninoise."
  },
  {
    id: "look-5",
    title: "Veste Coupe-Vent Floral « Jetour »",
    subtitle: "Coupe-vent tropical technique & sacoche holster kaki",
    image: "/assets/aistudio/1793196173456_2efd8b7f.jpg",
    tag: "Look #05 — Tropics Explorer",
    category: "varsity",
    productId: "prod-look-005",
    description: "Coupe-vent technique léger à imprimé floral tropical vibrant, col montant zippé et cordon élastique ajustable."
  },
  {
    id: "look-6",
    title: "Street Tailoring Cuir Noir & Cravate",
    subtitle: "Blouson cuir nappa, chemise blanche & cravate slim",
    image: "/assets/aistudio/1793196147632_7512d9e2.jpg",
    tag: "Look #06 — Noir Prestige",
    category: "varsity",
    productId: "prod-look-006",
    description: "Blouson en cuir nappa structuré col chemise combiné avec chemise blanche d’apparat et cravate slim. Silhouette street-tailoring contemporaine."
  },
  {
    id: "look-7",
    title: "Graphic Tee Jaune Soleil & Denim Loose",
    subtitle: "T-shirt boxy lourd 260g & casquette snapback",
    image: "/assets/aistudio/1793196166988_ff45ad79.jpg",
    tag: "Look #07 — Sun Vibe",
    category: "tshirts",
    productId: "prod-look-007",
    description: "T-shirt boxy lourd en pur coton 260 GSM jaune éclatant avec sérigraphie contrastée noire & rouge Keep Movin Around."
  },
  {
    id: "look-8",
    title: "Denim Baggy Patchwork Rust & Terre",
    subtitle: "Empiècements terre brûlée et ceinture western",
    image: "/assets/aistudio/1793196161270_6422d56b.jpg",
    tag: "Look #08 — Earth Raw",
    category: "pantalons",
    productId: "prod-look-008",
    description: "Denim loose fit assemblé avec empiècements teintes terre brûlée et finitions raw edge. Boucle de ceinture western cloutée signature."
  },
  {
    id: "look-9",
    title: "Hakama Soie Noire Jacquard Dragon Impérial",
    subtitle: "Coupe drapée orientale et tissage dragon ton sur ton",
    image: "/assets/aistudio/hakama_dragon_left.jpg",
    tag: "Look #09 — Dragon Emperor",
    category: "pantalons",
    productId: "prod-look-009",
    description: "Pantalon drapé oversize coupe hakama japonaise avec motif dragon impérial tissé en jacquard ton sur ton. Fluidité et ampleur théâtrale."
  },
  {
    id: "look-10",
    title: "Ensemble Plissé Resort Blanc Pur 2 Pièces",
    subtitle: "Chemisette col mao plissée & pantalon fluide assorti",
    image: "/assets/aistudio/1793196240812_1c830730.jpg",
    tag: "Look #10 — Resort Deluxe",
    category: "survetements",
    productId: "prod-look-010",
    description: "Ensemble estival haut de gamme composé d'une chemisette col mao plissée et d'un pantalon ample assorti en gaze côtelée ultra respirante."
  },
  {
    id: "look-11",
    title: "Boxy Heavyweight White Tee & Crossbody",
    subtitle: "Coton peigné épais 260 GSM col 3 cm & sacoche cuir",
    image: "/assets/aistudio/1793196150409_434dab46.jpg",
    tag: "Look #11 — Pure Minimal",
    category: "tshirts",
    productId: "prod-look-011",
    description: "T-shirt ultra épais au tombé structuré, col épais 3 cm anti-déformation, coupe boxy streetwear épurée."
  },
  {
    id: "look-12",
    title: "Maillot Moto Jersey Racing « Speed Eagle »",
    subtitle: "Jersey respirant bicolore manches longues & flockage damier",
    image: "/assets/aistudio/1793196187904_68957bff.jpg",
    tag: "Look #12 — Speed Racing",
    category: "tshirts",
    productId: "prod-look-012",
    description: "Jersey manches longues respirant style moto GP / motocross vintage avec graphisme aiglon racing et motif damier contrasté sur les manches."
  },
  {
    id: "look-13",
    title: "Polo Piqué Tennis Club Sport-Chic",
    subtitle: "Maille piquée respirante, liseré contrasté & col polo structuré",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
    tag: "Look #13 — French Tennis Club",
    category: "tshirts",
    productId: "prod-pol-002",
    description: "Inspiré de l’élégance sportive vintage et des courts de tennis réinventés pour la rue. Polo piqué marine avec col structuré."
  },
  {
    id: "look-14",
    title: "Denim Baggy Skate & Ceinture Western",
    subtitle: "Jean délavé déstructuré, taille basse et boucle métal gravée",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85",
    tag: "Look #14 — 90s Skate Core",
    category: "pantalons",
    productId: "prod-jns-001",
    description: "Coupe baggy skate délavée aux genoux, volume ample sur les chevilles combiné avec ceinture western en cuir ciselé."
  },
  {
    id: "look-15",
    title: "T-Shirt Boxy Acid Wash Y2K & Snapback",
    subtitle: "Coton lourd 280 GSM délavé minéral & broderie relief 3D",
    image: "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&w=1200&q=85",
    tag: "Look #15 — Y2K Heavyweight",
    category: "tshirts",
    productId: "prod-tsh-009",
    description: "T-shirt boxy aux épaules tombantes, lavage minéral aux reflets fumés, associé à la snapback brodée en relief 3D."
  },
  {
    id: "look-16",
    title: "Veste Trackjacket Sport-Chic & Polo Blanc",
    subtitle: "Survêtement rétro zippé bicolore blanc & vert court de tennis",
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1200&q=85",
    tag: "Look #16 — Court Heritage",
    category: "survetements",
    productId: "prod-pol-003",
    description: "Veste de survêtement trackjacket style tennis rétro héritage avec col montant et bandes bicolores blanc et vert émeraude."
  },
  {
    id: "look-17",
    title: "Ceinture Tactique Cobra & Denim Selvedge",
    subtitle: "Boucle métal rapide cobra & toile denim 14oz haut de gamme",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=85",
    tag: "Look #17 — Tactical Selvedge",
    category: "accessoires",
    productId: "prod-bel-002",
    description: "Accessoire de style streetwear utilitaire avec boucle de verrouillage rapide à déverrouillage cobra monté sur denim brut selvedge."
  },
  {
    id: "look-18",
    title: "Casquette Dad Hat Vintage Club & Tee 3D",
    subtitle: "Coton brossé délavé, visière courbée & broderie HPC Club",
    image: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1200&q=85",
    tag: "Look #18 — Vintage Club",
    category: "accessoires",
    productId: "prod-cap-001",
    description: "Casquette délavée style casquette de baseball rétro 6 pans avec broderie relief coordonnée aux pièces graphiques de la saison."
  }
];

const content = \`import { Product, CategoryInfo, DeliveryZone, PromoCode, StoreSettings } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'survetements',
    name: 'Ensembles & Survêtements',
    description: 'Ensembles jogging streetwear en molleton lourd et finitions soignées',
    iconName: 'Flame',
  },
  {
    id: 'sneakers',
    name: 'Sneakers & Baskets Lifestyle',
    description: 'Sélection exclusive de silhouettes rétro, basses et montantes',
    iconName: 'Footprints',
  },
  {
    id: 'basket',
    name: 'Chaussures de Basket',
    description: 'Paires haute performance pour terrain intérieur et playground',
    iconName: 'Trophy',
  },
  {
    id: 'tshirts',
    name: 'Tee-shirts & Polos',
    description: 'Coton peigné lourd 240 GSM, coupes oversize et graphismes percutants',
    iconName: 'Shirt',
  },
  {
    id: 'hoodies',
    name: 'Hoodies & Sweats',
    description: 'Sweats à capuche confortables avec broderies et détails métalliques',
    iconName: 'Sparkles',
  },
  {
    id: 'varsity',
    name: 'Vestes Varsity',
    description: 'Blousons universitaires iconiques avec empiècements en cuir végétal',
    iconName: 'Crown',
  },
  {
    id: 'pantalons',
    name: 'Jeans & Cargos',
    description: 'Cargos multipoches fonctionnels et denim coupe large',
    iconName: 'Layers',
  },
  {
    id: 'accessoires',
    name: 'Casquettes & Sacs',
    description: 'Sacs bandoulière tactiques, casquettes brodées et ceintures urbaines',
    iconName: 'ShoppingBag',
  },
];

export const LOOKBOOK_OUTFITS = \${JSON.stringify(lookbook, null, 2)};

export const INITIAL_PRODUCTS: Product[] = \${JSON.stringify(store.products, null, 2)};

export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-cotonou',
    name: 'Cotonou Intra-Muros (Express 24h)',
    cities: ['Cotonou'],
    fee: 1500,
    estimatedTime: '24 heures (jour même si commandé avant 14h)',
    freeDeliveryThreshold: 75000,
    description: 'Livraison directe par coursier moto à votre domicile, bureau ou boutique.',
    active: true,
  },
  {
    id: 'zone-calavi',
    name: 'Abomey-Calavi & Akpakpa Ouest',
    cities: ['Abomey-Calavi', 'Godomey', 'Tankpè', 'Akassato', 'Arconville'],
    fee: 2000,
    estimatedTime: '24h à 48 heures',
    freeDeliveryThreshold: 85000,
    description: 'Livraison sécurisée avec remise en main propre.',
    active: true,
  },
  {
    id: 'zone-portonovo',
    name: 'Porto-Novo & Sèmè-Kpodji',
    cities: ['Porto-Novo', 'Sèmè-Kpodji', 'Adjarra'],
    fee: 2500,
    estimatedTime: '48 heures',
    freeDeliveryThreshold: 90000,
    description: 'Acheminement rapide jusqu’à votre point de repère.',
    active: true,
  },
  {
    id: 'zone-provinces',
    name: 'Autres Villes du Bénin (Expédition Sécurisée)',
    cities: ['Parakou', 'Bohicon', 'Abomey', 'Ouidah', 'Natitingou', 'Lokossa'],
    fee: 4000,
    estimatedTime: '48h à 72 heures',
    freeDeliveryThreshold: 120000,
    description: 'Expédition par compagnie partenaire avec numéro de bordereau et retrait colis.',
    active: true,
  },
  {
    id: 'zone-pickup',
    name: 'Point Relais Partenaire Cotonou (Gratuit)',
    cities: ['Cotonou - Haie Vive', 'Cotonou - Maro-Militaire'],
    fee: 0,
    estimatedTime: 'Disponible sous 24h après confirmation',
    freeDeliveryThreshold: 0,
    description: 'Retirez votre commande sans frais dans nos points relais partenaires.',
    active: true,
  },
];

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-001',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 25000,
    maxDiscount: 15000,
    usageLimit: 200,
    usedCount: 24,
    active: true,
    expiryDate: '2026-12-31T23:59:59Z',
  },
  {
    id: 'promo-002',
    code: 'COTONOU5K',
    discountType: 'fixed',
    discountValue: 5000,
    minOrderAmount: 50000,
    usageLimit: 50,
    usedCount: 11,
    active: true,
    expiryDate: '2026-12-31T23:59:59Z',
  },
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'HP COLLECTION',
  slogan: 'Ton style. Tes règles.',
  phone: '+229 97 00 00 00',
  whatsappNumber: '+229 97 00 00 00',
  email: 'contact@hpcollection.bj',
  address: 'Cotonou, République du Bénin',
  announcementText: '🔥 NOUVELLE COLLECTION URBAN SNEAKERS & VARSITY DISPONIBLE | PAIEMENT À LA LIVRAISON ACCEPTÉ',
  announcementActive: true,
  currency: 'XOF',
  currencySymbol: 'FCFA',
  freeShippingThreshold: 75000,
  fedapayPublicKey: '',
  fedapaySecretKey: '',
  fedapaySandbox: true,
};
\`;

fs.writeFileSync("src/data/initialData.ts", content, "utf8");
console.log("Successfully wrote updated initialData.ts with all 18 outfits and 76 products!");
`;

fs.writeFileSync('scripts/sync_initial_data.js', syncScriptContent, 'utf8');
console.log('Successfully updated scripts/sync_initial_data.js');
