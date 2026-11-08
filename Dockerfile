# ---------------------
# Dependencies stage
# ---------------------
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.3.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Lockfile is committed; fail the build if it drifts from package.json.
RUN pnpm install --frozen-lockfile

# ---------------------
# Build stage
# ---------------------
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.3.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm run build

# ---------------------
# Production stage
# ---------------------
FROM node:22-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output bundles only the runtime dependencies.
COPY --from=build --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=build --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=build --chown=appuser:appgroup /app/public ./public

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
