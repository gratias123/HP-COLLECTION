import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * HP COLLECTION — Automated Production Data Backup Script
 * Usage: npm run backup or tsx scripts/backup.ts
 * Can be scheduled via cron: 0 3 * * * (Every night at 03:00 AM)
 */

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

const MAX_RETAINED_BACKUPS = 14; // Keep 14 daily snapshots

function computeSha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function runBackup() {
  console.log('📦 [HP COLLECTION DevOps] Starting production data backup...');

  if (!fs.existsSync(STORE_FILE)) {
    console.error(`❌ Store file not found at ${STORE_FILE}`);
    process.exit(1);
  }

  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(BACKUPS_DIR, `backup-${timestamp}`);
  fs.mkdirSync(backupFolder, { recursive: true });

  // 1. Copy store.json
  const targetStoreFile = path.join(backupFolder, 'store.json');
  fs.copyFileSync(STORE_FILE, targetStoreFile);

  // 2. Compute checksums
  const storeChecksum = computeSha256(targetStoreFile);

  // 3. Inspect database content stats
  const storeRaw = fs.readFileSync(STORE_FILE, 'utf-8');
  const storeData = JSON.parse(storeRaw);

  const stats = {
    products: (storeData.products || []).length,
    orders: (storeData.orders || []).length,
    categories: (storeData.categories || []).length,
    promoCodes: (storeData.promoCodes || []).length,
    deliveryZones: (storeData.deliveryZones || []).length,
    notifications: (storeData.notifications || []).length,
    adminUsers: (storeData.adminUsers || []).length,
  };

  // 4. Copy uploaded images if any
  let uploadedFilesCount = 0;
  const targetUploads = path.join(backupFolder, 'uploads');
  if (fs.existsSync(UPLOADS_DIR)) {
    copyRecursive(UPLOADS_DIR, targetUploads);
    uploadedFilesCount = fs.existsSync(targetUploads) ? fs.readdirSync(targetUploads).length : 0;
  }

  // 5. Generate backup manifest
  const manifest = {
    backupId: `backup-${timestamp}`,
    timestamp: now.toISOString(),
    storeChecksumSha256: storeChecksum,
    storeSizeBytes: fs.statSync(STORE_FILE).size,
    uploadedFilesCount,
    contentStats: stats,
    environment: process.env.NODE_ENV || 'production',
  };

  fs.writeFileSync(
    path.join(backupFolder, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  console.log(`✅ Backup successfully created at: ${backupFolder}`);
  console.log(`   - Integrity SHA-256: ${storeChecksum}`);
  console.log(`   - Content: ${stats.products} products, ${stats.orders} orders, ${stats.notifications} notification logs`);
  console.log(`   - Media: ${uploadedFilesCount} uploaded asset(s) preserved`);

  // 6. Prune old backups past MAX_RETAINED_BACKUPS
  try {
    const existing = fs
      .readdirSync(BACKUPS_DIR)
      .filter((name) => name.startsWith('backup-'))
      .sort();

    if (existing.length > MAX_RETAINED_BACKUPS) {
      const toDelete = existing.slice(0, existing.length - MAX_RETAINED_BACKUPS);
      for (const folder of toDelete) {
        fs.rmSync(path.join(BACKUPS_DIR, folder), { recursive: true, force: true });
        console.log(`🧹 Pruned expired backup snapshot: ${folder}`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Warning during backup rotation cleanup:', err);
  }

  console.log('🎯 [HP COLLECTION DevOps] Backup complete.');
}

runBackup().catch((err) => {
  console.error('❌ Backup failed:', err);
  process.exit(1);
});
