<script lang="ts">
	import { locale } from '$stores/locale';
	import SEOHead from '$components/shared/SEOHead.svelte';
	import XPBar from '$components/gamification/XPBar.svelte';
	import LevelBadge from '$components/gamification/LevelBadge.svelte';
	import AchievementGrid from '$components/gamification/AchievementGrid.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	// SvelteKit passes route params internally
	export let params: Record<string, string> = {};

	$: user = data.user;
	$: achievements = data.achievements || [];
	$: earnedIds = data.earnedAchievementIds || [];

	const labels = {
		en: {
			title: 'Profile',
			level: 'Level',
			xp: 'XP',
			nextLevel: 'to next level',
			achievementsTitle: 'Achievements',
			pathsCompleted: 'Paths Completed',
			stepsCompleted: 'Steps Completed',
			memberSince: 'Member since',
			stats: 'Statistics'
		},
		fr: {
			title: 'Profil',
			level: 'Niveau',
			xp: 'XP',
			nextLevel: 'avant le prochain niveau',
			achievementsTitle: 'Succès',
			pathsCompleted: 'Parcours Terminés',
			stepsCompleted: 'Étapes Terminées',
			memberSince: 'Membre depuis',
			stats: 'Statistiques'
		}
	};

	$: t = labels[$locale] || labels.en;
</script>

<SEOHead locale={$locale} title="{t.title} — Reverse Academy" path="/profile" noindex />

<div class="profile-page">
	<header class="profile-header">
		<div class="profile-identity">
			<h1 class="profile-name">{user?.username || 'Learner'}</h1>
			<span class="profile-email">{user?.email || ''}</span>
		</div>
		<div class="profile-level">
			<LevelBadge level={user?.level || 1} />
		</div>
	</header>

	<section class="xp-section">
		<XPBar
			currentXP={user?.xp || 0}
			levelXP={((user?.level || 1) * (user?.level || 1)) * 100}
			nextLevelXP={(((user?.level || 1) + 1) * ((user?.level || 1) + 1)) * 100}
		/>
	</section>

	<section class="stats-section" aria-label={t.stats}>
		<h2 class="section-heading">{t.stats}</h2>
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-value">{user?.pathsCompleted || 0}</span>
				<span class="stat-label">{t.pathsCompleted}</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{user?.stepsCompleted || 0}</span>
				<span class="stat-label">{t.stepsCompleted}</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{user?.xp || 0}</span>
				<span class="stat-label">{t.xp}</span>
			</div>
		</div>
	</section>

	<section class="achievements-section" aria-label={t.achievementsTitle}>
		<h2 class="section-heading">{t.achievementsTitle}</h2>
		<AchievementGrid {achievements} {earnedIds} />
	</section>
</div>

<style>
	.profile-page {
		max-width: var(--max-width-reading);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.profile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.profile-identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.profile-name {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}

	.profile-email {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.profile-level {
		flex-shrink: 0;
	}

	.section-heading {
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-4) 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: var(--space-4);
	}

	.stat-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
	}

	.stat-value {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--accent);
	}

	.stat-label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-align: center;
	}
</style>
