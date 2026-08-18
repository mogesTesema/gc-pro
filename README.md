# AACP

React frontend for the AI Advertisement Collaboration Platform — a marketplace where creators and brands run campaigns, applications, chat, and payouts.

## Requirements

- Node.js 20 (`nvm use` if you have `.nvmrc`)
- npm

## Setup

```bash
npm ci
cp .env.example .env
```

`.env` is optional for local UI work. API calls go to `REACT_APP_API_URL` (defaults to `http://localhost:5000/api`).

## Scripts

```bash
npm start          # dev server at http://localhost:3000
npm test           # Jest + Testing Library (non-interactive)
npm run typecheck  # tsc --noEmit
npm run build      # production bundle
```

Tests mock the HTTP client. They do not need a backend, database, or credentials.

## Stack

Create React App, React 19, TypeScript, Tailwind CSS, React Router.
