# Threadly

Threadly is a full-stack marketplace for second-hand fashion. Guests can search the rack;
members can publish listings with images, maintain a wishlist, complete a mocked checkout,
and review orders; administrators can moderate listings and inspect marketplace activity.

## Quick start

Requirements: Node.js 20+ (Node 22 recommended) and npm.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `apps/api/.env`
3. Initialize and run: `npm run db:setup && npm run dev`

Open [http://localhost:5173](http://localhost:5173). The API runs on port 4000.

Seeded accounts:

| Role          | Email                 | Password      |
| ------------- | --------------------- | ------------- |
| Administrator | `admin@threadly.dev`  | `admin12345`  |
| Seller        | `seller@threadly.dev` | `password123` |

The SQLite database and uploaded images are local runtime files and are intentionally ignored
by Git.

## What is included

- Searchable, paginated public catalog with category, condition, price, and sort support
- Session-based registration and sign-in using HTTP-only, SameSite cookies
- Owner-only listing create, edit, delete, mark-sold, and validated image upload flows
- Per-user wishlists that automatically discard sold items
- Transactional mocked checkout with captured purchase price and order history
- Role-protected admin moderation and marketplace order oversight
- Consistent Zod validation and JSON error envelopes
- Responsive Material UI frontend with loading, empty, success, and error states
- API integration tests, component tests, and three Playwright browser journeys
- GitHub Actions quality and browser-test jobs

## Architecture

```text
apps/
  api/      Express 5, Prisma, SQLite, sessions, Vitest/Supertest
  web/      React 19, Vite, Material UI, React Router, Vitest
packages/
  shared/   Shared Zod schemas and TypeScript contracts
e2e/        Playwright user journeys
```

The API is organized as routes → controllers → services → Prisma. HTTP validation and response
mapping remain at the edge; inventory transitions, ownership, and authorization live in services
and middleware. The web app uses a central credential-aware API client and feature folders.

## Commands

| Command             | Purpose                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| `npm run dev`       | Start API and web development servers                                                |
| `npm run db:setup`  | Apply migrations and seed demo data                                                  |
| `npm run lint`      | Lint all workspaces                                                                  |
| `npm run typecheck` | Run strict TypeScript checks                                                         |
| `npm test`          | Run API and component tests                                                          |
| `npm run e2e`       | Run Playwright tests (install Chromium first with `npx playwright install chromium`) |
| `npm run build`     | Produce production builds                                                            |

## Environment

The API reads `apps/api/.env`. Production deployments must replace `SESSION_SECRET`, set the
allowed `CLIENT_ORIGIN`, and provide durable storage for the SQLite database and `UPLOAD_DIR`.
The browser uses `VITE_API_URL` when supplied and otherwise targets `http://localhost:4000/api`.

This project deliberately uses SQLite and local uploads for a simple, reproducible demonstration.
For multi-instance production deployment, move relational data to PostgreSQL, images to object
storage, sessions to a shared store, and rate limiting to shared infrastructure.

## Security notes

- Passwords are salted and hashed with bcrypt; credentials and session identifiers are never
  returned by API serializers.
- Every mutating listing route enforces ownership, and admin routes enforce the `ADMIN` role.
- Checkout atomically claims an available item before creating its unique order.
- Uploads accept only JPEG, PNG, or WebP files up to 5 MB and use generated filenames.
- Auth endpoints are rate-limited, CORS is restricted, and server errors do not expose stacks.
