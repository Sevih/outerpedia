# syntax=docker/dockerfile:1
###############################################################################
# Image de production outerpedia V3 (Next.js, sortie "standalone", pnpm).
#
# Build simple : pas de python, pas de pipeline de données (les données générées
# seront committées — cf. Phase 2). Multi-stage -> image finale minimale, non-root.
###############################################################################

# ---- Base (avec pnpm) pour deps + build ----
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@10

# ---- Étape 1 : dépendances ----
FROM base AS deps
# Manifestes seuls -> cache Docker tant qu'ils ne changent pas.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Étape 2 : build ----
FROM base AS builder
# Domaine baké dans le bundle client AU BUILD.
ARG NEXT_PUBLIC_BASE_DOMAIN=outerpedia.com
ENV NEXT_PUBLIC_BASE_DOMAIN=${NEXT_PUBLIC_BASE_DOMAIN}
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- Étape 3 : runner (image finale, sans pnpm) ----
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Utilisateur non-root.
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nextjs

# Sortie standalone (server.js + node_modules minimal).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Assets statiques + public (non inclus dans standalone, à copier explicitement).
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
