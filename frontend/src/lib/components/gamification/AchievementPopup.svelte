<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { Trophy } from 'lucide-svelte';
	import type { Achievement } from '$types/gamification';
	import { locale } from '$stores/locale';
	import { reducedMotion } from '$stores/reducedMotion';

	export let achievement: Achievement;
	export let autoDismiss: number = 5000;

	let visible = true;

	onMount(() => {
		if (autoDismiss > 0) {
			const timeout = setTimeout(() => { visible = false; }, autoDismiss);
			return () => clearTimeout(timeout);
		}
	});
</script>

{#if visible}
	<div
		class="achievement-popup"
		transition:fly={{ y: 60, duration: $reducedMotion ? 0 : 400, easing: quintOut }}
		role="alert"
		aria-live="assertive"
	>
		<div class="popup-icon" aria-hidden="true">
			<Trophy size={20} strokeWidth={1.5} />
		</div>
		<div class="popup-content">
			<span class="popup-label">{$locale === 'fr' ? 'Succès débloqué !' : 'Achievement Unlocked!'}</span>
			<strong class="popup-title">{achievement.title}</strong>
			<p class="popup-description">{achievement.description}</p>
		</div>
		<button class="popup-dismiss" on:click={() => (visible = false)} aria-label={$locale === 'fr' ? 'Fermer' : 'Dismiss'}>
			&times;
		</button>
	</div>
{/if}

<style>
	.achievement-popup {
		position: fixed;
		bottom: var(--space-6);
		right: var(--space-6);
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		max-width: 360px;
		padding: var(--space-4);
		background: var(--surface-1);
		border: 1px solid var(--accent);
		border-radius: var(--radius-lg);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		z-index: 60;
	}

	.popup-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--accent-subtle);
		color: var(--accent);
		flex-shrink: 0;
	}

	.popup-content {
		flex: 1;
		min-width: 0;
	}

	.popup-label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
		margin-bottom: var(--space-1);
	}

	.popup-title {
		display: block;
		font-family: var(--font-heading);
		font-size: var(--text-base);
		color: var(--text-primary);
		margin-bottom: var(--space-1);
	}

	.popup-description {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		line-height: 1.4;
	}

	.popup-dismiss {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-tertiary);
		cursor: pointer;
		font-size: 16px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
	}

	.popup-dismiss:hover {
		background: var(--surface-3);
		color: var(--text-primary);
	}
</style>
