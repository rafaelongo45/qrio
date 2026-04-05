FROM node:22-alpine AS builder
WORKDIR /app

# Copy manifests first (better layer caching)
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN npm ci --workspace=server --workspace=shared --ignore-scripts

COPY server/ ./server/
COPY shared/ ./shared/

RUN npm run build --workspace=server

# ---- Runtime image ----
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN npm ci --workspace=server --workspace=shared --omit=dev --ignore-scripts

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/drizzle ./server/drizzle
COPY --from=builder /app/shared ./shared

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
