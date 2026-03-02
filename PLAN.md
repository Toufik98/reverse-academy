# Reverse Academy — Architecture & Implementation Plan

> **A reverse-engineering pedagogy platform** where learners start from a concrete, real-world problem and trace backward to understand the underlying concepts. Problem → Application → Theory.

---

## 1. Core Philosophy

Traditional learning: `Theory → Examples → Application → (maybe) Real Problem`
**Reverse Academy**: `Real Problem → Attempt → "Why doesn't this work?" → Discover Concept → Understand Theory`

The learner is **always motivated** because every piece of theory is introduced as the **answer to a question they already have**.

### Three Learning Modes (Hybrid)

| Mode | Description | Example |
|------|-------------|---------|
| **Problem-First Walkthrough** | User picks a real problem, solves it step-by-step, each step reveals theory | "Build a REST API" → HTTP → TCP/IP → networking fundamentals |
| **Fix-the-Broken-Thing** | User sees broken code/system, fixes it piece by piece, learns concepts while debugging | Broken TypeScript app → discover type system → understand generics |
| **Goal → Dependency Tree** | User picks a goal artifact, explores a visual dependency tree of concepts backward | "Deploy to production" → Docker → Linux → processes → syscalls |

---

## 2. Tech Stack

### Frontend — SvelteKit
| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | SvelteKit 2 | Reactive, fast, excellent DX, SSR + SPA hybrid |
| **Language** | TypeScript | Type safety across the stack |
| **Styling** | Tailwind CSS v4 | Utility-first, rapid prototyping |
| **UI Primitives** | Melt UI (headless) | Accessible primitives, fully custom styling |
| **Auth** | Lucia Auth v3 | SvelteKit-native, session-based, flexible |
| **i18n** | Paraglide.js (by Inlang) | Compile-time optimized, type-safe, Svelte-native |
| **State** | Svelte stores + context | Built-in reactivity, no extra library needed |
| **Interactive code** | CodeMirror 6 (via `svelte-codemirror-editor`) | Inline code editing with syntax highlighting |
| **Math rendering** | KaTeX | Fast LaTeX rendering for STEM formulas |
| **Animations** | Svelte transitions + Motion One | Restrained, purposeful motion |
| **Validation** | Zod | Content schema validation at build time |
| **Testing** | Vitest + Playwright + axe-core | Unit, component, E2E, accessibility |
| **Error tracking** | Sentry | Frontend + backend error capture |
| **Icons** | Lucide Svelte | 1.5px stroke, customizable, tree-shakeable |

### Backend — Rust (Axum)
| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Axum 0.7 | Async, type-safe, tower middleware ecosystem |
| **Language** | Rust | Performance, safety, excellent for long-running services |
| **ORM** | libSQL client (`libsql-client`) | Native Turso support |
| **Auth** | JWT tokens issued to Lucia sessions | Stateless API auth |
| **Validation** | `serde` + `validator` | Request validation |
| **API style** | REST + JSON | Simple, well-understood |
| **Docs** | `utoipa` (OpenAPI/Swagger) | Auto-generated API docs |
| **Logging** | `tracing` + `tracing-subscriber` | Structured JSON logs |
| **Rate limiting** | Tower rate-limiting middleware | Per-route request throttling |
| **HTTP client** | `reqwest` | Piston sidecar communication |
| **Email** | Resend API or `lettre` (SMTP) | Password reset, email verification |

### Database — Turso (libSQL)
| Aspect | Detail |
|--------|--------|
| **Engine** | libSQL (SQLite fork, edge-distributed) |
| **Hosting** | Turso cloud (free tier: 9GB, 500 DBs) |
| **Local dev** | `turso dev` (local SQLite replica) |
| **Migrations** | SQL migration files, applied via Rust CLI |

### Deployment — Docker Self-Hosted
| Service | Container | Port |
|---------|-----------|------|
| **SvelteKit app** | `node:20-alpine` + adapter-node | 3000 |
| **Rust API** | Multi-stage Rust build → `debian:slim` | 8080 |
| **Turso** | Turso cloud (no container) or local `sqld` | 8081 |
| **Nginx** | Reverse proxy + SSL | 80/443 |

---

## 3. Design System

### Design Philosophy

Reverse Academy is not a generic learning app. It is an **editorial investigation tool** — a place where you arrive with a problem, and leave understanding why the world works the way it does. The design must feel:

- **Intentional**, not templated. Every pixel earns its place.
- **Editorial**, not corporate. Think magazine art direction, not SaaS dashboard.
- **Warm in darkness**. Dark mode is the default, but it should feel like a well-lit study, not a void.
- **Typographically rich**. The hierarchy of serif/sans/mono tells the user what kind of content they're reading before they read a word.
- **Zero decoration noise**. No confetti, no cartoon mascots, no gradient blobs. Confidence through restraint.

Design inspiration triangle:
- **Editorial**: Monocle, Stripe Press, The Pudding (layout, typography, storytelling)
- **Developer tools**: Linear, Raycast, Warp (precision, speed, dark UI craft)
- **Learning platforms**: Brilliant, Exercism, Josh Comeau (interactivity, progressive disclosure)

### Color Palette

```
BACKGROUNDS
  --surface-0:      #050506    /* Deepest background (page) */
  --surface-1:      #0A0A0B    /* Card/panel background */
  --surface-2:      #111113    /* Elevated surfaces, modals */
  --surface-3:      #1A1A1D    /* Hover states, active panels */
  --surface-subtle:  #222226    /* Borders, dividers */

TEXT
  --text-primary:    #E8E6E3    /* Primary readable text (warm off-white) */
  --text-secondary:  #9B9A97    /* Secondary, muted labels */
  --text-tertiary:   #5C5B58    /* Disabled, placeholders */
  --text-inverse:    #050506    /* Text on light/accent backgrounds */

ACCENT — AMBER/GOLD (primary action, discovery moments)
  --accent:          #D4A843    /* Primary accent */
  --accent-hover:    #E2BC5A    /* Hover state */
  --accent-muted:    #D4A84320  /* Backgrounds, subtle highlights (12% opacity) */
  --accent-text:     #F5D98A    /* Accent text on dark backgrounds */

SEMANTIC
  --success:         #6B8F71    /* Muted sage green — correct answer, completion */
  --success-muted:   #6B8F7115  /* Success backgrounds */
  --error:           #C4554D    /* Muted red — wrong answer, errors */
  --error-muted:     #C4554D15  /* Error backgrounds */
  --info:            #5B8FB9    /* Muted steel blue — hints, info */
  --info-muted:      #5B8FB915  /* Info backgrounds */
  --warning:         #C49A4D    /* Warm amber — caution states */

CODE SYNTAX (custom theme, not default)
  --code-bg:         #0C0C0E    /* Code block background */
  --code-keyword:    #C4A7E7    /* Muted lavender */
  --code-string:     #A8C99C    /* Sage green */
  --code-function:   #E2BC5A    /* Amber */
  --code-comment:    #5C5B58    /* Muted gray */
  --code-type:       #7DAECC    /* Steel blue */
```

Light mode (secondary, togglable):
```
  --surface-0:       #FAFAF8    /* Warm off-white */
  --surface-1:       #F2F1EE
  --surface-2:       #FFFFFF
  --text-primary:    #1A1A1D
  --text-secondary:  #6B6A67
  --accent:          #B8892E    /* Slightly deeper amber for contrast */
```

### Typography

Three-font system where each typeface signals a content type:

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Display / Headings** | Fraunces (variable serif) | 600–800 | Page titles, path names, section headings, "aha moment" reveals |
| **Body / UI** | Satoshi (geometric sans) | 400–700 | Paragraphs, navigation, buttons, labels, form inputs |
| **Code / Technical** | JetBrains Mono | 400–600 | Code blocks, inline code, terminal output, technical identifiers |

Type scale (fluid, clamp-based):
```css
--text-xs:    clamp(0.694rem, 0.66rem + 0.18vw, 0.8rem);     /* 11–13px */
--text-sm:    clamp(0.833rem, 0.79rem + 0.22vw, 0.96rem);    /* 13–15px */
--text-base:  clamp(1rem, 0.95rem + 0.25vw, 1.15rem);        /* 16–18px */
--text-lg:    clamp(1.2rem, 1.1rem + 0.5vw, 1.44rem);        /* 19–23px */
--text-xl:    clamp(1.44rem, 1.3rem + 0.7vw, 1.8rem);        /* 23–29px */
--text-2xl:   clamp(1.728rem, 1.5rem + 1.14vw, 2.25rem);     /* 28–36px */
--text-3xl:   clamp(2.074rem, 1.75rem + 1.62vw, 2.8rem);     /* 33–45px */
--text-hero:  clamp(2.488rem, 2rem + 2.44vw, 3.6rem);        /* 40–58px */
```

Typography rules:
- Headings use Fraunces with tracked-tight letter-spacing (editorial feel)
- Body text at --text-base with 1.65 line-height (optimized for long-form reading)
- Code blocks use JetBrains Mono at --text-sm with 1.5 line-height
- Never use font weights below 400. Thin fonts disappear on dark backgrounds.
- Numbers in XP/stats use Satoshi tabular-nums for alignment

### Spacing & Layout

Adaptive layout system:
- **Reading/Theory mode**: Centered column, max-width 680px (editorial, like a magazine article)
- **Challenge/Code mode**: Full-width with split panes (problem left, editor right)
- **Explore/Browse mode**: Grid layout, max-width 1200px

```css
--space-1:    0.25rem;   /* 4px */
--space-2:    0.5rem;    /* 8px */
--space-3:    0.75rem;   /* 12px */
--space-4:    1rem;      /* 16px */
--space-6:    1.5rem;    /* 24px */
--space-8:    2rem;      /* 32px */
--space-12:   3rem;      /* 48px */
--space-16:   4rem;      /* 64px */
--space-24:   6rem;      /* 96px */
--space-32:   8rem;      /* 128px */

--radius-sm:  6px;
--radius-md:  10px;
--radius-lg:  16px;
--radius-xl:  24px;
```

### Motion Design

Motion is **restrained and purposeful**. Every animation communicates state change, not decoration.

| Context | Duration | Easing | Details |
|---------|----------|--------|---------|
| Hover states | 120ms | ease-out | Subtle background/border color shift |
| Panel open/close | 200ms | cubic-bezier(0.16, 1, 0.3, 1) | Slide + fade, no bounce |
| Page transitions | 250ms | ease-in-out | Crossfade between route content |
| Theory reveal | 400ms | cubic-bezier(0.16, 1, 0.3, 1) | Expand height + fade in content |
| XP counter | 600ms | spring(1, 80, 10) | Number counting up animation |
| Step completion | 300ms | ease-out | Subtle border glow (accent-muted) |
| Achievement earned | 500ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Scale up from center + fade, no confetti |

Rules:
- No animation on initial page load (reduces perceived load time)
- Animations respect `prefers-reduced-motion` — all motion disabled if set
- No infinite loops, no pulsing, no blinking
- Loading states use skeleton placeholders with a subtle shimmer (1.5s, ease-in-out)

### Component Design Language

**Cards** (path cards, concept cards):
- Background: `--surface-1` with 1px `--surface-subtle` border
- On hover: border shifts to `--accent-muted`, translate-y -2px
- No drop shadows. Depth communicated through border + background layering.
- Corner radius: `--radius-lg`

**Buttons**:
- Primary: `--accent` background, `--text-inverse` text, `--radius-md`
- Secondary: transparent background, 1px `--surface-subtle` border, `--text-primary` text
- Ghost: no border, `--text-secondary` text, hover shows `--surface-3` background
- All buttons: 44px minimum touch target, Satoshi 500 weight

**Code blocks** (the core learning surface):
- Background: `--code-bg` (slightly darker than surface-0)
- Top bar: filename + language label in `--text-tertiary`, JetBrains Mono
- Line numbers in `--text-tertiary`
- Active/error lines highlighted with `--error-muted` or `--success-muted` background
- Edit cursor: `--accent` colored
- No rounded corners on inline code — just `--code-bg` background + slight padding

**Theory reveals** (the "aha moment" surface):
- Left border: 3px `--accent` solid line (editorial pull-quote style)
- Background: `--accent-muted` (warm amber glow at 12% opacity)
- Heading in Fraunces, body in Satoshi
- Key insights highlighted with `--accent-text`

**Tutor agent messages**:
- Small floating panel, bottom-right or slide-in sidebar
- Avatar: abstract geometric mark (not a face, not a robot)
- Messages appear one at a time with 200ms fade-in
- Muted background, no chat bubbles — just clean text with timestamp

**Progress indicators**:
- XP bar: thin (4px) horizontal bar, `--accent` fill, `--surface-subtle` track
- Step progress: connected dots/line (like a timeline), completed steps fill with `--success`
- Level badge: circular, JetBrains Mono numeral, `--accent` ring

### Iconography

No emoji. No illustration packs. Custom minimal icon set:

| Purpose | Style |
|---------|-------|
| Navigation | 1.5px stroke, 20x20, rounded caps (Lucide icon set as base, customized) |
| Achievement badges | Geometric monoline symbols in `--accent` (e.g., diamond for "first bug", nested squares for "deep diver") |
| Step type indicators | Minimal 16x16 glyphs: wrench (challenge), lightbulb outline (reveal), terminal bracket (sandbox) |
| Domain icons | Abstract geometric marks, single-color, no fill |

### Responsive Breakpoints

```css
--bp-sm:   640px;    /* Mobile landscape */
--bp-md:   768px;    /* Tablet */
--bp-lg:   1024px;   /* Desktop */
--bp-xl:   1280px;   /* Wide desktop */
--bp-2xl:  1536px;   /* Ultra-wide */
```

Mobile-specific:
- Code sandbox switches from side-by-side to stacked (problem top, editor bottom)
- Theory reveals are full-width cards
- Navigation collapses to bottom tab bar (not hamburger menu)
- Touch targets: minimum 44x44px

### Dark Mode as Default

Dark mode is the **primary** experience. Light mode is available but secondary.

- Theme stored in cookie + `prefers-color-scheme` detection on first visit
- Toggle in navbar (sun/moon icon, 120ms crossfade)
- All colors defined as CSS custom properties, swapped at `:root[data-theme='light']`
- Images/diagrams: use `mix-blend-mode` or separate dark/light variants

### Design Anti-Patterns (What We Never Do)

- No emoji in the UI. Anywhere. Achievement icons are geometric symbols.
- No gradient backgrounds or gradient text.
- No rounded-full pill buttons (except small tags/badges).
- No stock illustrations, 3D renders, or AI-generated art.
- No "hero image with overlay text" patterns.
- No skeleton screens that bounce or pulse aggressively.
- No toast messages that auto-dismiss in under 4 seconds.
- No more than 2 colors visible in any single component.
- No decorative borders thicker than 1px (except the 3px theory-reveal accent).

---

## 4. Internationalization (i18n)

### Strategy

| Aspect | Detail |
|--------|--------|
| **Languages** | English (default) + French |
| **Scope** | Full — UI labels **and** learning content (paths, challenges, theory) |
| **Library** | Paraglide.js by Inlang — compile-time i18n, type-safe, tree-shaken per locale |
| **Routing** | Locale prefix: `/en/explore`, `/fr/explore` (SvelteKit `[lang]` param) |
| **Detection** | `Accept-Language` header on first visit → stored in cookie `locale` |
| **Fallback** | Missing French string → English fallback |

### UI Translations — Paraglide.js

Messages live in `/messages/{lang}.json` (Inlang project format):

```
messages/
├── en.json       # { "nav.explore": "Explore", "tutor.hint": "Need a hint?", ... }
└── fr.json       # { "nav.explore": "Explorer", "tutor.hint": "Besoin d'un indice ?", ... }
```

Usage in Svelte components:
```svelte
<script>
  import * as m from '$lib/paraglide/messages';
</script>

<button>{m.tutor_hint()}</button>
<!-- EN: "Need a hint?" / FR: "Besoin d'un indice ?" -->
```

Type-safe: calling `m.nonexistent_key()` is a **compile error**.

### Content Translations — Localized JSON Paths

Learning content is duplicated per locale in structured folders:

```
src/content/
├── en/
│   ├── paths/
│   │   ├── typescript-error-detective.json
│   │   ├── rust-ownership-from-bugs.json
│   │   └── build-rest-api-backward.json
│   ├── achievements.json
│   └── domains.json
└── fr/
    ├── paths/
    │   ├── typescript-error-detective.json
    │   ├── rust-ownership-from-bugs.json
    │   └── build-rest-api-backward.json
    ├── achievements.json
    └── domains.json
```

The content loader resolves the correct locale folder:
```typescript
// content-loader.ts
export function loadPath(slug: string, locale: 'en' | 'fr'): LearningPath {
  return import(`../../content/${locale}/paths/${slug}.json`);
}
```

### Translated Content Example (French snippet)

```json
{
  "id": "ts-error-detective",
  "slug": "typescript-error-detective",
  "title": "TypeScript : Détective d'Erreurs",
  "description": "Une appli TypeScript est cassée. Corrigez les erreurs et découvrez le système de types.",
  "steps": [
    {
      "id": "step-1",
      "title": "L'Application Plante",
      "content": {
        "scenario": "Un collègue a poussé ce code et l'appli plante. Pouvez-vous trouver le bug ?",
        "code": "function greet(name: string) {\n  return 'Hello, ' + name;\n}\n\ngreet(42);",
        "errorMessage": "L'argument de type 'number' n'est pas assignable au paramètre de type 'string'"
      }
    }
  ]
}
```

> **Note**: Code snippets inside challenges stay in English (code is universal), only scenarios, theory, hints, and UI text are translated.

### Locale-Aware Routing

```
src/routes/
├── [lang=locale]/                  # Param matcher: 'en' | 'fr'
│   ├── +layout.svelte              # Sets locale context
│   ├── +layout.server.ts           # Validates lang param, loads session
│   ├── +page.svelte                # Landing page
│   ├── explore/
│   ├── learn/
│   ├── profile/
│   └── auth/
└── +page.server.ts                 # Root redirect: detect locale → /en or /fr
```

Param matcher (`src/params/locale.ts`):
```typescript
import type { ParamMatcher } from '@sveltejs/kit';
export const match: ParamMatcher = (param) => /^(en|fr)$/.test(param);
```

### Tutor Agent Locale-Awareness

The rule-based tutor agent messages are also localized:
```typescript
const tutorMessages = {
  en: {
    OFFER_HINT: "Struggling? I have a hint that might help.",
    REVEAL_PARTIAL_THEORY: "Let me show you the concept behind this...",
    FAST_TRACK: "Nailed it! You clearly know this — let's skip ahead.",
    SUGGEST_DECOMPOSE: "This is complex. Let's break it into smaller pieces."
  },
  fr: {
    OFFER_HINT: "En difficulté ? J'ai un indice qui pourrait aider.",
    REVEAL_PARTIAL_THEORY: "Laissez-moi vous montrer le concept derrière ça...",
    FAST_TRACK: "Bien joué ! Vous maîtrisez ça — avançons.",
    SUGGEST_DECOMPOSE: "C'est complexe. Décomposons en morceaux plus petits."
  }
};
```

### Adding a New Language (Future)

1. Add locale code to param matcher: `/^(en|fr|ar)$/`
2. Create `messages/ar.json` with UI translations
3. Duplicate `src/content/en/` → `src/content/ar/` and translate
4. If RTL: add `dir="rtl"` logic in root layout based on locale

---

## 5. Code Execution Engine

### Strategy: Hybrid (Browser WASM + Self-Hosted Backend Executor)

Code execution is split into two tiers based on language capability. The learner experiences the same UI regardless of which tier handles execution.

```
User writes code in CodeSandbox
            |
            v
   +-------------------+
   |  Execution         |
   |  Router            |    Decides: browser or backend?
   |  (client-side)     |
   +----+----------+----+
        |          |
   WASM |          | API call
        |          |
   +----v----+ +---v--------------------------+
   | Browser | |  Rust API                     |
   | Runtime | |  POST /api/v1/execute         |
   |         | |         |                     |
   | - TS    | |  +------v-----------------+   |
   | - Python| |  |  Piston Engine         |   |
   | - SQL   | |  |  (Docker sidecar)      |   |
   |         | |  |  - Rust                |   |
   |         | |  |  - Go, C++, Java...    |   |
   +---------+ |  +------------------------+   |
               +-------------------------------+
```

### Tier 1: Browser WASM Runtimes (Client-Side)

Zero-latency execution, no network round-trip, works offline.

| Language | Runtime | Bundle Size | Notes |
|----------|---------|-------------|-------|
| **JavaScript** | Native `eval` + Web Worker sandbox | 0 KB | Runs in isolated Worker thread, no DOM access |
| **TypeScript** | `typescript` compiler (WASM) + Worker eval | ~3 MB | Compile TS to JS in browser, then execute in Worker |
| **Python** | Pyodide (CPython 3.11 WASM) | ~11 MB (lazy-loaded) | Full stdlib, numpy available. Loaded on first Python challenge. |
| **SQL** | sql.js (SQLite WASM) | ~1.5 MB | In-memory DB, pre-seeded with challenge data |

**Browser execution sandbox architecture:**

```typescript
// execution-router.ts
const BROWSER_LANGUAGES = ['javascript', 'typescript', 'python', 'sql'] as const;

export async function executeCode(
  code: string,
  language: string,
  timeout: number = 5000
): Promise<ExecutionResult> {
  if (BROWSER_LANGUAGES.includes(language as any)) {
    return executeBrowser(code, language, timeout);
  }
  return executeBackend(code, language, timeout);
}
```

**Web Worker isolation for JS/TS:**

```typescript
// workers/js-executor.worker.ts
// Runs in a dedicated Web Worker -- no access to DOM, fetch, or main thread
self.onmessage = async (e: MessageEvent<{ code: string; timeout: number }>) => {
  const { code, timeout } = e.data;
  const logs: string[] = [];

  // Override console.log to capture output
  const console = { log: (...args: any[]) => logs.push(args.join(' ')) };

  try {
    const fn = new Function('console', code);
    const timer = setTimeout(() => { throw new Error('Execution timeout'); }, timeout);
    fn(console);
    clearTimeout(timer);
    self.postMessage({ success: true, output: logs.join('\n'), error: null });
  } catch (err) {
    self.postMessage({ success: false, output: logs.join('\n'), error: err.message });
  }
};
```

**Pyodide lazy loading:**

```typescript
// workers/python-executor.ts
let pyodide: any = null;

async function ensurePyodide() {
  if (!pyodide) {
    // Lazy-load ~11MB WASM bundle only when first Python challenge is opened
    const { loadPyodide } = await import('pyodide');
    pyodide = await loadPyodide({
      indexURL: '/pyodide/',  // Self-hosted WASM files
    });
  }
  return pyodide;
}

export async function executePython(
  code: string,
  timeout: number
): Promise<ExecutionResult> {
  const py = await ensurePyodide();
  py.runPython('import io, sys; sys.stdout = io.StringIO()');

  try {
    py.runPython(code);
    const output = py.runPython('sys.stdout.getvalue()');
    return { success: true, output, error: null, tier: 'browser' };
  } catch (err) {
    return { success: false, output: '', error: err.message, tier: 'browser' };
  }
}
```

### Tier 2: Backend Execution via Piston (Docker Sidecar)

For compiled languages and anything not available in WASM.

**Piston** is an open-source code execution engine that:
- Supports 50+ languages out of the box
- Handles sandboxing via nsjail (syscall filtering, memory/CPU limits, network isolation)
- Runs each execution in an ephemeral container
- Self-hostable, no external API dependency

**Rust API endpoint:**

```rust
// routes/execute.rs
#[derive(Deserialize)]
struct ExecuteRequest {
    language: String,      // "rust", "go", "cpp", etc.
    version: String,       // "1.75.0", "1.21", etc.
    code: String,
    stdin: Option<String>, // Optional input
    timeout: Option<u32>,  // Max execution time (ms), default 5000
}

#[derive(Serialize)]
struct ExecuteResponse {
    success: bool,
    output: String,        // stdout
    error: Option<String>, // stderr or compilation error
    execution_time_ms: u32,
}

async fn execute_code(
    Json(req): Json<ExecuteRequest>,
    State(state): State<AppState>,
) -> Result<Json<ExecuteResponse>, AppError> {
    // Forward to Piston API running as Docker sidecar
    let piston_response = state.http_client
        .post(&format!("{}/api/v2/execute", state.config.piston_url))
        .json(&json!({
            "language": req.language,
            "version": req.version,
            "files": [{ "content": req.code }],
            "stdin": req.stdin.unwrap_or_default(),
            "run_timeout": req.timeout.unwrap_or(5000),
            "compile_timeout": 10000,
            "run_memory_limit": 256_000_000,  // 256MB
        }))
        .send()
        .await?;

    let result = piston_response.json::<PistonResult>().await?;
    Ok(Json(ExecuteResponse {
        success: result.run.code == 0,
        output: result.run.stdout,
        error: if result.run.stderr.is_empty() {
            result.compile.as_ref().map(|c| c.stderr.clone())
        } else {
            Some(result.run.stderr)
        },
        execution_time_ms: result.run.wall_time_ms,
    }))
}
```

### Piston Docker Sidecar

Added to docker-compose.yml:

```yaml
  piston:
    image: ghcr.io/engineer-man/piston:latest
    ports:
      - "2000:2000"
    volumes:
      - piston-packages:/piston/packages
    tmpfs:
      - /piston/jobs:exec,size=256M
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '2.0'
    restart: unless-stopped
```

**Language runtime installation** (one-time setup):

```bash
#!/bin/bash
# scripts/setup-piston-languages.sh
PISTON_URL="http://localhost:2000"

curl -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "rust", "version": "1.75.0"}'

# Future additions:
# curl -X POST "$PISTON_URL/api/v2/packages" -d '{"language": "go", "version": "1.21.0"}'
# curl -X POST "$PISTON_URL/api/v2/packages" -d '{"language": "gcc", "version": "12.2.0"}'
```

### Execution Result Types

```typescript
// types/execution.ts
export type ExecutionTier = 'browser' | 'backend';

export interface ExecutionResult {
  success: boolean;
  output: string;         // stdout or return value
  error: string | null;   // stderr, compilation error, or runtime error
  executionTimeMs?: number;
  tier: ExecutionTier;
}

export type SupportedLanguage =
  | 'javascript'    // Tier 1: Browser
  | 'typescript'    // Tier 1: Browser
  | 'python'        // Tier 1: Browser
  | 'sql'           // Tier 1: Browser
  | 'rust'          // Tier 2: Backend (Piston)
  | 'go'            // Tier 2: Backend (future)
  | 'cpp'           // Tier 2: Backend (future)
  | 'java';         // Tier 2: Backend (future)

export const LANGUAGE_CONFIG: Record<SupportedLanguage, {
  tier: ExecutionTier;
  displayName: string;
  version: string;
  fileExtension: string;
  codemirrorLang: string;
}> = {
  javascript: { tier: 'browser', displayName: 'JavaScript',  version: 'ES2023',  fileExtension: '.js',   codemirrorLang: 'javascript' },
  typescript: { tier: 'browser', displayName: 'TypeScript',  version: '5.3',     fileExtension: '.ts',   codemirrorLang: 'typescript' },
  python:     { tier: 'browser', displayName: 'Python',      version: '3.11',    fileExtension: '.py',   codemirrorLang: 'python' },
  sql:        { tier: 'browser', displayName: 'SQL',         version: 'SQLite',  fileExtension: '.sql',  codemirrorLang: 'sql' },
  rust:       { tier: 'backend', displayName: 'Rust',        version: '1.75',    fileExtension: '.rs',   codemirrorLang: 'rust' },
  go:         { tier: 'backend', displayName: 'Go',          version: '1.21',    fileExtension: '.go',   codemirrorLang: 'go' },
  cpp:        { tier: 'backend', displayName: 'C++',         version: 'C++20',   fileExtension: '.cpp',  codemirrorLang: 'cpp' },
  java:       { tier: 'backend', displayName: 'Java',        version: '21',      fileExtension: '.java', codemirrorLang: 'java' },
};
```

### Challenge Validation Flow

```
Learner writes code
       |
       v
+------------------+
| Execute code     |----> ExecutionResult { output, error }
+--------+---------+
         |
         v
+------------------+
| Step Validator   |    Compares output against expected:
|                  |    - Regex match on output
|                  |    - Exact output comparison
|                  |    - AST analysis (TS only, browser)
|                  |    - Custom validation function
+--------+---------+
         |
    +----+----+
    |         |
 correct   wrong
    |         |
    v         v
 Tutor:    Tutor:
 REVEAL    OFFER_HINT or
 THEORY    DEEPER_DIVE
```

### Security Constraints

| Concern | Browser (Tier 1) | Backend (Tier 2) |
|---------|-------------------|-------------------|
| Isolation | Web Worker (no DOM, no fetch) | nsjail (syscall filter, namespaces) |
| Timeout | Worker termination (5s default) | Piston `run_timeout` (5s default) |
| Memory | Browser tab limit (~4GB) | Piston limit (256MB) |
| Network | Workers have no network access | nsjail blocks all network |
| Filesystem | No filesystem access | Read-only except /tmp |
| Infinite loops | Worker killed after timeout | Process killed after timeout |

### MVP Execution Support Matrix

| Language | Tier | MVP Status | Load Cost |
|----------|------|------------|-----------|
| TypeScript | Browser | Day 1 | ~3 MB |
| JavaScript | Browser | Day 1 | 0 KB |
| Python | Browser | Day 1 | ~11 MB (lazy) |
| Rust | Backend (Piston) | Day 1 | N/A |
| SQL | Browser | v1.1 | ~1.5 MB |
| Go | Backend (Piston) | v2 | N/A |
| C++ | Backend (Piston) | v2 | N/A |
| Java | Backend (Piston) | v2 | N/A |

---

## 6. Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                       BROWSER                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │             SvelteKit App (SSR/CSR)                │  │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │  │
│  │  │ Problem   │ │ Code      │ │ Theory           │  │  │
│  │  │ Explorer  │ │ Sandbox   │ │ Revealer         │  │  │
│  │  └────┬──────┘ └─────┬─────┘ └──────┬───────────┘  │  │
│  │       │              │              │              │  │
│  │  ┌────▼──────────────▼──────────────▼───────────┐  │  │
│  │  │         Rule-Based Tutor Agent               │  │  │
│  │  │   (Svelte store + state machine)             │  │  │
│  │  └────┬─────────────────────────────────────────┘  │  │
│  │       │                                            │  │
│  │  ┌────▼─────────────────────────────────────────┐  │  │
│  │  │  WASM Execution (Tier 1)                     │  │  │
│  │  │  JS/TS: Web Worker | Python: Pyodide         │  │  │
│  │  │  SQL: sql.js                                 │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────┬───────────────────────────────────────────┘  │
│           │ fetch API (Tier 2 langs + progress)           │
└───────────┼──────────────────────────────────────────────┘
            │
     ┌──────▼──────────────────────────────────────┐
     │              Nginx Reverse Proxy             │
     │         (SSL termination, routing)           │
     └──────┬──────────────────┬───────────────────┘
            │                  │
     ┌──────▼──────┐   ┌──────▼──────────────────┐
     │  SvelteKit  │   │     Rust API (Axum)     │
     │  Node SSR   │   │  /api/execute           │
     │  Port 3000  │   │  /api/progress          │
     │             │   │  /api/achievements       │
     └─────────────┘   └──┬───────────────┬──────┘
                          │               │
                   ┌──────▼──────┐ ┌──────▼──────┐
                   │   Turso DB  │ │   Piston    │
                   │   (libSQL)  │ │  Code Exec  │
                   └─────────────┘ │  Port 2000  │
                                   └─────────────┘
```

---

## 7. Data Model

### Users
```sql
CREATE TABLE users (
    id          TEXT PRIMARY KEY,       -- ULID
    email       TEXT UNIQUE NOT NULL,
    username    TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    xp          INTEGER DEFAULT 0,
    level       INTEGER DEFAULT 1,
    locale      TEXT DEFAULT 'en',      -- preferred language: 'en' | 'fr'
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
);
```

### Sessions (Lucia Auth)
```sql
CREATE TABLE sessions (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    expires_at  TEXT NOT NULL
);
```

### Learning Paths
```sql
CREATE TABLE learning_paths (
    id          TEXT PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    domain      TEXT NOT NULL,       -- 'programming', 'stem', 'languages'
    mode        TEXT NOT NULL,       -- 'problem-first', 'fix-broken', 'goal-tree'
    difficulty  TEXT NOT NULL,       -- 'beginner', 'intermediate', 'advanced'
    description TEXT,
    xp_reward   INTEGER DEFAULT 100,
    created_at  TEXT DEFAULT (datetime('now'))
);
```

### Steps (nodes in a learning path)
```sql
CREATE TABLE steps (
    id              TEXT PRIMARY KEY,
    path_id         TEXT NOT NULL REFERENCES learning_paths(id),
    order_index     INTEGER NOT NULL,
    title           TEXT NOT NULL,
    step_type       TEXT NOT NULL,    -- 'challenge', 'reveal', 'sandbox', 'theory'
    content_json    TEXT NOT NULL,    -- JSON blob with step-specific content
    hint            TEXT,
    xp_reward       INTEGER DEFAULT 10,
    parent_step_id  TEXT REFERENCES steps(id)  -- for dependency trees
);
```

### User Progress
```sql
CREATE TABLE user_progress (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    path_id     TEXT NOT NULL REFERENCES learning_paths(id),
    step_id     TEXT NOT NULL REFERENCES steps(id),
    status      TEXT DEFAULT 'locked',  -- 'locked', 'available', 'in-progress', 'completed'
    answer_json TEXT,                   -- user's submitted answer
    attempts    INTEGER DEFAULT 0,
    completed_at TEXT,
    UNIQUE(user_id, step_id)
);
```

### Achievements
```sql
CREATE TABLE achievements (
    id          TEXT PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    icon        TEXT NOT NULL,        -- emoji or icon name
    xp_bonus    INTEGER DEFAULT 50,
    criteria_json TEXT NOT NULL       -- rule engine criteria
);

CREATE TABLE user_achievements (
    user_id         TEXT NOT NULL REFERENCES users(id),
    achievement_id  TEXT NOT NULL REFERENCES achievements(id),
    earned_at       TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, achievement_id)
);
```

---

## 8. Rule-Based Tutor Agent

The tutor agent is a **client-side state machine** (no AI API calls) that guides the learner through reverse-engineering paths.

### State Machine

```
┌──────────┐    user picks    ┌──────────────┐
│  IDLE    │───problem────────▶│ PROBLEM      │
└──────────┘                  │ PRESENTED    │
                              └──────┬───────┘
                                     │ user attempts
                              ┌──────▼───────┐
                              │ ATTEMPTING   │◄────────┐
                              └──────┬───────┘         │
                            correct? │                 │ retry
                         ┌───────────┼──────────┐      │
                         │ yes       │ partial  │ no   │
                  ┌──────▼──┐ ┌─────▼──────┐ ┌─▼──────┤
                  │ REVEAL  │ │ HINT       │ │ DEEPER │
                  │ THEORY  │ │ OFFERED    │ │ DIVE   │
                  └────┬────┘ └─────┬──────┘ └────────┘
                       │            │
                       │    ┌───────▼───────┐
                       │    │ HINT REVEALED │
                       │    └───────┬───────┘
                       │            │
                  ┌────▼────────────▼──┐
                  │   CONCEPT UNLOCKED │
                  │   (XP awarded)     │
                  └────────┬───────────┘
                           │
                    ┌──────▼───────┐
                    │ NEXT STEP or │
                    │ PATH COMPLETE│
                    └──────────────┘
```

### Agent Rules (examples)

```typescript
// Pseudocode for tutor decision engine
interface TutorRule {
  condition: (ctx: LearnerContext) => boolean;
  action: TutorAction;
  priority: number;
}

const rules: TutorRule[] = [
  {
    condition: (ctx) => ctx.attempts >= 3 && !ctx.hintUsed,
    action: 'OFFER_HINT',
    priority: 10
  },
  {
    condition: (ctx) => ctx.attempts >= 5,
    action: 'REVEAL_PARTIAL_THEORY',
    priority: 20
  },
  {
    condition: (ctx) => ctx.timeOnStep > 120_000, // 2 min
    action: 'SUGGEST_DECOMPOSE',  // break problem into sub-problems
    priority: 15
  },
  {
    condition: (ctx) => ctx.correctAnswer && ctx.attempts === 1,
    action: 'FAST_TRACK',  // skip optional theory, award bonus XP
    priority: 30
  },
  {
    condition: (ctx) => ctx.consecutiveFailures >= 3,
    action: 'OFFER_PREREQUISITE_PATH',  // suggest going deeper
    priority: 25
  }
];
```

---

## 9. Content Structure (Static JSON -- Localized)

Learning content is organized per locale in `/src/content/{lang}/`:

```
src/content/
├── en/
│   ├── paths/
│   │   ├── typescript-error-detective.json
│   │   ├── rust-ownership-from-bugs.json
│   │   └── build-rest-api-backward.json
│   ├── achievements.json
│   └── domains.json
└── fr/
    ├── paths/
    │   ├── typescript-error-detective.json
    │   ├── rust-ownership-from-bugs.json
    │   └── build-rest-api-backward.json
    ├── achievements.json
    └── domains.json
```

### Example Path: `typescript-error-detective.json`

```json
{
  "id": "ts-error-detective",
  "slug": "typescript-error-detective",
  "title": "TypeScript Error Detective",
  "domain": "programming",
  "mode": "fix-broken",
  "difficulty": "beginner",
  "description": "You have a broken TypeScript app. Fix the errors and discover the type system.",
  "xpReward": 150,
  "estimatedMinutes": 30,
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "title": "The App Crashes",
      "type": "challenge",
      "content": {
        "scenario": "A colleague pushed this code and the app crashes. Can you spot the bug?",
        "code": "function greet(name: string) {\n  return 'Hello, ' + name;\n}\n\ngreet(42);",
        "language": "typescript",
        "expectedFix": "greet('World')",
        "validationRegex": "greet\\(['\"].*['\"]\\)",
        "errorMessage": "Argument of type 'number' is not assignable to parameter of type 'string'"
      },
      "xpReward": 10
    },
    {
      "id": "step-2",
      "order": 2,
      "title": "Why Did That Fail?",
      "type": "reveal",
      "content": {
        "theory": "## Type Annotations\n\nTypeScript uses **type annotations** to catch errors at compile time...",
        "keyInsight": "Types are contracts. `name: string` means this function ONLY accepts strings.",
        "interactiveDemo": {
          "type": "type-playground",
          "initialCode": "let x: number = 'hello';",
          "prompt": "Try changing the value to make this valid"
        }
      },
      "xpReward": 5
    },
    {
      "id": "step-3",
      "order": 3,
      "title": "Now It Gets Weird",
      "type": "challenge",
      "content": {
        "scenario": "The greet function now needs to handle both a single name and an array of names.",
        "code": "function greet(name: string) {\n  return 'Hello, ' + name;\n}\n\ngreet(['Alice', 'Bob']);",
        "language": "typescript",
        "hint": "What if the parameter could be MORE than one type?",
        "expectedConcepts": ["union-types", "type-guards"]
      },
      "xpReward": 15
    },
    {
      "id": "step-4",
      "order": 4,
      "title": "Union Types — The 'Or' Operator for Types",
      "type": "reveal",
      "content": {
        "theory": "## Union Types\n\nA union type `A | B` means the value can be type A **or** type B...",
        "formula": null,
        "expandableSections": [
          {
            "title": "Why not just use 'any'?",
            "content": "Using `any` defeats the purpose of TypeScript. Union types give you flexibility WITH safety..."
          },
          {
            "title": "How does this relate to Set Theory?",
            "content": "In mathematics, a union A ∪ B contains all elements of A and all elements of B..."
          }
        ]
      },
      "xpReward": 5
    }
  ]
}
```

---

## 10. Frontend Page Structure

```
src/routes/
├── +page.server.ts                 # Root: detect Accept-Language → redirect to /en or /fr
│
├── [lang=locale]/                  # Locale-prefixed routes (param matcher)
│   ├── +page.svelte                # Landing page
│   ├── +layout.svelte              # Root layout (nav, theme, locale context)
│   ├── +layout.server.ts           # Validate lang, load auth session, set locale
│   │
│   ├── auth/
│   │   ├── login/+page.svelte
│   │   ├── register/+page.svelte
│   │   ├── logout/+server.ts
│   │   ├── forgot-password/+page.svelte
│   │   ├── reset-password/[token]/+page.svelte
│   │   ├── verify-email/[token]/+page.svelte
│   │   └── github/+server.ts          # GitHub OAuth callback
│   │
│   ├── explore/
│   │   ├── +page.svelte            # Browse all learning paths
│   │   └── [domain]/+page.svelte   # Filter by domain
│   │
│   ├── learn/
│   │   ├── [pathSlug]/
│   │   │   ├── +page.svelte        # Path overview + dependency tree view
│   │   │   ├── +page.server.ts     # Load path (locale-aware) + user progress
│   │   │   └── [stepId]/
│   │   │       ├── +page.svelte    # Interactive step (THE core experience)
│   │   │       └── +page.server.ts # Load step + validate answers
│   │
│   ├── onboarding/
│   │   └── +page.svelte            # Post-registration onboarding wizard
│   │
│   └── profile/
│       ├── +page.svelte            # XP, level, achievements, history
│       ├── settings/+page.svelte   # Account, preferences, data export
│       └── achievements/+page.svelte
│
├── api/
│   ├── progress/+server.ts         # Proxy to Rust API
│   └── achievements/+server.ts
│
src/params/
└── locale.ts                       # ParamMatcher: /^(en|fr)$/
```

---

## 11. Key Svelte Components

```
src/lib/components/
├── learning/
│   ├── ProblemPresenter.svelte     # Shows the problem/scenario
│   ├── CodeSandbox.svelte          # CodeMirror editor for code challenges
│   ├── MathSandbox.svelte          # KaTeX + formula input
│   ├── TheoryRevealer.svelte       # Progressive disclosure of theory
│   ├── HintDrawer.svelte           # Slide-in hint panel
│   ├── DependencyTree.svelte       # Visual concept dependency tree
│   ├── StepNavigator.svelte        # Next/prev step with progress
│   └── ConceptCard.svelte          # Card showing an unlocked concept
│
├── tutor/
│   ├── TutorAgent.svelte           # Main tutor overlay/sidebar
│   ├── TutorMessage.svelte         # Chat-like tutor messages
│   └── TutorActionBar.svelte       # "Need a hint?" / "Go deeper" buttons
│
├── gamification/
│   ├── XPBar.svelte                # Animated XP progress bar
│   ├── LevelBadge.svelte           # Current level display
│   ├── AchievementPopup.svelte     # Toast-like popup on achievement
│   └── AchievementGrid.svelte      # Grid of all achievements
│
├── onboarding/
│   ├── OnboardingFlow.svelte       # Multi-step wizard controller
│   ├── WelcomeStep.svelte          # Philosophy intro
│   ├── InterestPicker.svelte       # Domain card grid
│   ├── SkillAssessment.svelte      # Self-reported level
│   └── MicroChallenge.svelte       # Embedded first challenge
│
├── completion/
│   ├── PathComplete.svelte         # Completion summary screen
│   ├── ShareCard.svelte            # Shareable achievement card
│   └── NextRecommendation.svelte   # "What's next?" suggestions
│
├── settings/
│   └── SettingsForm.svelte         # Account & preference form
│
├── ui/
│   ├── Navbar.svelte
│   ├── Footer.svelte
│   ├── Modal.svelte
│   ├── Toast.svelte
│   ├── SkipLink.svelte             # "Skip to main content" a11y link
│   ├── KeyboardShortcuts.svelte    # Global shortcut handler
│   ├── ShortcutsHelp.svelte        # Shortcuts overlay (triggered by ?)
│   └── ExpandableSection.svelte
│
└── shared/
    ├── MarkdownRenderer.svelte     # Renders markdown content
    ├── CodeBlock.svelte            # Syntax-highlighted code display
    └── SEOHead.svelte              # Reusable meta/OG/hreflang component
```

---

## 12. Rust API Endpoints

```
Base: /api/v1

Auth:
  POST   /auth/verify          -- Verify session token
  POST   /auth/forgot-password  -- Send password reset email
  POST   /auth/reset-password   -- Reset password with token
  GET    /auth/verify-email/:token -- Verify email address
  GET    /auth/github           -- GitHub OAuth initiate
  GET    /auth/github/callback  -- GitHub OAuth callback

Health:
  GET    /health               -- Service health + DB status
  GET    /health/piston         -- Piston sidecar health

Code Execution:
  POST   /execute              -- Execute code via Piston (Tier 2 languages only)

Progress:
  GET    /progress/:userId                    — All progress for user
  GET    /progress/:userId/path/:pathId       — Progress for specific path
  POST   /progress/:userId/step/:stepId       — Submit step completion
  PATCH  /progress/:userId/step/:stepId       — Update attempt count

Achievements:
  GET    /achievements                        — List all achievements
  GET    /achievements/:userId                — User's earned achievements
  POST   /achievements/:userId/check          — Evaluate & award new achievements

Analytics:
  POST   /analytics/event                     — Track learning event
  GET    /analytics/:userId/summary           — Learning summary stats

User Settings:
  GET    /users/:userId/preferences            — Get preferences
  PATCH  /users/:userId/preferences            — Update preferences
  POST   /users/:userId/export                 — Export user data (JSON)
  DELETE /users/:userId                        — Delete account (soft, 7-day grace)

Leaderboard (future):
  GET    /leaderboard                         — Top users by XP
```

### Rust Project Structure
```
rust-api/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── config.rs              # Env vars, DB connection
│   ├── routes/
│   │   ├── mod.rs
│   │   ├── auth.rs                # OAuth, password reset, email verify
│   │   ├── execute.rs             # POST /execute (Piston proxy)
│   │   ├── health.rs              # Health check endpoints
│   │   ├── progress.rs
│   │   ├── achievements.rs
│   │   ├── users.rs               # Preferences, export, delete
│   │   └── analytics.rs
│   ├── models/
│   │   ├── mod.rs
│   │   ├── user.rs
│   │   ├── progress.rs
│   │   └── achievement.rs
│   ├── services/
│   │   ├── mod.rs
│   │   ├── progress_service.rs
│   │   └── achievement_engine.rs  # Rule evaluation
│   ├── middleware/
│   │   ├── auth.rs             # Session verification
│   │   └── rate_limit.rs       # Per-route rate limiting
│   └── error.rs                # Error types
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_sessions.sql
│   ├── 003_create_paths.sql
│   ├── 004_create_progress.sql
│   ├── 005_create_achievements.sql
│   ├── 006_create_preferences.sql
│   ├── 007_create_email_tokens.sql
│   ├── 008_create_oauth_accounts.sql
│   └── 009_create_analytics.sql
└── Dockerfile
```

---

## 13. Gamification System

### XP & Leveling

| Action | XP |
|--------|----|
| Complete a step | 5–20 (varies by difficulty) |
| Complete a path | 50–200 |
| First attempt success | 2x bonus |
| Use no hints | 1.5x bonus |
| Complete path < estimated time | 1.3x bonus |

**Level formula**: `level = floor(sqrt(xp / 100)) + 1`

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Curious Beginner |
| 2 | 100 | Problem Spotter |
| 3 | 400 | Bug Hunter |
| 5 | 1,600 | Concept Connector |
| 10 | 8,100 | Reverse Engineer |
| 15 | 19,600 | Theory Master |
| 20 | 36,100 | Polymath |

### Achievements (sample)

| Icon | Slug | Criteria |
|------|------|----------|
| Diamond | `first-bug` | Complete your first challenge step |
| Prism | `aha-moment` | Unlock 5 theory reveals |
| Arrow | `speed-runner` | Complete a path in under half the estimated time |
| Crosshair | `perfect-path` | Complete a full path with no hints used |
| Nested squares | `deep-diver` | Explore all optional "go deeper" sections in a path |
| Flame outline | `streak-3` | Complete steps 3 days in a row |
| Scaffold | `builder` | Complete 5 full learning paths |

---

## 14. MVP Scope (2 Weeks)

### Week 1: Foundation + Core UX

| Day | Task |
|-----|------|
| **1-2** | Scaffold SvelteKit + Tailwind + Melt UI + Paraglide.js. Design system tokens (colors, typography, spacing). Scaffold Rust API with Axum + Turso. Docker setup. Zod content schemas. |
| **3** | Lucia Auth integration (register, login, logout, GitHub OAuth). DB migrations (all 9). i18n routing (`[lang=locale]`). Password reset + email verification flow. |
| **4** | Landing page with interactive demo (guest code execution). Content loading system (locale-aware). Validate content at build time. SEO meta component. |
| **5** | Onboarding flow (4-screen wizard). Core learning UI with design system: `ProblemPresenter`, `CodeSandbox`, `TheoryRevealer`, language switcher, custom CodeMirror theme. Keyboard shortcuts. |

### Week 2: Intelligence, Polish & Production

| Day | Task |
|-----|------|
| **6** | Rule-based tutor agent (state machine + rules engine, locale-aware). Auto-save code in editor (localStorage). Session recovery. |
| **7** | Progress tracking (API endpoints + UI). Step completion flow. Path completion screen with share card + "what's next?" recommendation. |
| **8** | Gamification: XP bar, level display, achievement popup. Settings page. Error boundaries + 404/500 pages. |
| **9** | Create 2-3 complete learning paths in EN, translate to FR. Rate limiting on API. Health endpoints. Sentry integration. |
| **10** | Docker compose, Nginx config (security headers, CSR), Playwright E2E tests (5 critical flows), accessibility audit (axe-core), performance check (Lighthouse), final polish. |

### MVP Learning Paths

1. **TypeScript Error Detective** (fix-broken mode, beginner, ~30 min)
   - 8 steps: type errors → type annotations → union types → generics
   
2. **Build a REST API — Backward** (problem-first mode, intermediate, ~45 min)
   - 10 steps: "deploy this endpoint" → HTTP verbs → routing → middleware → TCP

3. **Rust Ownership: Why Does the Compiler Hate Me?** (fix-broken mode, intermediate, ~40 min)
   - 8 steps: borrow checker errors → ownership → borrowing → lifetimes

---

## 15. Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://api:8080
      - TURSO_URL=${TURSO_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
    depends_on:
      - api

  api:
    build:
      context: ./rust-api
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - TURSO_URL=${TURSO_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
      - JWT_SECRET=${JWT_SECRET}
      - PISTON_URL=http://piston:2000
      - RUST_LOG=info
    depends_on:
      - piston

  piston:
    image: ghcr.io/engineer-man/piston:latest
    ports:
      - "2000:2000"
    volumes:
      - piston-packages:/piston/packages
    tmpfs:
      - /piston/jobs:exec,size=256M
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '2.0'
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - api

volumes:
  piston-packages:
```

---

## 16. File Tree (Complete Project)

```
reverse-academy/
├── PLAN.md                          # This file
├── docker-compose.yml
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml                   # Lint, type-check, validate, test, build, E2E
├── nginx/
│   └── nginx.conf
├── scripts/
│   └── setup-piston-languages.sh    # Install language runtimes into Piston
│
├── frontend/                        # SvelteKit app
│   ├── package.json
│   ├── svelte.config.js
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── project.inlang/              # Inlang project config (Paraglide)
│   │   └── settings.json
│   ├── messages/                    # UI translations (Paraglide)
│   │   ├── en.json
│   │   └── fr.json
│   ├── Dockerfile
│   └── src/
│       ├── app.html
│       ├── app.css                  # Tailwind base + design tokens
│       ├── design/
│       │   ├── tokens.css           # CSS custom properties (colors, spacing, type scale)
│       │   ├── typography.css       # Font-face declarations + type utilities
│       │   ├── codemirror-theme.ts  # Custom CodeMirror 6 dark/light theme
│       │   └── fonts/               # Self-hosted Fraunces, Satoshi, JetBrains Mono
│       ├── params/
│       │   └── locale.ts            # ParamMatcher: /^(en|fr)$/
│       ├── lib/
│       │   ├── paraglide/           # Auto-generated by Paraglide (do not edit)
│       │   │   ├── messages.ts
│       │   │   └── runtime.ts
│       │   ├── i18n.ts              # Locale helpers, language switcher logic
│       │   ├── server/
│       │   │   ├── auth.ts          # Lucia auth setup
│       │   │   ├── db.ts            # Turso client
│       │   │   └── email.ts         # Email sending (Resend or SMTP)
│       │   ├── stores/
│       │   │   ├── tutor.ts         # Tutor agent state machine
│       │   │   ├── progress.ts      # User progress store
│       │   │   ├── gamification.ts  # XP, level, achievements
│       │   │   ├── locale.ts        # Current locale store
│       │   │   ├── settings.ts      # User preferences store
│       │   │   └── theme.ts         # Dark/light mode
│       │   ├── engine/
│       │   │   ├── execution-router.ts  # Routes code to browser or backend
│       │   │   ├── tutor-rules.ts   # Rule definitions
│       │   │   ├── tutor-messages.ts # Localized tutor messages (en/fr)
│       │   │   ├── step-validator.ts # Answer validation logic
│       │   │   ├── xp-calculator.ts # XP formulas
│       │   │   └── content-loader.ts # Locale-aware path loader
│       │   ├── workers/
│       │   │   ├── js-executor.worker.ts   # JS/TS execution in Web Worker
│       │   │   └── python-executor.ts      # Pyodide lazy-loader + executor
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   │   ├── LanguageSwitcher.svelte  # EN/FR toggle
│       │   │   │   └── ...          # (as listed in section 9)
│       │   │   └── ...              # (as listed in section 9)
│       │   └── types/
│       │       ├── path.ts          # LearningPath, Step, StepContent
│       │       ├── progress.ts      # UserProgress, StepStatus
│       │       ├── tutor.ts         # TutorState, TutorAction, TutorRule
│       │       ├── i18n.ts          # Locale, SupportedLocale types
│       │       ├── execution.ts     # ExecutionResult, SupportedLanguage, LANGUAGE_CONFIG
│       │       └── gamification.ts  # Achievement, Level, XPEvent
│       ├── schemas/
│       │   └── content.ts           # Zod schemas for path/step validation
│       ├── content/
│       │   ├── en/
│       │   │   ├── paths/
│       │   │   │   ├── typescript-error-detective.json
│       │   │   │   ├── build-rest-api-backward.json
│       │   │   │   └── rust-ownership-from-bugs.json
│       │   │   ├── achievements.json
│       │   │   └── domains.json
│       │   └── fr/
│       │       ├── paths/
│       │       │   ├── typescript-error-detective.json
│       │       │   ├── build-rest-api-backward.json
│       │       │   └── rust-ownership-from-bugs.json
│       │       ├── achievements.json
│       │       └── domains.json
│       └── routes/                  # (as listed in section 10)
│
├── scripts/
│   ├── validate-content.ts          # Build-time content validation
│   └── setup-piston-languages.sh    # Install language runtimes into Piston
│
├── static/
│   ├── robots.txt
│   ├── og-image.png                 # 1200x630 share image
│   ├── favicon.svg                  # Geometric mark, accent color
│   └── pyodide/                     # Self-hosted Pyodide WASM files
│
├── tests/
│   ├── unit/                        # Vitest unit tests
│   │   ├── xp-calculator.test.ts
│   │   ├── tutor-rules.test.ts
│   │   ├── step-validator.test.ts
│   │   └── execution-router.test.ts
│   ├── component/                   # Svelte component tests
│   │   ├── CodeSandbox.test.ts
│   │   ├── TheoryRevealer.test.ts
│   │   └── OnboardingFlow.test.ts
│   └── e2e/                         # Playwright E2E tests
│       ├── guest-demo.spec.ts
│       ├── registration.spec.ts
│       ├── learning-flow.spec.ts
│       ├── code-execution.spec.ts
│       └── i18n.spec.ts
│
└── rust-api/                        # Axum backend
    ├── Cargo.toml
    ├── Dockerfile
    ├── src/                         # (as listed in section 9)
    └── migrations/
```

---

## 17. Onboarding Flow

Every top learning app (Brilliant, Duolingo, Codecademy) converts visitors in under 90 seconds. Reverse Academy must do the same.

### Pre-Auth: Try Before Signup

The landing page includes an **interactive mini-challenge** that works without an account. Visitor writes code, gets feedback, sees the "aha" moment. Then: "Want to save your progress? Create an account in 10 seconds."

### Post-Registration Onboarding (4 screens, <60 seconds)

```
Screen 1: Welcome
  "You learn by doing, not by reading."
  Brief philosophy of reverse learning (3 sentences max)
  [Continue]

Screen 2: Pick Your Interest
  Grid of domain cards (programming, web dev, systems, etc.)
  Select 1-3 interests → personalizes explore page ranking
  [Continue]

Screen 3: Skill Check (Optional, skippable)
  "How comfortable are you with code?"
  - "Never written code"       → routes to beginner paths
  - "I've built small projects" → routes to intermediate
  - "I work with code daily"   → routes to advanced
  [Skip] [Continue]

Screen 4: First Challenge (Micro)
  Embedded 30-second challenge (TypeScript type error fix)
  Teaches the UI: code editor, run button, theory reveal
  Awards first 10 XP immediately → dopamine hit before they've committed
  [Start Learning]
```

### Data Model Addition

```sql
CREATE TABLE user_preferences (
    user_id     TEXT PRIMARY KEY REFERENCES users(id),
    interests   TEXT,            -- JSON array: ["programming", "web-dev"]
    skill_level TEXT DEFAULT 'beginner',  -- 'beginner', 'intermediate', 'advanced'
    onboarded   INTEGER DEFAULT 0,       -- 0 = not complete, 1 = complete
    editor_font_size INTEGER DEFAULT 14,
    editor_tab_size  INTEGER DEFAULT 2,
    updated_at  TEXT DEFAULT (datetime('now'))
);
```

### Onboarding Component

```
src/lib/components/onboarding/
├── OnboardingFlow.svelte        # Multi-step wizard controller
├── WelcomeStep.svelte           # Philosophy intro
├── InterestPicker.svelte        # Domain card grid
├── SkillAssessment.svelte       # Self-reported level
└── MicroChallenge.svelte        # Embedded first challenge
```

---

## 18. Landing Page Specification

The landing page is the most important page. It must explain the reverse learning concept, build trust, and convert visitors to learners. No signup wall for the demo.

### Structure (Top to Bottom)

```
1. HERO
   ┌─────────────────────────────────────────────────┐
   │  Headline (Fraunces, --text-hero):              │
   │  "Learn by breaking things."                    │
   │                                                 │
   │  Subhead (Satoshi, --text-lg):                  │
   │  "Start with a broken app. Fix it.              │
   │   Discover why it works along the way."         │
   │                                                 │
   │  [Start a Challenge] [How It Works ↓]           │
   └─────────────────────────────────────────────────┘

2. INTERACTIVE DEMO (no auth required)
   ┌─────────────────────────────────────────────────┐
   │  Embedded CodeSandbox with a simple TS error    │
   │  User can edit + run code right on the landing  │
   │  On success: theory reveal animates in          │
   │  "That's reverse learning. Want more?"          │
   │  [Create Free Account]                          │
   └─────────────────────────────────────────────────┘

3. HOW IT WORKS (3-column, icons + short text)
   ┌───────────┐ ┌───────────┐ ┌───────────┐
   │ 1. Break  │ │ 2. Fix    │ │ 3. Learn  │
   │ See broken│ │ Debug &   │ │ Theory    │
   │ code      │ │ repair    │ │ revealed  │
   └───────────┘ └───────────┘ └───────────┘

4. FEATURED PATHS (3 cards)
   Show the 3 MVP learning paths with:
   - Title, difficulty badge, estimated time
   - First line of the scenario text
   - [Start Path] button

5. PHILOSOPHY BLOCK (editorial, centered column)
   "Traditional education: Theory → Examples → Maybe a real problem.
    Reverse Academy: Real problem → Attempt → 'Why?' → Discover concept.
    Every piece of theory is the answer to a question you already have."

6. FOOTER
   Minimal: Language switcher, GitHub link, "Built with [tech]"
```

### Guest Access

- Visitors can attempt the landing page challenge without auth
- Attempting to start a full path triggers auth modal
- Guest progress on the landing demo is preserved and credited after signup

---

## 19. Error Handling & Loading States

### Global Error Boundary

```svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<!-- Renders for any unhandled error -->
<!-- Status code-aware: 404 vs 500 vs other -->
```

### Error Pages

| Route | Purpose |
|-------|---------|
| `+error.svelte` (root) | Catch-all: displays status + message |
| `[lang]/+error.svelte` | Locale-aware error page |

### Error States by Component

| Component | Error Behavior |
|-----------|----------------|
| `CodeSandbox` | Execution error displayed inline (red border + stderr), editor stays editable |
| `TheoryRevealer` | Content load failure → retry button + "Content unavailable" placeholder |
| `TutorAgent` | Fails silently — tutor is enhancement, not critical path |
| `API calls (progress, achievements)` | Toast notification + auto-retry (3 attempts, exponential backoff) |
| `Code execution (Tier 2)` | Timeout/failure → "Backend unavailable, try a browser-supported language" fallback |

### Loading Skeleton Patterns

```
ProblemPresenter:   3 text lines (60%/80%/40% width) + code block skeleton
CodeSandbox:        Gray block with line-number column
TheoryRevealer:     Collapsed state (no skeleton — it's hidden until triggered)
PathCard:           Rectangle with 2 text skeletons + badge placeholder
ExploreGrid:        6 PathCard skeletons in grid
```

All skeletons: `--surface-2` background, subtle shimmer (1.5s ease-in-out), no pulsing.

### Offline & Retry

- Service Worker (via SvelteKit): cache static assets + font files
- Code execution (Tier 1) works fully offline (browser WASM)
- API failures: show cached data if available, else retry prompt
- IndexedDB: cache last-loaded path content for offline access

---

## 20. Accessibility (a11y)

### Compliance Target: WCAG 2.1 Level AA

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard navigation** | All interactive elements reachable via Tab. Code editor uses Escape to exit → Tab resumes normal flow. |
| **Focus management** | On route change: focus moves to `<main>` heading. On modal open: focus trapped inside. On modal close: focus returns to trigger. |
| **Screen reader announcements** | `aria-live="polite"` regions for: code execution results, XP awarded, tutor messages, step completion. |
| **Skip link** | "Skip to main content" link, visible on focus, first element in DOM. |
| **Color contrast** | All text/background combos meet 4.5:1 ratio (AA). Accent on dark: #D4A843 on #050506 = 8.2:1. Verified. |
| **Alt text** | Geometric achievement icons include descriptive `aria-label`. No decorative images. |
| **ARIA landmarks** | `<nav>`, `<main>`, `<aside>` (tutor panel), `<footer>` with appropriate roles. |
| **Form labels** | All inputs have visible labels or `aria-label`. Error messages linked via `aria-describedby`. |
| **Reduced motion** | `prefers-reduced-motion: reduce` disables all transitions/animations. |
| **Font scaling** | All sizes in rem/clamp. UI functional up to 200% browser zoom. |

### Code Editor Accessibility

- CodeMirror 6 has built-in screen reader support (ARIA roles, live regions)
- Custom keybindings documented in accessible help panel (Cmd+?)
- Tab key: handled by editor (insert tab in code). Escape+Tab: exit editor focus.
- Execution results announced via `aria-live` region below editor

### Testing

- axe-core automated checks in Playwright E2E suite
- Manual screening reader testing checklist (VoiceOver on macOS)

---

## 21. SEO & Meta

### Per-Page Meta Tags

```svelte
<!-- +layout.svelte or +page.svelte -->
<svelte:head>
  <title>{pageTitle} — Reverse Academy</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="fr" href={frUrl} />
</svelte:head>
```

### Structured Data (JSON-LD)

Learning paths emit Course schema for search engines:

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "TypeScript Error Detective",
  "description": "Fix broken TypeScript code and discover the type system.",
  "provider": { "@type": "Organization", "name": "Reverse Academy" },
  "educationalLevel": "Beginner",
  "inLanguage": ["en", "fr"],
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "duration": "PT30M"
  }
}
```

### Static Files

| File | Purpose |
|------|---------|
| `robots.txt` | Allow all, sitemap reference |
| `sitemap.xml` | Auto-generated at build time: all locale-prefixed path pages |
| `og-image.png` | 1200x630 branded share image |
| `favicon.svg` | Geometric mark in `--accent` color, works on dark/light |

### Route-Level SEO

| Route | Title Pattern | Description |
|-------|---------------|-------------|
| Landing | "Reverse Academy — Learn by Breaking Things" | Philosophy-driven description |
| Explore | "Explore Learning Paths — Reverse Academy" | Domain/difficulty filtering mentioned |
| Path detail | "{Path Title} — Reverse Academy" | Path description |
| Step | "{Step Title} — {Path Title}" | Step-specific (noindex if auth-required) |
| Profile | noindex | Private content |

---

## 22. Authentication Completeness

### Full Auth Flow

| Feature | Route | Status |
|---------|-------|--------|
| Register (email + password) | `/[lang]/auth/register` | MVP |
| Login | `/[lang]/auth/login` | MVP |
| Logout | `/[lang]/auth/logout` | MVP |
| Forgot password | `/[lang]/auth/forgot-password` | MVP |
| Reset password (token link) | `/[lang]/auth/reset-password/[token]` | MVP |
| Email verification | `/[lang]/auth/verify-email/[token]` | MVP |
| OAuth: GitHub | `/[lang]/auth/github` | MVP |
| OAuth: Google | `/[lang]/auth/google` | v1.1 |

### Why OAuth Is MVP for Dev Learners

GitHub OAuth takes 30 minutes to implement with Lucia Auth and removes the #1 signup friction for developers. 80%+ of Exercism users sign in via GitHub.

### Password Reset Flow

```
1. User clicks "Forgot password?"
2. Enter email → POST /api/auth/forgot-password
3. Server generates time-limited token (1 hour), stores hash in DB
4. Sends email with reset link (via Resend or SMTP)
5. User clicks link → /auth/reset-password/[token]
6. New password form → POST /api/auth/reset-password
7. Token consumed, password updated, all sessions invalidated
```

### Email Verification

- On registration: send verification email with token link
- User can use the app immediately (soft gate)
- After 7 days without verification: show persistent banner, limit code execution to 10/day

### Data Model Addition

```sql
CREATE TABLE email_tokens (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    type        TEXT NOT NULL,         -- 'password_reset' | 'email_verification'
    token_hash  TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    used_at     TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE oauth_accounts (
    provider    TEXT NOT NULL,         -- 'github' | 'google'
    provider_id TEXT NOT NULL,
    user_id     TEXT NOT NULL REFERENCES users(id),
    created_at  TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (provider, provider_id)
);
```

---

## 23. Keyboard Shortcuts

Every code-focused learning platform needs keyboard shortcuts. They separate "toy" from "tool."

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` / `Ctrl+Enter` | Run code in active editor |
| `Cmd+S` / `Ctrl+S` | Prevent browser save dialog (intercepted, no-op or auto-save) |
| `Escape` | Close active panel (hint drawer, tutor, modal) |
| `Cmd+K` / `Ctrl+K` | Command palette (future — v1.1) |
| `?` | Show keyboard shortcuts help overlay (when not in editor) |

### Code Editor Shortcuts (CodeMirror defaults + custom)

| Shortcut | Action |
|----------|--------|
| `Tab` | Indent (inside editor) |
| `Shift+Tab` | Dedent |
| `Cmd+/` | Toggle comment |
| `Cmd+D` | Select next occurrence |
| `Escape` | Exit editor focus → Tab returns to page navigation |
| `Cmd+Z` / `Cmd+Shift+Z` | Undo / Redo |

### Step Navigation

| Shortcut | Action |
|----------|--------|
| `Alt+→` | Next step |
| `Alt+←` | Previous step |
| `Alt+H` | Toggle hint drawer |
| `Alt+T` | Toggle tutor panel |

### Implementation

```svelte
<!-- KeyboardShortcuts.svelte — mounted in root layout -->
<svelte:window on:keydown={handleGlobalShortcut} />
```

Shortcuts displayed in a help overlay (triggered by `?`), not hidden. Listed with platform-appropriate modifier (Cmd on Mac, Ctrl on Windows/Linux).

---

## 24. Auto-Save & Session Recovery

### Code Editor Auto-Save

Every keystroke in the code editor is debounced (500ms) and persisted to `localStorage`:

```typescript
// Key format: ra:code:{pathSlug}:{stepId}
// Value: { code: string, language: string, timestamp: number }
localStorage.setItem(
  `ra:code:${pathSlug}:${stepId}`,
  JSON.stringify({ code, language, timestamp: Date.now() })
);
```

On step load: check localStorage first. If saved code exists and is newer than last submission, restore it. Show subtle "Restored from draft" indicator.

### Session Recovery (Continue Where You Left Off)

On login / return visit:

```typescript
// Check user's last active step
const lastActive = await getLastActiveStep(userId);
// If exists and not completed:
// Show "Continue where you left off?" banner on landing/explore page
// Banner: "{Path Title} — Step {n}/{total}" + [Resume] button
```

### Data Model

```sql
ALTER TABLE user_progress ADD COLUMN last_active_at TEXT;
-- Updated every time user interacts with a step
```

### Cleanup

- Auto-saved code: purged after 30 days of inactivity per step
- Completed step drafts: cleared immediately on successful submission

---

## 25. Performance Budget

### Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | < 2.0s | SSR landing page, preload fonts, no render-blocking JS |
| **FID** (First Input Delay) | < 100ms | Minimal main-thread JS, WASM loaded async |
| **CLS** (Cumulative Layout Shift) | < 0.05 | Font `size-adjust`, fixed-height skeletons, reserved space for dynamic content |
| **TTFB** (Time to First Byte) | < 400ms | SvelteKit SSR + edge cache headers |

### Bundle Budget

| Asset | Max Size (gzipped) | Notes |
|-------|-------------------:|-------|
| Initial JS (SvelteKit) | 80 KB | Framework + router + first page |
| CSS (Tailwind purged) | 15 KB | Only used utilities shipped |
| Fonts (3 families, variable) | 120 KB | Subset to Latin + Latin Extended, woff2 only |
| CodeMirror (lazy) | 45 KB | Loaded on first code challenge |
| Pyodide (lazy) | 11 MB | Only loaded on first Python challenge, cached by SW |
| TypeScript compiler (lazy) | 3 MB | Loaded on first TS challenge |

### Font Loading Strategy

```css
/* Prevent FOIT (Flash of Invisible Text) */
@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Variable.woff2') format('woff2');
  font-display: swap;
  /* size-adjust to match fallback metrics */
}
```

- Fonts preloaded via `<link rel="preload">` in `app.html`
- `font-display: swap` ensures text visible immediately with system fallback
- `size-adjust` on fallback font to minimize CLS when custom font loads

### Lazy Loading Map

| Resource | Trigger | Preload? |
|----------|---------|----------|
| CodeMirror | User navigates to a challenge step | Prefetch on path overview page |
| Pyodide WASM | First Python challenge opened | No (too large) |
| KaTeX | First math content encountered | Prefetch if path has math steps |
| Achievement images | Viewport intersection | Lazy via `loading="lazy"` |

---

## 26. API Security & Rate Limiting

### Rate Limiting

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| `POST /execute` | 20 requests | per minute per user | Code execution is expensive |
| `POST /auth/*` | 5 requests | per minute per IP | Brute force prevention |
| `POST /progress/*` | 60 requests | per minute per user | Normal usage ceiling |
| `GET /*` | 200 requests | per minute per user | General read limit |
| Unauthenticated | 10 requests | per minute per IP | Landing page demo |

Implementation: Tower rate-limiting middleware in Rust API + per-route configuration.

### CORS Configuration

```rust
let cors = CorsLayer::new()
    .allow_origin([
        "https://reverse.academy".parse().unwrap(),
        "http://localhost:5173".parse().unwrap(),  // Dev
    ])
    .allow_methods([Method::GET, Method::POST, Method::PATCH])
    .allow_headers([CONTENT_TYPE, AUTHORIZATION])
    .allow_credentials(true);
```

### Request Constraints

| Constraint | Value |
|------------|-------|
| Max request body | 64 KB (general), 256 KB (code execution) |
| Code execution: max code length | 50,000 characters |
| Code execution: max stdin | 10,000 characters |
| Auth: password min length | 8 characters |
| Auth: username length | 3–30 characters, alphanumeric + underscore |

### Security Headers (Nginx)

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline';" always;
```

`wasm-unsafe-eval` is required for Pyodide and sql.js WASM execution.

---

## 27. Path Completion Experience

What happens when a learner finishes a path is as important as what happens during it.

### Completion Screen

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Path Complete                           (Fraunces, xl) │
│  "TypeScript Error Detective"                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  SUMMARY                                        │    │
│  │  8/8 steps completed                            │    │
│  │  +150 XP earned (1.5x no-hints bonus)           │    │
│  │  2 new concepts unlocked                         │    │
│  │  Total time: 22 minutes                          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Concepts You Discovered:                               │
│  [Type Annotations] [Union Types] [Generics] [Guards]   │
│                                                         │
│  [Share Achievement]  [What's Next?]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Shareable Completion Card

A generated OG-image-style card (server-side rendered PNG or SVG-to-canvas):
- Path title + completion date
- XP earned + level
- Reverse Academy branding
- 1200x630 for social sharing

### "What's Next?" Recommendation

Based on:
1. Concepts unlocked in current path that are prerequisites for other paths
2. Same domain, next difficulty level
3. Same mode preference (if user did fix-broken, suggest another fix-broken)

```typescript
function recommendNext(completedPath: LearningPath, allPaths: LearningPath[]): LearningPath[] {
  return allPaths
    .filter(p => p.id !== completedPath.id && !isCompleted(p))
    .sort((a, b) => {
      const aOverlap = conceptOverlap(completedPath, a);
      const bOverlap = conceptOverlap(completedPath, b);
      return bOverlap - aOverlap;  // More concept overlap = better recommendation
    })
    .slice(0, 3);
}
```

---

## 28. Settings Page

### Route: `/[lang]/profile/settings`

| Section | Fields |
|---------|--------|
| **Account** | Email (read-only if OAuth), username |
| **Password** | Change password (current + new), or "Connected via GitHub" badge |
| **Preferences** | Locale (EN/FR toggle), theme (dark/light/system), editor font size (12-20px slider), editor tab size (2/4 toggle) |
| **Data** | Export my data (JSON download), Delete account (with confirmation modal + 7-day grace period) |

### Settings Store

```typescript
// stores/settings.ts
interface UserSettings {
  locale: 'en' | 'fr';
  theme: 'dark' | 'light' | 'system';
  editorFontSize: number;    // 12–20
  editorTabSize: 2 | 4;
}
```

Settings persisted in `user_preferences` table (see Section 17) + localStorage for instant access.

---

## 29. Monitoring & Observability

### Error Tracking

| Tool | Purpose | MVP? |
|------|---------|------|
| **Sentry** (free tier) | Frontend + backend error capture with stack traces, source maps | Yes |
| Log files | Structured JSON logs from Rust API (`tracing` crate) | Yes |
| Uptime check | Simple health endpoint ping (UptimeRobot free tier) | Yes |

### Health Endpoints

```
GET /api/v1/health          → { "status": "ok", "version": "0.1.0", "db": "connected" }
GET /api/v1/health/piston   → { "status": "ok", "languages": ["rust@1.75"] }
```

### Logging (Rust API)

```rust
// Using `tracing` + `tracing-subscriber`
// Structured JSON logs with request_id, user_id, duration
tracing::info!(
    user_id = %user_id,
    path_id = %path_id,
    step_id = %step_id,
    "step_completed"
);
```

### Basic Analytics (Privacy-Respecting)

No third-party trackers. Self-hosted event table:

```sql
CREATE TABLE analytics_events (
    id         TEXT PRIMARY KEY,
    user_id    TEXT REFERENCES users(id),   -- nullable for anonymous
    event_type TEXT NOT NULL,               -- 'path_started', 'step_completed', 'hint_used', etc.
    metadata   TEXT,                        -- JSON: { pathId, stepId, language, ... }
    created_at TEXT DEFAULT (datetime('now'))
);
```

Key metrics to track:
- Funnel: landing → register → first challenge → path complete
- Drop-off: which steps do people abandon?
- Hint usage: which challenges are too hard?
- Execution errors: which code patterns cause the most failures?

---

## 30. Content Validation

### Zod Schema for Learning Paths

Every JSON content file is validated at build time. Malformed content never ships.

```typescript
// schemas/content.ts
import { z } from 'zod';

const StepContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('challenge'),
    scenario: z.string().min(10),
    code: z.string().min(1),
    language: z.enum(['javascript', 'typescript', 'python', 'rust', 'sql']),
    expectedFix: z.string().optional(),
    validationRegex: z.string().optional(),
    errorMessage: z.string().optional(),
    hint: z.string().optional(),
  }),
  z.object({
    type: z.literal('reveal'),
    theory: z.string().min(20),
    keyInsight: z.string(),
  }),
  z.object({
    type: z.literal('sandbox'),
    initialCode: z.string(),
    language: z.enum(['javascript', 'typescript', 'python', 'rust', 'sql']),
    prompt: z.string(),
  }),
  z.object({
    type: z.literal('theory'),
    content: z.string().min(20),
    expandableSections: z.array(z.object({
      title: z.string(),
      content: z.string(),
    })).optional(),
  }),
]);

const StepSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  title: z.string().min(3),
  type: z.enum(['challenge', 'reveal', 'sandbox', 'theory']),
  content: StepContentSchema,
  xpReward: z.number().int().min(1).max(100),
});

export const LearningPathSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(5),
  domain: z.string(),
  mode: z.enum(['problem-first', 'fix-broken', 'goal-tree']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string().min(20),
  xpReward: z.number().int().min(10),
  estimatedMinutes: z.number().int().min(5),
  steps: z.array(StepSchema).min(3),
});
```

### Build-Time Validation Script

```typescript
// scripts/validate-content.ts
// Run: npx tsx scripts/validate-content.ts
// Also runs as part of CI and pre-build hook

import { LearningPathSchema } from '../src/schemas/content';
import { readdirSync, readFileSync } from 'fs';

const locales = ['en', 'fr'];
let errors = 0;

for (const locale of locales) {
  const dir = `src/content/${locale}/paths`;
  for (const file of readdirSync(dir)) {
    const content = JSON.parse(readFileSync(`${dir}/${file}`, 'utf-8'));
    const result = LearningPathSchema.safeParse(content);
    if (!result.success) {
      console.error(`INVALID: ${locale}/${file}`);
      console.error(result.error.format());
      errors++;
    }
  }
}

if (errors > 0) process.exit(1);
console.log('All content valid.');
```

### Cross-Locale Consistency Check

```typescript
// Verify EN and FR paths have matching step counts and IDs
for (const enFile of enFiles) {
  const frFile = frPaths.get(enFile.slug);
  if (!frFile) { console.error(`Missing FR translation: ${enFile.slug}`); errors++; }
  if (frFile && enFile.steps.length !== frFile.steps.length) {
    console.error(`Step count mismatch: ${enFile.slug} (EN: ${enFile.steps.length}, FR: ${frFile.steps.length})`);
    errors++;
  }
}
```

---

## 31. Testing Strategy

### Test Pyramid

```
         ╱╲
        ╱  ╲         E2E (Playwright)
       ╱    ╲        5-10 critical user flows
      ╱──────╲
     ╱        ╲      Integration
    ╱          ╲     API endpoint tests, content loading
   ╱────────────╲
  ╱              ╲   Unit
 ╱                ╲  Tutor rules, XP calc, validators, execution router
╱──────────────────╲
```

### Unit Tests (Vitest — Frontend, cargo test — Backend)

| Area | Tests | Priority |
|------|-------|----------|
| XP calculator | Level formula, bonus multipliers, edge cases | P0 |
| Step validator | Regex matching, exact output, edge cases | P0 |
| Tutor rules engine | Each rule fires at correct conditions | P0 |
| Execution router | Correct tier selection per language | P0 |
| Content loader | Locale resolution, fallback behavior | P1 |
| Auth (Rust) | Token verification, session expiry | P0 |
| Rate limiter | Request counting, window reset | P1 |

### Component Tests (Svelte Testing Library + Vitest)

| Component | Tests |
|-----------|-------|
| `CodeSandbox` | Renders, accepts input, fires execute event, displays results |
| `TheoryRevealer` | Hidden by default, expands on trigger, renders markdown |
| `XPBar` | Displays correct percentage, animates on change |
| `LanguageSwitcher` | Toggles locale, updates URL |
| `OnboardingFlow` | Step progression, skip behavior, data collection |

### E2E Tests (Playwright)

| Flow | Steps |
|------|-------|
| **Guest demo** | Land → try challenge → see result → prompted to register |
| **Registration** | Register → onboarding → first challenge → complete step |
| **Full learning path** | Login → start path → complete 3 steps → see progress |
| **Code execution** | Open challenge → write code → run → see output |
| **i18n** | Switch EN→FR → verify translated content → URL changes |
| **Auth flows** | Login → logout → forgot password → reset |

### CI Pipeline

```yaml
# .github/workflows/ci.yml (or equivalent)
steps:
  - Lint (eslint + rusftfmt)
  - Type check (tsc --noEmit + cargo check)
  - Content validation (validate-content.ts)
  - Unit tests (vitest run + cargo test)
  - Build (SvelteKit + Rust)
  - E2E tests (Playwright against built app)
```

---

## 32. Key Design Decisions Summary

| Decision | Choice | Alternative Considered |
|----------|--------|----------------------|
| Frontend | SvelteKit | Next.js (rejected per user preference) |
| Backend | Rust (Axum) | Go, Python, Java |
| Database | Turso (libSQL) | PostgreSQL, SQLite, MongoDB |
| Auth | Lucia Auth (SvelteKit-native) + GitHub OAuth | Custom JWT, Supabase Auth |
| AI Tutor | Rule-based state machine | LLM-powered (deferred to v2) |
| Styling | Tailwind CSS + Melt UI (headless) | shadcn-svelte, Bits UI |
| Design | Dark editorial, Fraunces + Satoshi + JetBrains Mono | Generic SaaS, light-first |
| Layout | Adaptive: editorial column + full-width code | Fixed sidebar, single layout |
| Code Execution | Hybrid: browser WASM + Piston backend | All-backend, all-browser, third-party API |
| i18n | Paraglide.js (Inlang) | i18next, sveltekit-i18n |
| Locales | English + French | Arabic/RTL (deferred to v2) |
| Content i18n | Localized JSON per locale folder | Single JSON with embedded translations |
| Content validation | Zod schemas + build-time script | Runtime-only validation |
| Content format | Static JSON files | CMS, MDsveX |
| Testing | Vitest + Playwright + axe-core | Jest, Cypress |
| Error tracking | Sentry (free tier) | Self-hosted, none |
| Analytics | Self-hosted event table (privacy-first) | Google Analytics, Plausible |
| Email | Resend (free tier) or SMTP | SendGrid, Mailgun |
| Gamification | XP + levels + badges | Streaks + leaderboard (v2) |
| Deployment | Docker self-hosted | Vercel + Fly.io |
| Onboarding | 4-screen wizard + guest demo | No onboarding, tutorial video |
| Interactivity | CodeMirror + KaTeX + progressive disclosure | Simple text only |

---

## 33. Future Enhancements (Post-MVP)

- **v1.1**: Google OAuth, command palette (Cmd+K), SQL challenge support
- **v2**: AI-powered tutor (Claude/OpenAI API) for adaptive question generation
- **v2**: Arabic locale with full RTL layout support
- **v2**: Community-contributed learning paths (with translation workflow)
- **v2**: Streaks & daily goals ("learn 15 min/day")
- **v2**: Leaderboard (weekly, per-domain)
- **v2**: Translation contribution system (community can submit translations)
- **v2**: Spaced repetition review for completed concepts
- **v2**: Path branching (choose your own investigation direction)
- **v3**: Multiplayer: debug together in real-time (collaborative code editor)
- **v3**: STEM domain with interactive physics/math visualizations (Three.js)
- **v3**: Mobile app (Capacitor or React Native)
- **v3**: Path recommendation engine based on learning patterns
- **v3**: Auto-translation via LLM for new content (human-reviewed)
- **v3**: Instructor mode: create/publish custom learning paths

---

*Ready to build? Confirm this plan and we'll start scaffolding.*
