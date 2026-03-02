<script lang="ts">
	import { LANGUAGE_CONFIG, type SupportedLanguage } from '$types/execution';

	export let code: string;
	export let language: SupportedLanguage = 'typescript';
	export let filename: string = '';
	export let highlightLines: number[] = [];
	export let errorLines: number[] = [];

	$: langConfig = LANGUAGE_CONFIG[language];
	$: lines = code.split('\n');
	$: displayFilename = filename || `main${langConfig.fileExtension}`;
</script>

<div class="code-block" role="region" aria-label="Code block">
	<!-- Top bar -->
	<div class="code-header">
		<span class="code-filename">{displayFilename}</span>
		<span class="code-language">{langConfig.displayName}</span>
	</div>

	<!-- Code content -->
	<pre class="code-content"><code>{#each lines as line, i}<span
		class="code-line"
		class:highlighted={highlightLines.includes(i + 1)}
		class:error-line={errorLines.includes(i + 1)}
	><span class="line-number">{i + 1}</span><span class="line-content">{line}</span></span>
{/each}</code></pre>
</div>

<style>
	.code-block {
		background: var(--code-bg);
		border-radius: var(--radius-md);
		overflow: hidden;
		margin: var(--space-4) 0;
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.code-filename,
	.code-language {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.code-content {
		margin: 0;
		padding: var(--space-3) 0;
		overflow-x: auto;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.code-line {
		display: flex;
		padding: 0 var(--space-4);
	}

	.code-line.highlighted {
		background: var(--accent-muted);
	}

	.code-line.error-line {
		background: var(--error-muted);
	}

	.line-number {
		display: inline-block;
		min-width: 2.5em;
		padding-right: var(--space-3);
		color: var(--text-tertiary);
		text-align: right;
		user-select: none;
		flex-shrink: 0;
	}

	.line-content {
		flex: 1;
		white-space: pre;
	}

	code {
		background: none;
		padding: 0;
	}
</style>
