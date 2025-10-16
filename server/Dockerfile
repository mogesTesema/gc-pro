# ═══════════════════════════════════════════════════════════════
#  AACP Backend — Multi-Stage Dockerfile
#  Stack : Node.js 20 (LTS) · TypeScript · Express · Mongoose
# ═══════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────
# Stage 1 · deps
#   Install ALL dependencies (including devDeps needed for tsc)
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install OS-level packages required by some native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifests first — Docker layer cache will skip npm ci
# unless package files actually changed
COPY package.json package-lock.json ./

# Clean install — deterministic, uses lock file
RUN npm ci

# ──────────────────────────────────────────────────────────────
# Stage 2 · builder
#   Compile TypeScript → JavaScript into /app/dist
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Pull node_modules from deps stage (avoids re-installing)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build 2>/dev/null || npx tsc --project tsconfig.json

# ──────────────────────────────────────────────────────────────
# Stage 3 · runner  (the final production image)
#   Copy only compiled output + production node_modules
#   Result: ~180 MB instead of ~600 MB
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 appuser

WORKDIR /app

# Only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# If your app serves static files or uploads, copy them too
# COPY --from=builder /app/uploads ./uploads

# Switch to non-root
USER appuser

# The port the Express server listens on
EXPOSE 5000

# Graceful shutdown support
STOPSIGNAL SIGTERM

# Health check — hits the existing /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the compiled server
CMD ["node", "dist/server.js"]
