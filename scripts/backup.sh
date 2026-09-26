#!/bin/bash
# ============================================================
# MediSahel V3 — Sauvegarde de la base de données
# Usage : ./scripts/backup.sh
# ============================================================

set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/medisahel-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Sauvegarde de la base de données..."
docker compose exec -T db pg_dump -U medisahel_user medisahel | gzip > "${BACKUP_FILE}"

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ Sauvegarde créée : ${BACKUP_FILE} (${SIZE})"

echo "Nettoyage (garder les 30 dernières)..."
ls -t "${BACKUP_DIR}"/medisahel-*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm -f

echo "✅ Terminé"
