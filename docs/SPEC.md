# Feature Specification — Order Management

This document is the **single source of truth** for what we are building. Every test, API route, and UI component traces back to a numbered requirement here.

---

## 1. Goal

Build an Order Management feature for a food delivery app: customers browse a menu, add items to a cart, place an order with delivery details, and watch the order status progress in real time.

## 2. User Stories

| ID    | As a…    | I want to…                                       | So that…                                |
| ----- | -------- | ------------------------------------------------ | --------------------------------------- |
| US-1  | customer | see all available food items                     | I know what I can order                 |
| US-2  | customer | add an item to my cart and adjust its quantity   | I order the right amount                |
| US-3  | customer | remove an item from my cart                      | I can change my mind                    |
| US-4  | customer | see my cart total before checkout                | I know what I will pay                  |
| US-5  | customer | check out by providing delivery details          | the order can be delivered to me        |
| US-6  | customer | see my order status after placing it             | I know it is being prepared             |
| US-7  | customer | watch the status update without refreshing       | I get live progress                     |

## 3. Functional Requirements

### 3.1 Menu

- **FR-MENU-1** `GET /api/menu` returns the full list of menu items.
- **FR-MENU-2** Each item has: `id` (string), `name`, `description`, `price` (cents), `imageUrl`, `category` (enum: `pizza | burger | drink | dessert`).
- **FR-MENU-3** Menu is seeded into MongoDB on server boot if the collection is empty.
- **FR-MENU-4** The UI displays items grouped by category with image, name, description, and price.

### 3.2 Cart (client-only state)

- **FR-CART-1** Adding an existing cart item increments its quantity rather than duplicating.
- **FR-CART-2** Quantity must be ≥ 1; setting it to 0 removes the item.
- **FR-CART-3** Cart persists across reloads via `localStorage`.
- **FR-CART-4** Subtotal = sum of `price × quantity`.

### 3.3 Checkout & Order Placement

- **FR-ORDER-1** `POST /api/orders` accepts `{ items, customer }` where `customer = { name, address, phone }`.
- **FR-ORDER-2** Server validates with Zod: items non-empty, valid menu IDs, quantity 1–99, phone matches a permissive E.164-ish pattern, name 2–80 chars, address 5–200 chars.
- **FR-ORDER-3** Server returns the persisted order with generated `id`, server-computed `total`, and initial `status = "RECEIVED"`.
- **FR-ORDER-4** Invalid payloads return HTTP 400 with a structured body `{ error: { code, message, fields? } }`.

### 3.4 Order Status (CRUD: read + update)

- **FR-STATUS-1** Statuses progress: `RECEIVED → PREPARING → OUT_FOR_DELIVERY → DELIVERED`.
- **FR-STATUS-2** On creation, server schedules timed transitions (simulated): `RECEIVED → PREPARING` after 10s, `PREPARING → OUT_FOR_DELIVERY` after 20s, `OUT_FOR_DELIVERY → DELIVERED` after 30s. Durations live in one constant and are overridable via `STATUS_DELAYS_OVERRIDE` env var for demos.
- **FR-STATUS-3** `GET /api/orders/:id` returns the order with current status.
- **FR-STATUS-4** `GET /api/orders/:id/stream` is a Server-Sent Events endpoint that pushes the order on every status change and on initial connect.
- **FR-STATUS-5** `PATCH /api/orders/:id/status` updates status manually (covers the assessment's CRUD update requirement).
- **FR-STATUS-6** Status page renders a stepper showing the current stage; SSE updates it without a refresh.

### 3.5 List (CRUD: read)

- **FR-LIST-1** `GET /api/orders` returns all orders, newest first.

### 3.6 Delete (CRUD: delete)

- **FR-DELETE-1** `DELETE /api/orders/:id` removes the order, cancels its scheduled status transitions, and returns `204 No Content`.
- **FR-DELETE-2** Returns `404` on a missing or malformed id without leaking a CastError.

## 4. Non-Functional Requirements

- **NFR-1** All API routes return JSON. All errors share the `{ error: {...} }` shape.
- **NFR-2** All request bodies and route params are validated with Zod at the route boundary.
- **NFR-3** Same Zod shape used on the client to validate forms before submit.
- **NFR-4** No business logic in route handlers; routes delegate to service functions.
- **NFR-5** Data persisted in MongoDB Atlas via Mongoose models.
- **NFR-6** SSE endpoint cleans up listeners on disconnect (no leaks).
- **NFR-7** CORS configured for the deployed client origin only.

## 5. Out of Scope (explicit)

- Authentication / user accounts
- Payments
- Admin dashboard
- Restaurant / multi-tenant support
- Mobile native app

## 6. Task Breakdown

1. **T-DOCS** — Write SPEC, ARCHITECTURE, AI_USAGE, TESTING, SETUP, CLAUDE.md.
2. **T-SCAFFOLD** — npm workspaces root, server (Express+TS+Vitest), client (Vite+React+TS+Vitest+Tailwind).
3. **T-DOMAIN** — Zod schemas + types (shared shape both sides), Mongoose models, services with menu seed.
4. **T-API** — Routes for menu, orders (create/list/get/update-status), SSE stream. Tests alongside.
5. **T-UI** — Menu page, cart store (Zustand), cart drawer, checkout form, order status page with SSE consumer.
6. **T-TESTS** — Vitest+Supertest for API (mongodb-memory-server). Vitest+RTL for cart store + StatusStepper.
7. **T-DEPLOY** — README, `.env.example` for both sides, Render config for server, Vercel for client.

## 7. Acceptance — Definition of Done

- All FR/NFR met and traced to at least one test.
- `npm run lint && npm run typecheck && npm test && npm run build` passes from the repo root.
- App runs locally end-to-end: `npm run dev` → http://localhost:5173, server on http://localhost:4000.
- Deployed: client on Vercel, server on Render, both backed by MongoDB Atlas, all green.
