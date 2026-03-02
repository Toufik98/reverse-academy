<script lang="ts">
	import { tutorStore } from '$stores/tutor';
	import { locale } from '$stores/locale';
	import type { TutorState } from '$types/tutor';
	import { Lightbulb, BookOpen, ArrowRight } from 'lucide-svelte';

	export let state: TutorState;
	export let hintUsed: boolean = false;

	const labels = {
		en: {
			hint: 'Need a hint?',
			hintUsed: 'Hint used',
			goDeeper: 'Go deeper',
			nextStep: 'Next step',
			tryAgain: 'Try again'
		},
		fr: {
			hint: 'Besoin d\'un indice ?',
			hintUsed: 'Indice utilisé',
			goDeeper: 'Aller plus loin',
			nextStep: 'Étape suivante',
			tryAgain: 'Réessayer'
		}
	};

	$: l = labels[$locale] || labels.en;

	function requestHint() {
		tutorStore.useHint();
	}
</script>

<div class="tutor-action-bar" role="toolbar" aria-label={$locale === 'fr' ? 'Actions tuteur' : 'Tutor actions'}>
	{#if state === 'ATTEMPTING' || state === 'DEEPER_DIVE'}
		<button class="action-btn hint" on:click={requestHint} disabled={hintUsed}>
			<Lightbulb size={14} strokeWidth={1.5} />
			<span>{hintUsed ? l.hintUsed : l.hint}</span>
		</button>
	{/if}

	{#if state === 'CONCEPT_UNLOCKED'}
		<button class="action-btn next">
			<ArrowRight size={14} strokeWidth={1.5} />
			<span>{l.nextStep}</span>
		</button>
	{/if}

	{#if state === 'HINT_OFFERED'}
		<button class="action-btn deeper">
			<BookOpen size={14} strokeWidth={1.5} />
			<span>{l.goDeeper}</span>
		</button>
	{/if}
</div>

<style>
	.tutor-action-bar {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--surface-subtle);
		flex-wrap: wrap;
	}

	.action-btn {
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
		font-weight: 500;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 120ms ease-out;
	}

	.action-btn:hover:not(:disabled) {
		background: var(--surface-2);
		color: var(--text-primary);
		border-color: var(--text-tertiary);
	}

	.action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.action-btn.hint {
		color: var(--warning);
		border-color: var(--warning);
	}

	.action-btn.hint:hover:not(:disabled) {
		background: rgba(212, 168, 67, 0.08);
	}

	.action-btn.next {
		color: var(--accent);
		border-color: var(--accent);
	}

	.action-btn.deeper {
		color: var(--info);
		border-color: var(--info);
	}
</style>
