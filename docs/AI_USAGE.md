# AI Usage Log

This document is a transparent record of **how AI tooling was used to build this project** and **how it was constrained** as a spec-driven development process.

The project was built using **an AI assistant** as a spec-driven pair-programmer. The workflow below is deliberately structured: AI was steered by markdown specs, not asked to "build me an app."

---

## 1. The spec-driven workflow

```
                 ┌──────────────────────────────────────────────┐
                 │  SPEC.md  +  ARCHITECTURE.md  +  CLAUDE.md   │
                 │            (committed source of truth)        │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                  ┌──────────────────────────────────────┐
                  │  Claude Code reads these every turn  │
                  └──────────────┬───────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
       Code generation      Test generation        Doc updates
       (TDD per slice)      (Vitest + RTL)         (this file)
```

The contract: **AI never invents requirements or tech choices**. It only implements what is written in `SPEC.md` and `ARCHITECTURE.md`. Spec changes first, then code.

## 2. Tool used

| Tool             | Role                                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI Assistant** | Drove the entire build: scaffolding, models, services, routes, SSE, client UI, tests, deployment configuration. Operated under the rules in `CLAUDE.md`. |

I deliberately scoped AI usage to a single high-context tool rather than fragmenting across Copilot, Cursor, and ChatGPT. With one tool reading the whole spec and codebase, every change stays consistent. Multi-tool setups tend to drift.

## 3. Where AI was used — by activity

### 3.1 Requirements analysis & decomposition
- **Input**: functional requirements.
- **AI's role**: extract functional vs non-functional requirements, surface gaps (e.g., "pick reasonable defaults for status durations and document them"), propose the user-story table in `SPEC.md`.
- **My role**: approve/reject every choice; reject anything beyond the spec.

### 3.2 Architecture decisions
- **Input**: four-question check-in at session start (tech stack, storage, real-time, AI tools), then a second pivot when I decided to move to Express + MongoDB.
- **AI's role**: lay out trade-offs in tables, recommend defaults with reasoning, **push back when the pivot added complexity without obvious gain** (it warned that Express + Mongo means more reviewer setup, not "simpler code"). I made the call anyway because separation was the goal.
- **My role**: own the final picks. Decisions captured in `ARCHITECTURE.md` §4 with trade-offs explicit.

### 3.3 Code generation
- **Process**: one slice at a time (e.g., "the orders service + its Vitest tests"). Each slice referenced relevant `SPEC.md` IDs (e.g., FR-ORDER-1 through FR-ORDER-4).
- **Guardrails (from `CLAUDE.md`)**:
  - No backwards-compat shims, no speculative abstractions.
  - No comments unless the *why* is non-obvious.
  - Thin route handlers — business logic lives in services.
- **Verification**: each slice followed by `npm run typecheck && npm test` before moving on.

### 3.4 Test-Driven Development
- **Approach**: for each endpoint, AI generated the Vitest spec **first** (listing the cases derived from the spec), then the implementation. Red → green → next case.
- **Coverage targets** (see `TESTING.md`): every FR has at least one test; validation has a negative test per field.
- **What AI is bad at**: writing *redundant* tests. I pruned duplicates and merged overlapping cases by hand.

### 3.5 Debugging
- **Pattern**: when a test failed, the full failure was pasted back to AI with the file and the spec rule being tested. AI proposed a minimal patch, not a rewrite.
- **Example**: the SSE handler initially leaked event-bus listeners. AI's first fix wrapped the issue in a `try/catch`. I rejected that as a workaround and asked for the root cause. The real fix was unregistering the listener on `req.on("close")` and clearing the heartbeat interval. That kind of pushback matters.
- **Example 2**: `findByIdAndUpdate("nope-id", ...)` was throwing a Mongoose CastError. AI's first instinct was to wrap in try/catch and return null. Real fix: validate the id with `mongoose.Types.ObjectId.isValid` at the top of the service. Cleaner contract, no exception caught.

### 3.6 Documentation
- All docs in this folder were drafted by AI, then edited by me for tone and to remove fluff.
- `README.md` was generated last, after the code stabilised, so the commands shown match `package.json`.

### 3.7 The mid-build pivot
Halfway through I changed the stack from Next.js monorepo to Express + MongoDB + React+Vite. AI:
- Flagged the cost (more infra, two deploys, CORS, env vars) before agreeing.
- Asked four questions to lock the new shape (frontend choice, BE deploy target, Atlas setup, what to do with old code).
- Cleanly deleted the old code, regenerated the monorepo, kept the spec-driven docs structure intact.

The willingness to challenge the change kept it from being a knee-jerk pivot.

## 4. Where AI was *not* used

Knowing the limits matters:

- **Final architectural calls.** AI recommended; I chose. Recorded in `ARCHITECTURE.md`.
- **The spec itself.** I read the PDF; AI formalised but did not invent requirements.
- **Trust in green tests.** Tests were also reviewed by me — a generated test that passes against generated code can both be wrong in the same way. Spot-checked critical assertions manually.
- **Deployment credentials & repository creation.** Handled manually; AI does not touch my GitHub, Vercel, or Atlas accounts.

## 5. Prompts that worked well (templates)

> **Spec-bound implementation**
> "Implement `FR-ORDER-2` from `SPEC.md`. Tests first in `orders.service.spec.ts`, then service code in `server/src/services/orders.service.ts`. Follow the rules in `CLAUDE.md`. Do not add helpers or comments unless the test forces them."

> **Adversarial review**
> "Review the diff in `server/src/routes/orders.routes.ts`. Find: (a) any path that bypasses Zod validation, (b) any branch not covered by a test, (c) anything that violates `ARCHITECTURE.md` §4. List findings; do not edit yet."

> **Refactor**
> "There is duplication between `CheckoutForm.tsx` and `cart-store.ts` for totals. Propose two options and recommend one. Do not change code yet."

Pattern: **point at a spec rule, give a narrow scope, ask for findings before edits.** Open-ended prompts produce mush.

## 6. Lessons / honest reflection

1. **The spec is the most important file.** Without `SPEC.md` and `ARCHITECTURE.md`, AI defaults to "common patterns" that may not fit the task. With them, every output is anchored.
2. **AI is overconfident on edge cases.** It will happily generate `try/catch` blocks that hide real bugs. I had to push back several times — both for the SSE leak and the ObjectId casting issue.
3. **Tests written by AI need a human eye for *meaningful* coverage.** Line coverage is easy; behavioural coverage requires understanding the spec. I removed several "tests" that asserted the implementation rather than the behaviour.
4. **Small slices win.** One endpoint + its tests at a time produced clean diffs. "Build the whole orders module" produces sprawl with subtle inconsistencies.
5. **AI is good at pushing back too.** When I asked to pivot from Next.js to Express, AI listed the costs before agreeing — that saved me from a worse decision had I been wrong.
6. **Saying "no" is part of the workflow.** Roughly 1 in 4 AI suggestions was rejected or rewritten. If that ratio is 0, AI is leading.

## 7. Reproducibility

Anyone reading this repo can reconstruct the build:

1. Read `SPEC.md` → know *what* to build.
2. Read `ARCHITECTURE.md` → know *how* and *why*.
3. Read `CLAUDE.md` → know the conventions AI was told to follow.
4. Read this file → know the human/AI division of labour.

The goal here isn't just saying "I used AI" — it's "here is a workflow you could repeat."
