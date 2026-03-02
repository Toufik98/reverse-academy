<script lang="ts">
	import { marked } from 'marked';

	export let content: string;
	export let className: string = '';

	$: html = marked.parse(content, { async: false }) as string;
</script>

<div class="markdown-content prose {className}" role="document">
	{@html html}
</div>

<style>
	.markdown-content :global(h1),
	.markdown-content :global(h2),
	.markdown-content :global(h3) {
		font-family: var(--font-display);
		letter-spacing: -0.02em;
		color: var(--text-primary);
		margin-top: var(--space-8);
		margin-bottom: var(--space-4);
	}

	.markdown-content :global(h1) { font-size: var(--text-2xl); }
	.markdown-content :global(h2) { font-size: var(--text-xl); }
	.markdown-content :global(h3) { font-size: var(--text-lg); }

	.markdown-content :global(p) {
		color: var(--text-primary);
		line-height: 1.65;
		margin-bottom: var(--space-4);
	}

	.markdown-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.9em;
		background: var(--code-bg);
		padding: 0.15em 0.35em;
	}

	.markdown-content :global(pre) {
		background: var(--code-bg);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		overflow-x: auto;
		margin: var(--space-4) 0;
	}

	.markdown-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.markdown-content :global(strong) {
		color: var(--accent-text);
		font-weight: 600;
	}

	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		padding-left: var(--space-6);
		margin-bottom: var(--space-4);
	}

	.markdown-content :global(li) {
		margin-bottom: var(--space-2);
	}

	.markdown-content :global(blockquote) {
		border-left: 3px solid var(--accent);
		background: var(--accent-muted);
		padding: var(--space-4) var(--space-6);
		margin: var(--space-4) 0;
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
	}
</style>
