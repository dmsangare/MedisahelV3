# =====================================================
# Dockerfile MediSahel V3 — version offline-friendly
# =====================================================
FROM node:20-alpine

WORKDIR /app

# ⚠️ Installer OpenSSL (requis par Prisma)
# ⚠️ Installer libc6-compat (compatibilité glibc pour binaires Prisma)
RUN apk add --no-cache openssl libc6-compat

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier TOUT le projet (y compris node_modules)
COPY . .

# Générer le client Prisma pour Alpine
RUN npx prisma generate

# Builder : vite build + esbuild server.ts → dist/
RUN npm run build

# Utilisateur non-root
USER appuser

# Port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Lancer le serveur
CMD ["node", "dist/server.cjs"]
