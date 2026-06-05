# CLAUDE.md — Working Rules for This Project

This file is read by Claude Code on every turn. It encodes the conventions of this repo so AI output stays consistent with the human-authored spec.

> Source of truth: `docs/SPEC.md`. If a change conflicts with the spec, update the spec first, then code.

---

## Repository shape (fixed)

This is a **two-package monorepo** using npm workspaces:

- `server/` — Express + Mongoose + Zod + TypeScript. Deploys to Render.
- `client/` — Vite + React 18 + Tailwind + TypeScript. Deploys to Vercel.

Run from the repo root: `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Tech stack (fixed — do not substitute)

- **Server**: Node 20+, Express 4, Mongoose 8 (MongoDB Atlas), Zod 3, Vitest, Supertest, `mongodb-memory-server` for tests
- **Client**: React 18, Vite 6, Tailwind CSS 4 (CSS-first via `@theme` in `index.css` and `@tailwindcss/vite` plugin), Zustand 5 (cart only, persisted), Zod 3, React Router 7, Vitest + RTL
- **Real-time**: Server-Sent Events (one-way server → client)

## Folder & naming rules

**Server:**
- Route handlers in `server/src/routes/**` are **thin**: parse → validate (Zod) → call service → format response. No business logic.
- Services in `server/src/services/**` are pure functions that talk to models; they never import from `express`.
- Mongoose models in `server/src/models/**`.
- Co-locate tests: `foo.ts` next to `foo.spec.ts`.

**Client:**
- Pages in `client/src/pages/**`.
- Reusable UI in `client/src/components/**` grouped by feature folder.
- Shared helpers/types/schemas in `client/src/lib/**`.
- Co-locate tests next to the code under test.

## Validation

- Every API route validates its input with a Zod schema at the top of the handler.
- The same shape is mirrored on the client (`client/src/lib/schemas.ts`) for pre-submit form validation.
- Errors are returned as `{ error: { code, message, fields? } }`.

## Code style

- TypeScript strict; no `any`. If a third-party type is missing, declare it locally.
- No comments unless the *why* is non-obvious. No JSDoc on internal functions.
- No `try/catch` that swallows errors. Routes use a single error handler in `app.ts`.
- No premature abstractions. Second use site is allowed; a third triggers extraction.
- Server imports use `.js` extensions (ESM Node convention) even when the source file is `.ts`.

## What NOT to do

- Do not add features that are not in `SPEC.md`.
- Do not add authentication, payments, or admin UI — explicitly out of scope.
- Do not introduce a new dependency without flagging it (package + reason + alternative considered).
- Do not seed data outside `server/src/seed.ts`.
- Do not use `console.log` in committed code (warn/error/info OK).
- Do not write tests that assert on implementation details. Test behaviour.

## TDD loop

For each new endpoint or service function:

1. Open or create the `.spec.ts` next to the implementation file.
2. Add the cases derived from `SPEC.md` (cite the FR-id in the test name).
3. `npm run test:watch` (in the relevant workspace) until green.
4. Commit: `feat(orders): create endpoint (FR-ORDER-1, FR-ORDER-3)`.

## Commands

From the repo root:

```bash
npm run dev          # client (5173) + server (4000) in parallel
npm run build        # builds both
npm run lint         # lint both
npm run typecheck    # typecheck both
npm test             # tests for both
```

Per workspace:

```bash
npm --workspace server run dev
npm --workspace client run dev
```

## When unsure

Ask. The cost of a clarifying question is much lower than the cost of building the wrong thing.
