# Threadly

A vintage fashion marketplace where users browse and list second-hand clothing, curate a
wishlist, and "purchase" items via a mocked checkout.

Built as a demonstration of full-stack best practices: clean monorepo architecture, strict
TypeScript, automated tests, CI, and an incremental Git/PR workflow.

## Stack

| Layer    | Tech                                                       |
| -------- | ---------------------------------------------------------- |
| Frontend | React + TypeScript, Vite, MUI                              |
| Backend  | Node.js + TypeScript, Express 5, Zod validation            |
| Database | SQLite via Prisma (dev choice — swap for Postgres in prod) |
| Auth     | Session-based (HTTP-only cookies), bcrypt hashing          |
| Testing  | Vitest (unit + integration), Playwright (e2e)              |
| Tooling  | ESLint, Prettier, Husky, lint-staged, commitlint           |

## Repository layout

```
apps/
  web/     # React frontend
  api/     # Express backend
packages/
  shared/  # Shared TypeScript types & validation schemas
```

## Getting started

_(Full run instructions land with the final release PR. Each PR keeps the app runnable.)_
