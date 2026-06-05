FROM node:20-bookworm-slim AS base
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*
ENV DATABASE_URL="file:/app/data/dev.db"

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/data && ./node_modules/.bin/prisma migrate deploy && npm run build

FROM base AS runner
WORKDIR /app
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/dev.db"
ENV AUTH_SECRET="change-me"

RUN mkdir -p /app/data
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node server.js"]
