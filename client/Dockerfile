# ═══════════════════════════════════════════════════════════════
#  AACP Frontend — Multi-Stage Dockerfile
#  Stack : Node.js 20 · React (CRA) · TypeScript · TailwindCSS
#  Served : Nginx 1.25 (alpine) for sub-10 ms static delivery
# ═══════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────
# Stage 1 · deps
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ──────────────────────────────────────────────────────────────
# Stage 2 · builder
#   react-scripts build creates an optimised static bundle
#   The REACT_APP_* env vars are baked in at build time.
#   Pass them via --build-arg in docker-compose / CI.
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time arg so the API URL can be injected without an .env file
ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Disable Create-React-App's interactive prompt in CI/Docker
ENV CI=true

# Production build (outputs to /app/build)
RUN npm run build

# ──────────────────────────────────────────────────────────────
# Stage 3 · runner  (Nginx serves the static files)
# ──────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runner

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled React app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy our custom Nginx config (handles React Router SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx runs on port 80 inside the container
EXPOSE 80

# Nginx logs to stdout/stderr so Docker can capture them
CMD ["nginx", "-g", "daemon off;"]
