# 🚀 HP COLLECTION — Manuel d'Ingénierie DevOps & Déploiement en Production

> **Dernière mise à jour DevOps** : 30 Octobre 2026  
> **Statut du projet** : Codebase compilée, optimisée et prête au déploiement (`Production Ready`).  
> **Avertissement de conformité** : Conformément aux bonnes pratiques d'ingénierie, cette documentation détaille la procédure réelle sans prétendre que le site est déjà en ligne sur son domaine final tant que le pointage DNS et l'injection des clés réelles n'ont pas été exécutés par l'administrateur système.

---

## 1. Audit Technique & Vérification d'Architecture

| Composant | État Actuel | Diagnostic & Mesure DevOps |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Tailwind v4 + Vite | Build de production minifié dans `/dist` (755 ms). Chunks optimisés, polices préchargées (`preconnect`), balises meta SEO Bénin & Open Graph intégrées. |
| **Backend** | Express (Node.js / tsx) | Serveur full-stack avec montage dynamique Vite en dev et service statique ultra-rapide `/dist` en production. Limite JSON fixée à 15 Mo pour les images. |
| **Sécurité HTTP** | Renforcée | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (HSTS) actif en HTTPS. |
| **Base de Données** | `/data/store.json` | Stockage local persistant avec contrôle d'intégrité, initialisation atomique automatique et mécanisme de fusion non destructif. |
| **Stockage Médias** | `/public/uploads` + CDN | Images locales hébergées avec en-têtes de cache long terme (`Cache-Control: max-age=30d, immutable`). URLs Unsplash optimisées avec paramètres `auto=format&fit=crop`. |
| **Authentification** | Chiffrement PBKDF2-SHA512 | Mots de passe salés (16 octets aléatoires) avec 1000 itérations PBKDF2 SHA-512. Sessions d'administration signées expirant sous 7 jours. |
| **Sondes DevOps** | `/healthz` et `/api/health` | Endpoints de diagnostic temps réel (statut BDD, écriture disque, mémoire RSS/Heap, mode FedaPay, notifications). |
| **Sauvegarde / Restauration**| `npm run backup` / `restore` | Scripts automatisés avec empreinte d'intégrité SHA-256, manifeste JSON, rotation sur 14 jours et instantané de sécurité avant restauration. |
| **Mobile Android** | Ergonomie vérifiée | Cibles tactiles ≥ 44px, tiroir panier fluide, commande rapide sans étape superflue, simulation FedaPay MTN/Moov/Celtiis responsive. |
| **Gestion des Erreurs** | Masquage des traces | Middleware Express interceptant les erreurs 500 pour masquer les stack traces en `NODE_ENV=production`. |

---

## 2. Variables d'Environnement de Production

Créer le fichier `.env.production` sur le serveur (ou injecter via le Secret Manager de votre hébergeur) :

```ini
# Environnement d'exécution
NODE_ENV="production"
PORT=3000

# URL publique sécurisée (HTTPS obligatoire)
APP_URL="https://hpcollection.bj"

# Intelligence Artificielle (Google Gemini API)
GEMINI_API_KEY="AIzaSyYourProductionGeminiApiKey"

# FedaPay Mobile Money Bénin (Production Live)
FEDAPAY_PUBLIC_KEY="VOTRE_CLE_PUBLIQUE_FEDAPAY"
FEDAPAY_SECRET_KEY="VOTRE_CLE_SECRETE_FEDAPAY"

# WhatsApp Business Cloud API (Meta Graph v19.0)
WHATSAPP_PHONE_NUMBER_ID="109876543210987"
WHATSAPP_ACCESS_TOKEN="EAABxxxxxxxxxxxxxxxxxxxx"

# Passerelle Email SMTP Transactionnel
SMTP_HOST="smtp.resend.com"
SMTP_PORT=587
SMTP_USER="resend"
SMTP_PASS="re_xxxxxxxxxxxxxxxxxxxx"
SMTP_FROM="commandes@hpcollection.bj"

# Référencement Google & Tracking
GOOGLE_SITE_VERIFICATION="google-verification-token"
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Rétention des sauvegardes
BACKUP_RETENTION_DAYS=14
```

> **Sécurité POSIX** : Sur un serveur Linux, restreindre l'accès au fichier :
> ```bash
> chmod 600 .env.production
> chown nodejs:nodejs .env.production
> ```

---

## 3. Configuration Nom de Domaine, DNS et HTTPS

### 3.1. Enregistrements DNS recommandés (`hpcollection.bj`)

Configurez les entrées suivantes auprès de votre registrar (ex: registrar .bj de l'ASSI, Cloudflare, OVH, etc.) :

| Type | Nom / Hôte | Valeur / Cible | TTL | Rôle |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (racine) | `IP_PUBLIQUE_DU_SERVEUR` | 300 | Pointage principal IPv4 |
| **AAAA** | `@` (racine) | `IPV6_DU_SERVEUR` (si dispo) | 300 | Pointage IPv6 moderne |
| **CNAME** | `www` | `hpcollection.bj.` | 300 | Redirection sous-domaine www |
| **CNAME** | `staging` | `staging-server.domaine.com.` | 300 | Environnement de pré-production |
| **TXT** | `@` | `v=spf1 include:_spf.resend.com ~all` | 3600 | SPF (Délivrabilité emails) |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@hpcollection.bj` | 3600 | DMARC anti-usurpation |
| **TXT** | `@` | `google-site-verification=GSC_TOKEN` | 3600 | Validation Google Search Console |

### 3.2. Certificat SSL/TLS et HTTPS (Let's Encrypt / Certbot)

Sur le serveur web hôte (ex: Nginx reverse proxy) :
```bash
# Installation de Certbot
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx

# Génération du certificat TLS et configuration automatique
sudo certbot --nginx -d hpcollection.bj -d www.hpcollection.bj --agree-tos --redirect -m admin@hpcollection.bj

# Vérification du renouvellement automatique (cron / systemd timer)
sudo certbot renew --dry-run
```

---

## 4. Procédure de Déploiement Recommandée

### Option A : Déploiement VPS Linux (Ubuntu 24.04 LTS / Debian 12) avec Nginx & PM2

#### Étape 1 : Prérequis du serveur
```bash
# Mise à jour des paquets système
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git nginx ufw build-essential

# Installation de Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de PM2 (Gestionnaire de processus)
sudo npm install -g pm2
```

#### Étape 2 : Configuration du Pare-feu (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

#### Étape 3 : Installation de l'Application
```bash
# Cloner le dépôt dans /var/www/hpcollection
sudo mkdir -p /var/www/hpcollection
sudo chown -R $USER:$USER /var/www/hpcollection
cd /var/www/hpcollection
git clone <URL_DU_DEPOT> .

# Installation des dépendances et compilation
npm ci
npm run build

# Configuration des variables d'environnement de prod
cp .env.production.example .env.production
nano .env.production
```

#### Étape 4 : Gestion du Processus via PM2
Créer `ecosystem.config.cjs` à la racine :
```javascript
module.exports = {
  apps: [
    {
      name: 'hp-collection',
      script: 'server.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      instances: 'max',
      exec_mode: 'cluster',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
    },
  ],
};
```

Démarrer l'application :
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### Étape 5 : Configuration Nginx (`/etc/nginx/sites-available/hpcollection`)
```nginx
server {
    server_name hpcollection.bj www.hpcollection.bj;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Uploads max size (photos d'articles streetwear)
    client_max_body_size 20M;
}
```

Activer le site et recharger Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/hpcollection /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

### Option B : Déploiement Conteneurisé (Docker / Cloud Run)

Un `Dockerfile` optimisé pour la production multi-étape :

```dockerfile
# Étape 1 : Construction du bundle statique
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Runtime léger de production
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/data ./data

# Montage d'un volume persistant pour les données et uploads
VOLUME ["/app/data", "/app/public/uploads"]

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5. Stratégie de Sauvegarde & Procédure de Restauration

### 5.1. Automatisation des Sauvegardes Quotidiennes (Cron)
Pour planifier la sauvegarde automatique chaque nuit à 03h00 du matin :

```bash
crontab -e
```
Ajouter la ligne suivante :
```cron
0 3 * * * cd /var/www/hpcollection && /usr/bin/npm run backup >> /var/log/hp-backup.log 2>&1
```

### 5.2. Test de Sauvegarde Manuel
```bash
npm run backup
```
Le script :
1. Crée un snapshot dans `/backups/backup-<TIMESTAMP>`.
2. Calcule et enregistre la somme de contrôle SHA-256 de `store.json`.
3. Sauvegarde l'ensemble des images `/public/uploads`.
4. Supprime automatiquement les sauvegardes de plus de 14 jours.

### 5.3. Procédure de Restauration d'Urgence (Disaster Recovery)

En cas de corruption de données ou d'incident :
```bash
# 1. Lister les sauvegardes disponibles
npm run restore -- --list

# 2. Restaurer la dernière sauvegarde valide
npm run restore -- --latest

# 3. Ou restaurer une sauvegarde spécifique par son identifiant
npm run restore -- backup-2026-10-30T20-59-38-598Z
```

> **Garantie de sécurité** : Avant toute écrasement, le script génère automatiquement un fichier tampon de sécurité `data/store.pre-restore-<TIMESTAMP>.bak` permettant de revenir en arrière en cas d'erreur humaine.

---

## 6. Environnement de Test (Staging) vs Production

| Critère | Environnement Staging (Pré-prod) | Environnement Production (Live) |
| :--- | :--- | :--- |
| **URL d'accès** | `https://staging.hpcollection.bj` | `https://hpcollection.bj` |
| **Pointage DNS** | Sous-domaine `staging` vers serveur de test | Domaine racine `@` et `www` vers serveur de prod |
| **Base de Données** | `/data/store.json` (Données fictives / copies anonymisées) | `/data/store.json` (Commandes et clients réels) |
| **FedaPay** | Mode Sandbox (cartes et comptes Mobile Money de test FedaPay) | Mode Live (Clés API réelles FedaPay) |
| **WhatsApp Meta** | Mode `verified_simulator` | Mode `meta_cloud_api` avec jeton d'accès permanent |
| **Emails** | Interception ou redirection vers boîte dev | Envoi réel aux clients depuis `commandes@hpcollection.bj` |

---

## 7. Liste des Éléments Nécessitant une Intervention Humaine

Pour finaliser la mise en ligne effective, les actions suivantes doivent être réalisées par les responsables du projet :

1. **Achat et Délégation DNS du Domaine `.bj`** :
   - Acquérir le domaine `hpcollection.bj` auprès d'un bureau d'enregistrement accrédité (ou configurer la zone DNS Cloudflare/Route53).
   - Renseigner les enregistrements A et CNAME indiqués dans la section 3.1.

2. **Validation du Compte Marchand FedaPay Bénin** :
   - Créer un compte sur [https://fedapay.com](https://fedapay.com).
   - Soumettre les documents légaux d'entreprise (Registre du Commerce et du Crédit Mobilier - RCCM, Numéro IFU, RIB bancaire béninois).
   - Basculer en mode Live et copier la clé publique et la clé secrète dans `.env.production`.

3. **Création de l'Application WhatsApp Business (Meta)** :
   - Créer une application dans [Meta for Developers](https://developers.facebook.com).
   - Valider le numéro de téléphone béninois du service client.
   - Générer un jeton d'accès système permanent (System User Token) et récupérer le `Phone Number ID`.

4. **Compte SMTP Transactionnel** :
   - Ouvrir un compte sur un service de messagerie transactionnelle (ex: Resend, Brevo ou AWS SES).
   - Valider le domaine `hpcollection.bj` via les entrées DNS DKIM/SPF fournies.

5. **Sécurisation du Premier Accès Administrateur** :
   - Lors du premier démarrage en production, se connecter sur `/` puis ouvrir le portail admin.
   - Changer le mot de passe initial de test (`AdminHP2026!`) pour une clé forte et unique d'au moins 16 caractères.
