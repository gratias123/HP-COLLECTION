# 🚀 Guide de Déploiement vers GitHub (https://github.com/gratias123)

Votre dépôt Git local est **déjà initialisé et validé** sur la branche principale `main` avec l'ensemble du code de **HP COLLECTION**.

---

## Étape 1 : Créer le dépôt sur GitHub

1. Rendez-vous sur votre compte GitHub : **[https://github.com/new](https://github.com/new)**
2. Nommez le dépôt (par exemple : `hp-collection` ou `hpcollection`)
3. Choisissez **Public** ou **Privé**
4. ⚠️ **IMPORTANT** : Ne cochez **PAS** *"Add a README file"*, ni *.gitignore*, ni licence (car ils sont déjà configurés dans ce projet).
5. Cliquez sur **Create repository**.

---

## Étape 2 : Lier et Pousser le projet sur votre GitHub

Ouvrez votre terminal dans le dossier du projet et exécutez les commandes suivantes :

### Option A : En HTTPS (Recommandé avec Personal Access Token)

```bash
# 1. Associer l'adresse de votre nouveau dépôt distant GitHub
git remote add origin https://github.com/gratias123/hp-collection.git

# 2. S'assurer d'être sur la branche main
git branch -M main

# 3. Pousser tout le code vers GitHub
git push -u origin main
```

> **Note d'authentification GitHub** :  
> Lors de la demande du mot de passe dans le terminal, GitHub requiert un **Personal Access Token (classic)** au lieu de votre mot de passe habituel.  
> Pour en générer un en 30 secondes :
> 1. Allez sur [github.com/settings/tokens](https://github.com/settings/tokens)
> 2. Cliquez sur **Generate new token (classic)**
> 3. Cochez la case **`repo`** (accès complet aux dépôts)
> 4. Cliquez sur **Generate token** et collez-le comme mot de passe dans votre terminal.

---

### Option B : En SSH (Si vous avez déjà configuré votre clé SSH sur GitHub)

```bash
# 1. Associer le remote en SSH
git remote add origin git@github.com:gratias123/hp-collection.git

# 2. Pousser le code
git branch -M main
git push -u origin main
```

---

## Étape 3 : Déployer le site en ligne gratuitement depuis GitHub

Une fois votre dépôt sur `https://github.com/gratias123/hp-collection` :

1. **Render.com** (Idéal pour les applications Full-Stack Node.js/Express) :
   - Connectez-vous sur [Render.com](https://render.com) avec votre compte GitHub.
   - Cliquez sur **New +** > **Web Service**.
   - Sélectionnez votre dépôt `hp-collection`.
   - Build Command : `npm install && npm run build`
   - Start Command : `npm start`
   - Votre boutique sera en ligne gratuitement avec HTTPS !

2. **Vercel / Railway / VPS** :
   - Vous pouvez également connecter le dépôt à Vercel ou Railway en 1 clic.
   - Pour un déploiement sur VPS dédié ou conteneur Docker, référez-vous au guide complet [DEPLOYMENT.md](./DEPLOYMENT.md).
