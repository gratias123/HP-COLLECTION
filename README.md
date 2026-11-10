# 🧢 HP COLLECTION — Boutique E-Commerce Streetwear & Sneakers (Bénin)

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Backend-Express%20TS-000000.svg)](https://expressjs.com)
[![FedaPay](https://img.shields.io/badge/Paiement-FedaPay%20Bénin-orange.svg)](https://fedapay.com)

> **HP COLLECTION** : *Ton style. Tes règles.*  
> Plateforme e-commerce moderne conçue pour le marché béninois et ouest-africain (Cotonou, Abomey-Calavi, Porto-Novo), avec paiement Mobile Money (MTN, Moov, Celtiis), commande en ligne fluide, suivi de livraison, et panneau d'administration complet.

---

## ✨ Fonctionnalités Principales

- 🛍️ **Catalogue & Expérience Shopping Haut de Gamme** :
  - Catégories : Streetwear, Sneakers, Vestes & Blousons, Joggings & Survêtements, Accessoires.
  - Filtres dynamiques, tri par prix/nouveautés, recherche en direct.
  - Fiches produits ultra-détaillées (tailles, couleurs, guide des tailles, zoom photo).
  - Gestion du Panier & Liste d'envies (Wishlist).

- 💳 **Paiement Local Bénin (FedaPay & À la Réception)** :
  - Intégration FedaPay (MTN Mobile Money, Moov Money, Celtiis Cash, Carte bancaire).
  - Option "Paiement à la livraison / Essayage au déballage".
  - Simulateur Sandbox intégré pour tests locaux sans carte bancaire réelle.

- 📦 **Suivi des Commandes & Facturation** :
  - Suivi en temps réel avec numéro de commande (ex: `HP-2026-XXXX`).
  - Génération de factures et bons de livraison professionnels (PDF / HTML imprimable).
  - Notifications SMS / WhatsApp / Email transactionnelles.

- 🤖 **Assistant Styliste IA & Chatbot Support (Google Gemini)** :
  - Conseil mode personnalisé, suggestions de tenues selon l'occasion.
  - Réponse instantanée aux questions fréquentes (livraison, retours, délais).

- 🛡️ **Espace Administrateur Sécurisé (`/admin`)** :
  - Gestion des stocks, ajouts et modifications de produits.
  - Traitement du cycle de vie des commandes (En attente, Confirmée, Expédiée, Livrée).
  - Suivi des demandes de retour et d'échange.
  - Sauvegardes automatisées (`npm run backup` / `restore`) avec somme de contrôle SHA-256.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons.
- **Backend & API** : Node.js, Express, tsx.
- **Persistance** : Fichier JSON atomique structuré (`/data/store.json`) avec verrous d'intégrité et rotation automatique.
- **Paiements** : FedaPay SDK / API Gateway.
- **Intelligence Artificielle** : SDK `@google/genai` (Google Gemini 2.5).

---

## 🚀 Installation & Démarrage Local

### Prérequis
- [Node.js](https://nodejs.org) v20+ ou v22+
- `npm` ou `bun`

### 1. Cloner le projet
```bash
git clone https://github.com/gratias123/hp-collection.git
cd hp-collection
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
Copiez `.env.example` en `.env` :
```bash
cp .env.example .env
```
Renseignez vos clés API (facultatif en mode démo/bac à sable) :
- `GEMINI_API_KEY` (optionnel pour l'assistant IA)
- `FEDAPAY_PUBLIC_KEY` & `FEDAPAY_SECRET_KEY` (optionnel pour Mobile Money réel)

### 4. Lancer le serveur de développement
```bash
npm run dev
```
Accédez à l'application sur [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Démarre le serveur full-stack avec rechargement à chaud |
| `npm run build` | Compile le frontend React minifié pour la production (`/dist`) |
| `npm start` | Démarre le serveur de production |
| `npm run lint` | Vérifie les types TypeScript |
| `npm run backup` | Génère un instantané complet de la base de données et des uploads |
| `npm run restore` | Restaure une sauvegarde précédente |

---

## 🌐 Déploiement en Production

Pour un déploiement complet pas-à-pas (VPS Linux avec Nginx + PM2, Docker, Cloud Run, Render ou Railway), consultez le fichier détaillé :
👉 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 👤 Auteur & Droits

- Développé pour **HP COLLECTION Bénin**
- GitHub : [@gratias123](https://github.com/gratias123)
- Tous droits réservés © 2026 HP COLLECTION
