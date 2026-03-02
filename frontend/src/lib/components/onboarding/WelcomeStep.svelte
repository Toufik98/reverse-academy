<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { locale } from '$stores/locale';
	import { ArrowRight } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	const copy = {
		en: {
			title: 'You learn by doing,\nnot by reading.',
			description: 'Reverse Academy flips education upside down. Start with a broken app. Fix it. Discover the concepts along the way. Every piece of theory is the answer to a question you already have.',
			cta: 'Continue'
		},
		fr: {
			title: 'On apprend en faisant,\npas en lisant.',
			description: "Reverse Academy renverse l'éducation. Commencez avec une application cassée. Réparez-la. Découvrez les concepts en chemin. Chaque morceau de théorie est la réponse à une question que vous avez déjà.",
			cta: 'Continuer'
		}
	};

	$: t = copy[$locale] || copy.en;
</script>

<div class="welcome-step">
	<h1 class="welcome-title">{t.title}</h1>
	<p class="welcome-description">{t.description}</p>
	<button class="welcome-cta" on:click={() => dispatch('continue')}>
		<span>{t.cta}</span>
		<ArrowRight size={16} strokeWidth={1.5} />
	</button>
</div>

<style>
	.welcome-step {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		padding: var(--space-8) 0;
	}

	.welcome-title {
		font-family: var(--font-heading);
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1.1;
		white-space: pre-line;
		margin: 0;
	}

	.welcome-description {
		max-width: 480px;
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
	}

	.welcome-cta {
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

	.welcome-cta:hover {
		background: var(--accent-hover);
	}
</style>
