FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY shared/package.json ./shared/

RUN npm ci --workspace=client --workspace=shared --ignore-scripts

COPY client/ ./client/
COPY shared/ ./shared/

RUN npm run build --workspace=client

# ---- Runtime image ----
FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
