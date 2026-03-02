<script lang="ts">
	import { levelInfo } from '$stores/gamification';
	import { locale } from '$stores/locale';

	export let size: 'sm' | 'md' | 'lg' = 'md';

	$: info = $levelInfo;
</script>

<div class="level-badge {size}" aria-label="{$locale === 'fr' ? 'Niveau' : 'Level'} {info.level}: {info.title}">
	<span class="badge-number">{info.level}</span>
	{#if size !== 'sm'}
		<span class="badge-title">{info.title}</span>
	{/if}
</div>

<style>
	.level-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		border: 1px solid var(--accent-subtle);
		border-radius: var(--radius-full);
		background: var(--surface-1);
	}

	.level-badge.sm {
		padding: var(--space-1) var(--space-2);
	}

	.level-badge.md {
		padding: var(--space-1) var(--space-3);
	}

	.level-badge.lg {
		padding: var(--space-2) var(--space-4);
	}

	.badge-number {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.sm .badge-number { font-size: var(--text-xs); }
	.md .badge-number { font-size: var(--text-sm); }
	.lg .badge-number { font-size: var(--text-lg); }

	.badge-title {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.lg .badge-title {
		font-size: var(--text-sm);
	}
</style>
