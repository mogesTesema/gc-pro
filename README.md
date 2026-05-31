# GC-Pro Enterprise Suite

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Version](https://img.shields.io/badge/version-2.4.1-blue)

Secure, internal collaboration and compliance reporting platform. Features high-performance analytics dashboards, audit trails, and encrypted messaging.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment](#deployment)
5. [Contribution Guidelines](#contribution-guidelines)
6. [Security](#security)

## Architecture Overview
This application is built on a robust enterprise stack: **React 18, Express, Node.js, WebSockets**.
It follows strict Domain-Driven Design (DDD) principles and features event-driven micro-architecture for high scalability.

## Prerequisites
Please ensure your local development environment complies with IT security policies.
- Internal VPN access configured.
- Validated SSL certificates installed.

## Environment Setup
```bash
docker-compose up -d
```

## Deployment
All deployments must pass through the automated CI/CD pipeline. Direct pushes to `main` are strictly prohibited by branch protection rules.

## Contribution Guidelines
Please refer to `CONTRIBUTING.md` for strict branch naming and commit message conventions.

## Security
Report vulnerabilities according to `SECURITY.md`. Do NOT create public issues for security flaws.
