<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { reducedMotion } from '$stores/reducedMotion';

	export let type: 'success' | 'error' | 'info' = 'info';
	export let message: string;
	export let duration: number = 5000; // minimum 4s per design spec
	export let visible: boolean = true;

	const icons = { success: CheckCircle, error: AlertCircle, info: Info };

	let timeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		if (duration > 0) {
			timeout = setTimeout(() => (visible = false), duration);
		}
		return () => clearTimeout(timeout);
	});

	function dismiss() {
		visible = false;
	}
</script>

{#if visible}
	<div
		class="toast toast-{type}"
		role="alert"
		aria-live="polite"
		transition:fly={{ y: 16, duration: $reducedMotion ? 0 : 200 }}
	>
		<svelte:component this={icons[type]} size={18} strokeWidth={1.5} />
		<span class="toast-message">{message}</span>
		<button class="toast-close" on:click={dismiss} aria-label="Dismiss">
			<X size={14} strokeWidth={1.5} />
		</button>
	</div>
{/if}

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--text-primary);
		max-width: 420px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.toast-success { border-left: 3px solid var(--success); }
	.toast-error { border-left: 3px solid var(--error); }
	.toast-info { border-left: 3px solid var(--info); }

	.toast-message {
		flex: 1;
	}

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		margin: calc(-1 * var(--space-2)) calc(-1 * var(--space-3)) calc(-1 * var(--space-2)) 0;
		border: none;
		background: none;
		color: var(--text-tertiary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.toast-close:hover {
		color: var(--text-primary);
	}
</style>
