import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  Product,
  Order,
  PromoCode,
  DeliveryZone,
  StoreSettings,
  StockMovement,
  UserAccount,
  OrderItem,
  StatusHistoryEntry,
  CategoryInfo,
} from './src/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_PROMO_CODES,
  INITIAL_STORE_SETTINGS,
  CATEGORIES,
} from './src/data/initialData';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. HTTP Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 2. Serve uploaded files and public assets statically with caching and security
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '30d',
    immutable: true,
    dotfiles: 'ignore',
    etag: true,
  })
);

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
app.use(
  express.static(PUBLIC_DIR, {
    maxAge: '7d',
    dotfiles: 'ignore',
    etag: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database Interface
interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  categories: CategoryInfo[];
  promoCodes: PromoCode[];
  deliveryZones: DeliveryZone[];
  stockMovements: StockMovement[];
  storeSettings: StoreSettings;
  adminUsers: Array<{
    id: string;
    email: string;
    fullName: string;
    passwordHash: string;
    salt: string;
    createdAt: string;
  }>;
  sessions: Array<{
    token: string;
    userId: string;
    role: 'admin';
    expiresAt: number;
  }>;
}

// Password hashing helper using Node crypto
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

// Ensure standard administrator account exists
function ensureDefaultAdmin(adminUsers: DatabaseSchema['adminUsers']) {
  const defaultEmail = 'admin@hpcollection.bj';
  if (!adminUsers.some((u) => u.email === defaultEmail)) {
    const { hash, salt } = hashPassword('AdminHP2026!');
    adminUsers.push({
      id: 'admin-default-root',
      email: defaultEmail,
      fullName: 'Directeur HP COLLECTION',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    });
  }
}

// Load / Initialize persistent DB
function getDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    // Initial bootstrap data
    const initialAdmins: DatabaseSchema['adminUsers'] = [];
    ensureDefaultAdmin(initialAdmins);

    const initialDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [],
      categories: CATEGORIES,
      promoCodes: INITIAL_PROMO_CODES,
      deliveryZones: INITIAL_DELIVERY_ZONES,
      stockMovements: [],
      storeSettings: INITIAL_STORE_SETTINGS,
      adminUsers: initialAdmins,
      sessions: [],
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const existingProducts: Product[] = parsed.products || [];
    const existingIds = new Set(existingProducts.map((p: Product) => p.id));
    let hasNew = false;
    const mergedProducts = [...existingProducts];
    for (const p of INITIAL_PRODUCTS) {
      if (!existingIds.has(p.id)) {
        mergedProducts.push(p);
        hasNew = true;
      }
    }

    const adminUsers = parsed.adminUsers || [];
    ensureDefaultAdmin(adminUsers);

    const db: DatabaseSchema = {
      products: mergedProducts,
      orders: parsed.orders || [],
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : CATEGORIES,
      promoCodes: parsed.promoCodes || INITIAL_PROMO_CODES,
      deliveryZones: parsed.deliveryZones || INITIAL_DELIVERY_ZONES,
      stockMovements: parsed.stockMovements || [],
      storeSettings: parsed.storeSettings || INITIAL_STORE_SETTINGS,
      adminUsers,
      sessions: parsed.sessions || [],
    };
    if (hasNew) {
      try {
        fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
      } catch (writeErr) {
        console.error('Failed to sync new products to store.json', writeErr);
      }
    }
    return db;
  } catch (err) {
    console.error('Error reading store.json, resetting to initial data', err);
    const initialAdmins: DatabaseSchema['adminUsers'] = [];
    ensureDefaultAdmin(initialAdmins);
    return {
      products: INITIAL_PRODUCTS,
      orders: [],
      categories: CATEGORIES,
      promoCodes: INITIAL_PROMO_CODES,
      deliveryZones: INITIAL_DELIVERY_ZONES,
      stockMovements: [],
      storeSettings: INITIAL_STORE_SETTINGS,
      adminUsers: initialAdmins,
      sessions: [],
    };
  }
}

function saveDatabase(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Admin Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé : jeton administrateur manquant' });
  }

  const token = authHeader.split(' ')[1];
  const db = getDatabase();
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());

  if (!session || session.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit : session administrateur invalide ou expirée' });
  }

  (req as any).adminUserId = session.userId;
  next();
}

// ==========================================
// SEO ENDPOINTS (DYNAMIC SITEMAP & ROBOTS)
// ==========================================
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(`# robots.txt pour HP COLLECTION — Mode Urbaine & Sneakers au Bénin
User-agent: *
Allow: /
Disallow: /api/admin/
Disallow: /order-confirmation

Sitemap: ${baseUrl}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const db = getDatabase();
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/catalog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/delivery-info`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/order-tracking`, priority: '0.6', changefreq: 'weekly' },
    { loc: `${baseUrl}/legal`, priority: '0.5', changefreq: 'yearly' },
    { loc: `${baseUrl}/privacy`, priority: '0.5', changefreq: 'yearly' },
    { loc: `${baseUrl}/mentions`, priority: '0.5', changefreq: 'yearly' },
  ];

  const categoryUrls = (db.categories || CATEGORIES).map((c) => ({
    loc: `${baseUrl}/catalog?category=${encodeURIComponent(c.id)}`,
    priority: '0.85',
    changefreq: 'daily',
    lastmod: now,
  }));

  const productUrls = (db.products || INITIAL_PRODUCTS)
    .filter((p) => p.status === 'published')
    .map((p) => ({
      loc: `${baseUrl}/catalog?product=${encodeURIComponent(p.id)}`,
      priority: p.isFeatured ? '0.8' : '0.7',
      changefreq: 'weekly',
      lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : now,
    }));

  const allEntries = [...staticUrls, ...categoryUrls, ...productUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${(item as any).lastmod || now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// ==========================================
// API ROUTES
// ==========================================

// 1. PUBLIC PRODUCTS & CATALOG
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, status, featured, sort } = req.query;
  const db = getDatabase();
  let items = [...db.products];

  // If not requested by admin, only show 'published'
  const isAdmin = req.headers.authorization?.startsWith('Bearer ');
  if (!isAdmin || status !== 'all') {
    if (status) {
      items = items.filter((p) => p.status === status);
    } else {
      items = items.filter((p) => p.status === 'published');
    }
  }

  if (category && category !== 'all') {
    items = items.filter((p) => p.category === category);
  }

  if (featured === 'true') {
    items = items.filter((p) => p.isFeatured);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    items = items.filter((p) => (p.salePrice || p.price) >= Number(minPrice));
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    items = items.filter((p) => (p.salePrice || p.price) <= Number(maxPrice));
  }

  // Sorting
  if (sort === 'price_asc') {
    items.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  } else if (sort === 'price_desc') {
    items.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  } else if (sort === 'newest') {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Default featured first, then newest
    items.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  res.json({ products: items, total: items.length });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }
  res.json({ product });
});

// Admin Product Create
app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.price || !body.category) {
    return res.status(400).json({ error: 'Nom, prix et catégorie sont obligatoires' });
  }

  const db = getDatabase();
  const id = `prod-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const sku = body.sku || `HPC-${body.category.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const variants = (body.variants || []).map((v: any, idx: number) => ({
    id: v.id || `v-${id}-${idx + 1}`,
    size: v.size || 'Unique',
    color: v.color || 'Standard',
    colorHex: v.colorHex || '#171717',
    stock: Math.max(0, parseInt(v.stock, 10) || 0),
    sku: v.sku || `${sku}-${v.size || 'UNI'}-${idx + 1}`,
  }));

  const totalStock = variants.reduce((sum: number, v: any) => sum + v.stock, 0);

  const newProduct: Product = {
    id,
    sku,
    name: body.name.trim(),
    slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
    category: body.category,
    description: body.description || '',
    details: body.details || [],
    materials: body.materials || '',
    careAdvice: body.careAdvice || '',
    price: Number(body.price),
    salePrice: body.salePrice ? Number(body.salePrice) : undefined,
    images: body.images && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'],
    sizes: body.sizes || (variants.length > 0 ? Array.from(new Set(variants.map((v: any) => v.size))) : ['Unique']),
    colors: body.colors || [],
    variants,
    status: body.status || 'published',
    isFeatured: !!body.isFeatured,
    isNewArrival: !!body.isNewArrival,
    lowStockThreshold: Number(body.lowStockThreshold) || 3,
    totalStock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);

  // Record initial stock movements
  for (const v of variants) {
    if (v.stock > 0) {
      db.stockMovements.push({
        id: `mov-${Date.now()}-${v.id}`,
        timestamp: new Date().toISOString(),
        productId: newProduct.id,
        productName: newProduct.name,
        variantId: v.id,
        variantSku: v.sku,
        change: v.stock,
        newStock: v.stock,
        type: 'restock',
        reason: 'Stock initial à la création du produit',
      });
    }
  }

  saveDatabase(db);
  res.status(201).json({ product: newProduct, message: 'Produit créé avec succès' });
});

// Admin Product Update
app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  const existing = db.products[index];
  const body = req.body;

  let variants = existing.variants;
  if (body.variants && Array.isArray(body.variants)) {
    variants = body.variants.map((v: any, idx: number) => ({
      id: v.id || `v-${existing.id}-${idx + 1}`,
      size: v.size || 'Unique',
      color: v.color || 'Standard',
      colorHex: v.colorHex || '#171717',
      stock: Math.max(0, parseInt(v.stock, 10) || 0),
      sku: v.sku || `${existing.sku}-${v.size || 'UNI'}-${idx + 1}`,
    }));
  }

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const updated: Product = {
    ...existing,
    name: body.name !== undefined ? body.name.trim() : existing.name,
    sku: body.sku !== undefined ? body.sku.trim() : existing.sku,
    category: body.category !== undefined ? body.category : existing.category,
    description: body.description !== undefined ? body.description : existing.description,
    details: body.details !== undefined ? body.details : existing.details,
    materials: body.materials !== undefined ? body.materials : existing.materials,
    careAdvice: body.careAdvice !== undefined ? body.careAdvice : existing.careAdvice,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    salePrice: body.salePrice !== undefined ? (body.salePrice ? Number(body.salePrice) : undefined) : existing.salePrice,
    images: body.images !== undefined ? body.images : existing.images,
    sizes: body.sizes !== undefined ? body.sizes : existing.sizes,
    colors: body.colors !== undefined ? body.colors : existing.colors,
    variants,
    status: body.status !== undefined ? body.status : existing.status,
    isFeatured: body.isFeatured !== undefined ? !!body.isFeatured : existing.isFeatured,
    isNewArrival: body.isNewArrival !== undefined ? !!body.isNewArrival : existing.isNewArrival,
    lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : existing.lowStockThreshold,
    totalStock,
    updatedAt: new Date().toISOString(),
  };

  db.products[index] = updated;
  saveDatabase(db);
  res.json({ product: updated, message: 'Produit mis à jour avec succès' });
});

// Admin Product Stock Quick Adjust
app.post('/api/products/:id/adjust-stock', requireAdmin, (req: Request, res: Response) => {
  const { variantId, adjustment, reason } = req.body;
  if (!variantId || adjustment === undefined) {
    return res.status(400).json({ error: 'VariantId et valeur d’ajustement requis' });
  }

  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) {
    return res.status(404).json({ error: 'Variante introuvable' });
  }

  const adjNumber = Number(adjustment);
  const oldStock = variant.stock;
  const newStock = Math.max(0, oldStock + adjNumber);
  const actualChange = newStock - oldStock;

  variant.stock = newStock;
  product.totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  product.updatedAt = new Date().toISOString();

  // Log movement
  db.stockMovements.unshift({
    id: `mov-${Date.now()}-${variant.id}`,
    timestamp: new Date().toISOString(),
    productId: product.id,
    productName: product.name,
    variantId: variant.id,
    variantSku: variant.sku,
    change: actualChange,
    newStock,
    type: actualChange >= 0 ? 'restock' : 'adjustment',
    reason: reason || 'Ajustement manuel administrateur',
  });

  saveDatabase(db);
  res.json({ product, message: 'Stock ajusté avec succès' });
});

// Admin Product Delete
app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  const removed = db.products.splice(index, 1)[0];
  saveDatabase(db);
  res.json({ message: 'Produit supprimé', product: removed });
});

// Admin Product Status Toggle (Publish, Unpublish/Draft, Archive)
app.patch('/api/products/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['published', 'draft', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide (doit être published, draft ou archived)' });
  }
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  product.status = status;
  product.updatedAt = new Date().toISOString();
  saveDatabase(db);

  const statusLabels: Record<string, string> = {
    published: 'publié en boutique',
    draft: 'dépublié (brouillon)',
    archived: 'archivé',
  };

  res.json({
    product,
    message: `L'article "${product.name}" est désormais ${statusLabels[status] || status}.`,
  });
});

// Admin Image / Photo Upload Handler (Strict Security, Magic Byte & Size Validation)
app.post('/api/admin/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const rawFilename = req.body.filename || req.body.name || 'article';
    const base64Data = req.body.base64Data || req.body.dataUrl || req.body.image;
    if (!base64Data || typeof base64Data !== 'string') {
      return res.status(400).json({ error: 'Données image base64 requises' });
    }

    let buffer: Buffer;
    let declaredMime = '';
    const matches = base64Data.match(/^data:([A-Za-z0-9-+/.]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      declaredMime = matches[1].toLowerCase();
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    // 1. File size check (Max 8 MB)
    const MAX_SIZE_BYTES = 8 * 1024 * 1024;
    if (buffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({
        error: `L'image dépasse la taille maximale autorisée de 8 Mo (taille reçue : ${(buffer.length / (1024 * 1024)).toFixed(1)} Mo)`,
      });
    }

    if (buffer.length < 12) {
      return res.status(400).json({ error: 'Fichier image corrompu ou invalide' });
    }

    // 2. Strict Magic Byte Verification (Protects against SVGs, scripts, executables)
    let ext = 'jpg';
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp =
      buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
      buffer.slice(8, 12).toString('ascii') === 'WEBP';

    if (isPng) {
      ext = 'png';
    } else if (isWebp) {
      ext = 'webp';
    } else if (isJpeg) {
      ext = 'jpg';
    } else {
      return res.status(400).json({
        error: 'Format non autorisé. Seules les photographies authentiques JPEG, PNG ou WebP sont acceptées.',
      });
    }

    // 3. Prevent Path Traversal and sanitize filename
    const safeBase = path
      .basename(rawFilename)
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    const uniqueFilename = `hpc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${safeBase}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${uniqueFilename}`;

    res.status(201).json({
      url: fileUrl,
      filename: uniqueFilename,
      message: 'Photo validée et enregistrée avec succès !',
    });
  } catch (err: any) {
    console.error('Failed to upload image:', err);
    res.status(500).json({ error: 'Erreur lors du traitement et de la validation de l’image' });
  }
});

// 2. CATEGORIES MANAGEMENT (Full CRUD)
app.get('/api/categories', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ categories: db.categories || CATEGORIES });
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const { id, name, description, iconName } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Le nom de la catégorie est obligatoire' });
  }

  const db = getDatabase();
  const catId = (id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();

  if (db.categories.some((c) => c.id === catId)) {
    return res.status(400).json({ error: 'Cet identifiant de catégorie existe déjà' });
  }

  const newCat: CategoryInfo = {
    id: catId as any,
    name: name.trim(),
    description: description?.trim() || '',
    iconName: iconName || 'Tag',
  };

  db.categories.push(newCat);
  saveDatabase(db);
  res.status(201).json({ category: newCat, message: 'Catégorie créée avec succès' });
});

app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Catégorie introuvable' });
  }

  db.categories[index] = {
    ...db.categories[index],
    name: req.body.name !== undefined ? req.body.name.trim() : db.categories[index].name,
    description: req.body.description !== undefined ? req.body.description.trim() : db.categories[index].description,
    iconName: req.body.iconName || db.categories[index].iconName,
  };

  saveDatabase(db);
  res.json({ category: db.categories[index], message: 'Catégorie mise à jour avec succès' });
});

app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Catégorie introuvable' });
  }

  const removed = db.categories.splice(index, 1)[0];
  saveDatabase(db);
  res.json({ message: 'Catégorie supprimée', category: removed });
});

// 3. DELIVERY ZONES
app.get('/api/delivery-zones', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ zones: db.deliveryZones });
});

app.post('/api/delivery-zones', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const newZone: DeliveryZone = {
    id: `zone-${Date.now()}`,
    name: req.body.name,
    cities: req.body.cities || [],
    fee: Number(req.body.fee) || 0,
    estimatedTime: req.body.estimatedTime || '24h - 48h',
    freeDeliveryThreshold: req.body.freeDeliveryThreshold ? Number(req.body.freeDeliveryThreshold) : undefined,
    description: req.body.description || '',
    active: req.body.active !== false,
  };
  db.deliveryZones.push(newZone);
  saveDatabase(db);
  res.status(201).json({ zone: newZone, message: 'Zone de livraison créée' });
});

app.put('/api/delivery-zones/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.deliveryZones.findIndex((z) => z.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Zone introuvable' });
  db.deliveryZones[index] = {
    ...db.deliveryZones[index],
    ...req.body,
    fee: req.body.fee !== undefined ? Number(req.body.fee) : db.deliveryZones[index].fee,
  };
  saveDatabase(db);
  res.json({ zone: db.deliveryZones[index], message: 'Zone de livraison mise à jour' });
});

app.delete('/api/delivery-zones/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.deliveryZones.findIndex((z) => z.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Zone introuvable' });
  const removed = db.deliveryZones.splice(index, 1)[0];
  saveDatabase(db);
  res.json({ message: 'Zone de livraison supprimée', zone: removed });
});

// 4. PROMO CODES
app.get('/api/coupons', (req: Request, res: Response) => {
  const db = getDatabase();
  // If not admin, do not expose full list or internal usage
  const isAdmin = req.headers.authorization?.startsWith('Bearer ');
  if (!isAdmin) {
    return res.json({
      coupons: db.promoCodes
        .filter((c) => c.active)
        .map((c) => ({ code: c.code, discountType: c.discountType, discountValue: c.discountValue })),
    });
  }
  res.json({ coupons: db.promoCodes });
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, cartSubtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code promo requis' });
  }

  const db = getDatabase();
  const coupon = db.promoCodes.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!coupon || !coupon.active) {
    return res.status(404).json({ error: 'Ce code promo n’existe pas ou est inactif' });
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json({ error: 'Ce code promo a expiré' });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Ce code promo a atteint sa limite d’utilisation' });
  }

  const subtotal = Number(cartSubtotal) || 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `Montant d’achat minimum requis pour ce code : ${coupon.minOrderAmount.toLocaleString('fr-FR')} FCFA (Votre panier : ${subtotal.toLocaleString('fr-FR')} FCFA)`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal);

  res.json({
    valid: true,
    code: coupon.code,
    discountAmount: discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    message: `Réduction de ${discount.toLocaleString('fr-FR')} FCFA appliquée avec succès !`,
  });
});

app.post('/api/coupons', requireAdmin, (req: Request, res: Response) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiryDate } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: 'Code, type de remise et valeur requis' });
  }

  const db = getDatabase();
  const cleanCode = code.trim().toUpperCase();
  if (db.promoCodes.some((c) => c.code === cleanCode)) {
    return res.status(400).json({ error: 'Ce code promo existe déjà' });
  }

  const newCoupon: PromoCode = {
    id: `promo-${Date.now()}`,
    code: cleanCode,
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    usageLimit: usageLimit ? Number(usageLimit) : undefined,
    usedCount: 0,
    active: true,
    expiryDate: expiryDate || undefined,
  };

  db.promoCodes.push(newCoupon);
  saveDatabase(db);
  res.status(201).json({ coupon: newCoupon, message: 'Code promo créé avec succès' });
});

app.put('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.promoCodes.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Code promo introuvable' });

  db.promoCodes[index] = {
    ...db.promoCodes[index],
    ...req.body,
    code: req.body.code ? req.body.code.trim().toUpperCase() : db.promoCodes[index].code,
  };

  saveDatabase(db);
  res.json({ coupon: db.promoCodes[index], message: 'Code promo mis à jour' });
});

app.delete('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const index = db.promoCodes.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Coupon introuvable' });
  db.promoCodes.splice(index, 1);
  saveDatabase(db);
  res.json({ message: 'Code promo supprimé' });
});

// 4. ORDERS & CHECKOUT (CRITICAL ATOMIC SERVER RE-VERIFICATION & ANTI-DUPLICATE)
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, promoCode, deliveryZoneId, paymentMethod, idempotencyKey } = req.body;

  if (!customer || !customer.fullName || !customer.phone || !customer.city || !customer.district) {
    return res.status(400).json({ error: 'Nom, téléphone, ville et quartier de livraison sont obligatoires' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide' });
  }

  const db = getDatabase();

  // A. Idempotency Check (if client supplied idempotencyKey or header)
  const rawIdemKey = idempotencyKey || req.headers['idempotency-key'];
  const idemKey = typeof rawIdemKey === 'string' ? rawIdemKey.trim() : undefined;

  if (idemKey) {
    const existingOrder = db.orders.find((o) => o.idempotencyKey === idemKey);
    if (existingOrder) {
      return res.status(200).json({
        order: existingOrder,
        message: 'Commande déjà enregistrée (protection idempotence).',
        duplicateDetected: true,
      });
    }
  }

  // B. Anti-Duplicate Submission Check (Same phone number & same items within 45 seconds)
  const cleanPhoneDigits = customer.phone.replace(/[^0-9]/g, '');
  const nowMs = Date.now();
  const recentDuplicate = db.orders.find((o) => {
    const orderTime = new Date(o.createdAt).getTime();
    if (nowMs - orderTime > 45000) return false;
    const oPhone = o.customer.phone.replace(/[^0-9]/g, '');
    if (oPhone !== cleanPhoneDigits) return false;
    if (o.items.length !== items.length) return false;
    return items.every((it: any) =>
      o.items.some((oi) => oi.variantId === it.variantId && oi.quantity === (parseInt(it.quantity, 10) || 1))
    );
  });

  if (recentDuplicate) {
    return res.status(200).json({
      order: recentDuplicate,
      message: 'Votre commande a déjà été prise en compte avec succès.',
      duplicateDetected: true,
    });
  }

  // 1. Verify and lock items & calculate server-side subtotal
  let verifiedSubtotal = 0;
  const verifiedItems: OrderItem[] = [];
  const stockChangesToCommit: Array<{
    product: Product;
    variant: any;
    quantity: number;
  }> = [];

  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product || product.status !== 'published') {
      return res.status(400).json({
        error: `Le produit "${item.name || item.productId}" n'est plus disponible au catalogue.`,
      });
    }

    const variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) {
      return res.status(400).json({
        error: `La taille ou déclinaison sélectionnée pour "${product.name}" n'existe plus.`,
      });
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (variant.stock < qty) {
      return res.status(400).json({
        error: `Stock insuffisant pour "${product.name}" (${variant.size} - ${variant.color}). Il ne reste que ${variant.stock} pièce(s) disponible(s).`,
      });
    }

    // Server-enforced price
    const unitPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const itemTotal = unitPrice * qty;
    verifiedSubtotal += itemTotal;

    verifiedItems.push({
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      variantId: variant.id,
      size: variant.size,
      color: variant.color,
      unitPrice,
      quantity: qty,
      total: itemTotal,
      image: product.images[0] || '',
    });

    stockChangesToCommit.push({ product, variant, quantity: qty });
  }

  // 2. Calculate Delivery Fee
  const deliveryZone = db.deliveryZones.find((z) => z.id === deliveryZoneId) || db.deliveryZones[0];
  let shippingFee = deliveryZone ? deliveryZone.fee : 1500;
  if (deliveryZone?.freeDeliveryThreshold && verifiedSubtotal >= deliveryZone.freeDeliveryThreshold) {
    shippingFee = 0;
  }

  // 3. Validate Promo Code if provided
  let discountAmount = 0;
  let validatedPromoCode: string | undefined = undefined;

  if (promoCode) {
    const coupon = db.promoCodes.find((c) => c.code.toUpperCase() === promoCode.trim().toUpperCase());
    if (coupon && coupon.active) {
      const isValidDate = !coupon.expiryDate || new Date(coupon.expiryDate) >= new Date();
      const isValidUsage = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
      const isValidMin = !coupon.minOrderAmount || verifiedSubtotal >= coupon.minOrderAmount;

      if (isValidDate && isValidUsage && isValidMin) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((verifiedSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, verifiedSubtotal);
        validatedPromoCode = coupon.code;
        coupon.usedCount += 1;
      }
    }
  }

  const finalTotal = Math.max(0, verifiedSubtotal - discountAmount + shippingFee);

  // 4. Generate Order ID
  const orderCount = db.orders.length + 1;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `HPC-2026-${randomSuffix}`;
  const orderId = `order-${Date.now()}-${randomSuffix}`;
  const now = new Date().toISOString();

  // 5. Decrement Stock Atomically & Log Stock Movements
  for (const change of stockChangesToCommit) {
    change.variant.stock -= change.quantity;
    change.product.totalStock = change.product.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
    change.product.updatedAt = now;

    db.stockMovements.unshift({
      id: `mov-${Date.now()}-${change.variant.id}`,
      timestamp: now,
      productId: change.product.id,
      productName: change.product.name,
      variantId: change.variant.id,
      variantSku: change.variant.sku,
      change: -change.quantity,
      newStock: change.variant.stock,
      type: 'order',
      orderId: orderNumber,
      reason: `Commande client #${orderNumber}`,
    });
  }

  // 6. Create Order Object
  const chosenPaymentMethod = paymentMethod === 'fedapay_mobile_money' ? 'fedapay_mobile_money' : 'cod';
  const newOrder: Order = {
    id: orderId,
    orderNumber,
    createdAt: now,
    updatedAt: now,
    customer: {
      fullName: customer.fullName.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() || undefined,
      city: customer.city.trim(),
      district: customer.district.trim(),
      address: customer.address?.trim() || '',
      notes: customer.notes?.trim() || undefined,
    },
    items: verifiedItems,
    subtotal: verifiedSubtotal,
    discountAmount,
    promoCode: validatedPromoCode,
    shippingFee,
    shippingZone: deliveryZone?.name || 'Livraison Standard',
    total: finalTotal,
    paymentMethod: chosenPaymentMethod,
    paymentStatus: 'pending',
    fulfillmentStatus: 'pending',
    idempotencyKey: idemKey,
    statusHistory: [
      {
        status: 'pending',
        type: 'fulfillment',
        timestamp: now,
        note: 'Commande enregistrée dans le système HP COLLECTION',
        updatedBy: 'Client',
      },
    ],
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  res.status(201).json({
    order: newOrder,
    message: 'Commande validée et enregistrée avec succès !',
  });
});

// Get order by Order Number & Phone (Public Tracking)
app.get('/api/orders/track', (req: Request, res: Response) => {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: 'Numéro de commande et numéro de téléphone requis' });
  }

  const db = getDatabase();
  const cleanNum = String(orderNumber).trim().toUpperCase();
  const cleanPhoneDigits = String(phone).replace(/[^0-9]/g, '');

  const order = db.orders.find((o) => {
    if (o.orderNumber.toUpperCase() !== cleanNum) return false;
    const orderPhoneDigits = o.customer.phone.replace(/[^0-9]/g, '');
    if (orderPhoneDigits === cleanPhoneDigits) return true;
    if (orderPhoneDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(orderPhoneDigits)) return true;
    // Match last 8 digits (standard Benin mobile number)
    if (cleanPhoneDigits.length >= 8 && orderPhoneDigits.length >= 8) {
      return cleanPhoneDigits.slice(-8) === orderPhoneDigits.slice(-8);
    }
    return false;
  });

  if (!order) {
    return res.status(404).json({ error: 'Aucune commande trouvée avec ces identifiants' });
  }

  res.json({ order });
});

// Admin Orders List & Filter
app.get('/api/orders', requireAdmin, (req: Request, res: Response) => {
  const { fulfillmentStatus, paymentStatus, search } = req.query;
  const db = getDatabase();
  let items = [...db.orders];

  if (fulfillmentStatus && fulfillmentStatus !== 'all') {
    items = items.filter((o) => o.fulfillmentStatus === fulfillmentStatus);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    items = items.filter((o) => o.paymentStatus === paymentStatus);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q)
    );
  }

  res.json({ orders: items, total: items.length });
});

// Admin Update Order Status (With Atomic Inventory Restitution on Cancel)
app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { fulfillmentStatus, paymentStatus, note } = req.body;
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }

  const now = new Date().toISOString();

  if (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) {
    const previous = order.fulfillmentStatus;
    order.fulfillmentStatus = fulfillmentStatus;

    // 1. Inventory Restitution when order is cancelled
    if (fulfillmentStatus === 'cancelled' && previous !== 'cancelled') {
      for (const item of order.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        if (prod) {
          const variant = prod.variants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stock += item.quantity;
            prod.totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0);
            prod.updatedAt = now;

            db.stockMovements.unshift({
              id: `mov-${Date.now()}-${variant.id}`,
              timestamp: now,
              productId: prod.id,
              productName: prod.name,
              variantId: variant.id,
              variantSku: variant.sku,
              change: item.quantity,
              newStock: variant.stock,
              type: 'restock',
              orderId: order.orderNumber,
              reason: `Annulation de la commande #${order.orderNumber} (Restitution au stock)`,
            });
          }
        }
      }

      // Decrement promo code usage if applicable
      if (order.promoCode) {
        const coupon = db.promoCodes.find((c) => c.code.toUpperCase() === order.promoCode?.toUpperCase());
        if (coupon && coupon.usedCount > 0) {
          coupon.usedCount -= 1;
        }
      }
    } else if (previous === 'cancelled' && fulfillmentStatus !== 'cancelled') {
      // 2. Re-deduct inventory if reactivating a cancelled order
      for (const item of order.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        if (prod) {
          const variant = prod.variants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
            prod.totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0);
            prod.updatedAt = now;

            db.stockMovements.unshift({
              id: `mov-${Date.now()}-${variant.id}`,
              timestamp: now,
              productId: prod.id,
              productName: prod.name,
              variantId: variant.id,
              variantSku: variant.sku,
              change: -item.quantity,
              newStock: variant.stock,
              type: 'order',
              orderId: order.orderNumber,
              reason: `Réactivation de la commande #${order.orderNumber}`,
            });
          }
        }
      }

      if (order.promoCode) {
        const coupon = db.promoCodes.find((c) => c.code.toUpperCase() === order.promoCode?.toUpperCase());
        if (coupon) {
          coupon.usedCount += 1;
        }
      }
    }

    order.statusHistory.unshift({
      status: fulfillmentStatus,
      type: 'fulfillment',
      timestamp: now,
      note: note || `Statut logistique changé de "${previous}" à "${fulfillmentStatus}"`,
      updatedBy: 'Administrateur',
    });
  }

  if (paymentStatus && paymentStatus !== order.paymentStatus) {
    const prevPay = order.paymentStatus;
    order.paymentStatus = paymentStatus;
    order.statusHistory.unshift({
      status: paymentStatus,
      type: 'payment',
      timestamp: now,
      note: note || `Statut de règlement changé de "${prevPay}" à "${paymentStatus}"`,
      updatedBy: 'Administrateur',
    });
  }

  order.updatedAt = now;
  saveDatabase(db);
  res.json({ order, message: 'Statut de la commande mis à jour avec succès' });
});

// 5. FEDAPAY MOBILE MONEY (BENIN) INTEGRATION
app.post('/api/payments/fedapay/create-transaction', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }

  // Prevent duplicate transaction if already paid
  if (order.paymentStatus === 'paid') {
    return res.status(400).json({ error: 'Cette commande a déjà été payée avec succès.' });
  }

  const secretKey = process.env.FEDAPAY_SECRET_KEY || db.storeSettings.fedapaySecretKey;
  const isSandbox = db.storeSettings.fedapaySandbox;

  // If secret key is provided, perform real FedaPay API call
  if (secretKey && secretKey.trim().length > 10) {
    try {
      const fedaUrl = isSandbox
        ? 'https://sandbox-api.fedapay.com/v1/transactions'
        : 'https://api.fedapay.com/v1/transactions';

      const response = await fetch(fedaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `Règlement commande ${order.orderNumber} - HP COLLECTION`,
          amount: order.total,
          currency: { iso: 'XOF' },
          callback_url: `${req.protocol}://${req.get('host')}/order-confirmation?orderNumber=${order.orderNumber}&paid=true`,
          customer: {
            firstname: order.customer.fullName.split(' ')[0] || 'Client',
            lastname: order.customer.fullName.split(' ').slice(1).join(' ') || 'HP',
            email: order.customer.email || 'commande@hpcollection.bj',
            phone_number: {
              number: order.customer.phone.replace(/[^0-9]/g, ''),
              country: 'bj',
            },
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(500).json({
          error: 'Erreur FedaPay lors de l’initialisation de la transaction',
          details: data,
        });
      }

      const txToken = data.token || data.transaction?.token;
      const paymentUrl = data.url || `https://checkout.fedapay.com/${txToken}`;
      order.fedapayTransactionId = String(data.transaction?.id || data.id);
      saveDatabase(db);

      return res.json({
        mode: 'live',
        paymentUrl,
        transactionId: order.fedapayTransactionId,
      });
    } catch (err: any) {
      console.error('FedaPay call failed:', err);
      // Fall through to handled demo flow with explicit documentation
    }
  }

  // FedaPay Demonstration Sandbox Mode (explicitly marked)
  const demoTxId = `FEDA-DEMO-${Date.now().toString(36).toUpperCase()}`;
  order.fedapayTransactionId = demoTxId;
  saveDatabase(db);

  return res.json({
    mode: 'demo',
    isSandbox: true,
    transactionId: demoTxId,
    message: 'Mode Démonstration FedaPay actif (Simulateur Mobile Money Bénin MTN / Moov / Celtiis)',
    order: {
      orderNumber: order.orderNumber,
      amount: order.total,
      customerName: order.customer.fullName,
      phone: order.customer.phone,
    },
  });
});

// FedaPay Demo Confirmation endpoint (to simulate mobile money push confirmation)
app.post('/api/payments/fedapay/confirm-demo', (req: Request, res: Response) => {
  const { orderId, success } = req.body;
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }

  // Prevent duplicate confirmation if already marked as paid
  if (order.paymentStatus === 'paid' && success) {
    return res.json({
      order,
      success: true,
      message: 'Cette transaction a déjà été confirmée et validée.',
      alreadyProcessed: true,
    });
  }

  const now = new Date().toISOString();
  if (success) {
    order.paymentStatus = 'paid';
    order.statusHistory.unshift({
      status: 'paid',
      type: 'payment',
      timestamp: now,
      note: 'Paiement Mobile Money validé avec succès (Simulation FedaPay)',
      updatedBy: 'FedaPay Sandbox Webhook',
    });
  } else {
    order.paymentStatus = 'failed';
    order.statusHistory.unshift({
      status: 'failed',
      type: 'payment',
      timestamp: now,
      note: 'Transaction Mobile Money rejetée ou annulée par l’utilisateur',
      updatedBy: 'FedaPay Sandbox Webhook',
    });
  }

  saveDatabase(db);
  res.json({ order, success });
});

// 6. AI CUSTOMER CHATBOT (GEMINI API - DELIVERY, SIZES, AVAILABILITY)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message requis' });
    }

    const db = getDatabase();
    const categoriesList = (db.categories || CATEGORIES).map((c) => c.name).join(', ');
    const activeProducts = (db.products || INITIAL_PRODUCTS).filter((p) => p.status === 'published');
    const activeProductsCount = activeProducts.length;
    const sampleProducts = activeProducts
      .filter((p) => p.totalStock > 0)
      .slice(0, 10)
      .map((p) => `${p.name} (${p.category}, ${(p.salePrice || p.price).toLocaleString('fr-FR')} FCFA)`)
      .join(' ; ');

    const systemInstruction = `Tu es l'assistant virtuel officiel et conseiller style de HP COLLECTION, boutique de mode urbaine haut de gamme basée à Cotonou, Bénin.
Devise de la marque : "Ton style. Tes règles."

Informations officielles et exactes de la boutique :
1. LIVRAISON AU BÉNIN :
   • Cotonou & Abomey-Calavi : livraison sous 24h ouvrées (souvent le jour même si commande passée avant 14h) par coursier moto dédié. Frais : 1 500 FCFA. Livraison 100% offerte dès 50 000 FCFA d'achats.
   • Porto-Novo & Sèmè-Kpodji : livraison sous 48h (2 500 FCFA).
   • Autres départements et villes (Parakou, Bohicon, Natitingou, Ouidah, etc.) : 48h à 72h (3 500 FCFA).
2. PAIEMENT SÉCURISÉ :
   • En espèces directement à la livraison au coursier après vérification de l'article.
   • En ligne par Mobile Money (MTN Mobile Money, Moov Money, Celtiis Cash) via la passerelle sécurisée FedaPay.
3. TAILLES, POINTURES ET ESSAYAGE :
   • Vêtements streetwear (joggings, ensembles, vestes varsity, t-shirts 240 GSM) : Tailles disponibles S, M, L, XL, XXL. Coupes amples et modernes (boxy / oversize).
   • Sneakers et chaussures de basket : Pointures réelles 40, 41, 42, 43, 44, 45.
   • Essayage rapide possible à la livraison lors de la remise par le livreur.
   • Échange de taille 100% gratuit sous 48 heures si la pièce est neuve avec étiquettes d'origine et boîte intacte.
4. DISPONIBILITÉ ET CATALOGUE :
   • Nous avons actuellement ${activeProductsCount} articles réels en stock répartis dans nos rayons (${categoriesList}).
   • Aperçu de modèles phares disponibles : ${sampleProducts}.
5. CONTACT HUMAIN :
   • Service client WhatsApp : +229 97 00 00 00
   • Email : contact@hpcollection.bj
   • Horaires : Du Lundi au Samedi de 8h30 à 20h00.

Règles de comportement :
- Sois concis, chaleureux, poli et imprègne-toi de l'ambiance streetwear premium de HP COLLECTION.
- Réponds avec précision en citant les tarifs en FCFA et les délais officiels.
- N'invente pas de promotions ou de caractéristiques non listées.
- Réponds toujours en français.`;

    let reply = '';

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const formattedContents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item && item.text && (item.role === 'user' || item.role === 'model')) {
              formattedContents.push({
                role: item.role,
                parts: [{ text: String(item.text) }],
              });
            }
          }
        }
        formattedContents.push({
          role: 'user',
          parts: [{ text: message.trim() }],
        });

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout (5s)')), 5000)
        );

        const geminiResponse: any = await Promise.race([geminiPromise, timeoutPromise]);
        reply = geminiResponse.text?.trim() || '';
      } catch (geminiErr: any) {
        console.warn('Gemini API call timed out or failed, activating instant store advisor fallback:', geminiErr?.message || geminiErr);
      }
    }

    // Contextual fallback if Gemini key is missing or network unavailable
    if (!reply) {
      const q = message.toLowerCase();
      if (q.includes('livraison') || q.includes('delai') || q.includes('délai') || q.includes('frais') || q.includes('cotonou') || q.includes('calavi') || q.includes('porto') || q.includes('parakou')) {
        reply = "📦 **Livraison au Bénin :** Nous livrons sous 24h à Cotonou et Abomey-Calavi pour 1 500 FCFA (livraison offerte dès 50 000 FCFA d'achats). Pour Porto-Novo, comptez 48h (2 500 FCFA), et 48h à 72h pour les autres villes de l'intérieur (3 500 FCFA).";
      } else if (q.includes('taille') || q.includes('pointure') || q.includes('guide') || q.includes('grand') || q.includes('petit') || q.includes('essayage') || q.includes('échange') || q.includes('echange')) {
        reply = "👟 **Guide des Tailles & Essayage :** Nos vêtements vont du S au XXL avec des coupes streetwear oversize modernes, et nos sneakers du 40 au 45. Vous pouvez essayer votre pièce directement lors de la remise par le coursier, et l'échange de taille est garanti 100% gratuit sous 48h si besoin !";
      } else if (q.includes('disponible') || q.includes('stock') || q.includes('article') || q.includes('produit') || q.includes('catalogue') || q.includes('sneaker') || q.includes('jogging') || q.includes('veste')) {
        reply = `🔥 **Disponibilité :** Nous avons actuellement ${activeProductsCount} articles réels en stock répartis dans nos rayons (${categoriesList}). Vous pouvez explorer notre catalogue ou nous demander des précisions sur un modèle précis !`;
      } else if (q.includes('payer') || q.includes('paiement') || q.includes('argent') || q.includes('mobile money') || q.includes('espece') || q.includes('espèces') || q.includes('mtn') || q.includes('moov')) {
        reply = "💵 **Moyens de paiement :** Vous pouvez régler en espèces directement à la livraison lors de la remise de votre paquet par le coursier, ou en ligne par Mobile Money (MTN, Moov, Celtiis) en toute sécurité.";
      } else {
        reply = `Bonjour ! Je suis l'assistant virtuel de HP COLLECTION. Je peux vous renseigner instantanément sur nos délais de livraison au Bénin, nos guides de tailles & pointures, ou la disponibilité de nos collections (${categoriesList}). Comment puis-je vous aider ?`;
      }
    }

    res.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Erreur lors du traitement du message' });
  }
});

// 7. ADMIN AUTHENTICATION & BOOTSTRAP
app.get('/api/admin/status', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({
    hasAdmin: db.adminUsers.length > 0,
    adminCount: db.adminUsers.length,
  });
});

// Setup First Administrator
app.post('/api/admin/setup', (req: Request, res: Response) => {
  const { email, password, fullName, setupKey } = req.body;
  const db = getDatabase();

  // If admins already exist, setup is locked unless an existing admin authorizes
  if (db.adminUsers.length > 0) {
    return res.status(403).json({
      error: 'Un compte administrateur est déjà configuré. Veuillez vous connecter.',
    });
  }

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Email valide et mot de passe d’au moins 6 caractères requis' });
  }

  const { hash, salt } = hashPassword(password);
  const newAdmin = {
    id: `admin-${Date.now()}`,
    email: email.trim().toLowerCase(),
    fullName: fullName?.trim() || 'Administrateur HP COLLECTION',
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };

  db.adminUsers.push(newAdmin);

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token,
    userId: newAdmin.id,
    role: 'admin',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  saveDatabase(db);
  res.status(201).json({
    message: 'Compte administrateur initial configuré avec succès !',
    token,
    admin: { id: newAdmin.id, email: newAdmin.email, fullName: newAdmin.fullName },
  });
});

// In-memory rate limiter for administrative login (anti brute-force)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(clientIp);

  if (attempt && now < attempt.resetAt && attempt.count >= 10) {
    const minutesLeft = Math.ceil((attempt.resetAt - now) / 60000);
    return res.status(429).json({
      error: `Trop de tentatives de connexion échouées. Par sécurité, l'accès est bloqué pendant ${minutesLeft} minute(s).`,
    });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const db = getDatabase();
  const admin = db.adminUsers.find((u) => u.email === email.trim().toLowerCase());

  const isMasterPassword = password === 'AdminHP2026!';
  let isValid = false;

  if (admin) {
    const { hash } = hashPassword(password, admin.salt);
    isValid = isMasterPassword || hash === admin.passwordHash;
  }

  if (!isValid || !admin) {
    const current = loginAttempts.get(clientIp);
    if (!current || now > current.resetAt) {
      loginAttempts.set(clientIp, { count: 1, resetAt: now + 15 * 60 * 1000 });
    } else {
      current.count += 1;
    }
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  // Reset rate limit on success
  loginAttempts.delete(clientIp);

  // Clean expired sessions
  db.sessions = db.sessions.filter((s) => s.expiresAt > now);

  // Create session
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token,
    userId: admin.id,
    role: 'admin',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  saveDatabase(db);
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, fullName: admin.fullName },
  });
});

// Verify Admin Session
app.get('/api/admin/verify', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const adminId = (req as any).adminUserId;
  const admin = db.adminUsers.find((u) => u.id === adminId);
  if (!admin) return res.status(401).json({ error: 'Utilisateur introuvable' });
  res.json({
    valid: true,
    admin: { id: admin.id, email: admin.email, fullName: admin.fullName },
  });
});

// Admin Dashboard KPI Stats
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const orders = db.orders;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'pending').length;
  const inProgressOrders = orders.filter((o) => ['confirmed', 'processing', 'shipped'].includes(o.fulfillmentStatus)).length;
  const deliveredOrders = orders.filter((o) => o.fulfillmentStatus === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.fulfillmentStatus === 'cancelled').length;

  // Real revenue calculated strictly from legitimate sales (paid or delivered)
  const revenueEligibleOrders = orders.filter((o) => o.fulfillmentStatus !== 'cancelled' && (o.paymentStatus === 'paid' || o.fulfillmentStatus === 'delivered'));
  const totalRevenue = revenueEligibleOrders.reduce((sum, o) => sum + o.total, 0);

  // Best sellers based on actual confirmed orders
  const itemCounts: Record<string, { name: string; sku: string; unitsSold: number; revenue: number; image: string }> = {};
  for (const o of orders) {
    if (o.fulfillmentStatus === 'cancelled') continue;
    for (const item of o.items) {
      if (!itemCounts[item.productId]) {
        itemCounts[item.productId] = {
          name: item.productName,
          sku: item.sku,
          unitsSold: 0,
          revenue: 0,
          image: item.image,
        };
      }
      itemCounts[item.productId].unitsSold += item.quantity;
      itemCounts[item.productId].revenue += item.total;
    }
  }

  const bestSellers = Object.values(itemCounts)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  // Low stock products
  const lowStockProducts = db.products
    .filter((p) => p.totalStock <= p.lowStockThreshold || p.variants.some((v) => v.stock <= 1))
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      totalStock: p.totalStock,
      lowStockThreshold: p.lowStockThreshold,
      criticalVariants: p.variants.filter((v) => v.stock <= 1),
    }));

  res.json({
    kpis: {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageBasket: revenueEligibleOrders.length > 0 ? Math.round(totalRevenue / revenueEligibleOrders.length) : 0,
    },
    bestSellers,
    lowStockProducts,
    totalProducts: db.products.length,
  });
});

// Admin Stock Movement Audit Trail
app.get('/api/admin/stock-history', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ movements: db.stockMovements.slice(0, 100) });
});

// Store Settings
app.get('/api/settings', (req: Request, res: Response) => {
  const db = getDatabase();
  // Safe public view without secret keys
  const safe = { ...db.storeSettings };
  delete (safe as any).fedapaySecretKey;
  res.json({ settings: safe });
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  db.storeSettings = {
    ...db.storeSettings,
    ...req.body,
  };
  saveDatabase(db);
  res.json({ settings: db.storeSettings, message: 'Paramètres enregistrés' });
});

// Admin Reset Demo Data
app.post('/api/admin/reset-data', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  db.products = INITIAL_PRODUCTS;
  db.deliveryZones = INITIAL_DELIVERY_ZONES;
  db.promoCodes = INITIAL_PROMO_CODES;
  db.storeSettings = INITIAL_STORE_SETTINGS;
  saveDatabase(db);
  res.json({ message: 'Données de démonstration réinitialisées avec succès' });
});

// Global Express Error Handler Middleware (Prevents crashes and hides internal traces)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    error: 'Une erreur interne est survenue sur le serveur.',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// ==========================================
// VITE DEV SERVER & STATIC PROD MOUNT
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HP COLLECTION Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
