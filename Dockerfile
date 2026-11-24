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

# NEXT_PUBLIC_* values are inlined by Next.js during `next build`, so the
# environment-specific values must be supplied as build args. Keep this list
# in sync with .github/workflows/build-image.yml and README.md.
ARG NEXT_PUBLIC_MODE
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL
ARG NEXT_PUBLIC_PLATFORM_NAME
ARG NEXT_PUBLIC_POLYGON_TESTNET_URL
ARG NEXT_PUBLIC_POLYGON_MAINNET_URL
ARG NEXT_PUBLIC_ENABLE_APP_LAUNCHER
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN
ARG NEXT_PUBLIC_ACTIVE_THEME
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_FOOTER_TEXT
ARG NEXT_PUBLIC_LOGO_BASE_URL
ARG NEXT_PUBLIC_CURRENT_RELEASE
ARG NEXT_PUBLIC_ENABLE_BILLING_OPTION
ARG NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID
ARG NEXT_PUBLIC_LANDINGPAGE_URL

ENV NEXT_PUBLIC_MODE=${NEXT_PUBLIC_MODE} \
    NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
    NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL=${NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL} \
    NEXT_PUBLIC_PLATFORM_NAME=${NEXT_PUBLIC_PLATFORM_NAME} \
    NEXT_PUBLIC_POLYGON_TESTNET_URL=${NEXT_PUBLIC_POLYGON_TESTNET_URL} \
    NEXT_PUBLIC_POLYGON_MAINNET_URL=${NEXT_PUBLIC_POLYGON_MAINNET_URL} \
    NEXT_PUBLIC_ENABLE_APP_LAUNCHER=${NEXT_PUBLIC_ENABLE_APP_LAUNCHER} \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
    NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=${NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN} \
    NEXT_PUBLIC_ACTIVE_THEME=${NEXT_PUBLIC_ACTIVE_THEME} \
    NEXT_PUBLIC_APP_TITLE=${NEXT_PUBLIC_APP_TITLE} \
    NEXT_PUBLIC_FOOTER_TEXT=${NEXT_PUBLIC_FOOTER_TEXT} \
    NEXT_PUBLIC_LOGO_BASE_URL=${NEXT_PUBLIC_LOGO_BASE_URL} \
    NEXT_PUBLIC_CURRENT_RELEASE=${NEXT_PUBLIC_CURRENT_RELEASE} \
    NEXT_PUBLIC_ENABLE_BILLING_OPTION=${NEXT_PUBLIC_ENABLE_BILLING_OPTION} \
    NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID=${NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID} \
    NEXT_PUBLIC_LANDINGPAGE_URL=${NEXT_PUBLIC_LANDINGPAGE_URL}

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
