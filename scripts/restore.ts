import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * HP COLLECTION — Safe Production Data Restore Script
 * Usage:
 *   - List backups: tsx scripts/restore.ts --list
 *   - Restore latest: tsx scripts/restore.ts --latest
 *   - Restore specific: tsx scripts/restore.ts backup-2026-10-30T14-00-00-000Z
 */

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

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

async function runRestore() {
  const args = process.argv.slice(2);

  if (!fs.existsSync(BACKUPS_DIR)) {
    console.error('❌ No backups directory found at /backups');
    process.exit(1);
  }

  const available = fs
    .readdirSync(BACKUPS_DIR)
    .filter((f) => f.startsWith('backup-') && fs.statSync(path.join(BACKUPS_DIR, f)).isDirectory())
    .sort();

  if (args.includes('--list') || args.length === 0) {
    console.log('📋 [HP COLLECTION DevOps] Available Production Backups:');
    if (available.length === 0) {
      console.log('   (No backup archives present)');
      return;
    }

    for (const b of available) {
      const manifestPath = path.join(BACKUPS_DIR, b, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        console.log(` • ${b} | ${manifest.timestamp} | ${manifest.contentStats?.products ?? '?'} products, ${manifest.contentStats?.orders ?? '?'} orders`);
      } else {
        console.log(` • ${b} (manifest missing)`);
      }
    }
    console.log('\nTo restore: tsx scripts/restore.ts --latest OR tsx scripts/restore.ts <backup-folder-name>');
    return;
  }

  let targetBackupName = args[0];
  if (targetBackupName === '--latest') {
    if (available.length === 0) {
      console.error('❌ No backups available to restore.');
      process.exit(1);
    }
    targetBackupName = available[available.length - 1];
  }

  const backupDir = path.join(BACKUPS_DIR, targetBackupName);
  if (!fs.existsSync(backupDir)) {
    console.error(`❌ Backup "${targetBackupName}" not found in ${BACKUPS_DIR}`);
    process.exit(1);
  }

  const backupStoreFile = path.join(backupDir, 'store.json');
  if (!fs.existsSync(backupStoreFile)) {
    console.error(`❌ Corrupted backup: store.json missing from ${backupDir}`);
    process.exit(1);
  }

  // 1. Verify Manifest and Checksum
  const manifestPath = path.join(backupDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const actualChecksum = computeSha256(backupStoreFile);
    if (manifest.storeChecksumSha256 && manifest.storeChecksumSha256 !== actualChecksum) {
      console.error('🚨 Checksum mismatch! The backup file may be corrupted or tampered with.');
      console.error(`   Expected: ${manifest.storeChecksumSha256}`);
      console.error(`   Actual:   ${actualChecksum}`);
      process.exit(1);
    }
    console.log('🔒 Backup manifest verified successfully.');
  }

  // 2. Create a Pre-Restore Safety Snapshot of current state
  if (fs.existsSync(STORE_FILE)) {
    const preRestoreSafety = path.join(
      DATA_DIR,
      `store.pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.bak`
    );
    fs.copyFileSync(STORE_FILE, preRestoreSafety);
    console.log(`🛡️ Pre-restore snapshot created at: ${preRestoreSafety}`);
  }

  // 3. Restore store.json
  fs.copyFileSync(backupStoreFile, STORE_FILE);
  console.log(`✅ store.json restored from ${targetBackupName}`);

  // 4. Restore uploads if present
  const backupUploadsDir = path.join(backupDir, 'uploads');
  if (fs.existsSync(backupUploadsDir)) {
    copyRecursive(backupUploadsDir, UPLOADS_DIR);
    console.log(`✅ Uploaded media files restored to ${UPLOADS_DIR}`);
  }

  console.log('🎉 [HP COLLECTION DevOps] Production restoration complete and verified.');
}

runRestore().catch((err) => {
  console.error('❌ Restore failed:', err);
  process.exit(1);
});
