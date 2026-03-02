<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$stores/locale';

	export let initialFormula: string = '';
	export let prompt: string = '';

	let input = initialFormula;
	let renderedHtml = '';
	let katexLoaded = false;

	async function renderFormula(formula: string) {
		if (!katexLoaded) return;
		try {
			const katex = (await import('katex')).default;
			renderedHtml = katex.renderToString(formula, {
				throwOnError: false,
				displayMode: true
			});
		} catch {
			renderedHtml = `<span class="error">${$locale === 'fr' ? 'Formule invalide' : 'Invalid formula'}</span>`;
		}
	}

	$: if (katexLoaded) renderFormula(input);

	onMount(async () => {
		// Lazy-load KaTeX CSS
		if (!document.querySelector('link[href*="katex"]')) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
			document.head.appendChild(link);
		}
		katexLoaded = true;
		renderFormula(input);
	});
</script>

<div class="math-sandbox" role="region" aria-label={$locale === 'fr' ? 'Bac à sable mathématique' : 'Math sandbox'}>
	{#if prompt}
		<p class="sandbox-prompt">{prompt}</p>
	{/if}

	<div class="sandbox-input">
		<label for="formula-input" class="input-label">
			{$locale === 'fr' ? 'Formule LaTeX' : 'LaTeX Formula'}
		</label>
		<textarea
			id="formula-input"
			class="formula-input"
			bind:value={input}
			rows="3"
			spellcheck="false"
			aria-describedby="formula-preview"
		></textarea>
	</div>

	<div class="sandbox-preview" id="formula-preview" aria-live="polite">
		<span class="preview-label">{$locale === 'fr' ? 'Aperçu' : 'Preview'}</span>
		<div class="preview-content">
			{#if renderedHtml}
				{@html renderedHtml}
			{:else}
				<span class="placeholder">{$locale === 'fr' ? 'Tapez une formule ci-dessus' : 'Type a formula above'}</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.math-sandbox {
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.sandbox-prompt {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.sandbox-input {
		padding: var(--space-3) var(--space-4);
	}

	.input-label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-2);
	}

	.formula-input {
		width: 100%;
		min-height: 60px;
		padding: var(--space-2) var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-primary);
		background: var(--code-bg);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		resize: vertical;
		line-height: 1.5;
	}

	.formula-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-subtle);
	}

	.sandbox-preview {
		padding: var(--space-4);
		border-top: 1px solid var(--surface-subtle);
		background: var(--surface-1);
	}

	.preview-label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-3);
	}

	.preview-content {
		min-height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
	}

	.placeholder {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-tertiary);
	}

	.preview-content :global(.error) {
		color: var(--error);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}
</style>
