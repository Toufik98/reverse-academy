<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { reducedMotion } from '$stores/reducedMotion';

	export let open: boolean = false;
	export let title: string = '';

	const dispatch = createEventDispatcher();
	let modalEl: HTMLDivElement;
	let previouslyFocused: HTMLElement | null = null;

	function close() {
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();

		// Trap focus inside modal
		if (e.key === 'Tab' && modalEl) {
			const focusable = modalEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last?.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first?.focus();
			}
		}
	}

	$: if (open) {
		previouslyFocused = document.activeElement as HTMLElement;
		setTimeout(() => modalEl?.focus(), 0);
	} else if (previouslyFocused) {
		previouslyFocused.focus();
		previouslyFocused = null;
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="modal-backdrop"
		on:click={close}
		on:keydown={handleKeydown}
		transition:fade={{ duration: $reducedMotion ? 0 : 200 }}
		role="presentation"
	></div>

	<!-- Modal -->
	<div
		bind:this={modalEl}
		class="modal"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		tabindex="-1"
		on:keydown={handleKeydown}
		transition:fly={{ y: 8, duration: $reducedMotion ? 0 : 200 }}
	>
		{#if title}
			<div class="modal-header">
				<h2 class="modal-title">{title}</h2>
				<button class="modal-close" on:click={close} aria-label="Close">
					<X size={18} strokeWidth={1.5} />
				</button>
			</div>
		{/if}

		<div class="modal-content">
			<slot />
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 90;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 91;
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		max-width: 520px;
		width: calc(100% - var(--space-8));
		max-height: 85vh;
		overflow-y: auto;
		outline: none;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.modal-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		margin: 0;
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-secondary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: color 120ms ease-out, background 120ms ease-out;
	}

	.modal-close:hover {
		color: var(--text-primary);
		background: var(--surface-3);
	}

	.modal-content {
		padding: var(--space-6);
	}
</style>
