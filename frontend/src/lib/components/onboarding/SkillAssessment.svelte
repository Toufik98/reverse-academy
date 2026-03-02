<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { locale } from '$stores/locale';
	import { ArrowRight, SkipForward } from 'lucide-svelte';

	const dispatch = createEventDispatcher<{
		select: string;
		continue: void;
		skip: void;
	}>();

	const levels = [
		{
			id: 'beginner',
			en: { title: 'Never written code', description: 'I\'m completely new to programming' },
			fr: { title: 'Jamais codé', description: 'Je suis complètement nouveau en programmation' }
		},
		{
			id: 'intermediate',
			en: { title: 'I\'ve built small projects', description: 'I understand basics and have built some things' },
			fr: { title: 'J\'ai fait de petits projets', description: 'Je comprends les bases et j\'ai construit quelques choses' }
		},
		{
			id: 'advanced',
			en: { title: 'I work with code daily', description: 'I\'m a professional developer or advanced student' },
			fr: { title: 'Je code au quotidien', description: 'Je suis développeur professionnel ou étudiant avancé' }
		}
	];

	let selectedLevel = '';

	function select(id: string) {
		selectedLevel = id;
		dispatch('select', id);
	}

	function proceed() {
		dispatch('continue');
	}
</script>

<div class="skill-assessment">
	<h2 class="title">
		{$locale === 'fr' ? 'Quel est votre niveau ?' : 'How comfortable are you with code?'}
	</h2>

	<div class="level-options" role="radiogroup" aria-label={$locale === 'fr' ? 'Niveau de compétence' : 'Skill level'}>
		{#each levels as level}
			{@const l = $locale === 'fr' ? level.fr : level.en}
			<button
				class="level-option"
				class:selected={selectedLevel === level.id}
				on:click={() => select(level.id)}
				role="radio"
				aria-checked={selectedLevel === level.id}
			>
				<strong class="level-title">{l.title}</strong>
				<span class="level-desc">{l.description}</span>
			</button>
		{/each}
	</div>

	<div class="actions">
		<button class="skip-btn" on:click={() => dispatch('skip')}>
			<SkipForward size={14} strokeWidth={1.5} />
			<span>{$locale === 'fr' ? 'Passer' : 'Skip'}</span>
		</button>
		<button class="continue-btn" disabled={!selectedLevel} on:click={proceed}>
			<span>{$locale === 'fr' ? 'Continuer' : 'Continue'}</span>
			<ArrowRight size={16} strokeWidth={1.5} />
		</button>
	</div>
</div>

<style>
	.skill-assessment {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		text-align: center;
	}

	.title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.level-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 100%;
		max-width: 440px;
	}

	.level-option {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-4);
		min-height: 44px;
		border: 1.5px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-1);
		cursor: pointer;
		text-align: left;
		transition: all 150ms ease-out;
	}

	.level-option:hover {
		border-color: var(--text-tertiary);
	}

	.level-option.selected {
		border-color: var(--accent);
		background: var(--accent-subtle);
	}

	.level-title {
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--text-primary);
	}

	.level-desc {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-tertiary);
	}

	.actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.skip-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		min-height: 44px;
		border: none;
		background: none;
		color: var(--text-tertiary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.skip-btn:hover { color: var(--text-secondary); }

	.continue-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		min-height: 44px;
		background: var(--accent);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease-out;
	}

	.continue-btn:hover:not(:disabled) { background: var(--accent-hover); }
	.continue-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
