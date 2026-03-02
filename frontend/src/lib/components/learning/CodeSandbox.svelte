<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { Play, RotateCcw } from 'lucide-svelte';
	import { locale } from '$stores/locale';
	import { settings } from '$stores/settings';
	import type { SupportedLanguage } from '$types/execution';
	import type { ExecutionResult } from '$types/execution';
	import { LANGUAGE_CONFIG } from '$types/execution';
	import { executeCode } from '$engine/execution-router';
	import { browser } from '$app/environment';

	export let initialCode: string = '';
	export let language: SupportedLanguage = 'typescript';
	export let pathSlug: string = '';
	export let stepId: string = '';
	export let readonly: boolean = false;

	const dispatch = createEventDispatcher<{
		execute: ExecutionResult;
		codeChange: string;
	}>();

	let code = initialCode;
	let executing = false;
	let result: ExecutionResult | null = null;
	let editorContainer: HTMLDivElement;
	let editorView: any = null;

	$: langConfig = LANGUAGE_CONFIG[language];
	$: storageKey = `ra:code:${pathSlug}:${stepId}`;

	// Auto-save debounce
	let saveTimeout: ReturnType<typeof setTimeout>;

	function onCodeChange(newCode: string) {
		code = newCode;
		dispatch('codeChange', code);

		// Debounced auto-save to localStorage
		if (browser && pathSlug && stepId) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => {
				localStorage.setItem(
					storageKey,
					JSON.stringify({ code, language, timestamp: Date.now() })
				);
			}, 500);
		}
	}

	async function run() {
		if (executing || readonly) return;
		executing = true;
		result = null;

		try {
			result = await executeCode(code, language);
			dispatch('execute', result);
		} catch (err: any) {
			result = {
				success: false,
				output: '',
				error: err.message || 'Execution failed',
				tier: 'browser'
			};
		} finally {
			executing = false;
		}
	}

	function reset() {
		code = initialCode;
		result = null;
		if (editorView) {
			editorView.dispatch({
				changes: { from: 0, to: editorView.state.doc.length, insert: initialCode }
			});
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		// Cmd/Ctrl + Enter to run
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			run();
		}
		// Escape to exit editor focus
		if (e.key === 'Escape') {
			editorContainer?.blur();
		}
	}

	onDestroy(() => {
		editorView?.destroy();
	});

	onMount(async () => {
		// Restore from auto-save
		if (browser && pathSlug && stepId) {
			try {
				const saved = localStorage.getItem(storageKey);
				if (saved) {
					const parsed = JSON.parse(saved);
					if (parsed.code && parsed.timestamp) {
						code = parsed.code;
					}
				}
			} catch { /* ignore */ }
		}

		// Lazy-load CodeMirror
		const { EditorView, basicSetup } = await import('codemirror');
		const { EditorState } = await import('@codemirror/state');
		const { keymap } = await import('@codemirror/view');
		const { indentWithTab } = await import('@codemirror/commands');
		const { darkTheme } = await import('$design/codemirror-theme');

		// Load language support
		let langExtension;
		switch (language) {
			case 'javascript':
			case 'typescript': {
				const { javascript } = await import('@codemirror/lang-javascript');
				langExtension = javascript({ typescript: language === 'typescript' });
				break;
			}
			case 'python': {
				const { python } = await import('@codemirror/lang-python');
				langExtension = python();
				break;
			}
			case 'rust': {
				const { rust } = await import('@codemirror/lang-rust');
				langExtension = rust();
				break;
			}
			default: {
				const { javascript } = await import('@codemirror/lang-javascript');
				langExtension = javascript();
			}
		}

		const state = EditorState.create({
			doc: code,
			extensions: [
				basicSetup,
				langExtension,
				keymap.of([indentWithTab]),
				...darkTheme,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						onCodeChange(update.state.doc.toString());
					}
				}),
				EditorState.tabSize.of($settings.editorTabSize),
				EditorView.editable.of(!readonly)
			]
		});

		editorView = new EditorView({
			state,
			parent: editorContainer
		});
	});
</script>

<div class="code-sandbox" on:keydown={handleKeydown} role="region" aria-label="Code editor">
	<!-- Header -->
	<div class="sandbox-header">
		<div class="sandbox-file">
			<span class="sandbox-filename">main{langConfig.fileExtension}</span>
			<span class="sandbox-lang">{langConfig.displayName} {langConfig.version}</span>
		</div>
		<div class="sandbox-actions">
			<button class="sandbox-btn ghost" on:click={reset} aria-label="Reset code" disabled={readonly}>
				<RotateCcw size={14} strokeWidth={1.5} />
				<span>{$locale === 'fr' ? 'Réinitialiser' : 'Reset'}</span>
			</button>
			<button class="sandbox-btn primary" on:click={run} disabled={executing || readonly} aria-label="Run code">
				<Play size={14} strokeWidth={1.5} />
				<span>{executing ? ($locale === 'fr' ? 'Exécution...' : 'Running...') : ($locale === 'fr' ? 'Exécuter' : 'Run')}</span>
			</button>
		</div>
	</div>

	<!-- Editor -->
	<div bind:this={editorContainer} class="sandbox-editor" role="textbox" aria-multiline="true" aria-label="Code input"></div>

	<!-- Output -->
	{#if result}
		<div class="sandbox-output" role="region" aria-label="Execution output" aria-live="polite">
			<div class="output-header">
				<span class="output-label" class:success={result.success} class:error={!result.success}>
					{result.success ? ($locale === 'fr' ? 'Succès' : 'Success') : ($locale === 'fr' ? 'Erreur' : 'Error')}
				</span>
				{#if result.executionTimeMs}
					<span class="output-time">{result.executionTimeMs}ms</span>
				{/if}
				<span class="output-tier">{result.tier}</span>
			</div>
			{#if result.output}
				<pre class="output-content">{result.output}</pre>
			{/if}
			{#if result.error}
				<pre class="output-error">{result.error}</pre>
			{/if}
		</div>
	{/if}
</div>

<style>
	.code-sandbox {
		background: var(--code-bg);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.sandbox-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.sandbox-file {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.sandbox-filename {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.sandbox-lang {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.sandbox-actions {
		display: flex;
		gap: var(--space-2);
	}

	.sandbox-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: background 120ms ease-out;
		min-height: 44px;
	}

	.sandbox-btn.primary {
		background: var(--accent);
		color: var(--text-inverse);
	}

	.sandbox-btn.primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.sandbox-btn.primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sandbox-btn.ghost {
		background: none;
		color: var(--text-secondary);
	}

	.sandbox-btn.ghost:hover:not(:disabled) {
		background: var(--surface-3);
		color: var(--text-primary);
	}

	.sandbox-editor {
		min-height: 200px;
		max-height: 500px;
		overflow: auto;
	}

	.sandbox-editor :global(.cm-editor) {
		height: 100%;
		min-height: 200px;
	}

	.sandbox-output {
		border-top: 1px solid var(--surface-subtle);
	}

	.output-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-4);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.output-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.output-label.success { color: var(--success); }
	.output-label.error { color: var(--error); }

	.output-time,
	.output-tier {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.output-content,
	.output-error {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.5;
		overflow-x: auto;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.output-content { color: var(--text-primary); }
	.output-error { color: var(--error); }
</style>
