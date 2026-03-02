<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createAdminT } from '$lib/i18n/admin';
	import type { SupportedLocale } from '$types/i18n';

	export let data: { adminToken: string };

	$: lang = $page.params.lang as SupportedLocale;
	$: t = createAdminT(lang);

	let slug = '';
	let title = '';
	let domain = 'programming';
	let mode = 'fix-broken';
	let difficulty = 'beginner';
	let description = '';
	let estimatedMinutes = 30;
	let xpReward = 100;

	let saving = false;
	let error = '';

	// Auto-generate slug from title
	function slugify(str: string): string {
		return str
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	$: if (!manualSlug) {
		slug = slugify(title);
	}

	let manualSlug = false;

	function handleSlugInput() {
		manualSlug = true;
	}

	async function handleSubmit() {
		if (!slug || !title) return;
		saving = true;
		error = '';

		try {
			const res = await fetch('/api/v1/admin/paths', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.adminToken}`
				},
				body: JSON.stringify({
					slug,
					title,
					domain,
					mode,
					difficulty,
					description,
					estimatedMinutes,
					xpReward
				})
			});

			if (res.ok) {
				const result = await res.json();
				goto(`/${lang}/admin/paths/${result.id}`);
			} else {
				const text = await res.text();
				error = `Error (${res.status}): ${text}`;
			}
		} catch (e) {
			error = 'Failed to create path';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{t('newPath.title')} — Admin</title>
</svelte:head>

<div class="new-path-page">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="/{lang}/admin/paths">{t('nav.paths')}</a>
		<span class="sep">/</span>
		<span class="current">{t('dashboard.newPath')}</span>
	</nav>

	<section class="form-card">
		<h1>{t('newPath.title')}</h1>
		<p class="subtitle">{t('newPath.subtitle')}</p>

		<form on:submit|preventDefault={handleSubmit} class="path-form">
			<div class="form-grid">
				<div class="field span-2">
					<label for="title">{t('newPath.pathTitle')}</label>
					<input id="title" type="text" bind:value={title} required placeholder="TypeScript Error Detective" />
				</div>

				<div class="field">
					<label for="slug">{t('newPath.slug')}</label>
					<input id="slug" type="text" bind:value={slug} on:input={handleSlugInput} required placeholder="typescript-error-detective" />
					<span class="field-help">URL-friendly identifier. Auto-generated from title.</span>
				</div>

				<div class="field">
					<label for="domain">{t('table.domain')}</label>
					<select id="domain" bind:value={domain}>
						<option value="programming">{t('common.programming')}</option>
						<option value="web-dev">{t('common.webDev')}</option>
						<option value="systems">{t('common.systems')}</option>
						<option value="stem">{t('common.stem')}</option>
						<option value="languages">{t('common.languages')}</option>
					</select>
				</div>

				<div class="field">
					<label for="mode">{t('editor.mode')}</label>
					<select id="mode" bind:value={mode}>
						<option value="fix-broken">{t('common.fixBroken')}</option>
						<option value="problem-first">{t('common.problemFirst')}</option>
						<option value="reverse-engineer">{t('common.reverseEngineer')}</option>
						<option value="goal-tree">{t('common.goalTree')}</option>
					</select>
				</div>

				<div class="field">
					<label for="difficulty">{t('table.difficulty')}</label>
					<select id="difficulty" bind:value={difficulty}>
						<option value="beginner">{t('common.beginner')}</option>
						<option value="intermediate">{t('common.intermediate')}</option>
						<option value="advanced">{t('common.advanced')}</option>
					</select>
				</div>

				<div class="field">
					<label for="minutes">{t('editor.estimatedMinutes')}</label>
					<input id="minutes" type="number" bind:value={estimatedMinutes} min="1" />
				</div>

				<div class="field">
					<label for="xp">{t('editor.xpReward')}</label>
					<input id="xp" type="number" bind:value={xpReward} min="0" />
				</div>

				<div class="field span-full">
					<label for="desc">{t('editor.description')}</label>
					<textarea id="desc" bind:value={description} rows="4" placeholder="A compelling description of what the learner will accomplish..."></textarea>
				</div>
			</div>

			{#if error}
				<div class="error-msg" role="alert">{error}</div>
			{/if}

			<div class="form-footer">
				<a href="/{lang}/admin/paths" class="btn btn-secondary">{t('steps.cancel')}</a>
				<button type="submit" class="btn btn-primary" disabled={saving || !title || !slug}>
					{saving ? t('newPath.creating') : t('newPath.create')}
				</button>
			</div>
		</form>
	</section>
</div>

<style>
	.new-path-page {
		padding: var(--space-8);
		max-width: 800px;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		font-family: var(--font-body);
		font-size: var(--text-sm);
	}

	.breadcrumb a {
		color: var(--text-tertiary);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--accent);
	}

	.sep { color: var(--text-tertiary); }
	.current { color: var(--text-primary); font-weight: 500; }

	.form-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
	}

	.form-card h1 {
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-2);
	}

	.subtitle {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0 0 var(--space-6);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	.span-2 { grid-column: span 2; }
	.span-full { grid-column: 1 / -1; }

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field label {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.field input,
	.field select,
	.field textarea {
		padding: var(--space-2) var(--space-3);
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
		transition: border-color 0.15s;
	}

	.field input:focus,
	.field select:focus,
	.field textarea:focus {
		border-color: var(--accent);
	}

	.field textarea {
		resize: vertical;
		min-height: 100px;
	}

	.field-help {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.error-msg {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--error);
		margin-top: var(--space-4);
	}

	.form-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--surface-subtle);
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
		border: none;
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		text-decoration: none;
		transition: background 0.15s;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--text-inverse);
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

	@media (max-width: 768px) {
		.new-path-page { padding: var(--space-4); }
		.form-grid { grid-template-columns: 1fr; }
		.span-2 { grid-column: span 1; }
	}
</style>
