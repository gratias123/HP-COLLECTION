import { Product, CategoryInfo, DeliveryZone, PromoCode, StoreSettings } from '../types';

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

export const LOOKBOOK_OUTFITS = [
  {
    "id": "look-1",
    "title": "Cyber Denim & Casquette HP Signature",
    "subtitle": "Veste délavée brodée, chaînes métalliques et casquette 5-panel",
    "image": "/assets/aistudio/1793196164363_1__528b35f1.jpg",
    "tag": "Look #01 — Urban Tech",
    "category": "varsity",
    "productId": "prod-look-001",
    "description": "Veste en denim délavé avec finitions brodées aux manches, pantalon skate baggy orné de chaînes et de croix métalliques."
  },
  {
    "id": "look-2",
    "title": "Paisley Bandana & Cotonou Night",
    "subtitle": "Chemise satinée émeraude et boots vert olive",
    "image": "/assets/aistudio/1793196179671_1__fa78fa1f.jpg",
    "tag": "Look #02 — Tropical Rebel",
    "category": "tshirts",
    "productId": "prod-look-002",
    "description": "Chemise fluide à motif bandana vert d’eau et turquoise, ceinture fluo avec chaînes pendantes, pantalon ultra-large noir clouté."
  },
  {
    "id": "look-3",
    "title": "Scarlet Biker Racer & Custom Splatter",
    "subtitle": "Blouson cuir rouge éclatant et sacoche holster",
    "image": "/assets/aistudio/1793196195794_1__83aad193.jpg",
    "tag": "Look #03 — High Speed",
    "category": "varsity",
    "productId": "prod-look-003",
    "description": "Blouson court en cuir rouge racing avec sacoche coordonnée, jean skate déstructuré avec effet de lavis acide et projections de peinture."
  },
  {
    "id": "look-4",
    "title": "Ensemble Tailored Rouge & Béret d’Apparat",
    "subtitle": "Veste courte structurée et pantalon carmin",
    "image": "/assets/aistudio/1793196158473_10a41edc.jpg",
    "tag": "Look #04 — Couture Cotonou",
    "category": "survetements",
    "productId": "prod-look-004",
    "description": "Veste courte cintrée streetwear et pantalon de tailleur rouge carmin avec béret d’apparat coordonné. Coupe architecturale haute couture béninoise."
  },
  {
    "id": "look-5",
    "title": "Veste Coupe-Vent Floral « Jetour »",
    "subtitle": "Coupe-vent tropical technique & sacoche holster kaki",
    "image": "/assets/aistudio/1793196173456_2efd8b7f.jpg",
    "tag": "Look #05 — Tropics Explorer",
    "category": "varsity",
    "productId": "prod-look-005",
    "description": "Coupe-vent technique léger à imprimé floral tropical vibrant, col montant zippé et cordon élastique ajustable."
  },
  {
    "id": "look-6",
    "title": "Street Tailoring Cuir Noir & Cravate",
    "subtitle": "Blouson cuir nappa, chemise blanche & cravate slim",
    "image": "/assets/aistudio/1793196147632_7512d9e2.jpg",
    "tag": "Look #06 — Noir Prestige",
    "category": "varsity",
    "productId": "prod-look-006",
    "description": "Blouson en cuir nappa structuré col chemise combiné avec chemise blanche d’apparat et cravate slim. Silhouette street-tailoring contemporaine."
  },
  {
    "id": "look-7",
    "title": "Graphic Tee Jaune Soleil & Denim Loose",
    "subtitle": "T-shirt boxy lourd 260g & casquette snapback",
    "image": "/assets/aistudio/1793196166988_ff45ad79.jpg",
    "tag": "Look #07 — Sun Vibe",
    "category": "tshirts",
    "productId": "prod-look-007",
    "description": "T-shirt boxy lourd en pur coton 260 GSM jaune éclatant avec sérigraphie contrastée noire & rouge Keep Movin Around."
  },
  {
    "id": "look-8",
    "title": "Denim Baggy Patchwork Rust & Terre",
    "subtitle": "Empiècements terre brûlée et ceinture western",
    "image": "/assets/aistudio/1793196161270_6422d56b.jpg",
    "tag": "Look #08 — Earth Raw",
    "category": "pantalons",
    "productId": "prod-look-008",
    "description": "Denim loose fit assemblé avec empiècements teintes terre brûlée et finitions raw edge. Boucle de ceinture western cloutée signature."
  },
  {
    "id": "look-9",
    "title": "Hakama Soie Noire Jacquard Dragon Impérial",
    "subtitle": "Coupe drapée orientale et tissage dragon ton sur ton",
    "image": "/assets/aistudio/hakama_dragon_left.jpg",
    "tag": "Look #09 — Dragon Emperor",
    "category": "pantalons",
    "productId": "prod-look-009",
    "description": "Pantalon drapé oversize coupe hakama japonaise avec motif dragon impérial tissé en jacquard ton sur ton. Fluidité et ampleur théâtrale."
  },
  {
    "id": "look-10",
    "title": "Ensemble Plissé Resort Blanc Pur 2 Pièces",
    "subtitle": "Chemisette col mao plissée & pantalon fluide assorti",
    "image": "/assets/aistudio/1793196240812_1c830730.jpg",
    "tag": "Look #10 — Resort Deluxe",
    "category": "survetements",
    "productId": "prod-look-010",
    "description": "Ensemble estival haut de gamme composé d'une chemisette col mao plissée et d'un pantalon ample assorti en gaze côtelée ultra respirante."
  },
  {
    "id": "look-11",
    "title": "Boxy Heavyweight White Tee & Crossbody",
    "subtitle": "Coton peigné épais 260 GSM col 3 cm & sacoche cuir",
    "image": "/assets/aistudio/1793196150409_434dab46.jpg",
    "tag": "Look #11 — Pure Minimal",
    "category": "tshirts",
    "productId": "prod-look-011",
    "description": "T-shirt ultra épais au tombé structuré, col épais 3 cm anti-déformation, coupe boxy streetwear épurée."
  },
  {
    "id": "look-12",
    "title": "Maillot Moto Jersey Racing « Speed Eagle »",
    "subtitle": "Jersey respirant bicolore manches longues & flockage damier",
    "image": "/assets/aistudio/1793196187904_68957bff.jpg",
    "tag": "Look #12 — Speed Racing",
    "category": "tshirts",
    "productId": "prod-look-012",
    "description": "Jersey manches longues respirant style moto GP / motocross vintage avec graphisme aiglon racing et motif damier contrasté sur les manches."
  },
  {
    "id": "look-13",
    "title": "Polo Piqué Tennis Club Sport-Chic",
    "subtitle": "Maille piquée respirante, liseré contrasté & col polo structuré",
    "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
    "tag": "Look #13 — French Tennis Club",
    "category": "tshirts",
    "productId": "prod-pol-002",
    "description": "Inspiré de l’élégance sportive vintage et des courts de tennis réinventés pour la rue. Polo piqué marine avec col structuré."
  },
  {
    "id": "look-14",
    "title": "Denim Baggy Skate & Ceinture Western",
    "subtitle": "Jean délavé déstructuré, taille basse et boucle métal gravée",
    "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85",
    "tag": "Look #14 — 90s Skate Core",
    "category": "pantalons",
    "productId": "prod-jns-001",
    "description": "Coupe baggy skate délavée aux genoux, volume ample sur les chevilles combiné avec ceinture western en cuir ciselé."
  },
  {
    "id": "look-15",
    "title": "T-Shirt Boxy Acid Wash Y2K & Snapback",
    "subtitle": "Coton lourd 280 GSM délavé minéral & broderie relief 3D",
    "image": "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&w=1200&q=85",
    "tag": "Look #15 — Y2K Heavyweight",
    "category": "tshirts",
    "productId": "prod-tsh-009",
    "description": "T-shirt boxy aux épaules tombantes, lavage minéral aux reflets fumés, associé à la snapback brodée en relief 3D."
  },
  {
    "id": "look-16",
    "title": "Veste Trackjacket Sport-Chic & Polo Blanc",
    "subtitle": "Survêtement rétro zippé bicolore blanc & vert court de tennis",
    "image": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1200&q=85",
    "tag": "Look #16 — Court Heritage",
    "category": "survetements",
    "productId": "prod-pol-003",
    "description": "Veste de survêtement trackjacket style tennis rétro héritage avec col montant et bandes bicolores blanc et vert émeraude."
  },
  {
    "id": "look-17",
    "title": "Ceinture Tactique Cobra & Denim Selvedge",
    "subtitle": "Boucle métal rapide cobra & toile denim 14oz haut de gamme",
    "image": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=85",
    "tag": "Look #17 — Tactical Selvedge",
    "category": "accessoires",
    "productId": "prod-bel-002",
    "description": "Accessoire de style streetwear utilitaire avec boucle de verrouillage rapide à déverrouillage cobra monté sur denim brut selvedge."
  },
  {
    "id": "look-18",
    "title": "Casquette Dad Hat Vintage Club & Tee 3D",
    "subtitle": "Coton brossé délavé, visière courbée & broderie HPC Club",
    "image": "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1200&q=85",
    "tag": "Look #18 — Vintage Club",
    "category": "accessoires",
    "productId": "prod-cap-001",
    "description": "Casquette délavée style casquette de baseball rétro 6 pans avec broderie relief coordonnée aux pièces graphiques de la saison."
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-look-001",
    "sku": "HPC-DEN-001",
    "name": "Veste Denim Délavée « Cyber Drip » Broderies & Casquette HP",
    "description": "Veste en denim délavé artisanal avec finitions brodées aux manches, coupe structurée inspirée du streetwear béninois. Livrée avec écusson collector.",
    "price": 35000,
    "compareAtPrice": 42000,
    "category": "varsity",
    "images": [
      "/assets/aistudio/1793196164363_1__528b35f1.jpg",
      "/assets/aistudio/veste_denim_detail.jpg"
    ],
    "badge": "COLLECTION 2026",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Bleu Brut Délavé",
        "hex": "#4A6B82"
      }
    ],
    "variants": [
      {
        "id": "v-001-m",
        "size": "M",
        "color": "Bleu Brut Délavé",
        "stock": 6,
        "sku": "HPC-DEN-001-M"
      },
      {
        "id": "v-001-l",
        "size": "L",
        "color": "Bleu Brut Délavé",
        "stock": 8,
        "sku": "HPC-DEN-001-L"
      },
      {
        "id": "v-001-xl",
        "size": "XL",
        "color": "Bleu Brut Délavé",
        "stock": 4,
        "sku": "HPC-DEN-001-XL"
      }
    ],
    "totalStock": 18,
    "createdAt": "2026-10-31T10:00:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "veste-denim-d-lav-e-cyber-drip-broderies-casquette-hp",
    "updatedAt": "2026-10-31T10:00:00Z"
  },
  {
    "id": "prod-look-002",
    "sku": "HPC-SHR-002",
    "name": "Chemise Satinée Motif Bandana Émeraude « Cotonou Night »",
    "description": "Chemise fluide à col cubain en twill de viscose satiné, imprimé bandana cachemire émeraude et turquoise. Tombé impeccable et confort thermique pour les soirées chaudes.",
    "price": 22000,
    "compareAtPrice": 28000,
    "category": "tshirts",
    "images": [
      "/assets/aistudio/1793196179671_1__fa78fa1f.jpg",
      "/assets/aistudio/chemise_bandana_detail.jpg"
    ],
    "badge": "EXCLUSIF",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Émeraude & Turquoise",
        "hex": "#1A4D43"
      }
    ],
    "variants": [
      {
        "id": "v-002-s",
        "size": "S",
        "color": "Émeraude & Turquoise",
        "stock": 5,
        "sku": "HPC-SHR-002-S"
      },
      {
        "id": "v-002-m",
        "size": "M",
        "color": "Émeraude & Turquoise",
        "stock": 10,
        "sku": "HPC-SHR-002-M"
      },
      {
        "id": "v-002-l",
        "size": "L",
        "color": "Émeraude & Turquoise",
        "stock": 7,
        "sku": "HPC-SHR-002-L"
      },
      {
        "id": "v-002-xl",
        "size": "XL",
        "color": "Émeraude & Turquoise",
        "stock": 4,
        "sku": "HPC-SHR-002-XL"
      }
    ],
    "totalStock": 26,
    "createdAt": "2026-10-31T10:01:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "chemise-satin-e-motif-bandana-meraude-cotonou-night",
    "updatedAt": "2026-10-31T10:01:00Z"
  },
  {
    "id": "prod-look-003",
    "sku": "HPC-LTR-003",
    "name": "Blouson Moto Biker Cuir Rouge Écarlate HP",
    "description": "Blouson racer court en cuir synthétique de haute densité rouge écarlate. Col montant à bouton pression, zips métalliques renforcés et coupe fitted streetwear.",
    "price": 45000,
    "compareAtPrice": 55000,
    "category": "varsity",
    "images": [
      "/assets/aistudio/1793196195794_1__83aad193.jpg",
      "/assets/aistudio/blouson_cuir_rouge_detail.jpg"
    ],
    "badge": "ÉDITION LIMITÉE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Rouge Écarlate",
        "hex": "#B22222"
      }
    ],
    "variants": [
      {
        "id": "v-003-m",
        "size": "M",
        "color": "Rouge Écarlate",
        "stock": 4,
        "sku": "HPC-LTR-003-M"
      },
      {
        "id": "v-003-l",
        "size": "L",
        "color": "Rouge Écarlate",
        "stock": 6,
        "sku": "HPC-LTR-003-L"
      },
      {
        "id": "v-003-xl",
        "size": "XL",
        "color": "Rouge Écarlate",
        "stock": 3,
        "sku": "HPC-LTR-003-XL"
      }
    ],
    "totalStock": 13,
    "createdAt": "2026-10-31T10:02:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "blouson-moto-biker-cuir-rouge-carlate-hp",
    "updatedAt": "2026-10-31T10:02:00Z"
  },
  {
    "id": "prod-look-004",
    "sku": "HPC-ENS-004",
    "name": "Ensemble Tailored Streetwear Monogram Rouge Écarlate",
    "description": "Veste courte cintrée streetwear et pantalon de tailleur rouge carmin avec béret d'apparat coordonné. Coupe architecturale moderne inspirée de la haute couture béninoise.",
    "price": 38000,
    "compareAtPrice": 48000,
    "category": "survetements",
    "images": [
      "/assets/aistudio/1793196158473_10a41edc.jpg",
      "/assets/aistudio/detail_ensemble_rouge.jpg"
    ],
    "badge": "COUTURE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Rouge Carmin Royal",
        "hex": "#9E1B32"
      }
    ],
    "variants": [
      {
        "id": "v-004-s",
        "size": "S",
        "color": "Rouge Carmin Royal",
        "stock": 4,
        "sku": "HPC-ENS-004-S"
      },
      {
        "id": "v-004-m",
        "size": "M",
        "color": "Rouge Carmin Royal",
        "stock": 7,
        "sku": "HPC-ENS-004-M"
      },
      {
        "id": "v-004-l",
        "size": "L",
        "color": "Rouge Carmin Royal",
        "stock": 5,
        "sku": "HPC-ENS-004-L"
      },
      {
        "id": "v-004-xl",
        "size": "XL",
        "color": "Rouge Carmin Royal",
        "stock": 3,
        "sku": "HPC-ENS-004-XL"
      }
    ],
    "totalStock": 19,
    "createdAt": "2026-10-31T10:03:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "ensemble-tailored-streetwear-monogram-rouge-carlate",
    "updatedAt": "2026-10-31T10:03:00Z"
  },
  {
    "id": "prod-look-005",
    "sku": "HPC-WND-005",
    "name": "Veste Coupe-Vent Imprimé Floral Streetwear « Jetour »",
    "description": "Coupe-vent technique léger à imprimé floral tropical vibrant, col montant zippé et cordon élastique ajustable. Livré avec bandoulière holster tactique kaki assortie.",
    "price": 32000,
    "compareAtPrice": 39000,
    "category": "varsity",
    "images": [
      "/assets/aistudio/1793196173456_2efd8b7f.jpg",
      "/assets/aistudio/detail_veste_floral.jpg"
    ],
    "badge": "TENDANCE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Multicolore Floral & Kaki",
        "hex": "#D4A373"
      }
    ],
    "variants": [
      {
        "id": "v-005-m",
        "size": "M",
        "color": "Multicolore Floral & Kaki",
        "stock": 5,
        "sku": "HPC-WND-005-M"
      },
      {
        "id": "v-005-l",
        "size": "L",
        "color": "Multicolore Floral & Kaki",
        "stock": 8,
        "sku": "HPC-WND-005-L"
      },
      {
        "id": "v-005-xl",
        "size": "XL",
        "color": "Multicolore Floral & Kaki",
        "stock": 4,
        "sku": "HPC-WND-005-XL"
      }
    ],
    "totalStock": 17,
    "createdAt": "2026-10-31T10:04:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "veste-coupe-vent-imprim-floral-streetwear-jetour",
    "updatedAt": "2026-10-31T10:04:00Z"
  },
  {
    "id": "prod-look-006",
    "sku": "HPC-LTR-006",
    "name": "Blouson Cuir Street Tailoring Noir & Chemise Cravate",
    "description": "Blouson en cuir nappa structuré col chemise, combinable avec chemise blanche d'apparat et cravate slim. Silhouette street-tailoring contemporaine portée par les ambassadeurs de la marque.",
    "price": 42000,
    "compareAtPrice": 52000,
    "category": "varsity",
    "images": [
      "/assets/aistudio/1793196147632_7512d9e2.jpg",
      "/assets/aistudio/detail_cuir_cravate.jpg"
    ],
    "badge": "PREMIUM",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Noir Cuir Intense",
        "hex": "#111111"
      }
    ],
    "variants": [
      {
        "id": "v-006-m",
        "size": "M",
        "color": "Noir Cuir Intense",
        "stock": 4,
        "sku": "HPC-LTR-006-M"
      },
      {
        "id": "v-006-l",
        "size": "L",
        "color": "Noir Cuir Intense",
        "stock": 6,
        "sku": "HPC-LTR-006-L"
      },
      {
        "id": "v-006-xl",
        "size": "XL",
        "color": "Noir Cuir Intense",
        "stock": 4,
        "sku": "HPC-LTR-006-XL"
      },
      {
        "id": "v-006-xxl",
        "size": "XXL",
        "color": "Noir Cuir Intense",
        "stock": 2,
        "sku": "HPC-LTR-006-XXL"
      }
    ],
    "totalStock": 16,
    "createdAt": "2026-10-31T10:05:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "blouson-cuir-street-tailoring-noir-chemise-cravate",
    "updatedAt": "2026-10-31T10:05:00Z"
  },
  {
    "id": "prod-look-007",
    "sku": "HPC-TSH-007",
    "name": "T-Shirt Oversize Graphic Jaune Soleil « Dsquared Vibe »",
    "description": "T-shirt boxy lourd en pur coton 260 GSM jaune éclatant avec sérigraphie contrastée noire & rouge « Keep Movin Around ». Coupe décontractée parfaite avec un denim clair.",
    "price": 18000,
    "compareAtPrice": 24000,
    "category": "tshirts",
    "images": [
      "/assets/aistudio/1793196166988_ff45ad79.jpg",
      "/assets/aistudio/detail_tshirt_jaune.jpg"
    ],
    "badge": "BEST-SELLER",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Jaune Soleil Intense",
        "hex": "#F5B041"
      }
    ],
    "variants": [
      {
        "id": "v-007-s",
        "size": "S",
        "color": "Jaune Soleil Intense",
        "stock": 6,
        "sku": "HPC-TSH-007-S"
      },
      {
        "id": "v-007-m",
        "size": "M",
        "color": "Jaune Soleil Intense",
        "stock": 12,
        "sku": "HPC-TSH-007-M"
      },
      {
        "id": "v-007-l",
        "size": "L",
        "color": "Jaune Soleil Intense",
        "stock": 8,
        "sku": "HPC-TSH-007-L"
      },
      {
        "id": "v-007-xl",
        "size": "XL",
        "color": "Jaune Soleil Intense",
        "stock": 5,
        "sku": "HPC-TSH-007-XL"
      }
    ],
    "totalStock": 31,
    "createdAt": "2026-10-31T10:06:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "t-shirt-oversize-graphic-jaune-soleil-dsquared-vibe",
    "updatedAt": "2026-10-31T10:06:00Z"
  },
  {
    "id": "prod-look-008",
    "sku": "HPC-PNT-008",
    "name": "Jean Baggy Patchwork Rust & Terre Déstructuré",
    "description": "Denim loose fit assemblé avec empiècements teintes terre brûlée et finitions raw edge. Boucle de ceinture western cloutée signature et confort absolu.",
    "price": 26000,
    "compareAtPrice": 34000,
    "category": "pantalons",
    "images": [
      "/assets/aistudio/1793196161270_6422d56b.jpg",
      "/assets/aistudio/detail_jean_patchwork.jpg"
    ],
    "badge": "NOUVEAU",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Denim Rust Terre",
        "hex": "#8D5B4C"
      }
    ],
    "variants": [
      {
        "id": "v-008-30",
        "size": "30",
        "color": "Denim Rust Terre",
        "stock": 5,
        "sku": "HPC-PNT-008-30"
      },
      {
        "id": "v-008-32",
        "size": "32",
        "color": "Denim Rust Terre",
        "stock": 9,
        "sku": "HPC-PNT-008-32"
      },
      {
        "id": "v-008-34",
        "size": "34",
        "color": "Denim Rust Terre",
        "stock": 7,
        "sku": "HPC-PNT-008-34"
      },
      {
        "id": "v-008-36",
        "size": "36",
        "color": "Denim Rust Terre",
        "stock": 3,
        "sku": "HPC-PNT-008-36"
      }
    ],
    "totalStock": 24,
    "createdAt": "2026-10-31T10:07:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "jean-baggy-patchwork-rust-terre-d-structur",
    "updatedAt": "2026-10-31T10:07:00Z"
  },
  {
    "id": "prod-look-009",
    "sku": "HPC-HKM-009",
    "name": "Pantalon Large Hakama Soie Noire Jacquard Dragon",
    "description": "Pantalon drapé oversize coupe hakama japonaise avec motif dragon impérial tissé en jacquard ton sur ton. Fluidité, ampleur théâtrale et tombé majestueux.",
    "price": 29000,
    "compareAtPrice": 38000,
    "category": "pantalons",
    "images": [
      "/assets/aistudio/hakama_dragon_left.jpg",
      "/assets/aistudio/hakama_dragon_right.jpg"
    ],
    "badge": "HAUTE PIÈCE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir Soie Jacquard",
        "hex": "#1A1A1A"
      }
    ],
    "variants": [
      {
        "id": "v-009-m",
        "size": "M",
        "color": "Noir Soie Jacquard",
        "stock": 5,
        "sku": "HPC-HKM-009-M"
      },
      {
        "id": "v-009-l",
        "size": "L",
        "color": "Noir Soie Jacquard",
        "stock": 8,
        "sku": "HPC-HKM-009-L"
      },
      {
        "id": "v-009-xl",
        "size": "XL",
        "color": "Noir Soie Jacquard",
        "stock": 4,
        "sku": "HPC-HKM-009-XL"
      }
    ],
    "totalStock": 17,
    "createdAt": "2026-10-31T10:08:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "pantalon-large-hakama-soie-noire-jacquard-dragon",
    "updatedAt": "2026-10-31T10:08:00Z"
  },
  {
    "id": "prod-look-010",
    "sku": "HPC-ENS-010",
    "name": "Ensemble Plissé Resort Côtelé Blanc Pur 2 Pièces",
    "description": "Ensemble estival haut de gamme composé d'une chemisette col mao plissée et d'un pantalon ample assorti en gaze côtelée ultra respirante. Chic minimaliste et décontraction raffinée.",
    "price": 35000,
    "compareAtPrice": 44000,
    "category": "survetements",
    "images": [
      "/assets/aistudio/1793196240812_1c830730.jpg",
      "/assets/aistudio/detail_ensemble_plisse_top.jpg"
    ],
    "badge": "RESORT",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Blanc Pur Côtelé",
        "hex": "#FDFDFD"
      }
    ],
    "variants": [
      {
        "id": "v-010-s",
        "size": "S",
        "color": "Blanc Pur Côtelé",
        "stock": 4,
        "sku": "HPC-ENS-010-S"
      },
      {
        "id": "v-010-m",
        "size": "M",
        "color": "Blanc Pur Côtelé",
        "stock": 8,
        "sku": "HPC-ENS-010-M"
      },
      {
        "id": "v-010-l",
        "size": "L",
        "color": "Blanc Pur Côtelé",
        "stock": 6,
        "sku": "HPC-ENS-010-L"
      },
      {
        "id": "v-010-xl",
        "size": "XL",
        "color": "Blanc Pur Côtelé",
        "stock": 3,
        "sku": "HPC-ENS-010-XL"
      }
    ],
    "totalStock": 21,
    "createdAt": "2026-10-31T10:09:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "ensemble-pliss-resort-c-tel-blanc-pur-2-pi-ces",
    "updatedAt": "2026-10-31T10:09:00Z"
  },
  {
    "id": "prod-look-011",
    "sku": "HPC-TSH-011",
    "name": "T-Shirt Boxy Heavyweight Coton Blanc Pur 260 GSM",
    "description": "T-shirt ultra épais au tombé structuré, col épais 3 cm anti-déformation, coupe boxy streetwear épurée. Confection coton peigné respirant adapté au climat côtier.",
    "price": 16000,
    "compareAtPrice": 22000,
    "category": "tshirts",
    "images": [
      "/assets/aistudio/1793196150409_434dab46.jpg",
      "/assets/aistudio/detail_tshirt_blanc_boxy.jpg"
    ],
    "badge": "ESSENTIEL",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Blanc Optique",
        "hex": "#FFFFFF"
      }
    ],
    "variants": [
      {
        "id": "v-011-s",
        "size": "S",
        "color": "Blanc Optique",
        "stock": 8,
        "sku": "HPC-TSH-011-S"
      },
      {
        "id": "v-011-m",
        "size": "M",
        "color": "Blanc Optique",
        "stock": 15,
        "sku": "HPC-TSH-011-M"
      },
      {
        "id": "v-011-l",
        "size": "L",
        "color": "Blanc Optique",
        "stock": 10,
        "sku": "HPC-TSH-011-L"
      },
      {
        "id": "v-011-xl",
        "size": "XL",
        "color": "Blanc Optique",
        "stock": 6,
        "sku": "HPC-TSH-011-XL"
      }
    ],
    "totalStock": 39,
    "createdAt": "2026-10-31T10:10:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "t-shirt-boxy-heavyweight-coton-blanc-pur-260-gsm",
    "updatedAt": "2026-10-31T10:10:00Z"
  },
  {
    "id": "prod-look-012",
    "sku": "HPC-JRS-012",
    "name": "Maillot Moto Jersey Racing « Speed Eagle » Bicolore",
    "description": "Jersey manches longues respirant style moto GP / motocross vintage avec graphisme aiglon racing et motif damier contrasté sur les manches. Coupe ample sportive.",
    "price": 22000,
    "compareAtPrice": 29000,
    "category": "tshirts",
    "images": [
      "/assets/aistudio/1793196187904_68957bff.jpg",
      "/assets/aistudio/detail_jersey_racing.jpg"
    ],
    "badge": "RACING",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir & Blanc Racing",
        "hex": "#222222"
      }
    ],
    "variants": [
      {
        "id": "v-012-m",
        "size": "M",
        "color": "Noir & Blanc Racing",
        "stock": 6,
        "sku": "HPC-JRS-012-M"
      },
      {
        "id": "v-012-l",
        "size": "L",
        "color": "Noir & Blanc Racing",
        "stock": 9,
        "sku": "HPC-JRS-012-L"
      },
      {
        "id": "v-012-xl",
        "size": "XL",
        "color": "Noir & Blanc Racing",
        "stock": 5,
        "sku": "HPC-JRS-012-XL"
      }
    ],
    "totalStock": 20,
    "createdAt": "2026-10-31T10:11:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "maillot-moto-jersey-racing-speed-eagle-bicolore",
    "updatedAt": "2026-10-31T10:11:00Z"
  },
  {
    "id": "prod-snk-001",
    "sku": "HPC-SNK-001",
    "name": "Sneakers Skate Chunky Semelle Gum Suède & Toile",
    "description": "Silhouette basse skate rétro avec empiècements suède doux et semelle extérieure en gomme naturelle alvéolée.",
    "price": 34000,
    "compareAtPrice": 42000,
    "category": "sneakers",
    "images": [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "SKATE",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Noir & Gum",
        "hex": "#262626"
      }
    ],
    "variants": [
      {
        "id": "v-snk1-40",
        "size": "40",
        "color": "Noir & Gum",
        "stock": 3,
        "sku": "HPC-SNK-001-40"
      },
      {
        "id": "v-snk1-41",
        "size": "41",
        "color": "Noir & Gum",
        "stock": 5,
        "sku": "HPC-SNK-001-41"
      },
      {
        "id": "v-snk1-42",
        "size": "42",
        "color": "Noir & Gum",
        "stock": 6,
        "sku": "HPC-SNK-001-42"
      },
      {
        "id": "v-snk1-43",
        "size": "43",
        "color": "Noir & Gum",
        "stock": 4,
        "sku": "HPC-SNK-001-43"
      },
      {
        "id": "v-snk1-44",
        "size": "44",
        "color": "Noir & Gum",
        "stock": 2,
        "sku": "HPC-SNK-001-44"
      }
    ],
    "totalStock": 20,
    "createdAt": "2026-10-31T09:00:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "sneakers-skate-chunky-semelle-gum-su-de-toile",
    "updatedAt": "2026-10-31T09:00:00Z"
  },
  {
    "id": "prod-snk-002",
    "sku": "HPC-SNK-002",
    "name": "Sneakers HP Dunk Low « Vintage Bone & Forest »",
    "description": "Cuir pleine fleur bicolore blanc os et vert forêt profond, semelle intermédiaire pré-vieillie et lacets en coton épais.",
    "price": 39000,
    "compareAtPrice": 49000,
    "category": "sneakers",
    "images": [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "COLLECTOR",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Bone & Forêt",
        "hex": "#2D5A27"
      }
    ],
    "variants": [
      {
        "id": "v-snk2-41",
        "size": "41",
        "color": "Bone & Forêt",
        "stock": 4,
        "sku": "HPC-SNK-002-41"
      },
      {
        "id": "v-snk2-42",
        "size": "42",
        "color": "Bone & Forêt",
        "stock": 7,
        "sku": "HPC-SNK-002-42"
      },
      {
        "id": "v-snk2-43",
        "size": "43",
        "color": "Bone & Forêt",
        "stock": 5,
        "sku": "HPC-SNK-002-43"
      },
      {
        "id": "v-snk2-44",
        "size": "44",
        "color": "Bone & Forêt",
        "stock": 3,
        "sku": "HPC-SNK-002-44"
      }
    ],
    "totalStock": 19,
    "createdAt": "2026-10-31T09:01:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "sneakers-hp-dunk-low-vintage-bone-forest",
    "updatedAt": "2026-10-31T09:01:00Z"
  },
  {
    "id": "prod-snk-003",
    "sku": "HPC-SNK-003",
    "name": "Baskets Chunky Runner « Phantom Grey » Amorti Air",
    "description": "Mesh technique respirant et cuir synthétique superposé sur semelle intermédiaire XXL ultra amortissante.",
    "price": 36000,
    "compareAtPrice": 45000,
    "category": "sneakers",
    "images": [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "RUNNER",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Gris Phantom",
        "hex": "#708090"
      }
    ],
    "variants": [
      {
        "id": "v-snk3-40",
        "size": "40",
        "color": "Gris Phantom",
        "stock": 3,
        "sku": "HPC-SNK-003-40"
      },
      {
        "id": "v-snk3-41",
        "size": "41",
        "color": "Gris Phantom",
        "stock": 6,
        "sku": "HPC-SNK-003-41"
      },
      {
        "id": "v-snk3-42",
        "size": "42",
        "color": "Gris Phantom",
        "stock": 8,
        "sku": "HPC-SNK-003-42"
      },
      {
        "id": "v-snk3-43",
        "size": "43",
        "color": "Gris Phantom",
        "stock": 4,
        "sku": "HPC-SNK-003-43"
      },
      {
        "id": "v-snk3-44",
        "size": "44",
        "color": "Gris Phantom",
        "stock": 2,
        "sku": "HPC-SNK-003-44"
      }
    ],
    "totalStock": 23,
    "createdAt": "2026-10-31T09:02:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "baskets-chunky-runner-phantom-grey-amorti-air",
    "updatedAt": "2026-10-31T09:02:00Z"
  },
  {
    "id": "prod-snk-004",
    "sku": "HPC-SNK-004",
    "name": "Sneakers HP Apex Low Retro « Obsidian Gold »",
    "description": "Sneaker basse streetwear cuir nappa teinté noir profond rehaussé de touches dorées métallisées.",
    "price": 37000,
    "compareAtPrice": 46000,
    "category": "sneakers",
    "images": [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "SIGNATURE",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "41",
      "42",
      "43",
      "44",
      "45"
    ],
    "colors": [
      {
        "name": "Noir & Or",
        "hex": "#1C1C1C"
      }
    ],
    "variants": [
      {
        "id": "v-snk4-41",
        "size": "41",
        "color": "Noir & Or",
        "stock": 4,
        "sku": "HPC-SNK-004-41"
      },
      {
        "id": "v-snk4-42",
        "size": "42",
        "color": "Noir & Or",
        "stock": 6,
        "sku": "HPC-SNK-004-42"
      },
      {
        "id": "v-snk4-43",
        "size": "43",
        "color": "Noir & Or",
        "stock": 5,
        "sku": "HPC-SNK-004-43"
      },
      {
        "id": "v-snk4-44",
        "size": "44",
        "color": "Noir & Or",
        "stock": 3,
        "sku": "HPC-SNK-004-44"
      },
      {
        "id": "v-snk4-45",
        "size": "45",
        "color": "Noir & Or",
        "stock": 2,
        "sku": "HPC-SNK-004-45"
      }
    ],
    "totalStock": 20,
    "createdAt": "2026-10-31T09:03:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "sneakers-hp-apex-low-retro-obsidian-gold",
    "updatedAt": "2026-10-31T09:03:00Z"
  },
  {
    "id": "prod-bsk-001",
    "sku": "HPC-BSK-001",
    "name": "Court Pro Bounce Triple White Amorti Rebond",
    "description": "Modèle basketball performance profil bas, empeigne mesh respirant et semelle injectée dynamique pour playground et streetball.",
    "price": 38000,
    "compareAtPrice": 47000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "PERFORMANCE",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "41",
      "42",
      "43",
      "44",
      "45"
    ],
    "colors": [
      {
        "name": "Blanc Pur",
        "hex": "#F8F9FA"
      }
    ],
    "variants": [
      {
        "id": "v-bsk1-41",
        "size": "41",
        "color": "Blanc Pur",
        "stock": 3,
        "sku": "HPC-BSK-001-41"
      },
      {
        "id": "v-bsk1-42",
        "size": "42",
        "color": "Blanc Pur",
        "stock": 6,
        "sku": "HPC-BSK-001-42"
      },
      {
        "id": "v-bsk1-43",
        "size": "43",
        "color": "Blanc Pur",
        "stock": 5,
        "sku": "HPC-BSK-001-43"
      },
      {
        "id": "v-bsk1-44",
        "size": "44",
        "color": "Blanc Pur",
        "stock": 3,
        "sku": "HPC-BSK-001-44"
      },
      {
        "id": "v-bsk1-45",
        "size": "45",
        "color": "Blanc Pur",
        "stock": 2,
        "sku": "HPC-BSK-001-45"
      }
    ],
    "totalStock": 19,
    "createdAt": "2026-10-31T09:04:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "court-pro-bounce-triple-white-amorti-rebond",
    "updatedAt": "2026-10-31T09:04:00Z"
  },
  {
    "id": "prod-bsk-002",
    "sku": "HPC-BSK-002",
    "name": "Air Court High Retro Black & Gold Vieilli",
    "description": "Silhouette haute montante basketball vintage, tige cuir grainé noir mat et renforts cheville matelassés.",
    "price": 42000,
    "compareAtPrice": 52000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "HIGH TOP",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "42",
      "43",
      "44",
      "45"
    ],
    "colors": [
      {
        "name": "Noir & Or Ancien",
        "hex": "#232323"
      }
    ],
    "variants": [
      {
        "id": "v-bsk2-42",
        "size": "42",
        "color": "Noir & Or Ancien",
        "stock": 5,
        "sku": "HPC-BSK-002-42"
      },
      {
        "id": "v-bsk2-43",
        "size": "43",
        "color": "Noir & Or Ancien",
        "stock": 7,
        "sku": "HPC-BSK-002-43"
      },
      {
        "id": "v-bsk2-44",
        "size": "44",
        "color": "Noir & Or Ancien",
        "stock": 4,
        "sku": "HPC-BSK-002-44"
      },
      {
        "id": "v-bsk2-45",
        "size": "45",
        "color": "Noir & Or Ancien",
        "stock": 2,
        "sku": "HPC-BSK-002-45"
      }
    ],
    "totalStock": 18,
    "createdAt": "2026-10-31T09:05:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "air-court-high-retro-black-gold-vieilli",
    "updatedAt": "2026-10-31T09:05:00Z"
  },
  {
    "id": "prod-bsk-003",
    "sku": "HPC-BSK-003",
    "name": "Baskets Montantes Pro Court « Dynasty High »",
    "description": "Chaussure de basket hybride lifestyle et parquet en cuir épais souple avec semelle cousue 360 degrés.",
    "price": 41000,
    "compareAtPrice": 50000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "HERITAGE",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Blanc & Noir",
        "hex": "#FFFFFF"
      }
    ],
    "variants": [
      {
        "id": "v-bsk3-41",
        "size": "41",
        "color": "Blanc & Noir",
        "stock": 4,
        "sku": "HPC-BSK-003-41"
      },
      {
        "id": "v-bsk3-42",
        "size": "42",
        "color": "Blanc & Noir",
        "stock": 6,
        "sku": "HPC-BSK-003-42"
      },
      {
        "id": "v-bsk3-43",
        "size": "43",
        "color": "Blanc & Noir",
        "stock": 5,
        "sku": "HPC-BSK-003-43"
      },
      {
        "id": "v-bsk3-44",
        "size": "44",
        "color": "Blanc & Noir",
        "stock": 3,
        "sku": "HPC-BSK-003-44"
      }
    ],
    "totalStock": 18,
    "createdAt": "2026-10-31T09:06:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "baskets-montantes-pro-court-dynasty-high",
    "updatedAt": "2026-10-31T09:06:00Z"
  },
  {
    "id": "prod-hdy-001",
    "sku": "HPC-HDY-001",
    "name": "Hoodie Boxy Heavyweight HP « Golden Monogram »",
    "description": "Coton molleton brossé épais 460 GSM, capuche doublée sans cordon avec œillets métalliques et broderie or.",
    "price": 28000,
    "compareAtPrice": 35000,
    "category": "hoodies",
    "images": [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "HEAVYWEIGHT",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Noir Onyx",
        "hex": "#111111"
      }
    ],
    "variants": [
      {
        "id": "v-hdy1-m",
        "size": "M",
        "color": "Noir Onyx",
        "stock": 5,
        "sku": "HPC-HDY-001-M"
      },
      {
        "id": "v-hdy1-l",
        "size": "L",
        "color": "Noir Onyx",
        "stock": 8,
        "sku": "HPC-HDY-001-L"
      },
      {
        "id": "v-hdy1-xl",
        "size": "XL",
        "color": "Noir Onyx",
        "stock": 6,
        "sku": "HPC-HDY-001-XL"
      },
      {
        "id": "v-hdy1-xxl",
        "size": "XXL",
        "color": "Noir Onyx",
        "stock": 3,
        "sku": "HPC-HDY-001-XXL"
      }
    ],
    "totalStock": 22,
    "createdAt": "2026-10-31T09:07:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "hoodie-boxy-heavyweight-hp-golden-monogram",
    "updatedAt": "2026-10-31T09:07:00Z"
  },
  {
    "id": "prod-hdy-002",
    "sku": "HPC-HDY-002",
    "name": "Sweat Col Rond Minimaliste Broderie HPC Ton sur Ton",
    "description": "Crewneck streetwear en molleton de coton pur 420 GSM avec bord-côtes renforcés et coupe droite épurée.",
    "price": 24000,
    "compareAtPrice": 30000,
    "category": "hoodies",
    "images": [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "MINIMAL",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Gris Chiné Profond",
        "hex": "#4B4B4B"
      }
    ],
    "variants": [
      {
        "id": "v-hdy2-s",
        "size": "S",
        "color": "Gris Chiné Profond",
        "stock": 4,
        "sku": "HPC-HDY-002-S"
      },
      {
        "id": "v-hdy2-m",
        "size": "M",
        "color": "Gris Chiné Profond",
        "stock": 7,
        "sku": "HPC-HDY-002-M"
      },
      {
        "id": "v-hdy2-l",
        "size": "L",
        "color": "Gris Chiné Profond",
        "stock": 6,
        "sku": "HPC-HDY-002-L"
      },
      {
        "id": "v-hdy2-xl",
        "size": "XL",
        "color": "Gris Chiné Profond",
        "stock": 3,
        "sku": "HPC-HDY-002-XL"
      }
    ],
    "totalStock": 20,
    "createdAt": "2026-10-31T09:08:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "sweat-col-rond-minimaliste-broderie-hpc-ton-sur-ton",
    "updatedAt": "2026-10-31T09:08:00Z"
  },
  {
    "id": "prod-hdy-003",
    "sku": "HPC-HDY-003",
    "name": "Hoodie Zip Heavyweight 480 GSM Double Épaisseur Anthracite",
    "description": "Sweat zippé complet avec fermeture éclair à curseur métallique massif et intérieur thermique brossé.",
    "price": 31000,
    "compareAtPrice": 39000,
    "category": "hoodies",
    "images": [
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "THERMIQUE",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Anthracite Fumé",
        "hex": "#333333"
      }
    ],
    "variants": [
      {
        "id": "v-hdy3-m",
        "size": "M",
        "color": "Anthracite Fumé",
        "stock": 5,
        "sku": "HPC-HDY-003-M"
      },
      {
        "id": "v-hdy3-l",
        "size": "L",
        "color": "Anthracite Fumé",
        "stock": 7,
        "sku": "HPC-HDY-003-L"
      },
      {
        "id": "v-hdy3-xl",
        "size": "XL",
        "color": "Anthracite Fumé",
        "stock": 4,
        "sku": "HPC-HDY-003-XL"
      }
    ],
    "totalStock": 16,
    "createdAt": "2026-10-31T09:09:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "hoodie-zip-heavyweight-480-gsm-double-paisseur-anthracite",
    "updatedAt": "2026-10-31T09:09:00Z"
  },
  {
    "id": "prod-acc-001",
    "sku": "HPC-ACC-001",
    "name": "Mini Sacoche Rigide Box Crossbody Noir",
    "description": "Sacoche rectangulaire rigide en similicuir grainé résistant à l'eau avec sangle siglée amovible et fermoir métal.",
    "price": 15000,
    "compareAtPrice": 20000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "ACCESSOIRE",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir Mat",
        "hex": "#111111"
      }
    ],
    "variants": [
      {
        "id": "v-acc1-u",
        "size": "Unique",
        "color": "Noir Mat",
        "stock": 15,
        "sku": "HPC-ACC-001-U"
      }
    ],
    "totalStock": 15,
    "createdAt": "2026-10-31T09:10:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "mini-sacoche-rigide-box-crossbody-noir",
    "updatedAt": "2026-10-31T09:10:00Z"
  },
  {
    "id": "prod-acc-002",
    "sku": "HPC-ACC-002",
    "name": "Sacoche Messager Bandoulière Cordura Étanche Clip Cobra",
    "description": "Toile Cordura 1000D balistique haute ténacité, fermeture boucle rapide style tactique et compartiment rembourré.",
    "price": 19000,
    "compareAtPrice": 25000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "CORDURA",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir Tactique",
        "hex": "#1E1E1E"
      }
    ],
    "variants": [
      {
        "id": "v-acc2-u",
        "size": "Unique",
        "color": "Noir Tactique",
        "stock": 12,
        "sku": "HPC-ACC-002-U"
      }
    ],
    "totalStock": 12,
    "createdAt": "2026-10-31T09:11:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "sacoche-messager-bandouli-re-cordura-tanche-clip-cobra",
    "updatedAt": "2026-10-31T09:11:00Z"
  },
  {
    "id": "prod-acc-003",
    "sku": "HPC-ACC-003",
    "name": "Casquette 5-Panel Broderie Relief HP « Signature »",
    "description": "Casquette structurée 5 panneaux en sergé de coton peigné avec broderie monogramme 3D et attache arrière en métal cuivré.",
    "price": 9500,
    "compareAtPrice": 13000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "5-PANEL",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir & Or",
        "hex": "#151515"
      }
    ],
    "variants": [
      {
        "id": "v-acc3-u",
        "size": "Unique",
        "color": "Noir & Or",
        "stock": 25,
        "sku": "HPC-ACC-003-U"
      }
    ],
    "totalStock": 25,
    "createdAt": "2026-10-31T09:12:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "casquette-5-panel-broderie-relief-hp-signature",
    "updatedAt": "2026-10-31T09:12:00Z"
  },
  {
    "id": "prod-srv-001",
    "sku": "HPC-SRV-001",
    "name": "Ensemble Tracksuit Cargo Beige Sable Heavy Fleece",
    "description": "Sweat zippé col montant et jogging coupe droite ajustée avec poches cargo latérales discrètes.",
    "price": 36000,
    "compareAtPrice": 45000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "ESSENTIEL",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Sable Désert",
        "hex": "#C2B280"
      }
    ],
    "variants": [
      {
        "id": "v-srv1-s",
        "size": "S",
        "color": "Sable Désert",
        "stock": 4,
        "sku": "HPC-SRV-001-S"
      },
      {
        "id": "v-srv1-m",
        "size": "M",
        "color": "Sable Désert",
        "stock": 8,
        "sku": "HPC-SRV-001-M"
      },
      {
        "id": "v-srv1-l",
        "size": "L",
        "color": "Sable Désert",
        "stock": 6,
        "sku": "HPC-SRV-001-L"
      },
      {
        "id": "v-srv1-xl",
        "size": "XL",
        "color": "Sable Désert",
        "stock": 3,
        "sku": "HPC-SRV-001-XL"
      }
    ],
    "totalStock": 21,
    "createdAt": "2026-10-31T09:13:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "ensemble-tracksuit-cargo-beige-sable-heavy-fleece",
    "updatedAt": "2026-10-31T09:13:00Z"
  },
  {
    "id": "prod-srv-002",
    "sku": "HPC-SRV-002",
    "name": "Jogging Molleton Lourd 450 GSM Noir Graphite",
    "description": "Bas de jogging coupe tapered en coton éponge lourd avec cordons à embouts acier trempé et chevilles élastiquées.",
    "price": 22000,
    "compareAtPrice": 28000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "CONFORT",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Gris Graphite",
        "hex": "#2E2E2E"
      }
    ],
    "variants": [
      {
        "id": "v-srv2-m",
        "size": "M",
        "color": "Gris Graphite",
        "stock": 7,
        "sku": "HPC-SRV-002-M"
      },
      {
        "id": "v-srv2-l",
        "size": "L",
        "color": "Gris Graphite",
        "stock": 9,
        "sku": "HPC-SRV-002-L"
      },
      {
        "id": "v-srv2-xl",
        "size": "XL",
        "color": "Gris Graphite",
        "stock": 5,
        "sku": "HPC-SRV-002-XL"
      }
    ],
    "totalStock": 21,
    "createdAt": "2026-10-31T09:14:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "jogging-molleton-lourd-450-gsm-noir-graphite",
    "updatedAt": "2026-10-31T09:14:00Z"
  },
  {
    "id": "prod-srv-003",
    "sku": "HPC-SRV-003",
    "name": "Ensemble Short Boxy & T-Shirt Heavyweight Sand Dune",
    "description": "Duo estival haut de gamme composé d'un t-shirt 260g tombant et d'un short molletonné assorti à poches zippées.",
    "price": 28000,
    "compareAtPrice": 36000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "SUMMER DROP",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Dune de Sable",
        "hex": "#D8C7A5"
      }
    ],
    "variants": [
      {
        "id": "v-srv3-s",
        "size": "S",
        "color": "Dune de Sable",
        "stock": 4,
        "sku": "HPC-SRV-003-S"
      },
      {
        "id": "v-srv3-m",
        "size": "M",
        "color": "Dune de Sable",
        "stock": 7,
        "sku": "HPC-SRV-003-M"
      },
      {
        "id": "v-srv3-l",
        "size": "L",
        "color": "Dune de Sable",
        "stock": 5,
        "sku": "HPC-SRV-003-L"
      },
      {
        "id": "v-srv3-xl",
        "size": "XL",
        "color": "Dune de Sable",
        "stock": 3,
        "sku": "HPC-SRV-003-XL"
      }
    ],
    "totalStock": 19,
    "createdAt": "2026-10-31T09:15:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "ensemble-short-boxy-t-shirt-heavyweight-sand-dune",
    "updatedAt": "2026-10-31T09:15:00Z"
  },
  {
    "id": "prod-pan-001",
    "sku": "HPC-PAN-001",
    "name": "Jean Charpentier Carpenter Denim Brut Surpiqûres Écrues",
    "description": "Toile denim selvedge 14.5 oz non délavée, boucle marteau latérale authentique et poches outils fonctionnelles.",
    "price": 27000,
    "compareAtPrice": 35000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "RAW DENIM",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Denim Brut Foncé",
        "hex": "#1C2A39"
      }
    ],
    "variants": [
      {
        "id": "v-pan1-30",
        "size": "30",
        "color": "Denim Brut Foncé",
        "stock": 4,
        "sku": "HPC-PAN-001-30"
      },
      {
        "id": "v-pan1-32",
        "size": "32",
        "color": "Denim Brut Foncé",
        "stock": 7,
        "sku": "HPC-PAN-001-32"
      },
      {
        "id": "v-pan1-34",
        "size": "34",
        "color": "Denim Brut Foncé",
        "stock": 6,
        "sku": "HPC-PAN-001-34"
      },
      {
        "id": "v-pan1-36",
        "size": "36",
        "color": "Denim Brut Foncé",
        "stock": 3,
        "sku": "HPC-PAN-001-36"
      }
    ],
    "totalStock": 20,
    "createdAt": "2026-10-31T09:16:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "jean-charpentier-carpenter-denim-brut-surpiq-res-crues",
    "updatedAt": "2026-10-31T09:16:00Z"
  },
  {
    "id": "prod-pan-002",
    "sku": "HPC-PAN-002",
    "name": "Pantalon Baggy Parachute Double Ceinture « Stealth »",
    "description": "Tissu parachute indéchirable ultra léger avec doubles sangles de serrage à la taille et chevilles ajustables.",
    "price": 25000,
    "compareAtPrice": 32000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "PARACHUTE",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir Stealth",
        "hex": "#171717"
      }
    ],
    "variants": [
      {
        "id": "v-pan2-s",
        "size": "S",
        "color": "Noir Stealth",
        "stock": 4,
        "sku": "HPC-PAN-002-S"
      },
      {
        "id": "v-pan2-m",
        "size": "M",
        "color": "Noir Stealth",
        "stock": 8,
        "sku": "HPC-PAN-002-M"
      },
      {
        "id": "v-pan2-l",
        "size": "L",
        "color": "Noir Stealth",
        "stock": 6,
        "sku": "HPC-PAN-002-L"
      },
      {
        "id": "v-pan2-xl",
        "size": "XL",
        "color": "Noir Stealth",
        "stock": 3,
        "sku": "HPC-PAN-002-XL"
      }
    ],
    "totalStock": 21,
    "createdAt": "2026-10-31T09:17:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "pantalon-baggy-parachute-double-ceinture-stealth",
    "updatedAt": "2026-10-31T09:17:00Z"
  },
  {
    "id": "prod-pan-003",
    "sku": "HPC-PAN-003",
    "name": "Pantalon Cargo Tactique Multi-Poches « Nomad »",
    "description": "Toile ripstop coton renforcée, 6 poches cargo à soufflet avec rabats aimantés et passants ceinture renforcés.",
    "price": 28000,
    "compareAtPrice": 36000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TACTICAL",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Vert Olive Mill",
        "hex": "#3B4D3C"
      }
    ],
    "variants": [
      {
        "id": "v-pan3-30",
        "size": "30",
        "color": "Vert Olive Mill",
        "stock": 4,
        "sku": "HPC-PAN-003-30"
      },
      {
        "id": "v-pan3-32",
        "size": "32",
        "color": "Vert Olive Mill",
        "stock": 7,
        "sku": "HPC-PAN-003-32"
      },
      {
        "id": "v-pan3-34",
        "size": "34",
        "color": "Vert Olive Mill",
        "stock": 5,
        "sku": "HPC-PAN-003-34"
      },
      {
        "id": "v-pan3-36",
        "size": "36",
        "color": "Vert Olive Mill",
        "stock": 3,
        "sku": "HPC-PAN-003-36"
      }
    ],
    "totalStock": 19,
    "createdAt": "2026-10-31T09:18:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "pantalon-cargo-tactique-multi-poches-nomad",
    "updatedAt": "2026-10-31T09:18:00Z"
  },
  {
    "id": "prod-var-001",
    "sku": "HPC-VAR-001",
    "name": "Veste Varsity HP Heavyweight Vintage Cuir Vegan",
    "description": "Veste teddy universitaire emblématique en drap de laine lourd et manches en simili-cuir grainé doux. Patchs chenille brodés main.",
    "price": 44000,
    "compareAtPrice": 56000,
    "category": "varsity",
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "VARSITY ICON",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir & Crème",
        "hex": "#1C1C1C"
      }
    ],
    "variants": [
      {
        "id": "v-var1-m",
        "size": "M",
        "color": "Noir & Crème",
        "stock": 5,
        "sku": "HPC-VAR-001-M"
      },
      {
        "id": "v-var1-l",
        "size": "L",
        "color": "Noir & Crème",
        "stock": 8,
        "sku": "HPC-VAR-001-L"
      },
      {
        "id": "v-var1-xl",
        "size": "XL",
        "color": "Noir & Crème",
        "stock": 4,
        "sku": "HPC-VAR-001-XL"
      }
    ],
    "totalStock": 17,
    "createdAt": "2026-10-31T09:19:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "veste-varsity-hp-heavyweight-vintage-cuir-vegan",
    "updatedAt": "2026-10-31T09:19:00Z"
  },
  {
    "id": "prod-var-002",
    "sku": "HPC-VAR-002",
    "name": "Veste Bomber Matelassée Réversible « Black & Khaki »",
    "description": "Bomber MA-1 revisité avec extérieur satin nylon imperméable noir mat et doublure orange sécurité thermique.",
    "price": 36000,
    "compareAtPrice": 45000,
    "category": "varsity",
    "images": [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "RÉVERSIBLE",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Kaki & Orange",
        "hex": "#48533E"
      }
    ],
    "variants": [
      {
        "id": "v-var2-m",
        "size": "M",
        "color": "Kaki & Orange",
        "stock": 4,
        "sku": "HPC-VAR-002-M"
      },
      {
        "id": "v-var2-l",
        "size": "L",
        "color": "Kaki & Orange",
        "stock": 7,
        "sku": "HPC-VAR-002-L"
      },
      {
        "id": "v-var2-xl",
        "size": "XL",
        "color": "Kaki & Orange",
        "stock": 3,
        "sku": "HPC-VAR-002-XL"
      }
    ],
    "totalStock": 14,
    "createdAt": "2026-10-31T09:20:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "veste-bomber-matelass-e-r-versible-black-khaki",
    "updatedAt": "2026-10-31T09:20:00Z"
  },
  {
    "id": "prod-var-003",
    "sku": "HPC-VAR-003",
    "name": "Doudoune Courte Puff Sans Manches Noir Mat Tactical",
    "description": "Gilet matelassé sans manches à garnissage synthétique isolant thermique ultra léger et col montant coupe-vent.",
    "price": 29000,
    "compareAtPrice": 38000,
    "category": "varsity",
    "images": [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "PUFFER",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir Mat",
        "hex": "#1A1A1A"
      }
    ],
    "variants": [
      {
        "id": "v-var3-m",
        "size": "M",
        "color": "Noir Mat",
        "stock": 5,
        "sku": "HPC-VAR-003-M"
      },
      {
        "id": "v-var3-l",
        "size": "L",
        "color": "Noir Mat",
        "stock": 8,
        "sku": "HPC-VAR-003-L"
      },
      {
        "id": "v-var3-xl",
        "size": "XL",
        "color": "Noir Mat",
        "stock": 4,
        "sku": "HPC-VAR-003-XL"
      }
    ],
    "totalStock": 17,
    "createdAt": "2026-10-31T09:21:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "doudoune-courte-puff-sans-manches-noir-mat-tactical",
    "updatedAt": "2026-10-31T09:21:00Z"
  },
  {
    "id": "prod-tsh-001",
    "sku": "HPC-TSH-001",
    "name": "T-shirt Oversize 240 GSM Cotonou Heritage Noir",
    "description": "Coton peigné lourd 240 grammes, coupe boxy déstructurée et broderie subtile de l'écusson HP sur le flanc gauche.",
    "price": 15000,
    "compareAtPrice": 20000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "ESSENTIEL",
    "isFeatured": true,
    "isNew": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Noir Carbone",
        "hex": "#121212"
      }
    ],
    "variants": [
      {
        "id": "v-tsh1-s",
        "size": "S",
        "color": "Noir Carbone",
        "stock": 5,
        "sku": "HPC-TSH-001-S"
      },
      {
        "id": "v-tsh1-m",
        "size": "M",
        "color": "Noir Carbone",
        "stock": 12,
        "sku": "HPC-TSH-001-M"
      },
      {
        "id": "v-tsh1-l",
        "size": "L",
        "color": "Noir Carbone",
        "stock": 10,
        "sku": "HPC-TSH-001-L"
      },
      {
        "id": "v-tsh1-xl",
        "size": "XL",
        "color": "Noir Carbone",
        "stock": 6,
        "sku": "HPC-TSH-001-XL"
      },
      {
        "id": "v-tsh1-xxl",
        "size": "XXL",
        "color": "Noir Carbone",
        "stock": 3,
        "sku": "HPC-TSH-001-XXL"
      }
    ],
    "totalStock": 36,
    "createdAt": "2026-10-31T09:22:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "t-shirt-oversize-240-gsm-cotonou-heritage-noir",
    "updatedAt": "2026-10-31T09:22:00Z"
  },
  {
    "id": "prod-tsh-002",
    "sku": "HPC-TSH-002",
    "name": "T-shirt Oversize « Rules & Ambition » 260 GSM",
    "description": "Jersey lourd haut de gamme, typographie sérigraphiée effet velours et tombé streetwear tombant sur les épaules.",
    "price": 17000,
    "compareAtPrice": 23000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "AMBITION",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Blanc Craie",
        "hex": "#F3F3F3"
      }
    ],
    "variants": [
      {
        "id": "v-tsh2-m",
        "size": "M",
        "color": "Blanc Craie",
        "stock": 7,
        "sku": "HPC-TSH-002-M"
      },
      {
        "id": "v-tsh2-l",
        "size": "L",
        "color": "Blanc Craie",
        "stock": 9,
        "sku": "HPC-TSH-002-L"
      },
      {
        "id": "v-tsh2-xl",
        "size": "XL",
        "color": "Blanc Craie",
        "stock": 5,
        "sku": "HPC-TSH-002-XL"
      }
    ],
    "totalStock": 21,
    "createdAt": "2026-10-31T09:23:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "t-shirt-oversize-rules-ambition-260-gsm",
    "updatedAt": "2026-10-31T09:23:00Z"
  },
  {
    "id": "prod-tsh-003",
    "sku": "HPC-TSH-003",
    "name": "T-shirt Graphic Oversize « City of Ambition » 260 GSM",
    "description": "Illustration artistique urbaine sérigraphiée au dos, col rond renforcé 3 cm qui ne se détend jamais au lavage.",
    "price": 18000,
    "compareAtPrice": 24000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "ARTWORK",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Bleu Nuit Profond",
        "hex": "#1A2536"
      }
    ],
    "variants": [
      {
        "id": "v-tsh3-m",
        "size": "M",
        "color": "Bleu Nuit Profond",
        "stock": 6,
        "sku": "HPC-TSH-003-M"
      },
      {
        "id": "v-tsh3-l",
        "size": "L",
        "color": "Bleu Nuit Profond",
        "stock": 8,
        "sku": "HPC-TSH-003-L"
      },
      {
        "id": "v-tsh3-xl",
        "size": "XL",
        "color": "Bleu Nuit Profond",
        "stock": 4,
        "sku": "HPC-TSH-003-XL"
      }
    ],
    "totalStock": 18,
    "createdAt": "2026-10-31T09:24:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "t-shirt-graphic-oversize-city-of-ambition-260-gsm",
    "updatedAt": "2026-10-31T09:24:00Z"
  },
  {
    "id": "prod-tsh-004",
    "sku": "HPC-TSH-004",
    "name": "T-Shirt Oversize Graphic « Cotonou Underground » Lavis Gris",
    "description": "Traitement délavé à la pierre ponce façon vintage acid wash, sérigraphie dégradée inspiration culture clubbing de Cotonou.",
    "price": 17500,
    "compareAtPrice": 23500,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "WASHED",
    "isFeatured": false,
    "isNew": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Gris Acid Wash",
        "hex": "#5C5C5C"
      }
    ],
    "variants": [
      {
        "id": "v-tsh4-s",
        "size": "S",
        "color": "Gris Acid Wash",
        "stock": 4,
        "sku": "HPC-TSH-004-S"
      },
      {
        "id": "v-tsh4-m",
        "size": "M",
        "color": "Gris Acid Wash",
        "stock": 8,
        "sku": "HPC-TSH-004-M"
      },
      {
        "id": "v-tsh4-l",
        "size": "L",
        "color": "Gris Acid Wash",
        "stock": 6,
        "sku": "HPC-TSH-004-L"
      },
      {
        "id": "v-tsh4-xl",
        "size": "XL",
        "color": "Gris Acid Wash",
        "stock": 3,
        "sku": "HPC-TSH-004-XL"
      }
    ],
    "totalStock": 21,
    "createdAt": "2026-10-31T09:25:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "t-shirt-oversize-graphic-cotonou-underground-lavis-gris",
    "updatedAt": "2026-10-31T09:25:00Z"
  },
  {
    "id": "prod-tsh-005",
    "sku": "HPC-TSH-005",
    "name": "Polo Maille Côtelée Zip Métal Noir & Liseré Or",
    "description": "Maille fine respirante structurée en côtes anglaises, fermeture éclair dorée au col et silhouette habillée raffinée.",
    "price": 21000,
    "compareAtPrice": 28000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1625910513413-5bc595960010?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "POLO LUXE",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir & Liseré Or",
        "hex": "#161616"
      }
    ],
    "variants": [
      {
        "id": "v-tsh5-m",
        "size": "M",
        "color": "Noir & Liseré Or",
        "stock": 5,
        "sku": "HPC-TSH-005-M"
      },
      {
        "id": "v-tsh5-l",
        "size": "L",
        "color": "Noir & Liseré Or",
        "stock": 8,
        "sku": "HPC-TSH-005-L"
      },
      {
        "id": "v-tsh5-xl",
        "size": "XL",
        "color": "Noir & Liseré Or",
        "stock": 4,
        "sku": "HPC-TSH-005-XL"
      }
    ],
    "totalStock": 17,
    "createdAt": "2026-10-31T09:26:00Z",
    "status": "published",
    "lowStockThreshold": 5,
    "slug": "polo-maille-c-tel-e-zip-m-tal-noir-liser-or",
    "updatedAt": "2026-10-31T09:26:00Z"
  },
  {
    "id": "prod-srv-004",
    "sku": "HPC-SRV-004",
    "name": "Ensemble Tracksuit Techwear Cyber Noir & Cordons Réfléchissants",
    "slug": "ensemble-tracksuit-techwear-cyber-noir",
    "description": "Ensemble pantalon de jogging et veste zippée en nylon déperlant haute résistance avec bandes réfléchissantes 3M et multipoches ergonomiques.",
    "price": 39000,
    "compareAtPrice": 48000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TECHWEAR",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir Cyber",
        "hex": "#111111"
      }
    ],
    "variants": [
      {
        "id": "v-srv4-s",
        "size": "S",
        "color": "Noir Cyber",
        "stock": 5,
        "sku": "HPC-SRV-004-S"
      },
      {
        "id": "v-srv4-m",
        "size": "M",
        "color": "Noir Cyber",
        "stock": 8,
        "sku": "HPC-SRV-004-M"
      },
      {
        "id": "v-srv4-l",
        "size": "L",
        "color": "Noir Cyber",
        "stock": 7,
        "sku": "HPC-SRV-004-L"
      },
      {
        "id": "v-srv4-xl",
        "size": "XL",
        "color": "Noir Cyber",
        "stock": 4,
        "sku": "HPC-SRV-004-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 24,
    "status": "published",
    "createdAt": "2026-10-31T11:00:00Z",
    "updatedAt": "2026-10-31T11:00:00Z"
  },
  {
    "id": "prod-srv-005",
    "sku": "HPC-SRV-005",
    "name": "Jogging Baggy Molleton 480 GSM « Heavy Heavy » Gris Chiné",
    "slug": "jogging-baggy-molleton-480-gsm-heavy-heavy-gris",
    "description": "Pantalon de jogging ultra lourd en pur coton brossé 480 GSM avec tombé ample streetwear, chevilles élastiquées et poches renforcées.",
    "price": 24000,
    "compareAtPrice": 30000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "HEAVY FLEECE",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Gris Chiné Lourd",
        "hex": "#8A8D8F"
      }
    ],
    "variants": [
      {
        "id": "v-srv5-m",
        "size": "M",
        "color": "Gris Chiné Lourd",
        "stock": 6,
        "sku": "HPC-SRV-005-M"
      },
      {
        "id": "v-srv5-l",
        "size": "L",
        "color": "Gris Chiné Lourd",
        "stock": 10,
        "sku": "HPC-SRV-005-L"
      },
      {
        "id": "v-srv5-xl",
        "size": "XL",
        "color": "Gris Chiné Lourd",
        "stock": 7,
        "sku": "HPC-SRV-005-XL"
      },
      {
        "id": "v-srv5-xxl",
        "size": "XXL",
        "color": "Gris Chiné Lourd",
        "stock": 3,
        "sku": "HPC-SRV-005-XXL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 26,
    "status": "published",
    "createdAt": "2026-10-31T11:01:00Z",
    "updatedAt": "2026-10-31T11:01:00Z"
  },
  {
    "id": "prod-srv-006",
    "sku": "HPC-SRV-006",
    "name": "Ensemble Survêtement Velours Côtelé Émeraude & Or",
    "slug": "ensemble-survetement-velours-cotele-emeraude-or",
    "description": "Survêtement rétro chic en velours côtelé doux émeraude avec passepoils contrastés or vieilli et zip frontal métallique doré.",
    "price": 42000,
    "compareAtPrice": 52000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "VELOURS LUXE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Émeraude Royal",
        "hex": "#0F4D3C"
      }
    ],
    "variants": [
      {
        "id": "v-srv6-s",
        "size": "S",
        "color": "Émeraude Royal",
        "stock": 4,
        "sku": "HPC-SRV-006-S"
      },
      {
        "id": "v-srv6-m",
        "size": "M",
        "color": "Émeraude Royal",
        "stock": 8,
        "sku": "HPC-SRV-006-M"
      },
      {
        "id": "v-srv6-l",
        "size": "L",
        "color": "Émeraude Royal",
        "stock": 6,
        "sku": "HPC-SRV-006-L"
      },
      {
        "id": "v-srv6-xl",
        "size": "XL",
        "color": "Émeraude Royal",
        "stock": 3,
        "sku": "HPC-SRV-006-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 21,
    "status": "published",
    "createdAt": "2026-10-31T11:02:00Z",
    "updatedAt": "2026-10-31T11:02:00Z"
  },
  {
    "id": "prod-srv-007",
    "sku": "HPC-SRV-007",
    "name": "Pantalon de Jogging Cargo Multi-Sangles Streetwear Anthracite",
    "slug": "pantalon-jogging-cargo-multi-sangles-anthracite",
    "description": "Jogger techwear fusionnant le confort du molleton et les poches cargo à sangles ajustables, cordons élastiqués de serrage cheville.",
    "price": 26000,
    "compareAtPrice": 32000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TACTICAL JOGGER",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Anthracite Fumé",
        "hex": "#2B2D2F"
      }
    ],
    "variants": [
      {
        "id": "v-srv7-m",
        "size": "M",
        "color": "Anthracite Fumé",
        "stock": 6,
        "sku": "HPC-SRV-007-M"
      },
      {
        "id": "v-srv7-l",
        "size": "L",
        "color": "Anthracite Fumé",
        "stock": 9,
        "sku": "HPC-SRV-007-L"
      },
      {
        "id": "v-srv7-xl",
        "size": "XL",
        "color": "Anthracite Fumé",
        "stock": 5,
        "sku": "HPC-SRV-007-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 20,
    "status": "published",
    "createdAt": "2026-10-31T11:03:00Z",
    "updatedAt": "2026-10-31T11:03:00Z"
  },
  {
    "id": "prod-bsk-004",
    "sku": "HPC-BSK-004-RED",
    "name": "High Top Retro Court « Chicago Flame » Rouge & Blanc",
    "slug": "high-top-retro-court-chicago-flame-rouge-blanc",
    "description": "Silhouette haute montante basketball mythique bicolore rouge éclatant et cuir blanc cassé, semelle cousue cupsole et maintien optimal cheville.",
    "price": 45000,
    "compareAtPrice": 55000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "RETRO COURT",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "41",
      "42",
      "43",
      "44",
      "45"
    ],
    "colors": [
      {
        "name": "Rouge & Blanc Court",
        "hex": "#C0392B"
      }
    ],
    "variants": [
      {
        "id": "v-bsk4-41",
        "size": "41",
        "color": "Rouge & Blanc Court",
        "stock": 4,
        "sku": "HPC-BSK-004-41"
      },
      {
        "id": "v-bsk4-42",
        "size": "42",
        "color": "Rouge & Blanc Court",
        "stock": 7,
        "sku": "HPC-BSK-004-42"
      },
      {
        "id": "v-bsk4-43",
        "size": "43",
        "color": "Rouge & Blanc Court",
        "stock": 6,
        "sku": "HPC-BSK-004-43"
      },
      {
        "id": "v-bsk4-44",
        "size": "44",
        "color": "Rouge & Blanc Court",
        "stock": 4,
        "sku": "HPC-BSK-004-44"
      },
      {
        "id": "v-bsk4-45",
        "size": "45",
        "color": "Rouge & Blanc Court",
        "stock": 2,
        "sku": "HPC-BSK-004-45"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 23,
    "status": "published",
    "createdAt": "2026-10-31T11:04:00Z",
    "updatedAt": "2026-10-31T11:04:00Z"
  },
  {
    "id": "prod-bsk-005",
    "sku": "HPC-BSK-005-BLK",
    "name": "Baskets Montantes Streetball Shadow Black & Gum",
    "slug": "baskets-montantes-streetball-shadow-black-gum",
    "description": "Cuir suédé noir mat et renforts texturés sur semelle gum anti-dérapante conçue pour les terrains extérieurs et le streetball intense.",
    "price": 43000,
    "compareAtPrice": 52000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "STREETBALL",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Shadow Black & Gum",
        "hex": "#1C1C1C"
      }
    ],
    "variants": [
      {
        "id": "v-bsk5-41",
        "size": "41",
        "color": "Shadow Black & Gum",
        "stock": 3,
        "sku": "HPC-BSK-005-41"
      },
      {
        "id": "v-bsk5-42",
        "size": "42",
        "color": "Shadow Black & Gum",
        "stock": 6,
        "sku": "HPC-BSK-005-42"
      },
      {
        "id": "v-bsk5-43",
        "size": "43",
        "color": "Shadow Black & Gum",
        "stock": 5,
        "sku": "HPC-BSK-005-43"
      },
      {
        "id": "v-bsk5-44",
        "size": "44",
        "color": "Shadow Black & Gum",
        "stock": 3,
        "sku": "HPC-BSK-005-44"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 17,
    "status": "published",
    "createdAt": "2026-10-31T11:05:00Z",
    "updatedAt": "2026-10-31T11:05:00Z"
  },
  {
    "id": "prod-bsk-006",
    "sku": "HPC-BSK-006",
    "name": "Court Master Pro Triple Black Cuir Pleine Fleur",
    "slug": "court-master-pro-triple-black-cuir-pleine-fleur",
    "description": "Modèle basketball performance profil mi-haut en cuir pleine fleur résistant avec coussin d'air intégré et laçage ghillie ultra sécurisé.",
    "price": 46000,
    "compareAtPrice": 58000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "PRO EDITION",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44",
      "45"
    ],
    "colors": [
      {
        "name": "Triple Black",
        "hex": "#0D0D0D"
      }
    ],
    "variants": [
      {
        "id": "v-bsk6-40",
        "size": "40",
        "color": "Triple Black",
        "stock": 3,
        "sku": "HPC-BSK-006-40"
      },
      {
        "id": "v-bsk6-41",
        "size": "41",
        "color": "Triple Black",
        "stock": 6,
        "sku": "HPC-BSK-006-41"
      },
      {
        "id": "v-bsk6-42",
        "size": "42",
        "color": "Triple Black",
        "stock": 8,
        "sku": "HPC-BSK-006-42"
      },
      {
        "id": "v-bsk6-43",
        "size": "43",
        "color": "Triple Black",
        "stock": 5,
        "sku": "HPC-BSK-006-43"
      },
      {
        "id": "v-bsk6-44",
        "size": "44",
        "color": "Triple Black",
        "stock": 4,
        "sku": "HPC-BSK-006-44"
      },
      {
        "id": "v-bsk6-45",
        "size": "45",
        "color": "Triple Black",
        "stock": 2,
        "sku": "HPC-BSK-006-45"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 28,
    "status": "published",
    "createdAt": "2026-10-31T11:06:00Z",
    "updatedAt": "2026-10-31T11:06:00Z"
  },
  {
    "id": "prod-bsk-007",
    "sku": "HPC-BSK-007",
    "name": "Retro High 90s Heritage « Cyber Teal & White »",
    "slug": "retro-high-90s-heritage-cyber-teal-white",
    "description": "Clin d'œil aux légendes des playgrounds des années 90 : empiècements géométriques turquoise et col haut rembourré pour style urbain affirmé.",
    "price": 44000,
    "compareAtPrice": 54000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "90S HERITAGE",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Teal & White",
        "hex": "#008080"
      }
    ],
    "variants": [
      {
        "id": "v-bsk7-41",
        "size": "41",
        "color": "Teal & White",
        "stock": 4,
        "sku": "HPC-BSK-007-41"
      },
      {
        "id": "v-bsk7-42",
        "size": "42",
        "color": "Teal & White",
        "stock": 7,
        "sku": "HPC-BSK-007-42"
      },
      {
        "id": "v-bsk7-43",
        "size": "43",
        "color": "Teal & White",
        "stock": 5,
        "sku": "HPC-BSK-007-43"
      },
      {
        "id": "v-bsk7-44",
        "size": "44",
        "color": "Teal & White",
        "stock": 3,
        "sku": "HPC-BSK-007-44"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 19,
    "status": "published",
    "createdAt": "2026-10-31T11:07:00Z",
    "updatedAt": "2026-10-31T11:07:00Z"
  },
  {
    "id": "prod-bsk-008",
    "sku": "HPC-BSK-008",
    "name": "Dunk High Premium « Desert Sand & Khaki »",
    "slug": "dunk-high-premium-desert-sand-khaki",
    "description": "Sneaker montante profil basket en daim brossé teinte sable désert et cuir kaki texturé, parfaite à matcher avec les ensembles cargos.",
    "price": 42000,
    "compareAtPrice": 51000,
    "category": "basket",
    "images": [
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "SUEDE COURT",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Sable & Kaki",
        "hex": "#C2B280"
      }
    ],
    "variants": [
      {
        "id": "v-bsk8-41",
        "size": "41",
        "color": "Sable & Kaki",
        "stock": 4,
        "sku": "HPC-BSK-008-41"
      },
      {
        "id": "v-bsk8-42",
        "size": "42",
        "color": "Sable & Kaki",
        "stock": 6,
        "sku": "HPC-BSK-008-42"
      },
      {
        "id": "v-bsk8-43",
        "size": "43",
        "color": "Sable & Kaki",
        "stock": 5,
        "sku": "HPC-BSK-008-43"
      },
      {
        "id": "v-bsk8-44",
        "size": "44",
        "color": "Sable & Kaki",
        "stock": 2,
        "sku": "HPC-BSK-008-44"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 17,
    "status": "published",
    "createdAt": "2026-10-31T11:08:00Z",
    "updatedAt": "2026-10-31T11:08:00Z"
  },
  {
    "id": "prod-snk-005",
    "sku": "HPC-SNK-005",
    "name": "Sneakers Chunky Runner « Lunar Wave » Semelle Sculptée",
    "slug": "sneakers-chunky-runner-lunar-wave-semelle-sculptee",
    "description": "Silhouette avant-gardiste futuriste avec empeigne en maille respirante multicouche et semelle intermédiaire géométrique ultra absorbante.",
    "price": 38000,
    "compareAtPrice": 47000,
    "category": "sneakers",
    "images": [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "FUTURISTE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Blanc Lunaire & Argent",
        "hex": "#EAEAEA"
      }
    ],
    "variants": [
      {
        "id": "v-snk5-40",
        "size": "40",
        "color": "Blanc Lunaire & Argent",
        "stock": 3,
        "sku": "HPC-SNK-005-40"
      },
      {
        "id": "v-snk5-41",
        "size": "41",
        "color": "Blanc Lunaire & Argent",
        "stock": 6,
        "sku": "HPC-SNK-005-41"
      },
      {
        "id": "v-snk5-42",
        "size": "42",
        "color": "Blanc Lunaire & Argent",
        "stock": 8,
        "sku": "HPC-SNK-005-42"
      },
      {
        "id": "v-snk5-43",
        "size": "43",
        "color": "Blanc Lunaire & Argent",
        "stock": 5,
        "sku": "HPC-SNK-005-43"
      },
      {
        "id": "v-snk5-44",
        "size": "44",
        "color": "Blanc Lunaire & Argent",
        "stock": 3,
        "sku": "HPC-SNK-005-44"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 25,
    "status": "published",
    "createdAt": "2026-10-31T11:09:00Z",
    "updatedAt": "2026-10-31T11:09:00Z"
  },
  {
    "id": "prod-snk-006",
    "sku": "HPC-SNK-006",
    "name": "Sneakers Court Classic Low « Ivory & Forest Gum »",
    "slug": "sneakers-court-classic-low-ivory-forest-gum",
    "description": "Design intemporel en cuir nappa blanc ivoire, contrefort vert forêt et semelle en gomme vulcanisée au profil épuré.",
    "price": 35000,
    "compareAtPrice": 43000,
    "category": "sneakers",
    "images": [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "CLASSIC LOW",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "colors": [
      {
        "name": "Ivoire & Vert Forêt",
        "hex": "#F5F5DC"
      }
    ],
    "variants": [
      {
        "id": "v-snk6-40",
        "size": "40",
        "color": "Ivoire & Vert Forêt",
        "stock": 3,
        "sku": "HPC-SNK-006-40"
      },
      {
        "id": "v-snk6-41",
        "size": "41",
        "color": "Ivoire & Vert Forêt",
        "stock": 6,
        "sku": "HPC-SNK-006-41"
      },
      {
        "id": "v-snk6-42",
        "size": "42",
        "color": "Ivoire & Vert Forêt",
        "stock": 7,
        "sku": "HPC-SNK-006-42"
      },
      {
        "id": "v-snk6-43",
        "size": "43",
        "color": "Ivoire & Vert Forêt",
        "stock": 5,
        "sku": "HPC-SNK-006-43"
      },
      {
        "id": "v-snk6-44",
        "size": "44",
        "color": "Ivoire & Vert Forêt",
        "stock": 3,
        "sku": "HPC-SNK-006-44"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 24,
    "status": "published",
    "createdAt": "2026-10-31T11:10:00Z",
    "updatedAt": "2026-10-31T11:10:00Z"
  },
  {
    "id": "prod-var-004",
    "sku": "HPC-VAR-004",
    "name": "Veste Varsity Cuir Vegan Bicolore Bleu Nuit & Manches Crème",
    "slug": "veste-varsity-cuir-vegan-bleu-nuit-manches-creme",
    "description": "Veste teddy collégiale d'inspiration vintage en drap de laine bleu marine avec manches contrastées en similicuir crème et écussons brodés chenille.",
    "price": 45000,
    "compareAtPrice": 56000,
    "category": "varsity",
    "images": [
      "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "VARSITY ROYAL",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Bleu Nuit & Crème",
        "hex": "#1A2536"
      }
    ],
    "variants": [
      {
        "id": "v-var4-m",
        "size": "M",
        "color": "Bleu Nuit & Crème",
        "stock": 5,
        "sku": "HPC-VAR-004-M"
      },
      {
        "id": "v-var4-l",
        "size": "L",
        "color": "Bleu Nuit & Crème",
        "stock": 8,
        "sku": "HPC-VAR-004-L"
      },
      {
        "id": "v-var4-xl",
        "size": "XL",
        "color": "Bleu Nuit & Crème",
        "stock": 4,
        "sku": "HPC-VAR-004-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 17,
    "status": "published",
    "createdAt": "2026-10-31T11:11:00Z",
    "updatedAt": "2026-10-31T11:11:00Z"
  },
  {
    "id": "prod-var-005",
    "sku": "HPC-VAR-005",
    "name": "Blouson Bomber Oversize Matelassé Kaki Militaire & Doublure Cuivrée",
    "slug": "blouson-bomber-oversize-matelasse-kaki-militaire",
    "description": "Coupe oversize inspirée des blousons de vol MA-1 avec poche utilitaire zippée sur la manche, finitions bord-côtes lourdes et isolation légère.",
    "price": 37000,
    "compareAtPrice": 46000,
    "category": "varsity",
    "images": [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "MA-1 BOMBER",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Kaki Armée",
        "hex": "#4B5320"
      }
    ],
    "variants": [
      {
        "id": "v-var5-m",
        "size": "M",
        "color": "Kaki Armée",
        "stock": 5,
        "sku": "HPC-VAR-005-M"
      },
      {
        "id": "v-var5-l",
        "size": "L",
        "color": "Kaki Armée",
        "stock": 7,
        "sku": "HPC-VAR-005-L"
      },
      {
        "id": "v-var5-xl",
        "size": "XL",
        "color": "Kaki Armée",
        "stock": 4,
        "sku": "HPC-VAR-005-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 16,
    "status": "published",
    "createdAt": "2026-10-31T11:12:00Z",
    "updatedAt": "2026-10-31T11:12:00Z"
  },
  {
    "id": "prod-var-006",
    "sku": "HPC-VAR-006",
    "name": "Veste Moto Racer Cuir Noir Souple Finitions Métal Vieilli",
    "slug": "veste-moto-racer-cuir-noir-souple-finitions-metal",
    "description": "Blouson motard contemporain taillé pour la route et la ville avec zips asymétriques en métal brossé et matelassage ergonomique aux épaules.",
    "price": 48000,
    "compareAtPrice": 60000,
    "category": "varsity",
    "images": [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "LEATHER RACER",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir Cuir Nappa",
        "hex": "#141414"
      }
    ],
    "variants": [
      {
        "id": "v-var6-m",
        "size": "M",
        "color": "Noir Cuir Nappa",
        "stock": 4,
        "sku": "HPC-VAR-006-M"
      },
      {
        "id": "v-var6-l",
        "size": "L",
        "color": "Noir Cuir Nappa",
        "stock": 6,
        "sku": "HPC-VAR-006-L"
      },
      {
        "id": "v-var6-xl",
        "size": "XL",
        "color": "Noir Cuir Nappa",
        "stock": 3,
        "sku": "HPC-VAR-006-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 13,
    "status": "published",
    "createdAt": "2026-10-31T11:13:00Z",
    "updatedAt": "2026-10-31T11:13:00Z"
  },
  {
    "id": "prod-pan-004",
    "sku": "HPC-PAN-004",
    "name": "Pantalon Parachute Oversize Cordons Réglables Noir Mat",
    "slug": "pantalon-parachute-oversize-cordons-reglables-noir",
    "description": "Coupe baggy ballon en tissu technique indéchirable parachute avec cordons de serrage à stoppeurs chromés aux chevilles et à la taille.",
    "price": 26000,
    "compareAtPrice": 33000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "PARACHUTE FIT",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Noir Mat",
        "hex": "#181818"
      }
    ],
    "variants": [
      {
        "id": "v-pan4-s",
        "size": "S",
        "color": "Noir Mat",
        "stock": 4,
        "sku": "HPC-PAN-004-S"
      },
      {
        "id": "v-pan4-m",
        "size": "M",
        "color": "Noir Mat",
        "stock": 8,
        "sku": "HPC-PAN-004-M"
      },
      {
        "id": "v-pan4-l",
        "size": "L",
        "color": "Noir Mat",
        "stock": 6,
        "sku": "HPC-PAN-004-L"
      },
      {
        "id": "v-pan4-xl",
        "size": "XL",
        "color": "Noir Mat",
        "stock": 3,
        "sku": "HPC-PAN-004-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 21,
    "status": "published",
    "createdAt": "2026-10-31T11:14:00Z",
    "updatedAt": "2026-10-31T11:14:00Z"
  },
  {
    "id": "prod-pan-005",
    "sku": "HPC-PAN-005",
    "name": "Jean Loose Fit Brut Selvedge 14oz Coupe Skate",
    "slug": "jean-loose-fit-brut-selvedge-14oz-coupe-skate",
    "description": "Denim authentique rigide 14 onces à liseré selvedge blanc et rouge, coupe ultra large skate inspirée des années 90 et coutures ultra solides.",
    "price": 29000,
    "compareAtPrice": 38000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "RAW SELVEDGE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Indigo Brut Profond",
        "hex": "#1A2238"
      }
    ],
    "variants": [
      {
        "id": "v-pan5-30",
        "size": "30",
        "color": "Indigo Brut Profond",
        "stock": 4,
        "sku": "HPC-PAN-005-30"
      },
      {
        "id": "v-pan5-32",
        "size": "32",
        "color": "Indigo Brut Profond",
        "stock": 7,
        "sku": "HPC-PAN-005-32"
      },
      {
        "id": "v-pan5-34",
        "size": "34",
        "color": "Indigo Brut Profond",
        "stock": 6,
        "sku": "HPC-PAN-005-34"
      },
      {
        "id": "v-pan5-36",
        "size": "36",
        "color": "Indigo Brut Profond",
        "stock": 3,
        "sku": "HPC-PAN-005-36"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 20,
    "status": "published",
    "createdAt": "2026-10-31T11:15:00Z",
    "updatedAt": "2026-10-31T11:15:00Z"
  },
  {
    "id": "prod-pan-006",
    "sku": "HPC-PAN-006",
    "name": "Pantalon Cargo Tactique 8 Poches Toile Armée Kaki",
    "slug": "pantalon-cargo-tactique-8-poches-toile-armee-kaki",
    "description": "Coton ripstop haute densité résistant aux frottements avec poches à soufflet fermées par boutons pression et renforts genoux.",
    "price": 28000,
    "compareAtPrice": 35000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "MILITARY CARGO",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Kaki Militaire",
        "hex": "#4A5240"
      }
    ],
    "variants": [
      {
        "id": "v-pan6-30",
        "size": "30",
        "color": "Kaki Militaire",
        "stock": 4,
        "sku": "HPC-PAN-006-30"
      },
      {
        "id": "v-pan6-32",
        "size": "32",
        "color": "Kaki Militaire",
        "stock": 8,
        "sku": "HPC-PAN-006-32"
      },
      {
        "id": "v-pan6-34",
        "size": "34",
        "color": "Kaki Militaire",
        "stock": 6,
        "sku": "HPC-PAN-006-34"
      },
      {
        "id": "v-pan6-36",
        "size": "36",
        "color": "Kaki Militaire",
        "stock": 3,
        "sku": "HPC-PAN-006-36"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 21,
    "status": "published",
    "createdAt": "2026-10-31T11:16:00Z",
    "updatedAt": "2026-10-31T11:16:00Z"
  },
  {
    "id": "prod-hdy-004",
    "sku": "HPC-HDY-004",
    "name": "Hoodie Heavyweight Boxy 500 GSM « No Compromise » Crème",
    "slug": "hoodie-heavyweight-boxy-500-gsm-no-compromise-creme",
    "description": "Grammage d'exception 500 GSM en molleton pur coton peigné non gratté, tombé lourd sculptural, sans cordon de serrage avec logo brodé ton sur ton.",
    "price": 32000,
    "compareAtPrice": 40000,
    "category": "hoodies",
    "images": [
      "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "500 GSM HEAVY",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Crème Vintage",
        "hex": "#F5F2EB"
      }
    ],
    "variants": [
      {
        "id": "v-hdy4-m",
        "size": "M",
        "color": "Crème Vintage",
        "stock": 5,
        "sku": "HPC-HDY-004-M"
      },
      {
        "id": "v-hdy4-l",
        "size": "L",
        "color": "Crème Vintage",
        "stock": 8,
        "sku": "HPC-HDY-004-L"
      },
      {
        "id": "v-hdy4-xl",
        "size": "XL",
        "color": "Crème Vintage",
        "stock": 6,
        "sku": "HPC-HDY-004-XL"
      },
      {
        "id": "v-hdy4-xxl",
        "size": "XXL",
        "color": "Crème Vintage",
        "stock": 3,
        "sku": "HPC-HDY-004-XXL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 22,
    "status": "published",
    "createdAt": "2026-10-31T11:17:00Z",
    "updatedAt": "2026-10-31T11:17:00Z"
  },
  {
    "id": "prod-hdy-005",
    "sku": "HPC-HDY-005",
    "name": "Sweat Crewneck Minimaliste Écru Relief Écusson HPC",
    "slug": "sweat-crewneck-minimaliste-ecru-relief-ecusson-hpc",
    "description": "Col rond renforcé à double surpiqûre, intérieur gratté ultra doux et coupe ample streetwear adaptée aux climats frais du soir.",
    "price": 25000,
    "compareAtPrice": 32000,
    "category": "hoodies",
    "images": [
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "MINIMAL CREW",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Écru Naturel",
        "hex": "#EAE6DF"
      }
    ],
    "variants": [
      {
        "id": "v-hdy5-s",
        "size": "S",
        "color": "Écru Naturel",
        "stock": 4,
        "sku": "HPC-HDY-005-S"
      },
      {
        "id": "v-hdy5-m",
        "size": "M",
        "color": "Écru Naturel",
        "stock": 7,
        "sku": "HPC-HDY-005-M"
      },
      {
        "id": "v-hdy5-l",
        "size": "L",
        "color": "Écru Naturel",
        "stock": 6,
        "sku": "HPC-HDY-005-L"
      },
      {
        "id": "v-hdy5-xl",
        "size": "XL",
        "color": "Écru Naturel",
        "stock": 3,
        "sku": "HPC-HDY-005-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 20,
    "status": "published",
    "createdAt": "2026-10-31T11:18:00Z",
    "updatedAt": "2026-10-31T11:18:00Z"
  },
  {
    "id": "prod-tsh-006",
    "sku": "HPC-TSH-006",
    "name": "T-Shirt Boxy Heavyweight Noir « West Africa Heritage »",
    "slug": "t-shirt-boxy-heavyweight-noir-west-africa-heritage",
    "description": "Coton peigné 260 GSM au toucher sec américain, typographie sérigraphiée à l'encre gonflante 3D célébrant la créativité ouest-africaine.",
    "price": 18000,
    "compareAtPrice": 24000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "HERITAGE GRAPHIC",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Noir Intense",
        "hex": "#111111"
      }
    ],
    "variants": [
      {
        "id": "v-tsh6-s",
        "size": "S",
        "color": "Noir Intense",
        "stock": 6,
        "sku": "HPC-TSH-006-S"
      },
      {
        "id": "v-tsh6-m",
        "size": "M",
        "color": "Noir Intense",
        "stock": 12,
        "sku": "HPC-TSH-006-M"
      },
      {
        "id": "v-tsh6-l",
        "size": "L",
        "color": "Noir Intense",
        "stock": 10,
        "sku": "HPC-TSH-006-L"
      },
      {
        "id": "v-tsh6-xl",
        "size": "XL",
        "color": "Noir Intense",
        "stock": 6,
        "sku": "HPC-TSH-006-XL"
      },
      {
        "id": "v-tsh6-xxl",
        "size": "XXL",
        "color": "Noir Intense",
        "stock": 3,
        "sku": "HPC-TSH-006-XXL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 37,
    "status": "published",
    "createdAt": "2026-10-31T11:19:00Z",
    "updatedAt": "2026-10-31T11:19:00Z"
  },
  {
    "id": "prod-tsh-007-alt",
    "sku": "HPC-TSH-008-LUX",
    "name": "Chemise Manches Courtes Viscose Émeraude Motifs Baroque",
    "slug": "chemise-manches-courtes-viscose-emeraude-baroque",
    "description": "Tissu soyeux ultra respirant aux drapés luxueux avec motifs arabesques dorées sur fond vert impérial, col cubain décontracté.",
    "price": 23000,
    "compareAtPrice": 30000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "RESORT SILK",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Émeraude & Or Baroque",
        "hex": "#124E3F"
      }
    ],
    "variants": [
      {
        "id": "v-tsh7-m",
        "size": "M",
        "color": "Émeraude & Or Baroque",
        "stock": 5,
        "sku": "HPC-TSH-008-M"
      },
      {
        "id": "v-tsh7-l",
        "size": "L",
        "color": "Émeraude & Or Baroque",
        "stock": 8,
        "sku": "HPC-TSH-008-L"
      },
      {
        "id": "v-tsh7-xl",
        "size": "XL",
        "color": "Émeraude & Or Baroque",
        "stock": 4,
        "sku": "HPC-TSH-008-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 17,
    "status": "published",
    "createdAt": "2026-10-31T11:20:00Z",
    "updatedAt": "2026-10-31T11:20:00Z"
  },
  {
    "id": "prod-acc-004",
    "sku": "HPC-ACC-004",
    "name": "Sacoche Holster Poitrine Double Poche Tactique Cordura",
    "slug": "sacoche-holster-poitrine-double-poche-tactique-cordura",
    "description": "Harnais de poitrine tactique streetwear réglable en Cordura étanche avec double compartiment zippé et boucles rapides.",
    "price": 18000,
    "compareAtPrice": 24000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "CHEST RIG",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir Mat Tactique",
        "hex": "#171717"
      }
    ],
    "variants": [
      {
        "id": "v-acc4-u",
        "size": "Unique",
        "color": "Noir Mat Tactique",
        "stock": 18,
        "sku": "HPC-ACC-004-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 18,
    "status": "published",
    "createdAt": "2026-10-31T11:21:00Z",
    "updatedAt": "2026-10-31T11:21:00Z"
  },
  {
    "id": "prod-acc-005",
    "sku": "HPC-ACC-005",
    "name": "Sacoche Bandoulière Crossbody Modular Clip Cobra",
    "slug": "sacoche-bandouliere-crossbody-modular-clip-cobra",
    "description": "Format compact idéal pour smartphone, portefeuille et clés avec boucle métallique style alpinisme et sangle renforcée.",
    "price": 16000,
    "compareAtPrice": 22000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "CROSSBODY",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir Profond",
        "hex": "#111111"
      }
    ],
    "variants": [
      {
        "id": "v-acc5-u",
        "size": "Unique",
        "color": "Noir Profond",
        "stock": 20,
        "sku": "HPC-ACC-005-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 20,
    "status": "published",
    "createdAt": "2026-10-31T11:22:00Z",
    "updatedAt": "2026-10-31T11:22:00Z"
  },
  {
    "id": "prod-pol-001",
    "sku": "HPC-POL-001",
    "name": "Polo Piqué Coton Peigné Sport-Chic Blanc Épuré",
    "slug": "polo-pique-coton-peigne-sport-chic-blanc-epure",
    "description": "Polo emblématique en maille piquée respirante 100% coton peigné, col côtelé structuré avec liseré contrasté discret et patte à deux boutons nacrés. Coupe sport-chic ajustée élégante.",
    "price": 24000,
    "compareAtPrice": 32000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "SPORT-CHIC",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Blanc Tennis Pur",
        "hex": "#FFFFFF"
      }
    ],
    "variants": [
      {
        "id": "v-pol1-s",
        "size": "S",
        "color": "Blanc Tennis Pur",
        "stock": 5,
        "sku": "HPC-POL-001-S"
      },
      {
        "id": "v-pol1-m",
        "size": "M",
        "color": "Blanc Tennis Pur",
        "stock": 10,
        "sku": "HPC-POL-001-M"
      },
      {
        "id": "v-pol1-l",
        "size": "L",
        "color": "Blanc Tennis Pur",
        "stock": 8,
        "sku": "HPC-POL-001-L"
      },
      {
        "id": "v-pol1-xl",
        "size": "XL",
        "color": "Blanc Tennis Pur",
        "stock": 6,
        "sku": "HPC-POL-001-XL"
      },
      {
        "id": "v-pol1-xxl",
        "size": "XXL",
        "color": "Blanc Tennis Pur",
        "stock": 3,
        "sku": "HPC-POL-001-XXL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 32,
    "status": "published",
    "createdAt": "2026-11-03T10:00:00Z",
    "updatedAt": "2026-11-03T10:00:00Z"
  },
  {
    "id": "prod-pol-002",
    "sku": "HPC-POL-002",
    "name": "Polo Maille Piquée Bleu Marine Liseré Tennis Club",
    "slug": "polo-maille-piquee-bleu-marine-lisere-tennis-club",
    "description": "Silhouette intemporelle court tennis en piqué lourd 240 GSM bleu marine avec liseré blanc optique aux manches et broderie monogramme discrète sur la poitrine.",
    "price": 25000,
    "compareAtPrice": 34000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TENNIS CLUB",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Bleu Marine Club",
        "hex": "#1B2A4A"
      }
    ],
    "variants": [
      {
        "id": "v-pol2-m",
        "size": "M",
        "color": "Bleu Marine Club",
        "stock": 8,
        "sku": "HPC-POL-002-M"
      },
      {
        "id": "v-pol2-l",
        "size": "L",
        "color": "Bleu Marine Club",
        "stock": 9,
        "sku": "HPC-POL-002-L"
      },
      {
        "id": "v-pol2-xl",
        "size": "XL",
        "color": "Bleu Marine Club",
        "stock": 5,
        "sku": "HPC-POL-002-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 22,
    "status": "published",
    "createdAt": "2026-11-03T10:01:00Z",
    "updatedAt": "2026-11-03T10:01:00Z"
  },
  {
    "id": "prod-pol-003",
    "sku": "HPC-POL-003",
    "name": "Veste de Survêtement Trackjacket Sport-Chic Blanc & Vert Bouteille",
    "slug": "veste-survetement-trackjacket-sport-chic-blanc-vert",
    "description": "Veste de survêtement rétro sport-chic esprit country club en polyester crêpé texturé avec bandes contrastées vert bouteille et fermeture à glissière intégrale.",
    "price": 36000,
    "compareAtPrice": 45000,
    "category": "survetements",
    "images": [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TRACKJACKET",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Blanc & Vert Bouteille",
        "hex": "#1E4D2B"
      }
    ],
    "variants": [
      {
        "id": "v-pol3-s",
        "size": "S",
        "color": "Blanc & Vert Bouteille",
        "stock": 4,
        "sku": "HPC-POL-003-S"
      },
      {
        "id": "v-pol3-m",
        "size": "M",
        "color": "Blanc & Vert Bouteille",
        "stock": 8,
        "sku": "HPC-POL-003-M"
      },
      {
        "id": "v-pol3-l",
        "size": "L",
        "color": "Blanc & Vert Bouteille",
        "stock": 7,
        "sku": "HPC-POL-003-L"
      },
      {
        "id": "v-pol3-xl",
        "size": "XL",
        "color": "Blanc & Vert Bouteille",
        "stock": 3,
        "sku": "HPC-POL-003-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 22,
    "status": "published",
    "createdAt": "2026-11-03T10:02:00Z",
    "updatedAt": "2026-11-03T10:02:00Z"
  },
  {
    "id": "prod-jns-001",
    "sku": "HPC-JNS-001",
    "name": "Jean Baggy Skate Délavé Vintage Déstructuré",
    "slug": "jean-baggy-skate-delave-vintage-destructure",
    "description": "Denim ample ultra tendance coupe loose baggy 90s avec moustaches artisanales et délavage stone washed authentique. Tombé généreux sur les sneakers.",
    "price": 28000,
    "compareAtPrice": 36000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "BAGGY SKATE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Bleu Vintage Délavé",
        "hex": "#5C768D"
      }
    ],
    "variants": [
      {
        "id": "v-jns1-30",
        "size": "30",
        "color": "Bleu Vintage Délavé",
        "stock": 5,
        "sku": "HPC-JNS-001-30"
      },
      {
        "id": "v-jns1-32",
        "size": "32",
        "color": "Bleu Vintage Délavé",
        "stock": 9,
        "sku": "HPC-JNS-001-32"
      },
      {
        "id": "v-jns1-34",
        "size": "34",
        "color": "Bleu Vintage Délavé",
        "stock": 7,
        "sku": "HPC-JNS-001-34"
      },
      {
        "id": "v-jns1-36",
        "size": "36",
        "color": "Bleu Vintage Délavé",
        "stock": 4,
        "sku": "HPC-JNS-001-36"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 25,
    "status": "published",
    "createdAt": "2026-11-03T10:03:00Z",
    "updatedAt": "2026-11-03T10:03:00Z"
  },
  {
    "id": "prod-jns-002",
    "sku": "HPC-JNS-002",
    "name": "Jean Selvedge Brut Coupe Droite Évasée 14oz",
    "slug": "jean-selvedge-brut-coupe-droite-evasee-14oz",
    "description": "Toile japonaise brute 14 oz ultra résistante non lavée, surpiqûres couleur tabac, rivets en cuivre vieilli et revers contrasté avec liseré selvedge rouge.",
    "price": 32000,
    "compareAtPrice": 42000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "14OZ SELVEDGE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Denim Brut Indigo",
        "hex": "#16233B"
      }
    ],
    "variants": [
      {
        "id": "v-jns2-30",
        "size": "30",
        "color": "Denim Brut Indigo",
        "stock": 4,
        "sku": "HPC-JNS-002-30"
      },
      {
        "id": "v-jns2-32",
        "size": "32",
        "color": "Denim Brut Indigo",
        "stock": 8,
        "sku": "HPC-JNS-002-32"
      },
      {
        "id": "v-jns2-34",
        "size": "34",
        "color": "Denim Brut Indigo",
        "stock": 6,
        "sku": "HPC-JNS-002-34"
      },
      {
        "id": "v-jns2-36",
        "size": "36",
        "color": "Denim Brut Indigo",
        "stock": 3,
        "sku": "HPC-JNS-002-36"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 21,
    "status": "published",
    "createdAt": "2026-11-03T10:04:00Z",
    "updatedAt": "2026-11-03T10:04:00Z"
  },
  {
    "id": "prod-jns-003",
    "sku": "HPC-JNS-003",
    "name": "Jean Loose Classic Fit Bleu Moyen Raw Edge",
    "slug": "jean-loose-classic-fit-bleu-moyen-raw-edge",
    "description": "Jean polyvalent à jambe large et ourlets francs, confectionné dans une gabardine denim robuste et souple.",
    "price": 27000,
    "compareAtPrice": 35000,
    "category": "pantalons",
    "images": [
      "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "DENIM ESSENTIAL",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Bleu Moyen Classic",
        "hex": "#3B5998"
      }
    ],
    "variants": [
      {
        "id": "v-jns3-30",
        "size": "30",
        "color": "Bleu Moyen Classic",
        "stock": 4,
        "sku": "HPC-JNS-003-30"
      },
      {
        "id": "v-jns3-32",
        "size": "32",
        "color": "Bleu Moyen Classic",
        "stock": 7,
        "sku": "HPC-JNS-003-32"
      },
      {
        "id": "v-jns3-34",
        "size": "34",
        "color": "Bleu Moyen Classic",
        "stock": 6,
        "sku": "HPC-JNS-003-34"
      },
      {
        "id": "v-jns3-36",
        "size": "36",
        "color": "Bleu Moyen Classic",
        "stock": 3,
        "sku": "HPC-JNS-003-36"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 20,
    "status": "published",
    "createdAt": "2026-11-03T10:05:00Z",
    "updatedAt": "2026-11-03T10:05:00Z"
  },
  {
    "id": "prod-tsh-009",
    "sku": "HPC-TSH-009",
    "name": "T-Shirt Boxy Heavyweight Lavé Vintage Acid Wash Y2K 280 GSM",
    "slug": "t-shirt-boxy-heavyweight-lave-vintage-acid-wash-y2k",
    "description": "Coton ultra lourd 280 grammes traité au lavage minéral vintage avec emmanchures tombantes et col montant épais 3,5 cm. Pièce maîtresse de la tendance streetwear actuelle.",
    "price": 19000,
    "compareAtPrice": 26000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "Y2K ACID WASH",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Gris Minéral Fumé",
        "hex": "#4E4E4E"
      }
    ],
    "variants": [
      {
        "id": "v-tsh9-s",
        "size": "S",
        "color": "Gris Minéral Fumé",
        "stock": 6,
        "sku": "HPC-TSH-009-S"
      },
      {
        "id": "v-tsh9-m",
        "size": "M",
        "color": "Gris Minéral Fumé",
        "stock": 12,
        "sku": "HPC-TSH-009-M"
      },
      {
        "id": "v-tsh9-l",
        "size": "L",
        "color": "Gris Minéral Fumé",
        "stock": 10,
        "sku": "HPC-TSH-009-L"
      },
      {
        "id": "v-tsh9-xl",
        "size": "XL",
        "color": "Gris Minéral Fumé",
        "stock": 7,
        "sku": "HPC-TSH-009-XL"
      },
      {
        "id": "v-tsh9-xxl",
        "size": "XXL",
        "color": "Gris Minéral Fumé",
        "stock": 4,
        "sku": "HPC-TSH-009-XXL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 39,
    "status": "published",
    "createdAt": "2026-11-03T10:06:00Z",
    "updatedAt": "2026-11-03T10:06:00Z"
  },
  {
    "id": "prod-tsh-010",
    "sku": "HPC-TSH-010",
    "name": "T-Shirt Oversize Graphic « Cotonou Fast Life » Sérigraphie 3D",
    "slug": "t-shirt-oversize-graphic-cotonou-fast-life-serigraphie-3d",
    "description": "T-shirt blanc lourd au tombé parfait avec illustration percutante au dos en sérigraphie relief gonflante, célébrant l'énergie nocturne de Cotonou.",
    "price": 18500,
    "compareAtPrice": 25000,
    "category": "tshirts",
    "images": [
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TRENDING GRAPHIC",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Blanc Pur Sérigraphié",
        "hex": "#FAFAFA"
      }
    ],
    "variants": [
      {
        "id": "v-tsh10-m",
        "size": "M",
        "color": "Blanc Pur Sérigraphié",
        "stock": 8,
        "sku": "HPC-TSH-010-M"
      },
      {
        "id": "v-tsh10-l",
        "size": "L",
        "color": "Blanc Pur Sérigraphié",
        "stock": 11,
        "sku": "HPC-TSH-010-L"
      },
      {
        "id": "v-tsh10-xl",
        "size": "XL",
        "color": "Blanc Pur Sérigraphié",
        "stock": 6,
        "sku": "HPC-TSH-010-XL"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 25,
    "status": "published",
    "createdAt": "2026-11-03T10:07:00Z",
    "updatedAt": "2026-11-03T10:07:00Z"
  },
  {
    "id": "prod-bel-001",
    "sku": "HPC-BEL-001",
    "name": "Ceinture Cuir Western à Boucle Métal Gravée Vintage",
    "slug": "ceinture-cuir-western-a-boucle-metal-gravee-vintage",
    "description": "Cuir pleine fleur noir de 38 mm d'épaisseur avec boucle western ciselée argent vieilli, passants gravés et bout ferré sculpté. L'accessoire incontournable pour sublimer les jeans amples.",
    "price": 14000,
    "compareAtPrice": 19000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "WESTERN BUCKLE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "85",
      "95",
      "105",
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir & Argent Vieilli",
        "hex": "#1C1C1C"
      }
    ],
    "variants": [
      {
        "id": "v-bel1-85",
        "size": "85",
        "color": "Noir & Argent Vieilli",
        "stock": 6,
        "sku": "HPC-BEL-001-85"
      },
      {
        "id": "v-bel1-95",
        "size": "95",
        "color": "Noir & Argent Vieilli",
        "stock": 10,
        "sku": "HPC-BEL-001-95"
      },
      {
        "id": "v-bel1-105",
        "size": "105",
        "color": "Noir & Argent Vieilli",
        "stock": 8,
        "sku": "HPC-BEL-001-105"
      },
      {
        "id": "v-bel1-u",
        "size": "Unique",
        "color": "Noir & Argent Vieilli",
        "stock": 6,
        "sku": "HPC-BEL-001-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 30,
    "status": "published",
    "createdAt": "2026-11-03T10:08:00Z",
    "updatedAt": "2026-11-03T10:08:00Z"
  },
  {
    "id": "prod-bel-002",
    "sku": "HPC-BEL-002",
    "name": "Ceinture Tactique Sangle Haute Ténacité Clip Boucle Cobra",
    "slug": "ceinture-tactique-sangle-haute-tenacite-clip-cobra",
    "description": "Sangle militaire en nylon balistique indéchirable avec boucle rapide cobra en alliage de zinc ultra robuste et réglage millimétrique sans trous.",
    "price": 12000,
    "compareAtPrice": 16000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TACTICAL CLIP",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir Militaire",
        "hex": "#111111"
      }
    ],
    "variants": [
      {
        "id": "v-bel2-u",
        "size": "Unique",
        "color": "Noir Militaire",
        "stock": 24,
        "sku": "HPC-BEL-002-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 24,
    "status": "published",
    "createdAt": "2026-11-03T10:09:00Z",
    "updatedAt": "2026-11-03T10:09:00Z"
  },
  {
    "id": "prod-bel-003",
    "sku": "HPC-BEL-003",
    "name": "Ceinture Cuir Noir Cloutée Étoiles & Strass Streetwear",
    "slug": "ceinture-cuir-noir-cloutee-etoiles-strass-streetwear",
    "description": "Inspiration street punk et défilé luxe : cuir noir souple orné de rangées de clous pyramidaux et d'étoiles métalliques chromées. Boucle carrée polie.",
    "price": 16000,
    "compareAtPrice": 22000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "PUNK ROCK CHIC",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "90",
      "100",
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir Clouté Argent",
        "hex": "#222222"
      }
    ],
    "variants": [
      {
        "id": "v-bel3-90",
        "size": "90",
        "color": "Noir Clouté Argent",
        "stock": 7,
        "sku": "HPC-BEL-003-90"
      },
      {
        "id": "v-bel3-100",
        "size": "100",
        "color": "Noir Clouté Argent",
        "stock": 9,
        "sku": "HPC-BEL-003-100"
      },
      {
        "id": "v-bel3-u",
        "size": "Unique",
        "color": "Noir Clouté Argent",
        "stock": 6,
        "sku": "HPC-BEL-003-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 22,
    "status": "published",
    "createdAt": "2026-11-03T10:10:00Z",
    "updatedAt": "2026-11-03T10:10:00Z"
  },
  {
    "id": "prod-cap-001",
    "sku": "HPC-CAP-001",
    "name": "Casquette Dad Hat Coton Délavé Visière Courbée HPC Club",
    "slug": "casquette-dad-hat-coton-delave-visiere-courbee-hpc",
    "description": "Casquette basse déstructurée en sergé de coton délavé doux avec visière précourbée, œillets de ventilation brodés et fermeture sangle en tissu avec boucle en laiton.",
    "price": 11000,
    "compareAtPrice": 15000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "DAD HAT VINTAGE",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Kaki Vintage & Écru",
        "hex": "#4B5320"
      }
    ],
    "variants": [
      {
        "id": "v-cap1-u",
        "size": "Unique",
        "color": "Kaki Vintage & Écru",
        "stock": 20,
        "sku": "HPC-CAP-001-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 20,
    "status": "published",
    "createdAt": "2026-11-03T10:11:00Z",
    "updatedAt": "2026-11-03T10:11:00Z"
  },
  {
    "id": "prod-cap-002",
    "sku": "HPC-CAP-002",
    "name": "Casquette Snapback 5-Panel Broderie Relief Noir & Or",
    "slug": "casquette-snapback-5-panel-broderie-relief-noir-or",
    "description": "Casquette structurée 5 panneaux à calotte haute et visière plate, ornée du monogramme HP brodé en 3D relief or satiné sur fond noir profond.",
    "price": 13000,
    "compareAtPrice": 18000,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "SNAPBACK 3D",
    "isFeatured": true,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir & Or Signature",
        "hex": "#151515"
      }
    ],
    "variants": [
      {
        "id": "v-cap2-u",
        "size": "Unique",
        "color": "Noir & Or Signature",
        "stock": 25,
        "sku": "HPC-CAP-002-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 25,
    "status": "published",
    "createdAt": "2026-11-03T10:12:00Z",
    "updatedAt": "2026-11-03T10:12:00Z"
  },
  {
    "id": "prod-cap-003",
    "sku": "HPC-CAP-003",
    "name": "Casquette Trucker Filet Rétro Racing Motorsport",
    "slug": "casquette-trucker-filet-retro-racing-motorsport",
    "description": "Face avant en mousse rembourrée et dos en filet mesh respirant ultra aéré avec écusson brodé esprit courses automobiles et languette crantée ajustable.",
    "price": 10500,
    "compareAtPrice": 14500,
    "category": "accessoires",
    "images": [
      "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=80"
    ],
    "badge": "TRUCKER MESH",
    "isFeatured": false,
    "isNew": true,
    "sizes": [
      "Unique"
    ],
    "colors": [
      {
        "name": "Noir & Blanc Racing",
        "hex": "#1A1A1A"
      }
    ],
    "variants": [
      {
        "id": "v-cap3-u",
        "size": "Unique",
        "color": "Noir & Blanc Racing",
        "stock": 18,
        "sku": "HPC-CAP-003-U"
      }
    ],
    "lowStockThreshold": 5,
    "totalStock": 18,
    "status": "published",
    "createdAt": "2026-11-03T10:13:00Z",
    "updatedAt": "2026-11-03T10:13:00Z"
  }
];

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

export const DEFAULT_LOYALTY_CONFIG = {
  enabled: true,
  pointsPer1000FCFA: 1, // 1 point pour chaque 1 000 FCFA payés
  tiers: [
    {
      tier: 'standard' as const,
      name: 'Membre Standard',
      minSpent: 0,
      discountPercentage: 0,
      pointsMultiplier: 1,
      freeShipping: false,
      perks: 'Accès aux lancements & suivi de commande en direct',
    },
    {
      tier: 'bronze' as const,
      name: 'Membre Bronze',
      minSpent: 50000,
      discountPercentage: 3,
      pointsMultiplier: 1.1,
      freeShipping: false,
      perks: '3% de remise sur chaque commande & accès anticipé aux drops',
    },
    {
      tier: 'silver' as const,
      name: 'Membre Argent',
      minSpent: 120000,
      discountPercentage: 6,
      pointsMultiplier: 1.25,
      freeShipping: false,
      perks: '6% de réduction permanente & priorité de préparation coursier',
    },
    {
      tier: 'gold' as const,
      name: 'Membre Or',
      minSpent: 250000,
      discountPercentage: 10,
      pointsMultiplier: 1.5,
      freeShipping: true,
      perks: '10% de réduction permanente & livraison offerte dans votre ville',
    },
    {
      tier: 'vip' as const,
      name: 'Black Edition VIP',
      minSpent: 500000,
      discountPercentage: 15,
      pointsMultiplier: 2,
      freeShipping: true,
      perks: '15% de réduction, livraison offerte partout au Bénin & invitations privées',
    },
  ],
};

export const DEFAULT_RETURN_POLICY_CONFIG = {
  delayDays: 7,
  freeExchangeInCotonou: true,
  conditionRequirements: [
    "L'article doit être dans son état d'origine, non porté, non lavé avec ses étiquettes scellées.",
    "Les sneakers et chaussures doivent être restituées dans leur boîte d'origine intacte sans scotch direct.",
    "L'essayage est autorisé au moment de la livraison en présence du coursier.",
    "Les retours pour défaut de fabrication sont pris en charge à 100% par HP COLLECTION sans aucun frais.",
  ],
  refundProcessingTime: "Règlement en espèces ou virement Mobile Money (MTN, Moov, Celtiis) sous 24h à 48h ouvrées après inspection physique au dépôt.",
  eligibleCategories: ['survetements', 'sneakers', 'basket', 'tshirts', 'hoodies', 'varsity', 'pantalons', 'accessoires'],
  policyText: "Chez HP COLLECTION, votre satisfaction est garantie. Tout article commandé peut faire l'objet d'un échange gratuit de taille ou d'un remboursement selon les conditions en vigueur au Bénin. Notre coursier se déplace directement à votre adresse pour effectuer la reprise.",
};

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'HP COLLECTION',
  slogan: 'Ton style. Tes règles.',
  phone: '+229 97 00 00 00',
  whatsappNumber: '+229 97 00 00 00',
  email: 'contact@hpcollection.bj',
  address: 'Cotonou, République du Bénin',
  announcementText: 'NOUVELLE SÉLECTION URBAN SNEAKERS & STREETWEAR 2026 • PAIEMENT À LA LIVRAISON AU BÉNIN',
  announcementActive: false,
  currency: 'XOF',
  currencySymbol: 'FCFA',
  freeShippingThreshold: 75000,
  fedapayPublicKey: '',
  fedapaySecretKey: '',
  fedapaySandbox: true,
  loyaltyConfig: DEFAULT_LOYALTY_CONFIG,
  returnPolicyConfig: DEFAULT_RETURN_POLICY_CONFIG,
};


