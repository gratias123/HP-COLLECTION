import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
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
  NotificationLog,
  NotificationConfig,
  CustomerRecord,
  LoyaltyProgramConfig,
  LoyaltyTier,
  LoyaltyRewardHistory,
  ContactInquiry,
  ReturnRequest,
  ReturnRequestStatus,
  ReturnReason,
  ReturnResolution,
  ReturnPolicyConfig,
  CommercialDocument,
  CommercialDocumentType,
} from './src/types/index';
import {
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_PROMO_CODES,
  INITIAL_STORE_SETTINGS,
  CATEGORIES,
  DEFAULT_LOYALTY_CONFIG,
  DEFAULT_RETURN_POLICY_CONFIG,
} from './src/data/initialData';
import { NotificationEngine, DEFAULT_NOTIFICATION_CONFIG } from './server/notificationEngine';
import { NotificationOrchestrator } from './server/notificationTriggers';

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

// In production behind reverse proxy (Nginx, Cloudflare, GCP Cloud Run)
app.set('trust proxy', 1);

// 1. HTTP Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HTTPS Strict Transport Security (HSTS) when on HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
});

// 1.b CRITICAL SECURITY: Strictly block any public HTTP access to database files, backups, and internal scripts
app.use((req: Request, res: Response, next: NextFunction) => {
  const url = req.path.toLowerCase();
  if (
    url.startsWith('/data') ||
    url.startsWith('/backups') ||
    url.startsWith('/scripts') ||
    url.startsWith('/server') ||
    url.startsWith('/.env') ||
    url.includes('store.json') ||
    url.includes('.bak') ||
    url.includes('firebase-blueprint')
  ) {
    return res.status(403).json({ error: 'Accès strictement interdit aux ressources système internes' });
  }
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
  notifications: NotificationLog[];
  contactInquiries?: ContactInquiry[];
  loyaltyHistory?: LoyaltyRewardHistory[];
  anonymizedCustomers?: string[];
  returnRequests?: ReturnRequest[];
  adminUsers: Array<{
    id: string;
    email: string;
    fullName: string;
    passwordHash: string;
    salt: string;
    algorithm?: 'scrypt' | 'pbkdf2';
    createdAt: string;
  }>;
  sessions: Array<{
    token: string;
    userId: string;
    role: 'admin';
    expiresAt: number;
  }>;
}

// Modern cryptographic password hashing using Node.js scrypt (memory-hard, GPU-resistant)
function hashPassword(password: string, salt?: string): { hash: string; salt: string; algorithm: 'scrypt' } {
  const generatedSalt = salt || crypto.randomBytes(32).toString('hex');
  const derivedKey = crypto.scryptSync(password, generatedSalt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });
  return { hash: derivedKey.toString('hex'), salt: generatedSalt, algorithm: 'scrypt' };
}

// Timing-safe password verification supporting modern scrypt and legacy PBKDF2 migration
function verifyPassword(
  attempt: string,
  user: { passwordHash: string; salt: string; algorithm?: string }
): { isValid: boolean; needsUpgrade: boolean } {
  try {
    // 1. Check with modern scrypt
    const scryptHash = crypto.scryptSync(attempt, user.salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024,
    }).toString('hex');

    const scryptBuf = Buffer.from(scryptHash, 'hex');
    const userBuf = Buffer.from(user.passwordHash, 'hex');
    if (scryptBuf.length === userBuf.length && crypto.timingSafeEqual(scryptBuf, userBuf)) {
      return { isValid: true, needsUpgrade: false };
    }

    // 2. Check legacy PBKDF2 (1000 iterations) for seamless upgrade
    const pbkdf2Hash = crypto.pbkdf2Sync(attempt, user.salt, 1000, 64, 'sha512').toString('hex');
    const pbkdf2Buf = Buffer.from(pbkdf2Hash, 'hex');
    if (pbkdf2Buf.length === userBuf.length && crypto.timingSafeEqual(pbkdf2Buf, userBuf)) {
      return { isValid: true, needsUpgrade: true };
    }

    return { isValid: false, needsUpgrade: false };
  } catch {
    return { isValid: false, needsUpgrade: false };
  }
}

// Bootstrap initial admin ONLY if explicit env vars are provided and database is empty (no hardcoded credentials)
function ensureDefaultAdmin(adminUsers: DatabaseSchema['adminUsers']) {
  if (adminUsers.length === 0 && process.env.ADMIN_INITIAL_EMAIL && process.env.ADMIN_INITIAL_PASSWORD) {
    const { hash, salt, algorithm } = hashPassword(process.env.ADMIN_INITIAL_PASSWORD);
    adminUsers.push({
      id: `admin-${Date.now()}`,
      email: process.env.ADMIN_INITIAL_EMAIL.trim().toLowerCase(),
      fullName: process.env.ADMIN_INITIAL_NAME || 'Administrateur HP COLLECTION',
      passwordHash: hash,
      salt,
      algorithm,
      createdAt: new Date().toISOString(),
    });
    console.log(`[Admin Security] Compte administrateur initial configuré pour ${process.env.ADMIN_INITIAL_EMAIL}`);
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
      storeSettings: {
        ...INITIAL_STORE_SETTINGS,
        notificationConfig: DEFAULT_NOTIFICATION_CONFIG,
        loyaltyConfig: DEFAULT_LOYALTY_CONFIG,
        returnPolicyConfig: DEFAULT_RETURN_POLICY_CONFIG,
      },
      notifications: [],
      contactInquiries: [],
      loyaltyHistory: [],
      anonymizedCustomers: [],
      returnRequests: [],
      adminUsers: initialAdmins,
      sessions: [],
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Canonical catalog enforcement: purge legacy dummy duplicates (prod-exp-*)
    const initialProductIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
    const productMap = new Map<string, Product>();
    
    // 1. Add canonical products (12 authentic HP photoshoot pieces + unique streetwear essentials)
    for (const p of INITIAL_PRODUCTS) {
      productMap.set(p.id, p);
    }
    
    // 2. Keep any genuine custom products created via admin dashboard (non-legacy prod-exp-*)
    const existingRaw: Product[] = parsed.products || [];
    for (const p of existingRaw) {
      if (!p.id.startsWith('prod-exp-') && !initialProductIds.has(p.id)) {
        productMap.set(p.id, p);
      }
    }
    
    const cleanProducts = Array.from(productMap.values());
    const hasChanged = cleanProducts.length !== existingRaw.length;

    const adminUsers = parsed.adminUsers || [];
    ensureDefaultAdmin(adminUsers);

    const db: DatabaseSchema = {
      products: cleanProducts,
      orders: parsed.orders || [],
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : CATEGORIES,
      promoCodes: parsed.promoCodes || INITIAL_PROMO_CODES,
      deliveryZones: parsed.deliveryZones || INITIAL_DELIVERY_ZONES,
      stockMovements: parsed.stockMovements || [],
      storeSettings: {
        ...INITIAL_STORE_SETTINGS,
        ...(parsed.storeSettings || {}),
        notificationConfig: {
          ...DEFAULT_NOTIFICATION_CONFIG,
          ...(parsed.storeSettings?.notificationConfig || {}),
        },
        loyaltyConfig: {
          ...DEFAULT_LOYALTY_CONFIG,
          ...(parsed.storeSettings?.loyaltyConfig || {}),
        },
        returnPolicyConfig: {
          ...DEFAULT_RETURN_POLICY_CONFIG,
          ...(parsed.storeSettings?.returnPolicyConfig || {}),
        },
      },
      notifications: parsed.notifications || [],
      contactInquiries: parsed.contactInquiries || [],
      loyaltyHistory: parsed.loyaltyHistory || [],
      anonymizedCustomers: parsed.anonymizedCustomers || [],
      returnRequests: parsed.returnRequests || [],
      adminUsers,
      sessions: parsed.sessions || [],
    };
    if (hasChanged) {
      try {
        fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
        console.log(`[Store] Purged duplicates and synced ${cleanProducts.length} unique products to store.json`);
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
      storeSettings: {
        ...INITIAL_STORE_SETTINGS,
        notificationConfig: DEFAULT_NOTIFICATION_CONFIG,
      },
      notifications: [],
      adminUsers: initialAdmins,
      sessions: [],
    };
  }
}

function getNotificationOrchestrator(db: DatabaseSchema): NotificationOrchestrator {
  const config = db.storeSettings.notificationConfig || DEFAULT_NOTIFICATION_CONFIG;
  const engine = new NotificationEngine(config);
  return new NotificationOrchestrator(engine);
}

const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
let lastRollingBackupTime = 0;

function createBackupSnapshot(reason: string = 'auto'): string | null {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) return null;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `store-backup-${timestamp}-${reason}.json`;
    const backupPath = path.join(BACKUPS_DIR, backupFileName);
    fs.copyFileSync(STORE_FILE, backupPath);

    // Keep the last 15 automated rolling snapshots
    const files = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort();
    while (files.length > 15) {
      const oldest = files.shift();
      if (oldest) fs.unlinkSync(path.join(BACKUPS_DIR, oldest));
    }
    return backupFileName;
  } catch (err) {
    console.error('[Backup] Failed to create backup snapshot:', err);
    return null;
  }
}

let inMemoryDbCache: DatabaseSchema | null = null;

function saveDatabase(db: DatabaseSchema) {
  inMemoryDbCache = db;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Rolling backup every 15 minutes upon writes
    const nowMs = Date.now();
    if (nowMs - lastRollingBackupTime > 15 * 60 * 1000) {
      createBackupSnapshot('rolling');
      lastRollingBackupTime = nowMs;
    }

    // POSIX Atomic Write: write to temporary file, flush to storage, atomic rename
    const tempPath = path.join(
      DATA_DIR,
      `store.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}.json`
    );
    const data = JSON.stringify(db, null, 2);
    const fd = fs.openSync(tempPath, 'w');
    fs.writeSync(fd, data, 0, 'utf-8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fs.renameSync(tempPath, STORE_FILE);
  } catch (err: any) {
    // Graceful handling for read-only serverless filesystems (Vercel lambda / cloud functions)
    if (err.code === 'EROFS' || err.code === 'EACCES') {
      try {
        const tmpPath = path.join('/tmp', 'hp_store.json');
        fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
      } catch (tmpErr) {
        // Kept safely in inMemoryDbCache
      }
    } else {
      console.error('[Storage Error] Failed to persist store to disk:', err.message);
    }
  }
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
// DEVOPS & INFRASTRUCTURE HEALTH PROBES
// ==========================================
app.get(['/healthz', '/api/health'], (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const diskWritable = fs.existsSync(DATA_DIR);
    const uploadsWritable = fs.existsSync(UPLOAD_DIR);
    const memory = process.memoryUsage();

    res.status(200).json({
      status: 'healthy',
      app: 'HP COLLECTION',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: 'connected',
          writable: diskWritable,
          productsCount: (db.products || []).length,
          ordersCount: (db.orders || []).length,
          categoriesCount: (db.categories || []).length,
        },
        storage: {
          uploadsDir: uploadsWritable,
          uploadsPath: '/public/uploads',
        },
        memory: {
          rssMb: Math.round(memory.rss / (1024 * 1024)),
          heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
          heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
        },
        integrations: {
          fedapayConfigured: Boolean(db.storeSettings?.fedapayPublicKey || process.env.FEDAPAY_PUBLIC_KEY),
          fedapayMode: db.storeSettings?.fedapayPublicKey ? 'live' : 'sandbox',
          geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
          notificationsActive: Boolean(
            db.storeSettings?.notificationConfig?.whatsappEnabled || db.storeSettings?.notificationConfig?.emailEnabled
          ),
        },
      },
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ==========================================
// SYSTEM BACKUP & DATA PROTECTION ENDPOINTS
// ==========================================
app.get('/api/admin/backups', requireAdmin, (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      return res.json({ backups: [] });
    }
    const files = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((fileName) => {
        const stats = fs.statSync(path.join(BACKUPS_DIR, fileName));
        return {
          fileName,
          sizeBytes: stats.size,
          sizeKb: Math.round(stats.size / 1024),
          createdAt: stats.birthtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ backups: files });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la lecture des sauvegardes', details: err.message });
  }
});

app.post('/api/admin/backups/create', requireAdmin, (req: Request, res: Response) => {
  try {
    const filename = createBackupSnapshot('manual_admin');
    if (!filename) {
      return res.status(500).json({ error: 'Échec de la génération de la sauvegarde' });
    }
    res.status(201).json({
      message: 'Sauvegarde complète créée avec succès !',
      fileName: filename,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la création de la sauvegarde', details: err.message });
  }
});

app.post('/api/admin/backups/restore', requireAdmin, (req: Request, res: Response) => {
  const { fileName } = req.body;
  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).json({ error: 'Nom du fichier de sauvegarde requis' });
  }

  // Prevent path traversal
  const safeName = path.basename(fileName);
  const targetPath = path.join(BACKUPS_DIR, safeName);
  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ error: 'Fichier de sauvegarde introuvable' });
  }

  try {
    // 1. Safety snapshot of current state before restore
    createBackupSnapshot('pre_restore_safety');

    // 2. Read and validate target file
    const raw = fs.readFileSync(targetPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.products || !parsed.orders) {
      return res.status(400).json({ error: 'Structure de sauvegarde non conforme' });
    }

    // 3. Atomically overwrite
    saveDatabase(parsed);
    res.json({ message: `Base de données restaurée avec succès depuis "${safeName}"` });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la restauration', details: err.message });
  }
});

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
      items = items.filter((p) => !p.status || p.status === 'published');
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

  // -------------------------------------------------------------
  // AUTOMATED NOTIFICATIONS & ALERTS DISPATCH
  // -------------------------------------------------------------
  const orchestrator = getNotificationOrchestrator(db);
  const customerConsent = req.body.customerConsent !== false;

  // Asynchronous non-blocking dispatch with persistence
  (async () => {
    try {
      const generatedLogs: NotificationLog[] = [];

      // 1. Client Order Reception Confirmation
      const clientLogs = await orchestrator.notifyClientOrderReceived(newOrder, customerConsent);
      generatedLogs.push(...clientLogs);

      // 2. Admin New Order Alert
      const adminLogs = await orchestrator.alertAdminNewOrder(newOrder);
      generatedLogs.push(...adminLogs);

      // 3. Admin Stock Level & Stockout Alerts
      for (const change of stockChangesToCommit) {
        const stockLogs = await orchestrator.alertAdminStockLevels(change.product, change.variant);
        generatedLogs.push(...stockLogs);
      }

      if (generatedLogs.length > 0) {
        const freshDb = getDatabase();
        if (!freshDb.notifications) freshDb.notifications = [];
        freshDb.notifications.unshift(...generatedLogs);
        saveDatabase(freshDb);
      }
    } catch (notifErr) {
      console.error('Error during automated notification dispatch:', notifErr);
    }
  })();

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

  // Mask sensitive customer personal information for privacy
  const rawPhone = order.customer.phone;
  const digits = rawPhone.replace(/[^0-9]/g, '');
  const maskedPhone =
    digits.length >= 8
      ? `${rawPhone.slice(0, Math.max(0, rawPhone.length - 6))}•• •• ${digits.slice(-2)}`
      : rawPhone;

  const rawEmail = order.customer.email;
  const maskedEmail = rawEmail
    ? rawEmail.replace(/(.{2})(.*)(@.*)/, '$1••••$3')
    : undefined;

  const rawAddress = order.customer.address;
  const maskedAddress = rawAddress
    ? rawAddress.length > 10
      ? `${rawAddress.slice(0, 8)}...`
      : rawAddress
    : undefined;

  const safeOrder = {
    ...order,
    customer: {
      fullName: order.customer.fullName,
      phone: maskedPhone,
      email: maskedEmail,
      city: order.customer.city,
      district: order.customer.district,
      address: maskedAddress,
    },
  };

  res.json({ order: safeOrder });
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

  // Automated notification dispatches based on fulfillment or payment status changes
  const orchestrator = getNotificationOrchestrator(db);
  (async () => {
    try {
      const generatedLogs: NotificationLog[] = [];

      // 1. Client notification on status progression (confirmed, processing, shipped, delivered)
      if (fulfillmentStatus) {
        const clientLogs = await orchestrator.notifyClientFulfillmentStatus(order, fulfillmentStatus);
        generatedLogs.push(...clientLogs);
      }

      // 2. Admin notification on payment status change
      if (paymentStatus === 'paid') {
        const payLogs = await orchestrator.alertAdminPaymentConfirmed(order, 'Validation Manuelle Administrateur');
        generatedLogs.push(...payLogs);
      } else if (paymentStatus === 'failed') {
        const failLogs = await orchestrator.alertAdminPaymentFailed(order, note || 'Échec déclaré par administrateur');
        generatedLogs.push(...failLogs);
      }

      if (generatedLogs.length > 0) {
        const freshDb = getDatabase();
        if (!freshDb.notifications) freshDb.notifications = [];
        freshDb.notifications.unshift(...generatedLogs);
        saveDatabase(freshDb);
      }
    } catch (err) {
      console.error('Failed to dispatch status update notifications:', err);
    }
  })();

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

// Direct server-to-server transaction verification against FedaPay API
app.get('/api/payments/fedapay/verify-transaction/:transactionId', async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const db = getDatabase();
  const secretKey = process.env.FEDAPAY_SECRET_KEY || db.storeSettings.fedapaySecretKey;
  const isSandbox = db.storeSettings.fedapaySandbox;

  if (!secretKey || secretKey.trim().length < 10) {
    return res.status(400).json({ error: 'Clé secrète FedaPay non configurée sur le serveur' });
  }

  try {
    const fedaUrl = isSandbox
      ? `https://sandbox-api.fedapay.com/v1/transactions/${transactionId}`
      : `https://api.fedapay.com/v1/transactions/${transactionId}`;

    const response = await fetch(fedaUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Transaction FedaPay introuvable ou erreur API',
        details: data,
      });
    }

    const tx = data.v1?.transaction || data.transaction || data;
    const isApproved = tx.status === 'approved';

    // If transaction is approved, update order in db if present
    const order = db.orders.find(
      (o) =>
        o.fedapayTransactionId === String(transactionId) ||
        (tx.reference && o.orderNumber === tx.reference) ||
        (tx.custom_metadata?.orderNumber && o.orderNumber === tx.custom_metadata.orderNumber)
    );

    if (order && isApproved && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.fedapayTransactionId = String(transactionId);
      order.updatedAt = new Date().toISOString();
      order.statusHistory.unshift({
        status: 'paid',
        type: 'payment',
        timestamp: new Date().toISOString(),
        note: `Paiement vérifié avec succès via interrogation directe FedaPay API (Tx #${transactionId})`,
        updatedBy: 'FedaPay Server API Verification',
      });
      saveDatabase(db);
    }

    return res.json({
      verified: true,
      status: tx.status,
      isApproved,
      amount: tx.amount,
      orderNumber: order?.orderNumber,
      paymentStatus: order?.paymentStatus || (isApproved ? 'paid' : 'pending'),
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Impossible de vérifier la transaction auprès de FedaPay',
      details: err.message,
    });
  }
});

// FedaPay Demo Confirmation endpoint (to simulate mobile money push confirmation in test environment)
app.post('/api/payments/fedapay/confirm-demo', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_FEDAPAY_DEMO) {
    return res.status(403).json({
      error: 'Le simulateur de démonstration Mobile Money est désactivé en production. Utilisez les webhooks FedaPay officiels.',
    });
  }

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

  // Automated notification dispatch for verified server payment
  const orchestrator = getNotificationOrchestrator(db);
  (async () => {
    try {
      const generatedLogs: NotificationLog[] = [];
      if (success) {
        const payLogs = await orchestrator.alertAdminPaymentConfirmed(order, 'FedaPay Mobile Money Webhook Certifié');
        generatedLogs.push(...payLogs);
      } else {
        const failLogs = await orchestrator.alertAdminPaymentFailed(order, 'Transaction Mobile Money rejetée ou annulée par l’utilisateur');
        generatedLogs.push(...failLogs);
      }

      if (generatedLogs.length > 0) {
        const freshDb = getDatabase();
        if (!freshDb.notifications) freshDb.notifications = [];
        freshDb.notifications.unshift(...generatedLogs);
        saveDatabase(freshDb);
      }
    } catch (e) {
      console.error('Failed to dispatch payment notifications:', e);
    }
  })();

  saveDatabase(db);
  res.json({ order, success });
});

// 5.b OFFICIAL FEDAPAY PRODUCTION WEBHOOK (HMAC / SIGNATURE & IDEMPOTENCY)
app.post('/api/payments/fedapay/webhook', async (req: Request, res: Response) => {
  const event = req.body;
  const signature = req.headers['x-fedapay-signature'] || req.headers['fedapay-signature'];

  // Verify HMAC signature if secret is defined
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (webhookSecret && signature) {
    try {
      const hmac = crypto.createHmac('sha256', webhookSecret.trim());
      const rawPayload = JSON.stringify(req.body);
      const calculated = hmac.update(rawPayload).digest('hex');
      const cleanSig = String(signature).replace(/^sha256=/, '');
      if (cleanSig !== calculated && !cleanSig.includes(calculated)) {
        console.warn('[FedaPay Webhook] Alerte: divergence de signature sur le webhook entrant');
      }
    } catch (sigErr) {
      console.error('[FedaPay Webhook] Erreur de vérification signature:', sigErr);
    }
  }

  if (!event || (!event.name && !event.event && !event.status)) {
    return res.status(400).json({ error: 'Payload de webhook FedaPay invalide' });
  }

  const eventName = event.name || event.event || (event.status === 'approved' ? 'transaction.approved' : '');
  const entity = event.entity || event.data || event;
  const transactionId = entity.id ? String(entity.id) : undefined;
  const orderRef = entity.reference || entity.custom_metadata?.orderNumber || entity.custom_metadata?.orderId;
  const amount = Number(entity.amount || entity.received_amount || 0);

  const db = getDatabase();

  // Look up order by reference, orderNumber, id, or stored fedapayTransactionId
  const order = db.orders.find(
    (o) =>
      (orderRef && (o.orderNumber === orderRef || o.id === orderRef)) ||
      (transactionId && o.fedapayTransactionId === transactionId)
  );

  if (!order) {
    console.warn(`[FedaPay Webhook] Commande introuvable pour référence=${orderRef}, tx=${transactionId}`);
    return res.status(200).json({ received: true, warning: 'Commande non trouvée dans la base locale' });
  }

  // Idempotency: prevent double confirmation or duplicate logs
  if (order.paymentStatus === 'paid') {
    return res.status(200).json({
      received: true,
      alreadyProcessed: true,
      message: 'Transaction déjà confirmée et validée pour cette commande',
    });
  }

  const isApproved = eventName === 'transaction.approved' || entity.status === 'approved';
  const isDeclined =
    eventName === 'transaction.canceled' ||
    eventName === 'transaction.declined' ||
    entity.status === 'declined' ||
    entity.status === 'canceled';

  if (!isApproved && !isDeclined) {
    return res.status(200).json({ received: true, status: 'ignored_event' });
  }

  // Server-side amount validation against order total
  if (isApproved && amount > 0 && Math.abs(amount - order.total) > 5) {
    console.error(`[FedaPay Webhook] Divergence de montant! Reçu: ${amount}, Attendu: ${order.total}`);
    return res.status(400).json({ error: 'Montant de transaction incompatible avec la commande' });
  }

  const now = new Date().toISOString();
  if (isApproved) {
    order.paymentStatus = 'paid';
    if (transactionId) order.fedapayTransactionId = transactionId;
    order.updatedAt = now;
    order.statusHistory.unshift({
      status: 'paid',
      type: 'payment',
      timestamp: now,
      note: `Paiement Mobile Money validé via Webhook FedaPay certifié (Tx #${transactionId || 'N/A'})`,
      updatedBy: 'FedaPay Official Webhook',
    });

    // Automated notification dispatch
    const orchestrator = getNotificationOrchestrator(db);
    try {
      const payLogs = await orchestrator.alertAdminPaymentConfirmed(
        order,
        `FedaPay Webhook (${transactionId || 'MTN/Moov/Celtiis'})`
      );
      if (payLogs.length > 0) {
        if (!db.notifications) db.notifications = [];
        db.notifications.unshift(...payLogs);
      }
    } catch (e) {
      console.error('Failed to dispatch webhook payment notification:', e);
    }
  } else if (isDeclined) {
    order.paymentStatus = 'failed';
    order.updatedAt = now;
    order.statusHistory.unshift({
      status: 'failed',
      type: 'payment',
      timestamp: now,
      note: `Transaction Mobile Money rejetée ou annulée (Webhook FedaPay, Tx #${transactionId || 'N/A'})`,
      updatedBy: 'FedaPay Official Webhook',
    });
  }

  saveDatabase(db);
  return res.status(200).json({
    received: true,
    success: true,
    orderId: order.orderNumber,
    status: order.paymentStatus,
  });
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
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 12000)
        );

        const geminiResponse: any = await Promise.race([geminiPromise, timeoutPromise]);
        reply = geminiResponse.text?.trim() || '';
      } catch {
        // Quiet fallback to instant local store advisor
        reply = '';
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

  if (attempt && now < attempt.resetAt && attempt.count >= 5) {
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

  let isValid = false;
  let needsUpgrade = false;

  if (admin) {
    const check = verifyPassword(password, admin);
    isValid = check.isValid;
    needsUpgrade = check.needsUpgrade;
  }

  if (!isValid || !admin) {
    const current = loginAttempts.get(clientIp);
    if (!current || now > current.resetAt) {
      loginAttempts.set(clientIp, { count: 1, resetAt: now + 15 * 60 * 1000 });
    } else {
      current.count += 1;
    }
    return res.status(401).json({ error: 'Identifiants administrateur incorrects' });
  }

  // Automatic upgrade to modern scrypt hash if legacy format
  if (needsUpgrade) {
    const upgraded = hashPassword(password);
    admin.passwordHash = upgraded.hash;
    admin.salt = upgraded.salt;
    admin.algorithm = 'scrypt';
  }

  // Reset rate limit on success
  loginAttempts.delete(clientIp);

  // Clean expired sessions
  db.sessions = db.sessions.filter((s) => s.expiresAt > now);

  // Create session with 24h duration (OWASP compliant session window)
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token,
    userId: admin.id,
    role: 'admin',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
  });

  saveDatabase(db);
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, fullName: admin.fullName },
  });
});

// Admin Logout (Explicit Server-Side Session Revocation)
app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const db = getDatabase();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDatabase(db);
  res.json({ success: true, message: 'Session administrateur révoquée avec succès' });
});

// Admin Password Change
app.post('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 8 caractères' });
  }

  const db = getDatabase();
  const adminId = (req as any).adminUserId;
  const admin = db.adminUsers.find((u) => u.id === adminId);
  if (!admin) return res.status(401).json({ error: 'Compte administrateur introuvable' });

  const { isValid } = verifyPassword(currentPassword, admin);
  if (!isValid) {
    return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  }

  const upgraded = hashPassword(newPassword);
  admin.passwordHash = upgraded.hash;
  admin.salt = upgraded.salt;
  admin.algorithm = 'scrypt';

  // Revoke all other active sessions for security
  const currentToken = req.headers.authorization?.split(' ')[1];
  db.sessions = db.sessions.filter((s) => s.token === currentToken);

  saveDatabase(db);
  res.json({ success: true, message: 'Mot de passe administrateur mis à jour avec succès' });
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

// ==========================================
// NOTIFICATIONS & AUTOMATION AUDIT & DISPATCH
// ==========================================

// 1. Get Notification Logs with Filtering & Stats
app.get('/api/admin/notifications', requireAdmin, (req: Request, res: Response) => {
  const { eventType, status, channel, search, limit } = req.query;
  const db = getDatabase();
  let logs = db.notifications || [];

  if (eventType && eventType !== 'all') {
    logs = logs.filter((n) => n.eventType === eventType);
  }

  if (status && status !== 'all') {
    logs = logs.filter((n) => n.status === status);
  }

  if (channel && channel !== 'all') {
    logs = logs.filter((n) => n.channel === channel);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    logs = logs.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.recipient.name.toLowerCase().includes(q) ||
        (n.recipient.phone && n.recipient.phone.includes(q)) ||
        (n.recipient.email && n.recipient.email.toLowerCase().includes(q)) ||
        (n.providerMessageId && n.providerMessageId.toLowerCase().includes(q))
    );
  }

  // Calculate aggregated stats
  const allLogs = db.notifications || [];
  const total = allLogs.length;
  const sent = allLogs.filter((n) => n.status === 'sent').length;
  const failed = allLogs.filter((n) => n.status === 'failed').length;
  const pending = allLogs.filter((n) => n.status === 'pending' || n.status === 'retrying').length;
  const blocked = allLogs.filter((n) => n.status === 'blocked_no_consent').length;
  const successRate = total > 0 ? Math.round((sent / total) * 100) : 100;

  const maxItems = limit ? parseInt(limit as string, 10) : 100;
  res.json({
    notifications: logs.slice(0, maxItems),
    total: logs.length,
    stats: {
      total,
      sent,
      failed,
      pending,
      blocked,
      successRate,
    },
  });
});

// 2. Retry Failed Notification
app.post('/api/admin/notifications/:id/retry', requireAdmin, async (req: Request, res: Response) => {
  const db = getDatabase();
  const index = (db.notifications || []).findIndex((n) => n.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Notification introuvable' });
  }

  const notif = db.notifications[index];
  const config = db.storeSettings.notificationConfig || DEFAULT_NOTIFICATION_CONFIG;
  const engine = new NotificationEngine(config);

  const updatedLog = await engine.retryNotification(notif);
  db.notifications[index] = updatedLog;
  saveDatabase(db);

  res.json({
    notification: updatedLog,
    message: updatedLog.status === 'sent'
      ? 'Notification réexpédiée et confirmée par le prestataire !'
      : `Échec de la tentative : ${updatedLog.error || 'Erreur prestataire'}`,
  });
});

// 3. Get Notification Settings
app.get('/api/admin/notifications/config', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const config = db.storeSettings.notificationConfig || DEFAULT_NOTIFICATION_CONFIG;
  // Mask sensitive Meta token
  const safeConfig = { ...config };
  if (safeConfig.metaWhatsappToken) {
    safeConfig.metaWhatsappToken = `${safeConfig.metaWhatsappToken.slice(0, 8)}...***`;
  }
  res.json({ config: safeConfig });
});

// 4. Update Notification Settings
app.put('/api/admin/notifications/config', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const current = db.storeSettings.notificationConfig || DEFAULT_NOTIFICATION_CONFIG;
  const incoming = req.body;

  // Preserve existing token if masked token string is sent back
  let token = incoming.metaWhatsappToken;
  if (token && token.includes('...***')) {
    token = current.metaWhatsappToken;
  }

  db.storeSettings.notificationConfig = {
    ...current,
    ...incoming,
    metaWhatsappToken: token || current.metaWhatsappToken,
  };

  saveDatabase(db);
  res.json({
    config: db.storeSettings.notificationConfig,
    message: 'Configuration des automatisations et notifications mise à jour avec succès.',
  });
});

// 5. Test Notification Dispatch
app.post('/api/admin/notifications/test', requireAdmin, async (req: Request, res: Response) => {
  const { channel, target, eventType } = req.body;
  if (!channel || !target) {
    return res.status(400).json({ error: 'Canal et destinataire (téléphone ou email) requis' });
  }

  const db = getDatabase();
  const config = db.storeSettings.notificationConfig || DEFAULT_NOTIFICATION_CONFIG;
  const engine = new NotificationEngine(config);

  const testTitle = `🧪 Test de Notification HP COLLECTION [${channel.toUpperCase()}]`;
  const testContent = `Bonjour ! Ceci est un message test certifié envoyé par le moteur d’automatisation HP COLLECTION Bénin le ${new Date().toLocaleString('fr-FR')}.\n\nSi vous recevez ce message, votre intégration ${channel.toUpperCase()} est opérationnelle.`;

  const log = await engine.dispatchNotification({
    eventType: (eventType as any) || 'admin_new_order',
    recipientType: 'admin',
    recipient: {
      name: 'Administrateur Test',
      phone: channel === 'whatsapp' ? target : undefined,
      email: channel === 'email' ? target : undefined,
    },
    channel,
    title: testTitle,
    content: testContent,
    consentLegalBasis: 'legitimate_interest',
    metadata: {
      failureReason: 'Test manuel console admin',
    },
  });

  if (!db.notifications) db.notifications = [];
  db.notifications.unshift(log);
  saveDatabase(db);

  res.json({
    notification: log,
    message: log.status === 'sent'
      ? `Notification test confirmée avec succès (Réf: ${log.providerMessageId})`
      : `Échec du test : ${log.error}`,
  });
});

// 6. Clear Logs
app.delete('/api/admin/notifications', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const count = (db.notifications || []).length;
  db.notifications = [];
  saveDatabase(db);
  res.json({ message: `${count} entrée(s) de journal purgée(s)` });
});

// ==========================================
// CRM & GESTION DE LA CLIENTÈLE HP COLLECTION
// ==========================================

function normalizeCustomerPhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/[^0-9]/g, '');
  return digits.slice(-8); // Derniers 8 chiffres béninois
}

function getCustomerId(phone: string, email?: string): string {
  const normPhone = normalizeCustomerPhone(phone);
  if (normPhone) {
    return `cust-${normPhone}`;
  }
  const cleanEmail = (email || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
  return `cust-${cleanEmail || 'anon'}`;
}

function determineLoyaltyTier(totalPaid: number, loyaltyConfig: LoyaltyProgramConfig): LoyaltyTier {
  if (!loyaltyConfig || !loyaltyConfig.enabled) return 'standard';
  const tiers = [...loyaltyConfig.tiers].sort((a, b) => b.minSpent - a.minSpent);
  for (const t of tiers) {
    if (totalPaid >= t.minSpent) {
      return t.tier;
    }
  }
  return 'standard';
}

function getAggregatedCustomers(db: DatabaseSchema): CustomerRecord[] {
  const loyaltyConfig = db.storeSettings.loyaltyConfig || DEFAULT_LOYALTY_CONFIG;
  const anonymizedSet = new Set(db.anonymizedCustomers || []);
  const customerMap = new Map<string, {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    cities: Set<string>;
    districts: Set<string>;
    addresses: Set<string>;
    notes: Set<string>;
    orders: Order[];
    firstOrderDate: string;
    lastOrderDate: string;
  }>();

  // 1. Ingestion des commandes réelles
  for (const order of db.orders) {
    if (!order.customer) continue;
    const cid = getCustomerId(order.customer.phone, order.customer.email);
    let entry = customerMap.get(cid);
    if (!entry) {
      entry = {
        id: cid,
        fullName: order.customer.fullName || 'Client sans nom',
        phone: order.customer.phone,
        email: order.customer.email,
        cities: new Set<string>(),
        districts: new Set<string>(),
        addresses: new Set<string>(),
        notes: new Set<string>(),
        orders: [],
        firstOrderDate: order.createdAt,
        lastOrderDate: order.createdAt,
      };
      customerMap.set(cid, entry);
    }

    if (new Date(order.createdAt).getTime() >= new Date(entry.lastOrderDate).getTime()) {
      if (order.customer.fullName) entry.fullName = order.customer.fullName;
      if (order.customer.phone) entry.phone = order.customer.phone;
      if (order.customer.email) entry.email = order.customer.email;
      entry.lastOrderDate = order.createdAt;
    }

    if (new Date(order.createdAt).getTime() < new Date(entry.firstOrderDate).getTime()) {
      entry.firstOrderDate = order.createdAt;
    }

    if (order.customer.city) entry.cities.add(order.customer.city);
    if (order.customer.district) entry.districts.add(order.customer.district);
    if (order.customer.address) entry.addresses.add(order.customer.address);
    if (order.customer.notes) entry.notes.add(order.customer.notes);

    entry.orders.push(order);
  }

  // 2. Ingestion des demandes de contact
  const inquiries = db.contactInquiries || [];
  for (const inq of inquiries) {
    const cid = getCustomerId(inq.customerPhone, inq.customerEmail);
    if (!customerMap.has(cid)) {
      customerMap.set(cid, {
        id: cid,
        fullName: inq.customerName || 'Prospect / Client',
        phone: inq.customerPhone,
        email: inq.customerEmail,
        cities: new Set<string>(),
        districts: new Set<string>(),
        addresses: new Set<string>(),
        notes: new Set<string>(),
        orders: [],
        firstOrderDate: inq.createdAt,
        lastOrderDate: inq.createdAt,
      });
    }
  }

  // 3. Calculs des métriques strictes
  const result: CustomerRecord[] = [];
  const rewards = db.loyaltyHistory || [];

  for (const [cid, entry] of customerMap.entries()) {
    entry.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalOrdersCount = entry.orders.length;
    const completedOrdersCount = entry.orders.filter((o) => o.fulfillmentStatus === 'delivered').length;
    const pendingOrdersCount = entry.orders.filter(
      (o) => o.fulfillmentStatus !== 'delivered' && o.fulfillmentStatus !== 'cancelled'
    ).length;
    const cancelledOrdersCount = entry.orders.filter((o) => o.fulfillmentStatus === 'cancelled').length;

    // RÈGLE STRICTE : Achats réellement encaissés (paymentStatus === 'paid')
    const totalPaidAmount = entry.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const totalPendingAmount = entry.orders
      .filter((o) => o.paymentStatus === 'pending')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Points de fidélité
    const basePoints = Math.floor(totalPaidAmount / 1000) * (loyaltyConfig.pointsPer1000FCFA || 1);
    const manualPoints = rewards
      .filter((r) => r.customerId === cid)
      .reduce((sum, r) => sum + (r.pointsChange || 0), 0);
    const loyaltyPoints = Math.max(0, basePoints + manualPoints);

    const loyaltyTier = determineLoyaltyTier(totalPaidAmount, loyaltyConfig);

    // Réclamations & demandes
    const clientInquiries = inquiries.filter((inq) => {
      const inqPhoneNorm = normalizeCustomerPhone(inq.customerPhone);
      const entryPhoneNorm = normalizeCustomerPhone(entry.phone);
      return (
        (inqPhoneNorm && inqPhoneNorm === entryPhoneNorm) ||
        (inq.customerEmail && entry.email && inq.customerEmail.toLowerCase() === entry.email.toLowerCase())
      );
    });

    const hasPendingClaim = clientInquiries.some(
      (inq) => inq.status === 'pending' || inq.status === 'in_progress'
    );

    // Tags
    const tags: ('nouveau' | 'regulier' | 'vip' | 'reclamation')[] = [];
    if (hasPendingClaim) tags.push('reclamation');
    if (loyaltyTier === 'vip' || totalPaidAmount >= 250000 || totalOrdersCount >= 4) {
      tags.push('vip');
    } else if (totalOrdersCount >= 2) {
      tags.push('regulier');
    } else if (totalOrdersCount === 1) {
      tags.push('nouveau');
    }

    const normDigits = normalizeCustomerPhone(entry.phone);
    const customPromoCodes = (db.promoCodes || [])
      .filter((pc) => (normDigits && pc.code.includes(normDigits)) || pc.code.toLowerCase().includes(cid))
      .map((pc) => pc.code);

    const isAnonymized = anonymizedSet.has(cid);

    result.push({
      id: cid,
      fullName: isAnonymized ? 'Client Anonymisé (RGPD)' : entry.fullName,
      phone: isAnonymized ? '01••••' + entry.phone.slice(-4) : entry.phone,
      email: isAnonymized && entry.email ? '••••@••••' : entry.email,
      cities: isAnonymized ? [] : Array.from(entry.cities),
      districts: isAnonymized ? [] : Array.from(entry.districts),
      addresses: isAnonymized ? [] : Array.from(entry.addresses),
      notes: isAnonymized ? [] : Array.from(entry.notes),
      firstOrderDate: entry.firstOrderDate,
      lastOrderDate: entry.lastOrderDate,
      totalOrdersCount,
      completedOrdersCount,
      pendingOrdersCount,
      cancelledOrdersCount,
      totalPaidAmount,
      totalPendingAmount,
      loyaltyPoints,
      loyaltyTier,
      orderIds: entry.orders.map((o) => o.id),
      orders: entry.orders,
      customPromoCodes,
      tags,
      inquiriesCount: clientInquiries.length,
      lastInquiryDate: clientInquiries[0]?.createdAt,
      anonymized: isAnonymized,
    });
  }

  result.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
  return result;
}

// 1. Liste des Clients (Recherche, Filtres, KPIs réels)
app.get('/api/admin/customers', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { search, tier, status } = req.query;
  const all = getAggregatedCustomers(db);

  let filtered = [...all];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.cities.some((city) => city.toLowerCase().includes(q)) ||
        c.districts.some((dist) => dist.toLowerCase().includes(q))
    );
  }

  if (tier && typeof tier === 'string' && tier !== 'all') {
    filtered = filtered.filter((c) => c.loyaltyTier === tier);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    if (status === 'regular') {
      filtered = filtered.filter((c) => c.tags.includes('regulier') || c.tags.includes('vip'));
    } else if (status === 'vip') {
      filtered = filtered.filter((c) => c.tags.includes('vip'));
    } else if (status === 'pending_orders') {
      filtered = filtered.filter((c) => c.pendingOrdersCount > 0);
    } else if (status === 'claim') {
      filtered = filtered.filter((c) => c.tags.includes('reclamation'));
    }
  }

  const totalRevenuePaid = all.reduce((sum, c) => sum + c.totalPaidAmount, 0);
  const regularCustomers = all.filter((c) => c.tags.includes('regulier') || c.tags.includes('vip')).length;
  const vipCustomers = all.filter((c) => c.tags.includes('vip')).length;
  const pendingOrdersCount = all.reduce((sum, c) => sum + c.pendingOrdersCount, 0);
  const pendingInquiriesCount = (db.contactInquiries || []).filter(
    (i) => i.status === 'pending' || i.status === 'in_progress'
  ).length;

  res.json({
    customers: filtered,
    total: filtered.length,
    stats: {
      totalCustomers: all.length,
      regularCustomers,
      vipCustomers,
      totalRevenuePaid,
      pendingOrdersCount,
      pendingInquiriesCount,
    },
  });
});

// 2. Détail d'un Client (Fiche Client 360°)
app.get('/api/admin/customers/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const all = getAggregatedCustomers(db);
  const customer = all.find((c) => c.id === id);

  if (!customer) {
    return res.status(404).json({ error: 'Client introuvable dans la base de données' });
  }

  const normPhone = normalizeCustomerPhone(customer.phone);
  const clientInquiries = (db.contactInquiries || []).filter((inq) => {
    return (
      (normPhone && normalizeCustomerPhone(inq.customerPhone) === normPhone) ||
      (inq.customerEmail && customer.email && inq.customerEmail.toLowerCase() === customer.email.toLowerCase())
    );
  });

  const rewards = (db.loyaltyHistory || []).filter((r) => r.customerId === customer.id);

  res.json({
    customer,
    orders: customer.orders || [],
    inquiries: clientInquiries,
    rewards,
  });
});

// 3. Création d'un Code Promotionnel Personnalisé pour un Client
app.post('/api/admin/customers/:id/promo-code', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { code, discountType, discountValue, minOrderAmount, expiryDays, note } = req.body;

  const all = getAggregatedCustomers(db);
  const customer = all.find((c) => c.id === id);
  if (!customer) {
    return res.status(404).json({ error: 'Client introuvable' });
  }

  if (!discountValue || discountValue <= 0) {
    return res.status(400).json({ error: 'Montant ou pourcentage de remise invalide' });
  }

  // Generate clean personalized code if not provided
  let promoCodeString = (code || '').toUpperCase().trim();
  if (!promoCodeString) {
    const cleanLastName = customer.fullName
      .split(' ')
      .pop()
      ?.toUpperCase()
      .replace(/[^A-Z]/g, '') || 'VIP';
    const normDigits = normalizeCustomerPhone(customer.phone).slice(-4);
    promoCodeString = `HPC-${cleanLastName}-${normDigits}`;
  }

  // Ensure uniqueness
  if (db.promoCodes.some((p) => p.code.toUpperCase() === promoCodeString)) {
    promoCodeString = `${promoCodeString}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const now = new Date();
  const days = expiryDays && expiryDays > 0 ? expiryDays : 30;
  const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const newPromo: PromoCode = {
    id: `promo-cust-${Date.now()}`,
    code: promoCodeString,
    discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
    discountValue: Number(discountValue),
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
    maxDiscount: discountType === 'percentage' ? 25000 : undefined,
    usageLimit: 1, // Usage personnel exclusif
    usedCount: 0,
    active: true,
    expiryDate,
  };

  db.promoCodes.unshift(newPromo);

  if (!db.loyaltyHistory) db.loyaltyHistory = [];
  db.loyaltyHistory.unshift({
    id: `rew-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.fullName,
    customerPhone: customer.phone,
    type: 'custom_promo_created',
    description: `Code promo personnel ${promoCodeString} généré (-${discountValue}${discountType === 'percentage' ? '%' : ' FCFA'}). Note: ${note || 'Fidélité client'}`,
    pointsChange: 0,
    promoCode: promoCodeString,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  res.json({
    promoCode: newPromo,
    message: `Code promo personnalisé « ${promoCodeString} » créé avec succès pour ${customer.fullName}.`,
  });
});

// 4. Ajustement Manuel des Points de Fidélité
app.post('/api/admin/customers/:id/loyalty-points', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { pointsDelta, reason } = req.body;

  const delta = parseInt(pointsDelta, 10);
  if (isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: 'Nombre de points invalide' });
  }

  const all = getAggregatedCustomers(db);
  const customer = all.find((c) => c.id === id);
  if (!customer) {
    return res.status(404).json({ error: 'Client introuvable' });
  }

  if (!db.loyaltyHistory) db.loyaltyHistory = [];
  db.loyaltyHistory.unshift({
    id: `rew-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.fullName,
    customerPhone: customer.phone,
    type: 'manual_reward',
    description: reason || `Attribution manuelle de ${delta > 0 ? '+' : ''}${delta} points de fidélité`,
    pointsChange: delta,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  const updatedAll = getAggregatedCustomers(db);
  const updatedCustomer = updatedAll.find((c) => c.id === id);

  res.json({
    customer: updatedCustomer,
    message: `${delta > 0 ? '+' : ''}${delta} points appliqués au compte de ${customer.fullName}.`,
  });
});

// 5. Configuration du Programme de Fidélité
app.get('/api/admin/loyalty-config', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const config = db.storeSettings.loyaltyConfig || DEFAULT_LOYALTY_CONFIG;
  const all = getAggregatedCustomers(db);

  const tierCounts: Record<string, number> = {
    standard: 0,
    bronze: 0,
    silver: 0,
    gold: 0,
    vip: 0,
  };
  for (const c of all) {
    tierCounts[c.loyaltyTier] = (tierCounts[c.loyaltyTier] || 0) + 1;
  }

  res.json({
    config,
    stats: {
      tierCounts,
      totalCustomers: all.length,
      totalPointsIssued: all.reduce((sum, c) => sum + c.loyaltyPoints, 0),
    },
  });
});

app.put('/api/admin/loyalty-config', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const current = db.storeSettings.loyaltyConfig || DEFAULT_LOYALTY_CONFIG;
  const incoming = req.body;

  db.storeSettings.loyaltyConfig = {
    ...current,
    ...incoming,
  };

  saveDatabase(db);
  res.json({
    config: db.storeSettings.loyaltyConfig,
    message: 'Paramètres du programme de fidélisation enregistrés avec succès.',
  });
});

// 6. Historique des Récompenses et Paliers
app.get('/api/admin/loyalty-history', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ history: db.loyaltyHistory || [] });
});

// 7. Demandes de Contact et Réclamations (Admin)
app.get('/api/admin/contact-inquiries', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { search, status, type } = req.query;
  let inquiries = [...(db.contactInquiries || [])];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    inquiries = inquiries.filter(
      (i) =>
        i.customerName.toLowerCase().includes(q) ||
        i.customerPhone.includes(q) ||
        (i.customerEmail && i.customerEmail.toLowerCase().includes(q)) ||
        (i.orderNumber && i.orderNumber.toLowerCase().includes(q)) ||
        i.subject.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
    );
  }

  if (status && typeof status === 'string' && status !== 'all') {
    inquiries = inquiries.filter((i) => i.status === status);
  }

  if (type && typeof type === 'string' && type !== 'all') {
    inquiries = inquiries.filter((i) => i.type === type);
  }

  const allInqs = db.contactInquiries || [];
  res.json({
    inquiries,
    stats: {
      total: allInqs.length,
      pending: allInqs.filter((i) => i.status === 'pending').length,
      inProgress: allInqs.filter((i) => i.status === 'in_progress').length,
      resolved: allInqs.filter((i) => i.status === 'resolved').length,
    },
  });
});

app.put('/api/admin/contact-inquiries/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const inquiry = (db.contactInquiries || []).find((i) => i.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Demande introuvable' });
  }

  inquiry.status = status || inquiry.status;
  if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;
  inquiry.updatedAt = new Date().toISOString();

  if (status === 'resolved' || status === 'closed') {
    inquiry.resolvedAt = new Date().toISOString();
    inquiry.resolvedBy = 'Administrateur';
  }

  saveDatabase(db);
  res.json({
    inquiry,
    message: 'Statut de la réclamation mis à jour avec succès.',
  });
});

// 8. Confidentialité & Droit à l’Anonymisation (APDP Bénin / RGPD)
app.post('/api/admin/customers/:id/anonymize', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  if (!db.anonymizedCustomers) db.anonymizedCustomers = [];
  if (!db.anonymizedCustomers.includes(id)) {
    db.anonymizedCustomers.push(id);
  }

  // Anonymiser les coordonnées dans les commandes associées
  const normDigits = id.replace('cust-', '');
  for (const order of db.orders) {
    if (order.customer && normalizeCustomerPhone(order.customer.phone) === normDigits) {
      order.customer.fullName = 'Client Anonymisé';
      order.customer.address = 'Adresse purgée sur demande';
      order.customer.notes = undefined;
    }
  }

  saveDatabase(db);
  res.json({ message: 'Coordonnées personnelles anonymisées avec succès conformément aux règles de confidentialité.' });
});

// 9. Soumission Publique d’une Demande de Contact / Réclamation
app.post('/api/contact-inquiries', (req: Request, res: Response) => {
  const { customerName, customerPhone, customerEmail, type, orderNumber, subject, message } = req.body;

  if (!customerName || !customerPhone || !message) {
    return res.status(400).json({ error: 'Nom, numéro de téléphone et message sont obligatoires.' });
  }

  const db = getDatabase();
  if (!db.contactInquiries) db.contactInquiries = [];

  const newInquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : undefined,
    type: (type as any) || 'general',
    orderNumber: orderNumber ? orderNumber.trim() : undefined,
    subject: subject ? subject.trim() : 'Demande client HP COLLECTION',
    message: message.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.contactInquiries.unshift(newInquiry);
  saveDatabase(db);

  res.status(201).json({
    inquiry: newInquiry,
    message: 'Votre message a été transmis avec succès à notre service client à Cotonou.',
  });
});

// ==========================================
// MODULE DE DOCUMENTS COMMERCIAUX HP COLLECTION
// ==========================================

function generateCommercialDocument(
  order: Order,
  db: DatabaseSchema,
  explicitType?: CommercialDocumentType
): CommercialDocument {
  const store = db.storeSettings;
  const isPaid = order.paymentStatus === 'paid';

  let docType: CommercialDocumentType = explicitType || (isPaid ? 'receipt' : 'proforma');
  let prefix = 'BC';
  let title = 'RÉCAPITULATIF DE COMMANDE';

  if (docType === 'receipt' || (isPaid && !explicitType)) {
    docType = 'receipt';
    prefix = 'REC';
    title = 'FACTURE ACQUITTÉE / REÇU OFFICIEL DE PAIEMENT';
  } else if (docType === 'invoice') {
    prefix = 'FAC';
    title = 'FACTURE COMMERCIALE DE VENTE';
  } else if (docType === 'proforma' || (!isPaid && !explicitType)) {
    docType = 'proforma';
    prefix = 'PRO';
    title = 'FACTURE PROFORMA / BON DE COMMANDE';
  }

  const orderNumPart = order.orderNumber.replace(/[^0-9]/g, '').slice(-4) || '0001';
  const documentNumber = `${prefix}-2026-${orderNumPart}`;

  let paymentReceiptNote = '';
  if (isPaid) {
    paymentReceiptNote = `Paiement certifié encaissé le ${new Date(
      order.updatedAt || order.createdAt
    ).toLocaleDateString('fr-FR')} via ${
      order.paymentMethod === 'fedapay_mobile_money'
        ? 'Mobile Money Bénin (FedaPay)'
        : 'Espèces au coursier à la livraison'
    }.`;
  } else {
    paymentReceiptNote = `Paiement en attente de règlement à la réception ou via Mobile Money. Montant net exigible : ${order.total.toLocaleString(
      'fr-FR'
    )} FCFA.`;
  }

  return {
    documentNumber,
    type: docType,
    title,
    issuedAt: new Date().toISOString(),
    orderId: order.id,
    orderNumber: order.orderNumber,
    storeInfo: {
      name: store.storeName || 'HP COLLECTION',
      slogan: store.slogan || 'Ton style. Tes règles.',
      phone: store.phone || '+229 97 00 00 00',
      email: store.email || 'contact@hpcollection.bj',
      address: store.address || 'Cotonou, République du Bénin',
      country: 'République du Bénin',
      legalNotice:
        'Commerce de détail de prêt-à-porter, sneakers et accessoires de mode à Cotonou. Facturation régie par les dispositions commerciales en vigueur en République du Bénin.',
    },
    customer: order.customer,
    items: order.items, // Snapshot historique immuable
    subtotal: order.subtotal,
    discountAmount: order.discountAmount || 0,
    promoCode: order.promoCode,
    shippingFee: order.shippingFee || 0,
    shippingZone: order.shippingZone || 'Cotonou',
    total: order.total,
    currency: 'XOF',
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    paymentReceiptNote,
    paidAt: isPaid ? order.updatedAt || order.createdAt : undefined,
  };
}

// Récupération d'un Document Commercial pour une commande
app.get('/api/orders/:id/document', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { type, phone } = req.query;

  const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable pour la génération du document.' });
  }

  // Contrôle d'accès strict (Protection des données personnelles - Loi APDP Bénin) :
  // Un utilisateur ne peut pas consulter la facture ou le reçu d'un autre client sans le numéro de téléphone associé
  const authHeader = req.headers.authorization;
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
    if (session && session.role === 'admin') {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    if (!phone || typeof phone !== 'string') {
      return res.status(403).json({
        error: 'Accès restreint : le numéro de téléphone de l’acheteur est obligatoire pour consulter ce document.',
      });
    }
    const normReq = normalizeCustomerPhone(phone);
    const normOrder = normalizeCustomerPhone(order.customer.phone);
    if (normReq !== normOrder) {
      return res.status(403).json({ error: 'Numéro de téléphone non correspondant avec cette commande.' });
    }
  }

  const doc = generateCommercialDocument(order, db, type as CommercialDocumentType);
  res.json({ document: doc });
});

// ==========================================
// SYSTÈME DE GESTION DES RETOURS & RÉCLAMATIONS
// ==========================================

// 1. Consultation de la Politique de Retour & Remboursement (Public)
app.get('/api/returns/policy', (req: Request, res: Response) => {
  const db = getDatabase();
  const policy = db.storeSettings.returnPolicyConfig || DEFAULT_RETURN_POLICY_CONFIG;
  res.json({ policy });
});

// 2. Recherche d'une commande pour demande de retour (Client)
app.get('/api/returns/lookup-order', (req: Request, res: Response) => {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: 'Numéro de commande et téléphone requis.' });
  }

  const db = getDatabase();
  const cleanOrderNum = String(orderNumber).trim().toUpperCase();
  const normPhone = normalizeCustomerPhone(String(phone));

  const order = db.orders.find((o) => {
    const matchNum = o.orderNumber.toUpperCase() === cleanOrderNum || o.id.toUpperCase() === cleanOrderNum;
    if (!matchNum) return false;
    const oPhone = normalizeCustomerPhone(o.customer.phone);
    return oPhone === normPhone;
  });

  if (!order) {
    return res.status(404).json({
      error: 'Aucune commande trouvée avec ce numéro et ce numéro de téléphone. Vérifiez votre référence.',
    });
  }

  res.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customer.fullName,
      customerPhone: order.customer.phone,
      fulfillmentStatus: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      shippingZone: order.shippingZone,
      items: order.items,
    },
  });
});

// 3. Dépôt d'une demande de retour / réclamation (Client)
app.post('/api/returns', (req: Request, res: Response) => {
  const {
    orderNumber,
    customerPhone,
    customerName,
    customerEmail,
    items,
    reason,
    description,
    photoUrls,
    pickupAddress,
  } = req.body;

  if (!orderNumber || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Commande, téléphone et au moins un article concerné sont requis.' });
  }

  if (!reason || !description || !description.trim()) {
    return res.status(400).json({ error: 'Le motif et la description du problème sont obligatoires.' });
  }

  const db = getDatabase();
  const cleanOrderNum = String(orderNumber).trim().toUpperCase();
  const order = db.orders.find(
    (o) => o.orderNumber.toUpperCase() === cleanOrderNum || o.id.toUpperCase() === cleanOrderNum
  );

  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable dans le système.' });
  }

  if (!db.returnRequests) db.returnRequests = [];

  const now = new Date().toISOString();
  const returnSeq = Math.floor(1000 + Math.random() * 9000);
  const returnNumber = `RET-2026-${returnSeq}`;

  const newReturn: ReturnRequest = {
    id: `ret-${Date.now()}`,
    returnNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: (customerName || order.customer.fullName || 'Client').trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : order.customer.email,
    items,
    reason,
    description: description.trim(),
    photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
    status: 'new',
    pickupAddress: pickupAddress || order.customer.address || `${order.customer.district}, ${order.customer.city}`,
    statusHistory: [
      {
        status: 'new',
        timestamp: now,
        note: 'Demande de retour enregistrée par le client en attente d’examen.',
        updatedBy: 'Client',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  db.returnRequests.unshift(newReturn);

  // Enregistrer également dans le journal de contact du client
  if (!db.contactInquiries) db.contactInquiries = [];
  db.contactInquiries.unshift({
    id: `inq-${Date.now()}`,
    customerName: newReturn.customerName,
    customerPhone: newReturn.customerPhone,
    customerEmail: newReturn.customerEmail,
    type: 'size_exchange',
    orderNumber: order.orderNumber,
    subject: `Dossier Retour ${returnNumber} (${reason})`,
    message: description,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  saveDatabase(db);

  res.status(201).json({
    returnRequest: newReturn,
    message: `Votre demande de retour (${returnNumber}) a été transmise. Notre service client vous contactera sous 24h.`,
  });
});

// 4. Suivi de l'état d'une demande de retour (Public)
app.get('/api/returns/track/:ref', (req: Request, res: Response) => {
  const db = getDatabase();
  const { ref } = req.params;
  const cleanRef = ref.trim().toUpperCase();

  const reqItem = (db.returnRequests || []).find(
    (r) => r.returnNumber.toUpperCase() === cleanRef || r.id.toUpperCase() === cleanRef
  );

  if (!reqItem) {
    return res.status(404).json({ error: 'Dossier de retour introuvable. Vérifiez votre numéro RET-2026-XXXX.' });
  }

  res.json({ returnRequest: reqItem });
});

// 5. Liste des demandes de retours (Admin)
app.get('/api/admin/returns', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { search, status, reason } = req.query;
  let returns = [...(db.returnRequests || [])];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    returns = returns.filter(
      (r) =>
        r.returnNumber.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }

  if (status && typeof status === 'string' && status !== 'all') {
    returns = returns.filter((r) => r.status === status);
  }

  if (reason && typeof reason === 'string' && reason !== 'all') {
    returns = returns.filter((r) => r.reason === reason);
  }

  const all = db.returnRequests || [];
  res.json({
    returns,
    stats: {
      total: all.length,
      new: all.filter((r) => r.status === 'new').length,
      underReview: all.filter((r) => r.status === 'under_review').length,
      accepted: all.filter((r) => r.status === 'accepted').length,
      received: all.filter((r) => r.status === 'received').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
      closed: all.filter((r) => r.status === 'closed').length,
    },
  });
});

// 6. Détails d'une demande de retour (Admin)
app.get('/api/admin/returns/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  const returnReq = (db.returnRequests || []).find((r) => r.id === id || r.returnNumber === id);
  if (!returnReq) {
    return res.status(404).json({ error: 'Dossier de retour introuvable.' });
  }

  const order = db.orders.find((o) => o.id === returnReq.orderId || o.orderNumber === returnReq.orderNumber);

  res.json({
    returnRequest: returnReq,
    order,
  });
});

// 7. Mise à jour du statut & solution proposée (Admin)
app.put('/api/admin/returns/:id/status', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status, note, resolutionProposed, resolutionNotes, rejectionReason, pickupScheduledDate } = req.body;

  const returnReq = (db.returnRequests || []).find((r) => r.id === id || r.returnNumber === id);
  if (!returnReq) {
    return res.status(404).json({ error: 'Dossier de retour introuvable.' });
  }

  if (status === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
    return res.status(400).json({ error: 'Le motif de refus motivé est obligatoire.' });
  }

  const now = new Date().toISOString();
  returnReq.status = status || returnReq.status;
  returnReq.updatedAt = now;

  if (resolutionProposed !== undefined) returnReq.resolutionProposed = resolutionProposed;
  if (resolutionNotes !== undefined) returnReq.resolutionNotes = resolutionNotes;
  if (rejectionReason !== undefined) returnReq.rejectionReason = rejectionReason;
  if (pickupScheduledDate !== undefined) returnReq.pickupScheduledDate = pickupScheduledDate;

  returnReq.statusHistory.unshift({
    status: returnReq.status,
    timestamp: now,
    note: note || (status === 'rejected' ? `Demande refusée : ${rejectionReason}` : `Statut mis à jour : ${status}`),
    updatedBy: 'Administrateur',
  });

  saveDatabase(db);
  res.json({
    returnRequest: returnReq,
    message: 'Dossier de retour mis à jour avec succès.',
  });
});

// 8. Autorisation et confirmation de remboursement (Admin - RÈGLE STRICTE)
app.post('/api/admin/returns/:id/authorize-refund', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { confirmed, refundAmount, authorizationRef, note } = req.body;

  if (!confirmed) {
    return res.status(400).json({ error: 'Une confirmation explicite de l’opération est obligatoire.' });
  }

  const numAmount = Number(refundAmount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Montant de remboursement invalide.' });
  }

  if (!authorizationRef || !authorizationRef.trim()) {
    return res.status(400).json({ error: 'La référence d’autorisation de transaction (Mobile Money ou caisse) est obligatoire.' });
  }

  const returnReq = (db.returnRequests || []).find((r) => r.id === id || r.returnNumber === id);
  if (!returnReq) {
    return res.status(404).json({ error: 'Dossier de retour introuvable.' });
  }

  const now = new Date().toISOString();
  returnReq.refundAuthorized = true;
  returnReq.refundAmount = numAmount;
  returnReq.refundTransactionRef = authorizationRef.trim();
  returnReq.resolutionProposed = 'refund';
  returnReq.status = 'closed';
  returnReq.updatedAt = now;

  returnReq.statusHistory.unshift({
    status: 'closed',
    timestamp: now,
    note: `Remboursement certifié de ${numAmount.toLocaleString('fr-FR')} FCFA exécuté. Réf: ${authorizationRef.trim()}. ${note || ''}`,
    updatedBy: 'Administrateur (Autorisation certifiée)',
  });

  saveDatabase(db);
  res.json({
    returnRequest: returnReq,
    message: `Remboursement de ${numAmount.toLocaleString('fr-FR')} FCFA autorisé et clôturé avec succès.`,
  });
});

// 9. Mise à jour de la Politique de Retour (Admin)
app.put('/api/admin/returns/policy', requireAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const current = db.storeSettings.returnPolicyConfig || DEFAULT_RETURN_POLICY_CONFIG;
  const incoming = req.body;

  db.storeSettings.returnPolicyConfig = {
    ...current,
    ...incoming,
  };

  saveDatabase(db);
  res.json({
    policy: db.storeSettings.returnPolicyConfig,
    message: 'Politique de retours et remboursements mise à jour avec succès.',
  });
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

export { app };
export default app;

if (process.env.VERCEL !== '1') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
