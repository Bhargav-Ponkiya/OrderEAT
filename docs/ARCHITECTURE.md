# Architecture & Design Decisions

This document captures the **why** behind each technical choice.

---

## 1. High-level shape

```
┌──────────────────────┐      HTTP + SSE       ┌───────────────────────────┐
│  React + Vite SPA    │ ───────────────────►  │  Express REST + SSE       │
│  (Vercel)            │ ◄── EventSource ───── │  (Render)                 │
└──────────────────────┘                       │           │               │
                                               │           ▼               │
                                               │  ┌──────────────────┐    │
                                               │  │   Services       │    │
                                               │  │  (pure logic)    │    │
                                               │  └────────┬─────────┘    │
                                               │           ▼               │
                                               │  ┌──────────────────┐    │
                                               │  │  Mongoose models │    │
                                               │  └────────┬─────────┘    │
                                               └───────────┼──────────────┘
                                                           ▼
                                                ┌──────────────────┐
                                                │  MongoDB Atlas   │
                                                └──────────────────┘
```

The client never imports anything from the server (and vice versa). They only meet at the HTTP boundary, which is the kind of separation Express + React makes explicit.

## 2. Tech choices

| Concern               | Pick                                      | Why                                                                              |
| --------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- |
| Backend framework     | **Express 4**                             | Tiny, ubiquitous, easy to reason about. Plays nicely with Mongoose + SSE.        |
| ORM/ODM               | **Mongoose 8**                            | Schema-first MongoDB. Strong typing via `InferSchemaType`.                       |
| Validation            | **Zod 3**                                 | One schema → both runtime check and TS types. Shared shape FE/BE.                |
| Real-time             | **Server-Sent Events**                    | One-way status updates only need server→client. Native browser API. No extra ws server. |
| Frontend framework    | **React 18 + Vite 6**                     | Fastest dev loop. Static build deploys anywhere.                                 |
| Routing               | **React Router 7**                        | Standard for Vite-based React apps.                                              |
| Styling               | **Tailwind 4** (`@tailwindcss/vite`)      | Latest stable. CSS-first config (`@theme` block in `index.css`, no `tailwind.config.ts`). Native Vite plugin, no PostCSS chain. |
| Cart state            | **Zustand 5** + `persist`                 | Tiny, no provider boilerplate, localStorage out of the box.                      |
| Server state          | Plain `fetch` + local component state     | 3 endpoints; TanStack Query would be overkill.                                   |
| Tests                 | **Vitest 2** + Supertest + RTL + `mongodb-memory-server` | Single test runner everywhere. In-memory Mongo means CI needs no Atlas. |
| Backend deploy        | **Render** (free tier)                    | Persistent Node server (Vercel functions kill SSE).                              |
| Frontend deploy       | **Vercel**                                | Static build, instant deploys, free.                                             |
| DB                    | **MongoDB Atlas** (free M0)               | The spec allows "a simple database." Mongo is the natural pair with Express.     |

## 3. Folder layout

```
ordereat/
├── server/
│   ├── src/
│   │   ├── app.ts              # Express app factory (createApp)
│   │   ├── index.ts            # bin: connect DB, seed, listen
│   │   ├── db.ts               # mongoose connect/disconnect
│   │   ├── seed.ts             # initial menu data
│   │   ├── status-scheduler.ts # setTimeout chain that progresses status
│   │   ├── models/
│   │   │   ├── MenuItem.model.ts
│   │   │   └── Order.model.ts
│   │   ├── services/
│   │   │   ├── menu.service.ts
│   │   │   └── orders.service.ts
│   │   ├── routes/
│   │   │   ├── menu.routes.ts
│   │   │   └── orders.routes.ts
│   │   ├── realtime/
│   │   │   ├── event-bus.ts    # EventEmitter wrapper
│   │   │   └── sse.ts          # express handler that writes SSE
│   │   ├── lib/
│   │   │   ├── schemas.ts      # Zod
│   │   │   ├── types.ts
│   │   │   └── http.ts         # error helpers
│   │   └── test/setup.ts       # mongodb-memory-server setup
│   ├── package.json
│   ├── tsconfig.json + tsconfig.build.json
│   └── vitest.config.ts
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── lib/{types,schemas,api,cart-store,format}.ts
│   │   ├── pages/{Menu,Checkout,Order}Page.tsx
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── ui/{Button,Input}.tsx
│   │       ├── menu/MenuGrid.tsx
│   │       ├── cart/CartDrawer.tsx
│   │       ├── checkout/CheckoutForm.tsx
│   │       └── orders/{StatusStepper,OrderStatusView}.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│   # Tailwind v4 is configured via `@theme` in `src/index.css`; no tailwind.config.* file
├── docs/                       # SPEC, ARCHITECTURE, AI_USAGE, TESTING, SETUP
├── CLAUDE.md                   # AI working rules
└── package.json                # npm workspaces root
```

## 4. Key design decisions (with trade-offs)

### 4.1 Repository or no repository?

For Mongoose, **the model itself is the repository**. Mongoose schemas already define the persistence contract; adding another layer for the sake of "interface + implementation" would be ceremony with no payoff at this size. Services call models directly. If we needed to swap to Postgres later we'd write a real repository layer then — until then, KISS.

### 4.2 Zod schemas mirrored, not shared

The client has its own `schemas.ts` mirroring the server's. We could share via a third workspace, but adding a `shared/` package for ~30 lines of Zod is more friction than it's worth. The shapes are small enough that drift is obvious in a diff and tested on both sides.

### 4.3 Status scheduler driven by `setTimeout`

When an order is created, the scheduler chains three `setTimeout`s that flip the status in MongoDB and emit on an in-process `EventEmitter`. The SSE handler subscribes to the bus filtered by order ID and writes events to the open response.

Trade-off: `setTimeout` does not survive a server restart. The spec explicitly allows "simulated in the back-end", and Render keeps the process alive for at least the demo window. A real system would use a job queue (BullMQ, Cloud Tasks). Worth calling out, not worth building today.

### 4.4 SSE over WebSockets

The customer only consumes status updates — server → client. SSE delivers exactly that via the native `EventSource` API with auto-reconnect and a single HTTP connection. WebSockets would add a duplex channel we don't need plus more deployment friction (sticky sessions, etc.).

### 4.5 In-memory Mongo for tests

`mongodb-memory-server` spins up a real Mongo binary in a temp directory. Tests use it via the `beforeAll` hook in `src/test/setup.ts`. This means:
- CI passes without an Atlas account
- Tests are isolated (each test wipes collections in `beforeEach`)
- Speed is fine (~1s startup, then tests run normally)

### 4.6 Server-computed totals

The service re-prices every order line from the menu in MongoDB before persisting. Any forged `total` in the request body is dropped by the Zod schema (it isn't in the schema, so it's stripped). A test specifically asserts this.

### 4.7 ObjectId validation in services

Mongo ObjectIds are validated in the service layer (`mongoose.Types.ObjectId.isValid`) before any `findById`, so a request like `GET /api/orders/garbage` returns a clean 404 instead of a CastError stacktrace.

### 4.8 Error shape

Every API error returns:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "customer.phone": "Invalid phone" } } }
```

The client renders field-level errors directly from `fields`. Consistent, machine-readable, no string parsing.

### 4.9 CORS pinned to a known origin

Server reads `ALLOWED_ORIGINS` (comma-separated) from env. In prod it's the Vercel URL; locally it's `http://localhost:5173`. No `*` in production.

## 5. Security

- Every body and param validated by Zod at the route boundary.
- Phone, name, address have length caps.
- CORS scoped to the deployed client origin.
- No secrets in the repo. `.env.example` documents required vars.
- Express `json({ limit: "100kb" })` caps request size.
- Mongoose `strictQuery: true` so unknown fields are ignored.

## 6. What is intentionally *not* done

- **No auth.** Out of scope.
- **No payments.** Out of scope.
- **No job queue.** `setTimeout` is sufficient for the demo; documented.
- **No global state for orders on the client.** Page-local `useState` is enough for 3 routes.
- **No shared workspace for Zod schemas.** Mirrored deliberately; see §4.2.

These are deliberate. Each would be at least half a day of work that doesn't move the core product forward.
