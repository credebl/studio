# ---------------------
# Build stage
# ---------------------
FROM node:22-alpine AS build

# Enable corepack and install a specific pnpm version securely
RUN corepack enable && corepack prepare pnpm@10.3.0 --activate


# Set working directory
WORKDIR /app

# Copy only necessary files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
# sonarcloud: disable=ShellScriptExecutionRisk
RUN pnpm install

# Copy the rest of the source code
COPY . .
# COPY .next ./.next
# COPY public ./public
# COPY node_modules ./node_modules


# Build the Next.js application
RUN pnpm run build

# ---------------------
# Production stage
# ---------------------
FROM node:22-alpine AS production

# Create a non-root user
# RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Set working directory
WORKDIR /app

# Copy necessary build artifacts from build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
