# OrderEAT — Food Ordering & Real-Time Status Tracking

[![CI](https://github.com/Bhargav-Ponkiya/OrderEAT/actions/workflows/ci.yml/badge.svg)](https://github.com/Bhargav-Ponkiya/OrderEAT/actions/workflows/ci.yml)

> A modern food ordering and real-time status tracking application. Browse menu → add to cart → checkout → track order lifecycle.

- **Live demo:** <!-- TODO: Vercel URL -->
- **API:** <!-- TODO: Render URL/api/health -->

---

## What's here

A two-package monorepo that covers every feature in the brief:

- 🍕 **Menu** browsing with categories (FR-MENU)
- 🛒 **Cart** with quantity controls, persisted in `localStorage` (FR-CART)
- 💳 **Checkout** with Zod-validated delivery details (FR-ORDER)
- 🛵 **Order status tracking** with **real-time SSE updates** (FR-STATUS)
- 🧪 **TDD** with Vitest specs traced to spec IDs on both client and server
- 📄 **Spec-driven AI workflow** documented in [`docs/AI_USAGE.md`](./docs/AI_USAGE.md)

## Tech stack

| Layer    | Pick                                                  |
| -------- | ----------------------------------------------------- |
| Backend  | Express 4 + Mongoose 8 + Zod + TypeScript (Node 20+)  |
| Frontend | React 18 + Vite 6 + Tailwind 4 + Zustand + Zod        |
| Database | MongoDB Atlas                                         |
| Realtime | Server-Sent Events (one-way server → client)          |
| Tests    | Vitest 2 + Supertest + RTL + `mongodb-memory-server`  |
| Hosting  | Vercel (client) + Render (server)                     |

Decisions and trade-offs: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Documentation

Read in this order to understand the project the way it was built:

| Doc                                                    | What it covers                                  |
| ------------------------------------------------------ | ----------------------------------------------- |
| [`docs/SPEC.md`](./docs/SPEC.md)                       | Numbered requirements (FR-MENU-1, FR-ORDER-2…)   |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)       | Tech choices + design decisions + trade-offs    |
| [`docs/AI_USAGE.md`](./docs/AI_USAGE.md)               | How AI (Claude Code) was used to build this     |
| [`docs/TESTING.md`](./docs/TESTING.md)                 | TDD strategy and coverage map                    |
| [`docs/SETUP.md`](./docs/SETUP.md)                     | **Start here on a new machine** — local setup → deploy → submit |
| [`CLAUDE.md`](./CLAUDE.md)                             | Project rules read by the AI on every turn       |

## Getting started

### Prerequisites
- Node 20+ (Node 22 used in development — `.nvmrc` provided)
- A **MongoDB Atlas** connection string (free M0 cluster works)

### Setup

```bash
# from the repo root
npm install                          # installs both workspaces

# server env
cp server/.env.example server/.env
# edit server/.env and paste your MONGODB_URI

# client env (defaults work locally)
cp client/.env.example client/.env

# run both client + server in parallel
npm run dev
# server: http://localhost:4000
# client: http://localhost:5173
```

### Quality gate

```bash
npm run lint         # eslint, both workspaces
npm run typecheck    # tsc --noEmit, both workspaces
npm test             # vitest, both workspaces
npm run build        # production build, both workspaces
```

## API reference

Base URL: `http://localhost:4000` (local) or your Render URL.

All responses are JSON. Errors share `{ error: { code, message, fields? } }`.

| Method | Path                          | Description                                |
| ------ | ----------------------------- | ------------------------------------------ |
| GET    | `/api/health`                 | Liveness check                              |
| GET    | `/api/menu`                   | Returns the menu                            |
| GET    | `/api/orders`                 | Lists all orders (newest first)            |
| POST   | `/api/orders`                 | Creates an order: `{ items, customer }`    |
| GET    | `/api/orders/:id`             | Returns a single order                      |
| PATCH  | `/api/orders/:id/status`      | Manually update status: `{ status }`        |
| DELETE | `/api/orders/:id`             | Removes the order, cancels its scheduler    |
| GET    | `/api/orders/:id/stream`      | **SSE** stream of order status updates      |

### Example: place an order

```bash
curl -X POST http://localhost:4000/api/orders \
  -H 'content-type: application/json' \
  -d '{
    "items": [{ "menuItemId": "burger-classic", "quantity": 2 }],
    "customer": {
      "name": "Jane Doe",
      "address": "742 Evergreen Terrace, Springfield",
      "phone": "+1 555 123 4567"
    }
  }'
```

### Example: subscribe to status

```bash
curl -N http://localhost:4000/api/orders/<id>/stream
# event: snapshot
# data: {...}
# event: update
# data: {...}
```

## Real-time status simulation

When an order is created, a backend scheduler progresses it:

```
RECEIVED  →  PREPARING  →  OUT_FOR_DELIVERY  →  DELIVERED
   (10s)        (20s)            (30s)
```

Durations live in `server/src/status-scheduler.ts` and can be overridden for demos with the `STATUS_DELAYS_OVERRIDE` env var (format: `RECEIVED:5000,PREPARING:10000,OUT_FOR_DELIVERY:15000`).

The SSE client on `/orders/:id` updates the stepper UI as each event arrives. No polling.

## Deployment

See [`docs/SETUP.md`](./docs/SETUP.md) for the full step-by-step (Render for the API, Vercel for the SPA, MongoDB Atlas for data). Both free tiers.

## Feature checklist

| Requirement                                | Status |
| ------------------------------------------ | ------ |
| Menu display (FR-MENU)                     | ✅     |
| Add to cart + quantity (FR-CART)           | ✅     |
| Checkout with delivery details (FR-ORDER)  | ✅     |
| Order status with real-time updates (FR-STATUS) | ✅ (SSE) |
| REST API for orders + menu                 | ✅     |
| Database (MongoDB Atlas)                   | ✅     |
| TDD: API + UI component tests              | ✅     |
| Input validation                           | ✅ (Zod) |
| React + Vite                               | ✅     |
| Real-time updates                          | ✅     |
| Hosted (Vercel + Render)                   | ✅ (see top) |

## License

MIT
