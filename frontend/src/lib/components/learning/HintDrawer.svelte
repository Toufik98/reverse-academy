<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { X, Lightbulb } from 'lucide-svelte';
	import { locale } from '$stores/locale';
	import { reducedMotion } from '$stores/reducedMotion';
	import MarkdownRenderer from '$components/shared/MarkdownRenderer.svelte';

	export let hint: string = '';
	export let open: boolean = false;

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

{#if open && hint}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="hint-backdrop" on:click={close} role="presentation" aria-hidden="true"></div>
	<aside
		class="hint-drawer"
		transition:fly={{ x: 320, duration: $reducedMotion ? 0 : 300, easing: quintOut }}
		on:keydown={handleKeydown}
		role="complementary"
		aria-label={$locale === 'fr' ? 'Indice' : 'Hint'}
	>
		<div class="hint-header">
			<div class="hint-title">
				<Lightbulb size={16} strokeWidth={1.5} />
				<span>{$locale === 'fr' ? 'Indice' : 'Hint'}</span>
			</div>
			<button class="hint-close" on:click={close} aria-label={$locale === 'fr' ? 'Fermer' : 'Close'}>
				<X size={16} strokeWidth={1.5} />
			</button>
		</div>
		<div class="hint-body">
			<MarkdownRenderer content={hint} />
		</div>
	</aside>
{/if}

<style>
	.hint-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 40;
	}

	.hint-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 320px;
		max-width: 90vw;
		background: var(--surface-1);
		border-left: 1px solid var(--surface-subtle);
		z-index: 50;
		display: flex;
		flex-direction: column;
		box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
	}

	.hint-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.hint-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--accent);
	}

	.hint-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-tertiary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background 120ms ease-out;
	}

	.hint-close:hover {
		background: var(--surface-3);
		color: var(--text-primary);
	}

	.hint-body {
		flex: 1;
		padding: var(--space-4);
		overflow-y: auto;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		line-height: 1.6;
		color: var(--text-secondary);
	}
</style>
