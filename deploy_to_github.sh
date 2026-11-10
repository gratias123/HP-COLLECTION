#!/usr/bin/env bash
# Script pour pousser le projet vers https://github.com/gratias123/HP-COLLECTION
set -e

if [ -z "$1" ]; then
  echo "Usage: ./deploy_to_github.sh <VOTRE_GITHUB_TOKEN>"
  echo "Exemple: ./deploy_to_github.sh ghp_xxxxxxxxxxxxxxxxxxxx"
  exit 1
fi

TOKEN="$1"
REPO="gratias123/HP-COLLECTION"

echo "➡️ Configuration de l'authentification GitHub..."
git remote set-url origin "https://${TOKEN}@github.com/${REPO}.git"

echo "➡️ Envoi du code sur la branche main..."
git push -u origin main --force

echo "✅ Projet déployé avec succès sur https://github.com/${REPO} !"

# Nettoyage de l'URL pour ne pas laisser le token dans la configuration git
git remote set-url origin "https://github.com/${REPO}.git"
