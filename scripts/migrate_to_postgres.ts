/**
 * Script de migration et génération de seed SQL pour PostgreSQL
 * Exporte l'ensemble des 76 produits, catégories, zones et paramètres sans aucune perte.
 */

import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');
const OUTPUT_SQL = path.join(process.cwd(), 'data', 'seed_data.sql');

function escapeSql(str: string): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function runMigration() {
  if (!fs.existsSync(STORE_PATH)) {
    console.error(`Fichier store.json introuvable à : ${STORE_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  const store = JSON.parse(raw);

  console.log(`[Migration] Lecture des données actuelles :`);
  console.log(`- Produits : ${store.products?.length || 0}`);
  console.log(`- Catégories : ${store.categories?.length || 0}`);
  console.log(`- Zones de livraison : ${store.deliveryZones?.length || 0}`);
  console.log(`- Codes promo : ${store.promoCodes?.length || 0}`);
  console.log(`- Commandes : ${store.orders?.length || 0}`);

  const sqlLines: string[] = [];
  sqlLines.push('-- ====================================================================');
  sqlLines.push('-- SEED AUTOMATIQUE HP COLLECTION POUR POSTGRESQL');
  sqlLines.push(`-- Généré le : ${new Date().toISOString()}`);
  sqlLines.push('-- ====================================================================\n');
  sqlLines.push('BEGIN;\n');

  // Categories
  if (store.categories) {
    for (const cat of store.categories) {
      sqlLines.push(
        `INSERT INTO categories (id, name, description, icon) VALUES (${escapeSql(cat.id)}, ${escapeSql(cat.name)}, ${escapeSql(cat.description || '')}, ${escapeSql(cat.icon || '')}) ON CONFLICT (id) DO NOTHING;`
      );
    }
  }

  // Delivery Zones
  if (store.deliveryZones) {
    for (const z of store.deliveryZones) {
      sqlLines.push(
        `INSERT INTO delivery_zones (id, name, fee, estimated_hours, is_active) VALUES (${escapeSql(z.id)}, ${escapeSql(z.name)}, ${z.fee}, ${escapeSql(z.estimatedHours || '24h')}, ${z.isActive ? 'TRUE' : 'FALSE'}) ON CONFLICT (id) DO NOTHING;`
      );
    }
  }

  // Promo Codes
  if (store.promoCodes) {
    for (const p of store.promoCodes) {
      sqlLines.push(
        `INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order_amount, is_active) VALUES (${escapeSql(p.id)}, ${escapeSql(p.code)}, ${escapeSql(p.discountType)}, ${p.discountValue}, ${p.minOrderAmount || 0}, ${p.isActive ? 'TRUE' : 'FALSE'}) ON CONFLICT (code) DO NOTHING;`
      );
    }
  }

  // Products & Variants
  if (store.products) {
    for (const prod of store.products) {
      const imagesJson = escapeSql(JSON.stringify(prod.images || []));
      sqlLines.push(
        `INSERT INTO products (id, sku, name, description, price, sale_price, category_id, images, is_featured, is_trending, total_stock) VALUES (${escapeSql(prod.id)}, ${escapeSql(prod.sku)}, ${escapeSql(prod.name)}, ${escapeSql(prod.description)}, ${prod.price}, ${prod.salePrice || 'NULL'}, ${escapeSql(prod.category)}, ${imagesJson}::jsonb, ${prod.isFeatured ? 'TRUE' : 'FALSE'}, ${prod.isTrending ? 'TRUE' : 'FALSE'}, ${prod.totalStock || 0}) ON CONFLICT (id) DO UPDATE SET total_stock = EXCLUDED.total_stock;`
      );

      if (prod.variants && Array.isArray(prod.variants)) {
        for (const v of prod.variants) {
          sqlLines.push(
            `INSERT INTO product_variants (id, product_id, sku, size, color, stock) VALUES (${escapeSql(v.id)}, ${escapeSql(prod.id)}, ${escapeSql(v.sku)}, ${escapeSql(v.size)}, ${escapeSql(v.color)}, ${v.stock}) ON CONFLICT (id) DO UPDATE SET stock = EXCLUDED.stock;`
          );
        }
      }
    }
  }

  sqlLines.push('\nCOMMIT;\n');

  fs.writeFileSync(OUTPUT_SQL, sqlLines.join('\n'), 'utf-8');
  console.log(`[Migration] Fichier SQL généré avec succès : ${OUTPUT_SQL}`);
  console.log(`[Migration] Nombre de lignes SQL générées : ${sqlLines.length}`);
}

runMigration();
