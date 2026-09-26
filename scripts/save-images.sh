#!/bin/bash
# ============================================================
# MediSahel V3 — Export des images Docker (transport offline)
# Usage : ./scripts/save-images.sh
# ============================================================

set -euo pipefail

OUTPUT="images-base.tar"

echo "Export des images Docker vers ${OUTPUT}..."
echo "Ceci peut prendre 2-5 minutes..."

docker save \
    medisahel-v3:latest \
    postgres:18-alpine \
    node:20-alpine \
    -o "${OUTPUT}"

SIZE=$(du -h "${OUTPUT}" | cut -f1)
echo ""
echo "✅ Images exportées : ${OUTPUT} (${SIZE})"
echo ""
echo "Pour transporter sur une nouvelle clinique :"
echo "  1. Copier ${OUTPUT} sur une clé USB"
echo "  2. Sur la nouvelle machine : docker load -i ${OUTPUT}"
echo "  3. Puis : sudo ./scripts/install.sh"
