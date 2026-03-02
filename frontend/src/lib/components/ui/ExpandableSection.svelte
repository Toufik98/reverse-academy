<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { reducedMotion } from '$stores/reducedMotion';

	export let title: string;
	export let open: boolean = false;
</script>

<div class="expandable">
	<button
		class="expandable-trigger"
		on:click={() => (open = !open)}
		aria-expanded={open}
	>
		<span class="expandable-title">{title}</span>
		<span class="expandable-icon" class:rotated={open}>
			<ChevronDown size={16} strokeWidth={1.5} />
		</span>
	</button>

	{#if open}
		<div class="expandable-content" transition:slide={{ duration: $reducedMotion ? 0 : 200 }}>
			<slot />
		</div>
	{/if}
</div>

<style>
	.expandable {
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.expandable-trigger {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		min-height: 44px;
		background: none;
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		text-align: left;
		transition: background-color 120ms ease-out;
	}

	.expandable-trigger:hover {
		background: var(--surface-2);
	}

	.expandable-icon {
		display: flex;
		color: var(--text-tertiary);
		transition: transform 200ms ease-out;
	}

	.expandable-icon.rotated {
		transform: rotate(180deg);
	}

	.expandable-content {
		padding: var(--space-4);
		border-top: 1px solid var(--surface-subtle);
	}
</style>
