#!/bin/bash
# ============================================================
# MediSahel V3 — Installation pour une nouvelle clinique
# Usage : sudo ./scripts/install.sh
# ============================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   MediSahel V3 — Installation                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}⚠️  Ce script doit être lancé avec sudo${NC}"
    exit 1
fi

if ! grep -qi ubuntu /etc/os-release; then
    echo -e "${RED}⚠️  Ce script est conçu pour Ubuntu${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[1/4] Installation de Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker "${SUDO_USER:-$USER}"
    echo -e "${GREEN}✅ Docker installé${NC}"
else
    echo -e "${GREEN}[1/4] Docker déjà installé${NC}"
fi

if [ -f "./images-base.tar" ]; then
    echo -e "${YELLOW}[2/4] Chargement des images Docker depuis images-base.tar...${NC}"
    docker load -i ./images-base.tar
    echo -e "${GREEN}✅ Images chargées${NC}"
else
    echo -e "${YELLOW}[2/4] Pas d'images-base.tar — Docker va télécharger les images${NC}"
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[3/4] Création du .env depuis .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        chmod 600 .env
        echo -e "${RED}⚠️  IMPORTANT : éditez .env et remplissez vos valeurs !${NC}"
        echo "Puis relancez : sudo ./scripts/install.sh"
        exit 0
    else
        echo -e "${RED}❌ .env.example introuvable${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}[4/4] Démarrage des containers Docker...${NC}"
docker compose up -d --build

echo -e "${YELLOW}Création du schéma de base de données...${NC}"
sleep 10
docker compose exec -T app npx prisma db push --skip-generate || true

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Installation terminée !                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
docker compose ps
echo ""
echo -e "${GREEN}➡️  Application accessible sur :${NC}"
echo -e "   http://$(hostname -I | awk '{print $1}')"
echo ""
