<script lang="ts">
	import type { Achievement, UserAchievement } from '$types/gamification';
	import { locale } from '$stores/locale';
	import { Trophy, Lock } from 'lucide-svelte';

	export let achievements: Achievement[] = [];
	export let earned: UserAchievement[] = [];

	$: earnedSlugs = new Set(earned.map((e) => e.achievementSlug));
</script>

<div class="achievement-grid" role="list" aria-label={$locale === 'fr' ? 'Succès' : 'Achievements'}>
	{#each achievements as achievement (achievement.slug)}
		{@const isEarned = earnedSlugs.has(achievement.slug)}
		<div
			class="achievement-card"
			class:earned={isEarned}
			role="listitem"
			aria-label="{achievement.title}{isEarned ? '' : ` (${$locale === 'fr' ? 'verrouillé' : 'locked'})`}"
		>
			<div class="card-icon" aria-hidden="true">
				{#if isEarned}
					<Trophy size={24} strokeWidth={1.5} />
				{:else}
					<Lock size={20} strokeWidth={1.5} />
				{/if}
			</div>
			<h3 class="card-title">{achievement.title}</h3>
			<p class="card-description">{achievement.description}</p>
			{#if isEarned}
				{@const earnedDate = earned.find((e) => e.achievementSlug === achievement.slug)?.earnedAt}
				{#if earnedDate}
					<time class="card-date" datetime={earnedDate}>
						{new Date(earnedDate).toLocaleDateString($locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
					</time>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.achievement-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.achievement-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-2);
		padding: var(--space-5) var(--space-4);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		background: var(--surface-1);
		opacity: 0.45;
		transition: all 200ms ease-out;
	}

	.achievement-card.earned {
		opacity: 1;
		border-color: var(--accent-subtle);
	}

	.achievement-card.earned:hover {
		border-color: var(--accent);
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		color: var(--text-tertiary);
	}

	.earned .card-icon {
		background: var(--accent-subtle);
		color: var(--accent);
	}

	.card-title {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
	}

	.card-description {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		line-height: 1.4;
	}

	.card-date {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
