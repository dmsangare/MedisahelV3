#!/bin/bash
# ============================================================
# MediSahel V3 — Déploiement / mise à jour
# Usage : ./scripts/deploy.sh
# ============================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}╔══════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   MediSahel V3 — Déploiement                 ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════╝${NC}"

echo -e "${YELLOW}[1/5] Sauvegarde de la base...${NC}"
./scripts/backup.sh || echo "⚠️  Backup échoué, on continue"

if [ -d ".git" ]; then
    echo -e "${YELLOW}[2/5] Récupération du code (git pull)...${NC}"
    git pull
else
    echo -e "${YELLOW}[2/5] Pas de dépôt git, étape ignorée${NC}"
fi

echo -e "${YELLOW}[3/5] Rebuild de l'image Docker...${NC}"
docker compose build

echo -e "${YELLOW}[4/5] Redémarrage des containers...${NC}"
docker compose up -d

echo -e "${YELLOW}[5/5] Mise à jour du schéma DB...${NC}"
sleep 5
docker compose exec -T app npx prisma db push --skip-generate || true

echo ""
echo -e "${GREEN}✅ Déploiement terminé${NC}"
docker compose ps
