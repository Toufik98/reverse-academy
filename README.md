<div align="center">

# Reverse Academy

**Learn backward. Understand forward.**

A reverse-engineering pedagogy platform where learners start from a broken, real-world problem and trace backward to discover concepts.

`Real Problem → Attempt → "Why?" → Discover Concept → Understand Theory`

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2-FF3E00?style=flat-square&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Rust](https://img.shields.io/badge/Rust-Axum_0.7-000000?style=flat-square&logo=rust&logoColor=white)](https://github.com/tokio-rs/axum)
[![Turso](https://img.shields.io/badge/Turso-libSQL-4FF8D2?style=flat-square)](https://turso.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-Proprietary-lightgray?style=flat-square)]()
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1_AA-005A9C?style=flat-square)]()

</div>

---

## Why Reverse Academy?

Traditional learning: *Theory → Examples → Application → (maybe) Real Problem*

**Reverse Academy** flips this entirely. Every concept is introduced as the **answer to a question the learner already has**. You debug, you wonder "why?", and then the theory appears — not as homework, but as revelation.

### Three Learning Modes

| Mode | Flow | Example |
|------|------|---------|
| **Problem-First Walkthrough** | Pick a real problem → solve step-by-step → each step reveals theory | "Build a REST API" → HTTP → TCP/IP → fundamentals |
| **Fix-the-Broken-Thing** | See broken code → fix piece by piece → learn while debugging | Broken TS app → type system → generics |
| **Goal → Dependency Tree** | Pick a goal → explore concept dependencies backward | "Deploy to prod" → Docker → Linux → syscalls |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Nginx (443)                     │
│                 Reverse Proxy + SSL                 │
├───────────────────────┬─────────────────────────────┤
│   SvelteKit (:3000)   │     Rust API (:8080)        │
│   SSR + SPA Hybrid    │     Axum 0.7 REST           │
│   Lucia Auth          │     JWT · Rate Limiting     │
│   Paraglide i18n      │     utoipa OpenAPI           │
├───────────────────────┼─────────────────────────────┤
│         Turso (libSQL — edge-distributed)            │
├─────────────────────────────────────────────────────┤
│   Piston (:2000) — sandboxed code execution          │
│   WASM (browser) for JS/TS/Python · Piston for Rust  │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | SvelteKit 2, TypeScript 5.3+, Tailwind CSS v4 |
| **UI** | Melt UI (headless a11y primitives) |
| **Auth** | Lucia Auth v3 + GitHub OAuth |
| **i18n** | Paraglide.js (public) + admin i18n dictionary (EN/FR) |
| **Code Editor** | CodeMirror 6 (lazy-loaded) |
| **Math** | KaTeX (lazy-loaded) |
| **Validation** | Zod (content schemas, import validation) |
| **Backend** | Rust, Axum 0.7, libsql |
| **Database** | Turso (libSQL, edge-distributed SQLite) |
| **Execution** | Browser WASM (Tier 1) + Piston sidecar (Tier 2) |
| **Testing** | Vitest + Playwright + axe-core |
| **Deployment** | Docker + Nginx reverse proxy |

---

## Project Structure

```
reverse-academy/
├── PLAN.md                          # Canonical spec (2432 lines, 33 sections)
├── LEARNING-PATH-TEMPLATE.md        # Markdown template for AI-authored paths
├── docker-compose.yml               # 4 services: frontend, api, piston, nginx
├── .env.example
├── nginx/nginx.conf
│
├── frontend/                        # SvelteKit app
│   ├── src/
│   │   ├── design/                  # tokens.css, typography.css, codemirror-theme.ts
│   │   ├── content/{en,fr}/         # Localized learning paths, achievements, domains
│   │   ├── schemas/content.ts       # Zod validation for path/step JSON
│   │   ├── lib/
│   │   │   ├── components/          # 36+ Svelte components (learning, tutor, gamification, UI)
│   │   │   ├── engine/              # execution-router, tutor-rules, step-validator, xp-calculator, markdown-parser
│   │   │   ├── i18n/admin.ts        # Admin panel i18n dictionary (EN/FR, 150+ keys)
│   │   │   ├── stores/              # tutor, progress, gamification, locale, theme, settings
│   │   │   ├── types/               # path, progress, tutor, i18n, execution, gamification
│   │   │   ├── workers/             # js-executor.worker.ts, python-executor.ts
│   │   │   └── server/              # auth.ts (Lucia), db.ts (Turso), email.ts (Resend)
│   │   └── routes/
│   │       ├── [lang=locale]/       # All locale-prefixed public routes
│   │       ├── [lang=locale]/admin/ # Admin portal (login, dashboard, paths CRUD, import)
│   │       └── api/                 # SvelteKit server routes (proxy to Rust API)
│   ├── messages/{en,fr}.json        # Paraglide i18n (~70 keys each)
│   └── static/                      # favicon.svg, robots.txt
│
├── rust-api/                        # Axum backend
│   ├── src/
│   │   ├── routes/                  # health, auth, execute, progress, achievements, users, analytics, admin
│   │   ├── models/                  # user, progress, achievement
│   │   ├── services/                # progress_service, achievement_engine
│   │   └── middleware/              # JWT auth, per-route rate limiting
│   └── migrations/                  # 9 SQL migrations
│
├── scripts/                         # setup-piston-languages.sh, dev.sh
└── tests/                           # unit (4), component (3), e2e (6)
```

---

## Quick Start

### Prerequisites

- **Node.js** 20+ and **npm**
- **Rust** 1.75+ (via [rustup](https://rustup.rs))
- **Turso CLI** — `brew install tursodatabase/tap/turso` (or [install guide](https://docs.turso.tech/cli/installation))

### 1. Clone & configure

```bash
git clone <repo-url> reverse-academy
cd reverse-academy
cp .env.example .env
# Edit .env with your Turso, GitHub OAuth, and Resend credentials
```

### 2. Run without Docker

```bash
./scripts/dev.sh
```

This starts the SvelteKit frontend (`:5173`) and Rust API (`:8080`) in parallel. See [scripts/dev.sh](scripts/dev.sh).

### 3. Run with Docker

```bash
docker compose up --build
```

Services: frontend (`:3000`), API (`:8080`), Piston (`:2000`), Nginx (`:80`).

---

## Admin Portal

The admin portal at `/{lang}/admin` provides full content management:

- **Dashboard** — stats overview (paths, steps, users, achievements), breakdown by domain/difficulty
- **Paths** — browse, search, filter, create, edit, delete learning paths and their steps
- **Import** — bulk import learning paths from **JSON** or **Markdown** files with Zod validation
- **i18n** — full EN/FR support across all admin pages
- **Theme** — 3-state toggle (system auto-detect / light / dark)

### Authentication

Admin access uses a bearer token set via the `ADMIN_TOKEN` environment variable. Set the cookie `ra-admin-token` to authenticate.

### Creating Content with AI

The recommended workflow for creating new learning paths:

1. Give an AI (ChatGPT, Claude, etc.) the template at [`LEARNING-PATH-TEMPLATE.md`](LEARNING-PATH-TEMPLATE.md)
2. Ask it to fill in a learning path on any topic
3. Import the resulting Markdown or JSON in the admin portal at `/{lang}/admin/import`
4. The import page validates everything (Zod schemas) before saving

The Markdown template includes all required metadata fields, step structure, content blocks (scenario, theory, key insight, code), and allowed values for domains, modes, and difficulties.

### Import Validation

All imports (JSON and Markdown) are validated client-side with Zod before hitting the API:

- Required fields: `id`, `slug`, `title`, `domain`, `mode`, `difficulty`, `description`, `steps[]`
- Domain must be one of: `programming`, `web-dev`, `systems`, `stem`, `languages`
- Mode must be one of: `fix-broken`, `problem-first`, `goal-tree`
- Difficulty must be one of: `beginner`, `intermediate`, `advanced`
- Each step requires: `id`, `title`, `type`, `content` (with `scenario` and `theory`)
- Description and scenario must be at least 10 characters
- XP values must be non-negative integers

---

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
npm run check                   # svelte-check + TypeScript
npm run validate-content        # Zod schema validation
npm test                        # Vitest unit tests
```

### Rust API

```bash
cd rust-api
cargo run                       # http://localhost:8080
cargo test                      # Unit tests
cargo clippy                    # Lint
```

### Tests

```bash
# Unit tests (Vitest)
cd frontend && npm test

# E2E tests (Playwright)
npx playwright test

# Accessibility audit
npx playwright test tests/e2e/a11y.spec.ts
```

---

## Design System

Dark mode is default (auto-detects OS preference). Built for focus, not flashiness.

| Token | Dark | Light | Purpose |
|---|---|---|---|
| `--surface-0` | `#161618` | `#FAFAF8` | Page background |
| `--surface-1` | `#1C1C1F` | `#F2F1EE` | Card background |
| `--accent` | `#D4A843` | `#B8892E` | Primary accent (amber/gold) |
| `--success` | `#6B8F71` | `#4A7050` | Correct (sage green) |
| `--error` | `#C4554D` | `#A8403A` | Wrong (muted red) |
| `--info` | `#5B8FB9` | `#3D6F94` | Hints (steel blue) |

### Theme System

Three modes: **System** (auto-detect via `prefers-color-scheme`), **Light**, **Dark**. Persisted to `localStorage`. Toggle cycles `system → light → dark → system` in both navbar and admin sidebar.

**Typography**: Fraunces (headings) · Satoshi (body/UI) · JetBrains Mono (code)

**Philosophy**: Editorial, not corporate. Think Brilliant meets Linear. Zero decoration noise — no emoji, no gradients, no mascots.

---

## API Reference

Base: `/api/v1`

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Service + DB status |
| `GET` | `/paths` | List all learning paths |
| `GET` | `/paths/:slug` | Get path with steps |
| `POST` | `/auth/verify` | Verify session |
| `POST` | `/auth/forgot-password` | Send reset email |
| `GET` | `/auth/github` | GitHub OAuth |
| `POST` | `/execute` | Execute code (Piston) |
| `GET` | `/progress/:userId` | All progress |
| `POST` | `/progress/:userId/step/:stepId` | Submit step completion |
| `GET` | `/achievements` | List all achievements |
| `POST` | `/achievements/:userId/check` | Evaluate & award |
| `GET/PATCH` | `/users/:userId/preferences` | User preferences |
| `POST` | `/analytics/event` | Record analytics event |

### Admin Endpoints (Bearer token required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/admin/stats` | Dashboard statistics |
| `POST` | `/admin/paths` | Create learning path |
| `PUT` | `/admin/paths/:id` | Update path metadata |
| `DELETE` | `/admin/paths/:id` | Delete path and steps |
| `POST` | `/admin/paths/:id/steps` | Add step to path |
| `PUT` | `/admin/paths/:id/steps/:stepId` | Update step |
| `DELETE` | `/admin/paths/:id/steps/:stepId` | Delete step |
| `PUT` | `/admin/paths/:id/steps/reorder` | Reorder steps |
| `POST` | `/admin/import` | Import full path + steps |
| `GET` | `/admin/paths/:id/export` | Export path as JSON |

Rate limits: Auth `5/min/IP` · Execute `20/min/user` · General `200/min/user`

---

## Learning Paths

| Path | Mode | Difficulty | Steps |
|------|------|-----------|-------|
| **TypeScript Error Detective** | Fix-broken | Beginner | 8 steps, ~30 min |
| **Build a REST API — Backward** | Problem-first | Intermediate | 10 steps, ~45 min |
| **Rust Ownership: Why Does the Compiler Hate Me?** | Fix-broken | Intermediate | 8 steps, ~40 min |
| **Python: Debug the Data Pipeline** | Fix-broken | Intermediate | 10 steps, ~35 min |
| **SQL: The Query Detective** | Problem-first | Intermediate | 8 steps, ~30 min |

All paths available in English and French. Code stays English — scenarios, theory, hints, and UI are translated.

---

## Internationalization

Two i18n systems work together:

| System | Scope | Files |
|--------|-------|-------|
| **Paraglide.js** | Public site (compile-time, type-safe) | `messages/{en,fr}.json` |
| **Admin i18n dictionary** | Admin portal (runtime, 150+ keys) | `lib/i18n/admin.ts` |

All routes are locale-prefixed: `/en/explore`, `/fr/admin/paths`. Language switcher available in both the public navbar and admin sidebar. System detects `Accept-Language` on first visit.

---

## Code Execution Engine

Two-tier hybrid — zero-latency browser execution for most languages, backend sandbox for compiled ones.

| Tier | Languages | Runtime | Latency |
|------|-----------|---------|---------|
| **1 — Browser WASM** | JavaScript, TypeScript, Python, SQL | Web Worker / Pyodide / sql.js | ~0ms |
| **2 — Piston Sidecar** | Rust, Go, C++, Java | Docker sandbox | ~200ms |

The `execution-router.ts` decides tier at runtime. Users see the same UI regardless.

---

## Accessibility

WCAG 2.1 AA is non-negotiable.

- All interactive elements keyboard-reachable
- `aria-live="polite"` for execution results, XP awards, tutor messages
- `prefers-reduced-motion: reduce` disables all transitions
- Skip link as first DOM element
- 4.5:1 minimum contrast ratio
- 44px minimum touch targets
- Focus trap in modals, Escape to close

---

## Contributing

1. Branch from `main` → `feat/your-feature`
2. Ensure EN + FR translations for all user-facing strings
3. Run `npm run check && npm test && npx playwright test`
4. Open PR with context on the PLAN.md section being implemented

---

## License

Proprietary. All rights reserved.

---

<div align="center">

**Built with restraint.**

*Reverse Academy — where every concept earns its introduction.*

</div>
