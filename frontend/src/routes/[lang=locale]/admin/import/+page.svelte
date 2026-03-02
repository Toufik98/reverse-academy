<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createAdminT } from '$lib/i18n/admin';
	import { parseMarkdownPath } from '$lib/engine/markdown-parser';
	import { learningPathSchema } from '$schemas/content';
	import type { SupportedLocale } from '$types/i18n';

	export let data: { adminToken: string };

	$: lang = $page.params.lang;
	$: t = createAdminT(lang as SupportedLocale);

	let activeTab: 'json' | 'markdown' = 'json';
	let jsonInput = '';
	let mdInput = '';
	let importing = false;
	let results: Array<{ slug: string; ok: boolean; message: string }> = [];
	let dragActive = false;

	// ─── Validation State ────────────────────────────────────

	type ValidationState = {
		valid: boolean;
		data: any[] | null;
		errors: string[];
		warnings: string[];
	};

	let validationState: ValidationState = { valid: false, data: null, errors: [], warnings: [] };

	// ─── JSON Validation ─────────────────────────────────────

	function validateJsonInput(text: string): ValidationState {
		if (!text.trim()) return { valid: false, data: null, errors: [], warnings: [] };

		// Step 1: Parse JSON syntax
		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch (e: any) {
			return { valid: false, data: null, errors: [`JSON syntax error: ${e.message}`], warnings: [] };
		}

		// Step 2: Normalize to array
		const paths = Array.isArray(parsed) ? parsed : [parsed];

		// Step 3: Validate each path with Zod
		return validatePaths(paths);
	}

	// ─── Markdown Validation ─────────────────────────────────

	function validateMdInput(text: string): ValidationState {
		if (!text.trim()) return { valid: false, data: null, errors: [], warnings: [] };

		const result = parseMarkdownPath(text);

		if (!result.ok || !result.data) {
			return {
				valid: false,
				data: null,
				errors: result.errors,
				warnings: result.warnings
			};
		}

		// Now validate the parsed data with Zod
		const zodResult = validatePaths([result.data]);
		return {
			...zodResult,
			warnings: [...result.warnings, ...zodResult.warnings]
		};
	}

	// ─── Shared Zod Validation ───────────────────────────────

	function validatePaths(paths: any[]): ValidationState {
		const errors: string[] = [];
		const warnings: string[] = [];
		const validPaths: any[] = [];

		for (let i = 0; i < paths.length; i++) {
			const p = paths[i];
			const label = p?.title || p?.slug || `Path ${i + 1}`;

			// Basic structure check
			if (!p || typeof p !== 'object') {
				errors.push(`${label}: Not a valid object`);
				continue;
			}

			// Required fields check
			const requiredFields = ['id', 'slug', 'title', 'domain', 'mode', 'difficulty', 'description', 'steps'];
			const missing = requiredFields.filter(f => !p[f]);
			if (missing.length > 0) {
				errors.push(`${label}: Missing required fields: ${missing.join(', ')}`);
				continue;
			}

			// Slug format
			if (!/^[a-z0-9-]+$/.test(p.slug)) {
				errors.push(`${label}: Slug must be lowercase alphanumeric with hyphens (got "${p.slug}")`);
			}

			// Domain validation
			const validDomains = ['programming', 'web-dev', 'systems', 'stem', 'languages'];
			if (!validDomains.includes(p.domain)) {
				errors.push(`${label}: Invalid domain "${p.domain}". Must be: ${validDomains.join(', ')}`);
			}

			// Mode validation
			const validModes = ['fix-broken', 'problem-first', 'goal-tree'];
			if (!validModes.includes(p.mode)) {
				errors.push(`${label}: Invalid mode "${p.mode}". Must be: ${validModes.join(', ')}`);
			}

			// Difficulty validation
			const validDifficulties = ['beginner', 'intermediate', 'advanced'];
			if (!validDifficulties.includes(p.difficulty)) {
				errors.push(`${label}: Invalid difficulty "${p.difficulty}". Must be: ${validDifficulties.join(', ')}`);
			}

			// Description length
			if (typeof p.description === 'string' && p.description.length < 10) {
				errors.push(`${label}: Description too short (min 10 characters)`);
			}

			// Steps validation
			if (!Array.isArray(p.steps) || p.steps.length === 0) {
				errors.push(`${label}: Must have at least one step`);
				continue;
			}

			// Validate each step
			const stepIds = new Set<string>();
			const validStepTypes = ['challenge', 'reveal', 'sandbox', 'theory'];

			for (let j = 0; j < p.steps.length; j++) {
				const step = p.steps[j];
				const stepLabel = `${label} → Step ${j + 1}`;

				if (!step.id) errors.push(`${stepLabel}: Missing id`);
				if (!step.title) errors.push(`${stepLabel}: Missing title`);
				if (!step.type || !validStepTypes.includes(step.type)) {
					errors.push(`${stepLabel}: Invalid type "${step.type}". Must be: ${validStepTypes.join(', ')}`);
				}

				if (step.id && stepIds.has(step.id)) {
					errors.push(`${stepLabel}: Duplicate step ID "${step.id}"`);
				}
				stepIds.add(step.id);

				// Step order check
				if (step.order !== undefined && step.order !== j + 1) {
					warnings.push(`${stepLabel}: Order is ${step.order}, expected ${j + 1}`);
				}

				// Content validation by type
				if (step.content) {
					const c = step.content;
					switch (step.type) {
						case 'challenge':
							if (!c.scenario || (typeof c.scenario === 'string' && c.scenario.length < 10))
								errors.push(`${stepLabel}: Challenge scenario too short (min 10 chars)`);
							if (!c.code)
								errors.push(`${stepLabel}: Challenge missing code`);
							if (!c.language)
								warnings.push(`${stepLabel}: Challenge missing language, defaulting to typescript`);
							break;
						case 'reveal':
							if (!c.theory || (typeof c.theory === 'string' && c.theory.length < 10))
								errors.push(`${stepLabel}: Reveal theory too short (min 10 chars)`);
							if (!c.keyInsight || (typeof c.keyInsight === 'string' && c.keyInsight.length < 10))
								errors.push(`${stepLabel}: Reveal keyInsight too short (min 10 chars)`);
							break;
						case 'sandbox':
							if (!c.prompt || (typeof c.prompt === 'string' && c.prompt.length < 1))
								errors.push(`${stepLabel}: Sandbox missing prompt`);
							if (c.initialCode === undefined)
								errors.push(`${stepLabel}: Sandbox missing initialCode`);
							break;
						case 'theory':
							if (!c.content || (typeof c.content === 'string' && c.content.length < 10))
								errors.push(`${stepLabel}: Theory content too short (min 10 chars)`);
							break;
					}
				} else {
					errors.push(`${stepLabel}: Missing content object`);
				}
			}

			// Zod deep validation (catch anything we missed)
			try {
				learningPathSchema.parse(p);
			} catch (zodError: any) {
				if (zodError.issues) {
					for (const issue of zodError.issues) {
						const path = issue.path?.join('.') || '';
						const msg = `${label}: ${path ? path + ' — ' : ''}${issue.message}`;
						// Only add if not a duplicate of our manual checks
						if (!errors.some(e => e.includes(issue.message))) {
							errors.push(msg);
						}
					}
				}
			}

			if (!errors.some(e => e.startsWith(label))) {
				validPaths.push(p);
			} else {
				// Even with errors, include for preview if it has basic structure
				validPaths.push(p);
			}
		}

		return {
			valid: errors.length === 0,
			data: validPaths.length > 0 ? validPaths : null,
			errors,
			warnings
		};
	}

	// ─── Reactivity ──────────────────────────────────────────

	$: {
		if (activeTab === 'json' && jsonInput) {
			validationState = validateJsonInput(jsonInput);
		} else if (activeTab === 'markdown' && mdInput) {
			validationState = validateMdInput(mdInput);
		} else {
			validationState = { valid: false, data: null, errors: [], warnings: [] };
		}
	}

	// ─── File Handling ───────────────────────────────────────

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave() {
		dragActive = false;
	}

	async function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
		const files = e.dataTransfer?.files;
		if (!files?.length) return;
		await processFile(files[0]);
	}

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;
		await processFile(input.files[0]);
	}

	async function processFile(file: File) {
		const text = await file.text();
		const ext = file.name.split('.').pop()?.toLowerCase();

		if (ext === 'md' || ext === 'markdown') {
			activeTab = 'markdown';
			mdInput = text;
		} else {
			activeTab = 'json';
			jsonInput = text;
		}
	}

	// ─── Import ──────────────────────────────────────────────

	async function handleImport() {
		if (!validationState.valid || !validationState.data) return;

		importing = true;
		results = [];

		for (const p of validationState.data) {
			try {
				const res = await fetch(`/api/v1/admin/paths/import`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${data.adminToken}`
					},
					body: JSON.stringify(p)
				});

				if (res.ok) {
					results = [...results, { slug: p.slug, ok: true, message: 'Imported successfully' }];
				} else {
					const msg = await res.text();
					results = [...results, { slug: p.slug, ok: false, message: msg || `HTTP ${res.status}` }];
				}
			} catch (err: any) {
				results = [...results, { slug: p.slug, ok: false, message: err.message || 'Network error' }];
			}
		}

		importing = false;
	}

	// ─── Examples & Downloads ────────────────────────────────

	function loadJsonExample() {
		jsonInput = JSON.stringify({
			id: 'example-path',
			slug: 'example-path',
			title: 'Example Learning Path',
			domain: 'programming',
			mode: 'fix-broken',
			difficulty: 'beginner',
			description: 'An example path to demonstrate the import format. Replace this with real content.',
			estimatedMinutes: 30,
			xpReward: 100,
			steps: [
				{
					id: 'step-1',
					order: 1,
					title: 'The First Broken Thing',
					type: 'challenge',
					content: {
						type: 'challenge',
						scenario: 'The CI pipeline reports an error. A function expects a string but receives a number.',
						code: 'function greet(name: string) {\n  return `Hello, ${name}!`;\n}\n\ngreet(42);',
						language: 'typescript',
						expectedFix: 'greet("Alice")',
						validationRegex: 'greet\\s*\\(\\s*["\']',
						hint: 'Check the type of argument being passed to greet().'
					},
					xpReward: 10
				},
				{
					id: 'step-2',
					order: 2,
					title: 'Why Did That Fail?',
					type: 'reveal',
					content: {
						type: 'reveal',
						theory: '## Type Annotations\n\nWhen a parameter has a type annotation like `name: string`, the compiler checks every call site. Passing a number where a string is expected is a compile-time error in TypeScript.\n\n```typescript\nfunction greet(name: string) { ... }\ngreet("Alice"); // OK\ngreet(42);      // ERROR\n```',
						keyInsight: 'Type annotations are compile-time contracts that prevent runtime bugs.',
						formula: null
					},
					xpReward: 5
				}
			]
		}, null, 2);
	}

	function loadMdTemplate() {
		mdInput = `## Path Metadata

\`\`\`yaml
id: my-new-path
slug: my-new-path
title: My New Learning Path
domain: programming
mode: fix-broken
difficulty: beginner
description: A brief description of this learning path (at least 10 characters).
estimatedMinutes: 30
xpReward: 200
\`\`\`

---

## Step 1

### Metadata

\`\`\`yaml
title: The First Challenge
type: challenge
xpReward: 10
\`\`\`

### Scenario

> Describe the real-world problem here. The CI pipeline fails with a specific error. What went wrong?

### Code

\`\`\`typescript
// Put the broken code here
function example() {
  return "fix me";
}
\`\`\`

### Hint

> Give a helpful hint without revealing the full answer.

### Expected Fix

\`\`\`
the expected fix string
\`\`\`

---

## Step 2

### Metadata

\`\`\`yaml
title: Why Did That Fail?
type: reveal
xpReward: 5
\`\`\`

### Theory

## The Concept Behind the Fix

Explain the underlying concept here with examples and code blocks.

\`\`\`typescript
// Good example code
\`\`\`

### Key Insight

> One clear sentence that captures the "aha moment" for this concept.
`;
	}

	function downloadMdTemplate() {
		const template = `# Learning Path Template — Reverse Academy

> Fill in every section below. Do NOT change heading names or the key: value syntax.

---

## Path Metadata

\`\`\`yaml
id: my-path-slug
slug: my-path-slug
title: My Learning Path Title
domain: programming
mode: fix-broken
difficulty: beginner
description: A 1-2 sentence description of what the learner will achieve (min 10 chars).
estimatedMinutes: 30
xpReward: 200
\`\`\`

**Allowed values:**
- domain: programming | web-dev | systems | stem | languages
- mode: fix-broken | problem-first | goal-tree
- difficulty: beginner | intermediate | advanced

---

## Step 1

### Metadata

\`\`\`yaml
title: The First Broken Thing
type: challenge
xpReward: 10
\`\`\`

### Scenario

> Describe the real-world problem. What error message appears? What broke?

### Code

\`\`\`typescript
// The broken code the learner must fix
function example() {
  return "fix me";
}
\`\`\`

### Hint

> A helpful hint without revealing the answer.

### Expected Fix

\`\`\`
the expected fix
\`\`\`

### Validation Regex

\`\`\`
expected\\.fix\\.regex
\`\`\`

### Error Message

\`\`\`
The error message shown to the learner
\`\`\`

---

## Step 2

### Metadata

\`\`\`yaml
title: Why Did That Fail?
type: reveal
xpReward: 5
\`\`\`

### Theory

## The Concept Title

Full markdown theory content with code blocks, lists, etc.

### Key Insight

> A single clear insight sentence (min 10 chars).

### Formula

$$
\\text{Optional LaTeX formula}
$$

---

## Step 3

### Metadata

\`\`\`yaml
title: Try It Yourself
type: sandbox
xpReward: 10
\`\`\`

### Prompt

> Describe what the learner should build or experiment with.

### Initial Code

\`\`\`typescript
// Starter code for the sandbox
\`\`\`

---

## Step 4

### Metadata

\`\`\`yaml
title: Deeper Understanding
type: theory
xpReward: 5
\`\`\`

### Content

## Full Theory Section

Rich markdown content explaining deeper concepts.

### Expandable: Advanced Topic

Hidden expandable content for curious learners.
`;
		const blob = new Blob([template], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'learning-path-template.md';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>{t('import.title')} — Reverse Academy Admin</title>
</svelte:head>

<div class="import-page">
	<header class="page-header">
		<div>
			<h1>{t('import.title')}</h1>
			<p>{t('import.subtitle')}</p>
		</div>
	</header>

	<!-- Drop zone -->
	<div
		class="drop-zone"
		class:active={dragActive}
		on:drop={handleFileDrop}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		role="region"
		aria-label="File drop zone"
	>
		<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
		</svg>
		<p>{t('import.dropZone')}</p>
		<label class="file-label">
			{t('import.orBrowse')}
			<input type="file" accept=".json,.md,.markdown" on:change={handleFileSelect} hidden />
		</label>
	</div>

	<!-- Tab switcher -->
	<div class="tab-bar" role="tablist">
		<button
			role="tab"
			class="tab"
			class:active={activeTab === 'json'}
			aria-selected={activeTab === 'json'}
			on:click={() => activeTab = 'json'}
		>
			{t('import.tabJson')}
		</button>
		<button
			role="tab"
			class="tab"
			class:active={activeTab === 'markdown'}
			aria-selected={activeTab === 'markdown'}
			on:click={() => activeTab = 'markdown'}
		>
			{t('import.tabMarkdown')}
		</button>
	</div>

	<!-- Editor section -->
	<div class="editor-section">
		{#if activeTab === 'json'}
			<div class="editor-header">
				<span class="editor-label">{t('import.jsonEditor')}</span>
				<button class="example-btn" on:click={loadJsonExample}>{t('import.loadExample')}</button>
			</div>
			<textarea
				class="code-editor"
				bind:value={jsonInput}
				placeholder={t('import.placeholder')}
				spellcheck="false"
				rows="20"
			></textarea>
		{:else}
			<div class="editor-header">
				<span class="editor-label">{t('import.mdEditor')}</span>
				<div class="editor-actions">
					<button class="example-btn" on:click={loadMdTemplate}>{t('import.loadMdTemplate')}</button>
					<button class="example-btn" on:click={downloadMdTemplate}>{t('import.downloadTemplate')}</button>
				</div>
			</div>
			<textarea
				class="code-editor"
				bind:value={mdInput}
				placeholder={t('import.mdPlaceholder')}
				spellcheck="false"
				rows="20"
			></textarea>
		{/if}
	</div>

	<!-- Validation results -->
	{#if validationState.errors.length > 0}
		<section class="validation-section errors" role="alert">
			<h3>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
				{t('import.schemaErrors')} ({validationState.errors.length})
			</h3>
			<ul>
				{#each validationState.errors as error}
					<li>{error}</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if validationState.warnings.length > 0}
		<section class="validation-section warnings">
			<h3>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
				{t('import.schemaWarnings')} ({validationState.warnings.length})
			</h3>
			<ul>
				{#each validationState.warnings as warning}
					<li>{warning}</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Valid badge -->
	{#if (activeTab === 'json' ? jsonInput : mdInput) && validationState.errors.length === 0 && validationState.data}
		<div class="valid-badge">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
			{t('import.valid')} — {validationState.data.length} {t('import.pathsDetected')}, {validationState.data.reduce((s, p) => s + (p.steps?.length || 0), 0)} {t('import.stepsDetected')}
			{#if activeTab === 'markdown'}
				<span class="converted-tag">{t('import.convertedFromMd')}</span>
			{/if}
		</div>
	{/if}

	<!-- Preview -->
	{#if validationState.data && validationState.data.length > 0}
		<section class="preview-section">
			<h2>{t('import.preview')}</h2>
			{#each validationState.data as p}
				<div class="preview-card">
					<div class="preview-header">
						<strong>{p.title}</strong>
						<div class="preview-meta">
							<span class="preview-badge">{p.domain}</span>
							<span class="preview-badge">{p.difficulty}</span>
							<span class="preview-badge">{p.mode}</span>
						</div>
					</div>
					<p class="preview-desc">{p.description}</p>
					<div class="preview-steps">
						{#each p.steps as step, i}
							<span class="step-pill" title={step.title}>
								{i + 1}. {step.title}
								<span class="step-pill-type">{step.type}</span>
							</span>
						{/each}
					</div>
					<div class="preview-stats">
						<span>{p.steps.length} {t('paths.steps')}</span>
						<span>{p.estimatedMinutes || '?'} {t('paths.min')}</span>
						<span>{p.xpReward || 0} XP</span>
					</div>
				</div>
			{/each}
		</section>
	{/if}

	<!-- Results -->
	{#if results.length > 0}
		<section class="results-section">
			<h2>{t('import.results')}</h2>
			{#each results as r}
				<div class="result-row" class:success={r.ok} class:fail={!r.ok}>
					<span class="result-icon">{r.ok ? '✓' : '✗'}</span>
					<span class="result-slug">{r.slug}</span>
					<span class="result-msg">{r.message}</span>
				</div>
			{/each}
		</section>
	{/if}

	<!-- Actions -->
	<div class="actions">
		<a href="/{lang}/admin/paths" class="btn btn-secondary">{t('steps.cancel')}</a>
		<button
			class="btn btn-primary"
			on:click={handleImport}
			disabled={importing || !validationState.valid}
		>
			{#if importing}
				{t('import.importing')}
			{:else}
				{t('import.importAll')} ({validationState.data?.length || 0})
			{/if}
		</button>
	</div>
</div>

<style>
	.import-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		color: var(--text-primary);
		margin: 0 0 var(--space-2);
	}

	.page-header p {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		margin: 0;
	}

	/* Drop zone */
	.drop-zone {
		border: 2px dashed var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-8) var(--space-6);
		text-align: center;
		color: var(--text-tertiary);
		transition: border-color 0.2s, background 0.2s;
		margin-bottom: var(--space-6);
	}

	.drop-zone.active {
		border-color: var(--accent);
		background: var(--accent-muted);
	}

	.drop-zone svg {
		margin-bottom: var(--space-3);
		opacity: 0.5;
	}

	.drop-zone p {
		margin: 0 0 var(--space-3);
		font-size: var(--text-sm);
	}

	.file-label {
		color: var(--accent);
		cursor: pointer;
		text-decoration: underline;
		font-size: var(--text-sm);
	}

	.file-label:hover {
		color: var(--accent-hover);
	}

	/* Tab bar */
	.tab-bar {
		display: flex;
		gap: var(--space-1);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.tab {
		padding: var(--space-2) var(--space-4);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
	}

	.tab:hover {
		color: var(--text-primary);
	}

	.tab.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	/* Editor */
	.editor-section {
		margin-bottom: var(--space-6);
	}

	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}

	.editor-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-weight: 500;
	}

	.editor-actions {
		display: flex;
		gap: var(--space-2);
	}

	.example-btn {
		background: none;
		border: 1px solid var(--surface-subtle);
		color: var(--text-secondary);
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-body);
		transition: color 0.15s, border-color 0.15s;
	}

	.example-btn:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	.code-editor {
		width: 100%;
		min-height: 400px;
		background: var(--code-bg);
		color: var(--text-primary);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.6;
		resize: vertical;
		tab-size: 2;
	}

	.code-editor::placeholder {
		color: var(--text-tertiary);
	}

	.code-editor:focus {
		outline: none;
		border-color: var(--accent);
	}

	/* Validation */
	.validation-section {
		border-radius: var(--radius-md);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.validation-section.errors {
		background: var(--error-muted);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
	}

	.validation-section.warnings {
		background: color-mix(in srgb, var(--warning) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--warning) 25%, transparent);
	}

	.validation-section h3 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 600;
		margin: 0 0 var(--space-3);
	}

	.validation-section.errors h3 {
		color: var(--error);
	}

	.validation-section.warnings h3 {
		color: var(--warning);
	}

	.validation-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.validation-section li {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		padding: var(--space-1) 0;
		border-bottom: 1px solid color-mix(in srgb, var(--surface-subtle) 50%, transparent);
		font-family: var(--font-mono);
	}

	.validation-section li:last-child {
		border-bottom: none;
	}

	/* Valid badge */
	.valid-badge {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background: var(--success-muted);
		border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
		border-radius: var(--radius-md);
		color: var(--success);
		font-size: var(--text-sm);
		font-weight: 500;
		margin-bottom: var(--space-4);
	}

	.converted-tag {
		background: var(--accent-muted);
		color: var(--accent);
		font-size: var(--text-xs);
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
		margin-left: var(--space-2);
	}

	/* Preview */
	.preview-section {
		margin-bottom: var(--space-6);
	}

	.preview-section h2 {
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		color: var(--text-primary);
		margin: 0 0 var(--space-4);
	}

	.preview-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.preview-header strong {
		color: var(--text-primary);
		font-size: var(--text-base);
	}

	.preview-meta {
		display: flex;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.preview-badge {
		background: var(--surface-2);
		color: var(--text-secondary);
		font-size: var(--text-xs);
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
	}

	.preview-desc {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		margin: 0 0 var(--space-3);
		line-height: 1.5;
	}

	.preview-steps {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.step-pill {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.step-pill-type {
		color: var(--accent);
		font-size: 10px;
		text-transform: uppercase;
		font-weight: 600;
	}

	.preview-stats {
		display: flex;
		gap: var(--space-4);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	/* Results */
	.results-section {
		margin-bottom: var(--space-6);
	}

	.results-section h2 {
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		color: var(--text-primary);
		margin: 0 0 var(--space-4);
	}

	.result-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		margin-bottom: var(--space-2);
		font-size: var(--text-sm);
	}

	.result-row.success {
		background: var(--success-muted);
	}

	.result-row.fail {
		background: var(--error-muted);
	}

	.result-icon {
		font-weight: 700;
		font-size: var(--text-base);
	}

	.result-row.success .result-icon {
		color: var(--success);
	}

	.result-row.fail .result-icon {
		color: var(--error);
	}

	.result-slug {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}

	.result-msg {
		color: var(--text-secondary);
		margin-left: auto;
	}

	/* Actions */
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		padding-top: var(--space-4);
		border-top: 1px solid var(--surface-subtle);
	}

	.btn {
		padding: var(--space-2) var(--space-5);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s, opacity 0.15s;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--text-inverse);
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--surface-subtle);
	}

	.btn-secondary:hover {
		border-color: var(--text-tertiary);
		color: var(--text-primary);
	}
</style>
