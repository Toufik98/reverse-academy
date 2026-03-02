<script lang="ts">
	import { locale } from '$stores/locale';
	import { Share2, Copy, Check } from 'lucide-svelte';
	import type { LearningPath } from '$types/path';

	export let path: LearningPath;
	export let totalXP: number = 0;
	export let minutes: number = 0;

	let copied = false;

	$: shareText = $locale === 'fr'
		? `J'ai terminé "${path.title}" sur Reverse Academy ! ${totalXP} XP en ${minutes} minutes.`
		: `I completed "${path.title}" on Reverse Academy! ${totalXP} XP in ${minutes} minutes.`;

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(shareText);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch { /* fallback */ }
	}

	function shareNative() {
		if (navigator.share) {
			navigator.share({
				title: `Reverse Academy — ${path.title}`,
				text: shareText,
				url: window.location.origin
			}).catch(() => {});
		} else {
			copyToClipboard();
		}
	}
</script>

<div class="share-card">
	<div class="card-visual">
		<span class="card-brand">Reverse Academy</span>
		<h3 class="card-path">{path.title}</h3>
		<div class="card-stats">
			<span>{totalXP} XP</span>
			<span>•</span>
			<span>{minutes}m</span>
		</div>
	</div>

	<div class="share-actions">
		<button class="share-btn" on:click={shareNative}>
			<Share2 size={14} strokeWidth={1.5} />
			<span>{$locale === 'fr' ? 'Partager' : 'Share'}</span>
		</button>
		<button class="copy-btn" on:click={copyToClipboard}>
			{#if copied}
				<Check size={14} strokeWidth={1.5} />
				<span>{$locale === 'fr' ? 'Copié !' : 'Copied!'}</span>
			{:else}
				<Copy size={14} strokeWidth={1.5} />
				<span>{$locale === 'fr' ? 'Copier' : 'Copy'}</span>
			{/if}
		</button>
	</div>
</div>

<style>
	.share-card {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.card-visual {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-6);
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
	}

	.card-brand {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.card-path {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
	}

	.card-stats {
		display: flex;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.share-actions {
		display: flex;
		justify-content: center;
		gap: var(--space-2);
	}

	.share-btn,
	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		min-height: 44px;
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		background: none;
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 120ms ease-out;
	}

	.share-btn:hover,
	.copy-btn:hover {
		background: var(--surface-2);
		border-color: var(--text-tertiary);
		color: var(--text-primary);
	}
</style>
