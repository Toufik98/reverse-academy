# Learning Path Template — Reverse Academy

> **Instructions for AI authors**: Fill in every section below. Do NOT change heading names or the `key: value` syntax in metadata blocks — the parser depends on them. Code blocks must specify a language. You can add as many steps as needed by duplicating the `## Step N` pattern.

---

## Path Metadata

```yaml
id: my-path-slug
slug: my-path-slug
title: My Learning Path Title
domain: programming
mode: fix-broken
difficulty: beginner
description: A concise 1-2 sentence description of what the learner will achieve. Must be at least 10 characters.
estimatedMinutes: 30
xpReward: 200
```

**Allowed values:**

| Field | Options |
|---|---|
| `domain` | `programming`, `web-dev`, `systems`, `stem`, `languages` |
| `mode` | `fix-broken`, `problem-first`, `goal-tree` |
| `difficulty` | `beginner`, `intermediate`, `advanced` |

---

## Step 1

### Metadata

```yaml
title: The First Broken Thing
type: challenge
xpReward: 10
```

### Scenario

> The CI pipeline explodes with: `TypeError: Cannot read property 'map' of undefined`. A teammate merged this data fetcher without testing. The API returns an object, but the code assumes an array.

### Code

```typescript
async function loadUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();
  return data.map(user => user.name);
}
```

### Hint

> Look at what the API actually returns — is it always an array? What if it wraps the array in a `{ users: [...] }` object?

### Expected Fix

```
data.users.map
```

### Validation Regex

```
data\.users\.map
```

### Error Message

```
TypeError: Cannot read property 'map' of undefined
```

---

## Step 2

### Metadata

```yaml
title: Why Did That Fail?
type: reveal
xpReward: 5
```

### Theory

## API Response Shapes — Never Assume the Structure

When you call `fetch()` and parse JSON, you get `unknown` at runtime. The shape could be:

- A raw array: `[{id: 1}, {id: 2}]`
- A wrapped object: `{ users: [...], total: 100 }`
- An error object: `{ error: "Not found" }`

Always validate the shape before operating on it:

```typescript
const data = await response.json();

// UNSAFE — assumes array:
data.map(u => u.name);

// SAFE — check first:
if (Array.isArray(data)) {
  data.map(u => u.name);
} else if (data.users) {
  data.users.map(u => u.name);
}
```

### Key Insight

> Never assume an API response shape. Always validate the structure before accessing nested properties. TypeScript types describe intent — runtime checks enforce reality.

### Formula

$$
\text{Safety} = \text{Type annotation} + \text{Runtime guard}
$$

---

## Step 3

### Metadata

```yaml
title: Experiment in the Sandbox
type: sandbox
xpReward: 10
```

### Prompt

> Rewrite the `loadUsers` function to handle both response shapes — a raw array and a `{ users: [] }` wrapper. Add a TypeScript type guard to detect which shape you received.

### Initial Code

```typescript
interface ApiResponse {
  users: User[];
  total: number;
}

type User = { id: number; name: string };

async function loadUsers(): Promise<string[]> {
  const response = await fetch('/api/users');
  const data = await response.json();
  // TODO: handle both shapes
  return [];
}
```

---

## Step 4

### Metadata

```yaml
title: Understanding Response Types
type: theory
xpReward: 5
```

### Content

## Discriminated Unions for API Responses

In production APIs, you often need to handle multiple response shapes. TypeScript's discriminated unions let you model this cleanly:

```typescript
type ApiSuccess = { status: 'ok'; data: User[] };
type ApiError = { status: 'error'; message: string };
type ApiResponse = ApiSuccess | ApiError;

function handleResponse(res: ApiResponse) {
  if (res.status === 'ok') {
    // TypeScript knows res.data exists here
    return res.data;
  } else {
    // TypeScript knows res.message exists here
    throw new Error(res.message);
  }
}
```

### Expandable: Type Narrowing Deep Dive

TypeScript narrows types through control flow analysis. Each `if`, `switch`, or type guard eliminates possibilities:

```typescript
function process(input: string | number | null) {
  if (input === null) return;       // eliminates null
  if (typeof input === 'string') {
    input.toUpperCase();            // TypeScript knows: string
  } else {
    input.toFixed(2);               // TypeScript knows: number
  }
}
```

### Expandable: Zod for Runtime Validation

For critical paths, use Zod to bridge compile-time types and runtime validation:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const data = await response.json();
const user = UserSchema.parse(data); // throws if invalid
```

---

<!-- Repeat the ## Step N pattern for additional steps -->

# Rules Reminder

1. **Step types**: `challenge`, `reveal`, `sandbox`, `theory`
2. **Step IDs** are auto-generated as `step-1`, `step-2`, etc. from the order
3. **Challenge** steps MUST have: Scenario, Code, Hint (optional: Expected Fix, Validation Regex, Error Message)
4. **Reveal** steps MUST have: Theory, Key Insight (optional: Formula, Expandable sections)
5. **Sandbox** steps MUST have: Prompt, Initial Code
6. **Theory** steps MUST have: Content (optional: Expandable sections)
7. **Code blocks** in Scenario/Theory/Content use Markdown fenced blocks with language tags
8. **All text** should be in the target language (EN or FR). Code stays English.
9. **Minimum lengths**: description ≥ 10 chars, scenario ≥ 10 chars, theory ≥ 10 chars, key insight ≥ 10 chars
10. Steps alternate: challenge → reveal → challenge → reveal (recommended pattern, not enforced)
