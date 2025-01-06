FROM node:20.14.0-bookworm-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends git ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

COPY . /app/

RUN cd backend && npm ci && npm run build

RUN cd frontend && npm ci && npm run build
