<script lang="ts">
	import { locale } from '$stores/locale';
	import { Sparkles, Share2, ArrowRight } from 'lucide-svelte';
	import type { LearningPath } from '$types/path';
	import XPBar from '$components/gamification/XPBar.svelte';
	import ShareCard from './ShareCard.svelte';
	import NextRecommendation from './NextRecommendation.svelte';

	export let path: LearningPath;
	export let totalXP: number = 0;
	export let timeSpent: number = 0;
	export let hintsUsed: number = 0;
	export let firstAttemptCount: number = 0;
	export let recommendations: LearningPath[] = [];

	$: minutes = Math.round(timeSpent / 60000);
	$: stepsCount = path.steps.length;
</script>

<div class="path-complete" role="region" aria-label={$locale === 'fr' ? 'Parcours terminé' : 'Path complete'}>
	<div class="celebration" aria-hidden="true">
		<Sparkles size={40} strokeWidth={1} />
	</div>

	<h1 class="title">
		{$locale === 'fr' ? 'Parcours terminé !' : 'Path Complete!'}
	</h1>
	<h2 class="path-name">{path.title}</h2>

	<!-- Stats -->
	<div class="stats-grid">
		<div class="stat">
			<span class="stat-value">{totalXP}</span>
			<span class="stat-label">XP</span>
		</div>
		<div class="stat">
			<span class="stat-value">{stepsCount}</span>
			<span class="stat-label">{$locale === 'fr' ? 'Étapes' : 'Steps'}</span>
		</div>
		<div class="stat">
			<span class="stat-value">{minutes}m</span>
			<span class="stat-label">{$locale === 'fr' ? 'Temps' : 'Time'}</span>
		</div>
		<div class="stat">
			<span class="stat-value">{firstAttemptCount}</span>
			<span class="stat-label">{$locale === 'fr' ? 'Premier essai' : 'First try'}</span>
		</div>
	</div>

	<XPBar />

	<!-- Share -->
	<ShareCard {path} {totalXP} {minutes} />

	<!-- What's next -->
	{#if recommendations.length > 0}
		<NextRecommendation paths={recommendations} />
	{/if}
</div>

<style>
	.path-complete {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		max-width: 560px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
		text-align: center;
	}

	.celebration {
		color: var(--accent);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.1); opacity: 0.8; }
	}

	@media (prefers-reduced-motion: reduce) {
		.celebration { animation: none; }
	}

	.title {
		font-family: var(--font-heading);
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}

	.path-name {
		font-family: var(--font-body);
		font-size: var(--text-lg);
		font-weight: 400;
		color: var(--text-secondary);
		margin: 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
		width: 100%;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
	}

	.stat-value {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
