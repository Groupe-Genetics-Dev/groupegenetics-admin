# ---------- Étape 1 : dépendances ----------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Next.js a besoin du compilateur SWC natif de la plateforme (ex. @next/swc-linux-arm64-musl
# sur Mac Apple Silicon). npm ci peut l'omettre quand le package-lock a été généré sur une autre
# architecture : on vérifie qu'il se charge et on l'installe ici sinon, pour que "next build"
# n'ait jamais à le télécharger (échec "fetch failed" sur les réseaux filtrés).
RUN SWC="@next/swc-linux-$(node -p process.arch)-musl" \
    && if ! node -e "require('$SWC')" 2>/dev/null; then \
         echo "Installation de $SWC" \
         && npm install --no-save "$SWC@$(node -p "require('next/package.json').version")"; \
       fi \
    && node -e "require('$SWC')" \
    && echo "Compilateur SWC OK : $SWC"

# ---------- Étape 2 : build Next.js ----------
FROM node:22-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* est injecté dans le bundle au moment du build
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Étape 3 : image d'exécution ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
