import { Product } from '../types';

export interface SEOConfig {
  title?: string;
  description?: string;
  canonicalPath?: string;
  product?: Product | null;
  categoryName?: string;
}

export function updatePageSEO(config: SEOConfig) {
  if (typeof document === 'undefined') return;

  const brandName = "HP COLLECTION";
  const defaultTitle = "HP COLLECTION | Boutique de Vêtements, Streetwear & Sneakers au Bénin";
  const defaultDesc = "HP COLLECTION — Boutique en ligne premium de mode urbaine, sneakers authentiques, joggings et vestes au Bénin. Ton style. Tes règles. Livraison 24h à Cotonou et Calavi.";

  let pageTitle = defaultTitle;
  let pageDesc = defaultDesc;

  if (config.product) {
    pageTitle = `${config.product.name} | Boutique HP COLLECTION Bénin`;
    pageDesc = `${config.product.name} — ${config.product.description} En stock à Cotonou. Livraison 24h et paiement à la réception.`;
  } else if (config.categoryName) {
    pageTitle = `${config.categoryName} au Bénin | Boutique HP COLLECTION`;
    pageDesc = `Découvrez notre collection de ${config.categoryName.toLowerCase()} au Bénin. Qualité premium, essayage à la livraison et expédition express 24h.`;
  } else if (config.title) {
    pageTitle = `${config.title} | ${brandName}`;
    if (config.description) pageDesc = config.description;
  }

  // 1. Update Document Title
  document.title = pageTitle;

  // 2. Update Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', pageDesc);
  }

  // 3. Update OpenGraph Tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', pageTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', pageDesc);

  if (config.product && config.product.images[0]) {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', config.product.images[0]);
  }

  // 4. Update Canonical Link
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && typeof window !== 'undefined') {
    const origin = window.location.origin;
    const path = config.canonicalPath || window.location.pathname;
    canonical.setAttribute('href', `${origin}${path}`);
  }

  // 5. Dynamic Schema.org JSON-LD for Products
  const existingProductScript = document.getElementById('schema-product-ld');
  if (config.product) {
    const p = config.product;
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "image": p.images,
      "description": p.description,
      "sku": p.sku,
      "category": p.category,
      "brand": {
        "@type": "Brand",
        "name": "HP COLLECTION"
      },
      "offers": {
        "@type": "Offer",
        "url": typeof window !== 'undefined' ? `${window.location.origin}/catalog?product=${p.id}` : `https://hpcollection.bj/catalog?product=${p.id}`,
        "priceCurrency": "XOF",
        "price": p.salePrice && p.salePrice > 0 ? p.salePrice : p.price,
        "availability": p.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "HP COLLECTION"
        }
      }
    };

    if (existingProductScript) {
      existingProductScript.textContent = JSON.stringify(productSchema);
    } else {
      const script = document.createElement('script');
      script.id = 'schema-product-ld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(productSchema);
      document.head.appendChild(script);
    }
  } else if (existingProductScript) {
    existingProductScript.remove();
  }
}
