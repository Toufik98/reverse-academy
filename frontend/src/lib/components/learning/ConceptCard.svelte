<script lang="ts">
	import { Check, Lock } from 'lucide-svelte';

	export let title: string;
	export let description: string = '';
	export let unlocked: boolean = false;
	export let icon: string = '';
</script>

<div class="concept-card" class:unlocked aria-label="{title}{unlocked ? '' : ' (locked)'}">
	{#if unlocked}
		<div class="card-icon unlocked-icon">
			<Check size={16} strokeWidth={2} />
		</div>
	{:else}
		<div class="card-icon locked-icon">
			<Lock size={14} strokeWidth={1.5} />
		</div>
	{/if}

	<div class="card-content">
		<h4 class="card-title">{title}</h4>
		{#if description && unlocked}
			<p class="card-description">{description}</p>
		{/if}
	</div>
</div>

<style>
	.concept-card {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-1);
		transition: all 200ms ease-out;
		opacity: 0.5;
	}

	.concept-card.unlocked {
		opacity: 1;
		border-color: var(--accent-subtle);
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.unlocked-icon {
		background: var(--accent-subtle);
		color: var(--accent);
	}

	.locked-icon {
		background: var(--surface-3);
		color: var(--text-tertiary);
	}

	.card-content {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.concept-card:not(.unlocked) .card-title {
		color: var(--text-tertiary);
	}

	.card-description {
		margin: var(--space-1) 0 0;
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		line-height: 1.4;
	}
</style>
