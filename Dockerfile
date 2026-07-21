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
# DOIT rester aligné sur le champ "packageManager" de package.json. Le pin est
# répété ici (et pas lu depuis le manifeste) parce que pnpm s'installe AVANT le
# COPY de package.json, pour garder le cache Docker de cette couche. Une dérive
# entre les deux se paie au `pnpm install --frozen-lockfile` ci-dessous, donc au
# build de PROD et non en dev.
RUN npm install -g pnpm@11.13.0

# ---- Étape 1 : dépendances ----
FROM base AS deps
# Manifestes seuls -> cache Docker tant qu'ils ne changent pas.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Étape 2 : build ----
FROM base AS builder
# NEXT_PUBLIC_* = BAKÉS dans le bundle AU BUILD (build-time). La génération
# statique fige les URLs à la compilation : ces valeurs ne sont PAS ajustables au
# runtime du conteneur.
#
# Profil de déploiement (cf. src/lib/site.ts). Défauts = PROD (outerpedia.com,
# sous-domaines de langue, indexable) depuis la BASCULE du 21/07/2026 — la CI
# builde sans build-args. L'ancien profil staging (vps-7b703196.vps.ovh.net,
# path, noindex) reste accessible par --build-arg au besoin.
# Détail : docs/procedure/bascule-domaine.md
ARG NEXT_PUBLIC_SITE_ORIGIN=https://outerpedia.com
ENV NEXT_PUBLIC_SITE_ORIGIN=${NEXT_PUBLIC_SITE_ORIGIN}
ARG NEXT_PUBLIC_LANG_ROUTING=subdomain
ENV NEXT_PUBLIC_LANG_ROUTING=${NEXT_PUBLIC_LANG_ROUTING}
ARG NEXT_PUBLIC_SITE_INDEXABLE=true
ENV NEXT_PUBLIC_SITE_INDEXABLE=${NEXT_PUBLIC_SITE_INDEXABLE}
# Base des assets images : sans elle, les URLs d'images deviennent relatives →
# servies (404) par le VPS au lieu du bucket R2. Indépendante du domaine du site.
ARG NEXT_PUBLIC_IMG_BASE=https://img.outerpedia.com
ENV NEXT_PUBLIC_IMG_BASE=${NEXT_PUBLIC_IMG_BASE}
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
