# Testing Strategy

This document outlines our commitment to **Test-Driven Development** (TDD) and how we verify code correctness.

---

## 1. Philosophy

- **Tests are written from the spec, not from the code.** Every test references a `FR-*` ID from `SPEC.md`.
- **Test behaviour, not implementation.** We assert on inputs and outputs, not internal calls.
- **Pyramid, not ice-cream-cone.** Lots of small unit tests on schemas and services, a layer of integration tests on API routes, a thin layer of component tests on critical UI.
- **No mocks of our own modules.** We mock at process boundaries only (timers, network if needed). Services use real models against an in-memory MongoDB.

## 2. Stack

| Layer                  | Tool                                                       |
| ---------------------- | ---------------------------------------------------------- |
| Server unit + integration | **Vitest 2** + **Supertest** + **mongodb-memory-server** |
| Client unit + component   | **Vitest 2** + **@testing-library/react** (jsdom)        |

`mongodb-memory-server` boots a real Mongo binary in a temp dir for tests, so CI passes without an Atlas account. Each test wipes collections in `beforeEach`.

## 3. What is covered

### 3.1 Schemas — both sides
- `server/src/lib/schemas.spec.ts` — happy path + negative test per field on `CustomerSchema` and `CreateOrderInputSchema` (FR-ORDER-1, FR-ORDER-2).
- `client/src/lib/schemas.spec.ts` — same for the mirrored client schema, so drift between FE/BE is caught at test time.

### 3.2 Services (`server/src/services/orders.service.spec.ts`)
- FR-ORDER-3: `createOrder` returns a persisted order with `status = "RECEIVED"` and a server-computed total.
- Idempotency key lookup returns the existing order (FR-ORDER-3).
- Server-side re-pricing ignores any forged `total` field on the input.
- FR-ORDER-2: unknown menu IDs return `UNKNOWN_ITEM` with field-level errors.
- `getOrder` / `listOrders` round-trip through Mongo.
- `setOrderStatus` updates manually (FR-STATUS-5) and returns `null` for malformed/unknown IDs.
- `deleteOrder` removes a persisted order and returns `false` for missing or malformed IDs (FR-DELETE-1, FR-DELETE-2).

### 3.3 API routes & controllers (`server/src/routes/*.spec.ts`)
- `GET /api/menu` — 200 + items (FR-MENU-1).
- `POST /api/orders`:
  - 201 + order body on valid payload (FR-ORDER-1, FR-ORDER-3).
  - 201 + same order ID on duplicate request with same `x-idempotency-key` (FR-ORDER-3).
  - 400 + `customer.phone` field error on invalid phone (FR-ORDER-2, FR-ORDER-4).
  - 400 on empty items.
  - 400 on unknown menu item, with `items.0.menuItemId` field error.
- `GET /api/orders/:id`:
  - 200 on existing ID (FR-STATUS-3).
  - 404 on a well-formed but missing ObjectId.
  - 404 on a malformed ID (no CastError leak).
- `PATCH /api/orders/:id/status` — 200 on valid status, 400 on garbage (FR-STATUS-5).
- `DELETE /api/orders/:id` — 204 + removed, 404 on missing or malformed id (FR-DELETE-1, FR-DELETE-2).
- `GET /api/orders` — 200 + orders array (FR-LIST-1).

### 3.4 Client cart store (`client/src/lib/cart-store.spec.ts`)
- Add new item → quantity 1.
- Add existing item → quantity increments (FR-CART-1).
- Set quantity to 0 → item removed (FR-CART-2).
- Negative quantity → item removed (FR-CART-2).
- Remove drops only the targeted line.
- Subtotal calculation (FR-CART-4).

### 3.5 Client component (`client/src/components/orders/StatusStepper.spec.tsx`)
- Renders prior steps as "done", current as "current", later as "pending".
- Treats `DELIVERED` as the final current step.

## 4. What we deliberately do *not* test

- **End-to-end browser tests (Playwright).** Out of scope for the current phase; manual smoke covers the customer flow.
- **The SSE wire format in a unit test.** It's exercised manually with `curl -N`; mocking `EventSource` reliably in jsdom is more brittle than the value it provides.
- **Mongoose internals.** Schemas, casting, etc.
- **Network errors in the UI.** Surfaced via the error states on `MenuPage` and `OrderPage`; testing the strings is brittle.

## 5. Running tests

From the repo root:

```bash
npm test                       # both workspaces in parallel
npm --workspace server test    # server only
npm --workspace client test    # client only
```

Watch mode per workspace:

```bash
npm --workspace server run test:watch
npm --workspace client run test:watch
```

## 6. CI signal (local equivalent)

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

If that passes, the code matches the spec to the level we can automate. GitHub Actions runs the exact same command on every push.
