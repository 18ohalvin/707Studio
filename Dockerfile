# ==========================================
# 707 Activation Builder — single production image
# ==========================================
# The frontend and the API ship together in one container so the whole studio
# is reachable under one domain: Express serves the built Vue app and handles
# /api itself, which avoids needing a separate web server or CORS setup.
#
# Debian slim (not Alpine) on purpose — native module builds on this deploy
# server have repeatedly failed against Alpine's musl headers mirror.

# ---- Stage 1: build the frontend ----
FROM node:22-slim AS frontend-builder

WORKDIR /app

COPY package*.json ./
# --include=dev is required: the deploy platform injects NODE_ENV=production as
# a build arg, which would otherwise make npm skip devDependencies and leave
# vite/vue-tsc missing at build time.
RUN npm ci --include=dev

COPY . .
RUN npm run build

# ---- Stage 2: build the API ----
FROM node:22-slim AS server-builder

WORKDIR /app/server

COPY server/package*.json ./
# Same reason as the frontend stage: typescript lives in devDependencies.
RUN npm ci --include=dev

COPY server/ ./
RUN npm run build

# ---- Stage 3: runtime ----
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
# Uploads must live on the mounted volume, not inside the image, or every
# deploy wipes the media library.
ENV UPLOAD_DIR=/app/data/uploads

# curl for the container healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Production dependencies for the API
COPY server/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled API
COPY --from=server-builder /app/server/dist ./dist
# SQL schema/seed, kept alongside for first-time database setup
COPY --from=server-builder /app/server/db ./db
# Built frontend — server/src/index.ts serves this from public/app
COPY --from=frontend-builder /app/dist ./public/app

RUN mkdir -p /app/data/uploads

VOLUME ["/app/data"]

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail --silent http://localhost:3001/api/health || exit 1

CMD ["node", "dist/index.js"]
