# AGENTS.md — Reverse Academy

> You are a build agent for **Reverse Academy**, a reverse-engineering pedagogy platform built with SvelteKit (frontend) and Rust/Axum (backend). Implement `PLAN.md` faithfully — do not invent features or substitute technologies.

---

## Quick Reference

| Task | Command |
|------|---------|
| **Frontend dev** | `cd frontend && npm run dev` |
| **Frontend build** | `cd frontend && npm run build` |
| **Type check** | `cd frontend && npm run check` |
| **Lint** | `cd frontend && npm run lint` |
| **Format** | `cd frontend && npm run format` |
| **Unit/component tests** | `cd frontend && npm run test` |
| **Single test file** | `cd frontend && npx vitest run tests/unit/xp-calculator.test.ts` |
| **Single test (watch)** | `cd frontend && npx vitest xp-calculator` |
| **E2E tests** | `npx playwright test` |
| **Single E2E test** | `npx playwright test tests/e2e/learning-flow.spec.ts` |
| **Content validation** | `npx tsx scripts/validate-content.ts` |
| **Rust check** | `cd rust-api && cargo check` |
| **Rust clippy** | `cd rust-api && cargo clippy -D warnings` |
| **Rust format check** | `cd rust-api && cargo fmt --check` |
| **Rust tests** | `cd rust-api && cargo test` |
| **Single Rust test** | `cd rust-api && cargo test test_name_here` |
| **Full CI** | Lint → Type check → Content validation → Unit tests → Rust check → Rust tests |

---

## Project Structure

```
reverse-academy/
├── frontend/                 # SvelteKit 2 + TypeScript (strict)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/   # learning/ tutor/ gamification/ ui/ shared/
│   │   │   ├── engine/       # execution-router, tutor-rules, xp-calculator, etc.
│   │   │   ├── stores/       # tutor, progress, gamification, locale, theme
│   │   │   ├── types/        # path, progress, tutor, i18n, execution, gamification
│   │   │   ├── server/       # auth (Lucia), db (Turso), email (Resend)
│   │   │   └── workers/      # JS/Python executors
│   │   ├── routes/[lang=locale]/  # Locale-prefixed routes (en/fr)
│   │   ├── content/{en,fr}/  # Localized learning paths
│   │   └── design/           # tokens.css, typography.css, codemirror-theme
│   └── messages/{en,fr}.json # Paraglide i18n
├── rust-api/                 # Axum 0.7 REST API
│   ├── src/
│   │   ├── routes/           # auth, execute, progress, achievements, etc.
│   │   ├── models/           # user, progress, achievement
│   │   ├── services/         # progress_service, achievement_engine
│   │   └── middleware/       # auth, rate_limit
│   └── migrations/           # 001-010 SQL migrations (Turso/libSQL)
├── tests/
│   ├── unit/                 # Vitest: engine modules
│   ├── component/            # Vitest: Svelte components
│   └── e2e/                  # Playwright: full flows
└── docker-compose.yml        # frontend, api, piston, nginx
```

---

## Tech Stack (Locked)

- **Frontend:** SvelteKit 2, TypeScript (strict), Tailwind CSS v4, Melt UI, Paraglide.js (i18n)
- **Auth:** Lucia Auth v3 + GitHub OAuth (frontend), JWT tokens (API)
- **Backend:** Rust + Axum 0.7, Turso (libSQL), utoipa (OpenAPI), tracing
- **Code Execution:** Browser WASM (JS/TS/Python/SQL) + Piston sidecar (Rust/Go/C++/Java)
- **Testing:** Vitest (unit/component), Playwright + axe-core (E2E/a11y), cargo test (Rust)

---

## Code Style & Conventions

### TypeScript / Svelte

- **Strict mode** enabled. No `any`. Use proper types from `$lib/types/`.
- **Imports:** Use SvelteKit aliases: `$lib`, `$components`, `$stores`, `$engine`, `$types`, `$schemas`, `$design`.
- **Component structure** (always follow this order):
  ```svelte
  <script lang="ts">
    // 1. Imports  2. Props (export let)  3. Reactive ($:)
    // 4. Handlers  5. Lifecycle
  </script>
  <!-- 6. Template (semantic HTML, ARIA) -->
  <style>/* 7. Scoped — prefer Tailwind in template */</style>
  ```
- **State:** Svelte stores (`writable`/`derived`) for global; context API for component-scoped.
- **Data loading:** Use `+page.server.ts` / `+layout.server.ts` load functions. Never call Rust API from client components.
- **Forms:** Use SvelteKit form actions with Zod server-side validation.
- **Naming:** `PascalCase` components, `camelCase` variables/functions, `kebab-case` files.
- **Error handling:** `+error.svelte` pages (status-aware). API errors: toast + retry (3 attempts, exponential backoff).

### Rust

- **Handlers:** `async fn` returning `Result<Json<T>, AppError>`.
- **State:** `State(state): State<AppState>` for shared DB pool, HTTP client, config.
- **Validation:** `validator` crate on request bodies, return 400 with structured errors.
- **Logging:** `tracing::info!` / `tracing::error!` with structured fields (`user_id`, `path_id`).
- **Naming:** `snake_case` functions/variables, `PascalCase` types, `SCREAMING_SNAKE_CASE` constants.
- **Error handling:** Custom `AppError` with `impl IntoResponse`. Use `thiserror` for derive.
- **API design:** RESTful nouns (`/progress`), proper HTTP methods, standard status codes.

---

## Design System (Strict — No Hardcoded Values)

- **Colors:** Use CSS custom properties only (`--surface-0`, `--accent`, `--text-primary`, etc.). Dark mode is default.
- **Fonts:** Fraunces (headings), Satoshi (body/UI), JetBrains Mono (code). Never use weights below 400.
- **Anti-patterns:** No emoji in UI, no gradient backgrounds, no stock illustrations, no auto-dismissing toasts under 4s, no more than 2 colors per component.
- **Accessibility:** WCAG 2.1 AA non-negotiable. Keyboard navigation, `aria-live` for dynamic content, skip link, `prefers-reduced-motion` respected.

---

## i18n (EN + FR)

- **UI strings:** Paraglide.js — `import * as m from '$lib/paraglide/messages'`. Missing key = compile error.
- **Content:** `src/content/{en,fr}/paths/*.json`. Code snippets stay in English.
- **Routes:** Locale-prefixed: `/en/explore`, `/fr/explore`. Root redirects via `Accept-Language`.

---

## Testing

- **Unit tests** (`tests/unit/`): engine modules (xp-calculator, step-validator, tutor-rules, execution-router).
- **Component tests** (`tests/component/`): Svelte components (CodeSandbox, OnboardingFlow, TheoryRevealer).
- **E2E tests** (`tests/e2e/`): full flows with Playwright + axe-core accessibility checks.
- **Vitest config:** globals enabled, includes `tests/unit/**/*.test.ts` and `tests/component/**/*.test.ts`.
- **Playwright config:** parallel, 30s timeout, Chromium + Firefox + Mobile Chrome.

---

## Decision Checklist

Before every change, confirm:
- [ ] Matches PLAN.md specification?
- [ ] Accessible (keyboard, screen reader, contrast, reduced motion)?
- [ ] Internationalized (both EN and FR)?
- [ ] Uses design system tokens (no hardcoded colors/sizes/fonts)?
- [ ] Follows component/route conventions?
- [ ] Has loading and error states?
- [ ] Has a test (unit, component, or E2E)?

---

## Reference Files

- `PLAN.md` — canonical architecture and requirements spec
- `.github/copilot-instructions.md` — detailed agent instructions (926 lines)
- `frontend/src/design/tokens.css` — design system values
- `frontend/src/schemas/content.ts` — Zod content validation schemas
- `rust-api/migrations/*.sql` — database schema
