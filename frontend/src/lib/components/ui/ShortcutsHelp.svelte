<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { X } from 'lucide-svelte';
	import { locale } from '$stores/locale';
	import { reducedMotion } from '$stores/reducedMotion';

	export let open: boolean = false;

	const dispatch = createEventDispatcher();

	function close() {
		open = false;
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	const shortcuts = [
		{ keys: ['Cmd/Ctrl', 'Enter'], en: 'Run code', fr: 'Exécuter le code' },
		{ keys: ['Cmd/Ctrl', 'S'], en: 'Save (intercepted)', fr: 'Enregistrer (intercepté)' },
		{ keys: ['Escape'], en: 'Close active panel', fr: 'Fermer le panneau actif' },
		{ keys: ['?'], en: 'Show this help', fr: 'Afficher cette aide' },
		{ keys: ['Alt', '\u2192'], en: 'Next step', fr: 'Étape suivante' },
		{ keys: ['Alt', '\u2190'], en: 'Previous step', fr: 'Étape précédente' },
		{ keys: ['Alt', 'H'], en: 'Toggle hint drawer', fr: "Basculer l'indice" },
		{ keys: ['Alt', 'T'], en: 'Toggle tutor panel', fr: 'Basculer le tuteur' },
	];
</script>

{#if open}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="shortcuts-backdrop"
		on:click={close}
		on:keydown={handleKeydown}
		transition:fade={{ duration: $reducedMotion ? 0 : 150 }}
		role="presentation"
		aria-hidden="true"
	></div>

	<div
		class="shortcuts-overlay"
		role="dialog"
		aria-modal="true"
		aria-label={$locale === 'fr' ? 'Raccourcis clavier' : 'Keyboard shortcuts'}
		on:keydown={handleKeydown}
		tabindex="-1"
		transition:fade={{ duration: $reducedMotion ? 0 : 150 }}
	>
		<div class="shortcuts-header">
			<h2 class="shortcuts-title">
				{$locale === 'fr' ? 'Raccourcis clavier' : 'Keyboard Shortcuts'}
			</h2>
			<button class="shortcuts-close" on:click={close} aria-label={$locale === 'fr' ? 'Fermer' : 'Close'}>
				<X size={16} strokeWidth={1.5} />
			</button>
		</div>

		<div class="shortcuts-list" role="list">
			{#each shortcuts as shortcut}
				<div class="shortcut-row" role="listitem">
					<div class="shortcut-keys">
						{#each shortcut.keys as key, i}
							{#if i > 0}<span class="key-sep">+</span>{/if}
							<kbd class="key">{key}</kbd>
						{/each}
					</div>
					<span class="shortcut-desc">
						{$locale === 'fr' ? shortcut.fr : shortcut.en}
					</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.shortcuts-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 80;
	}

	.shortcuts-overlay {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 81;
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		max-width: 480px;
		width: calc(100% - var(--space-8));
		max-height: 85vh;
		overflow-y: auto;
		outline: none;
	}

	.shortcuts-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.shortcuts-title {
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.shortcuts-close {
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
	}

	.shortcuts-close:hover {
		color: var(--text-primary);
		background: var(--surface-3);
	}

	.shortcuts-list {
		padding: var(--space-4) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.shortcut-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	.shortcut-keys {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		padding: var(--space-1) var(--space-2);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.key-sep {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.shortcut-desc {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
</style>
