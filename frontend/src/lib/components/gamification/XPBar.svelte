<script lang="ts">
	import { levelInfo } from '$stores/gamification';
	import { xpForLevel } from '$types/gamification';
	import { locale } from '$stores/locale';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let info = $levelInfo;
	$: info = $levelInfo;

	const animatedProgress = tweened(0, { duration: 600, easing: cubicOut });
	$: animatedProgress.set(info.xpProgress);
	$: currentLevelXP = xpForLevel(info.level);
</script>

<div class="xp-bar" role="progressbar" aria-valuenow={info.currentXP} aria-valuemin={currentLevelXP} aria-valuemax={info.xpForNextLevel} aria-label={$locale === 'fr' ? 'Barre d\'expérience' : 'Experience bar'}>
	<div class="xp-header">
		<span class="xp-level">{$locale === 'fr' ? 'Niveau' : 'Level'} {info.level}</span>
		<span class="xp-count">{info.currentXP} XP</span>
	</div>
	<div class="xp-track">
		<div class="xp-fill" style="width: {$animatedProgress * 100}%"></div>
	</div>
	<div class="xp-footer">
		<span class="xp-title">{info.title}</span>
		<span class="xp-next">{info.xpForNextLevel - info.currentXP} XP {$locale === 'fr' ? 'restant' : 'to next'}</span>
	</div>
</div>

<style>
	.xp-bar {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.xp-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.xp-level {
		font-family: var(--font-heading);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--accent);
	}

	.xp-count {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
	}

	.xp-track {
		height: 6px;
		background: var(--surface-3);
		border-radius: 3px;
		overflow: hidden;
	}

	.xp-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 3px;
		transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.xp-footer {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.xp-title {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.xp-next {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
