# ---------------------
# Build stage
# ---------------------
FROM oven/bun:1.3.3-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source
COPY . .

# Build Next.js app
RUN bun --bun run build


# ---------------------
# Production stage
# ---------------------
FROM oven/bun:1.3.3-alpine AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy required runtime files
COPY --from=build /app/package.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# Fix ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Start Next.js
CMD ["bun", "run", "start"]
