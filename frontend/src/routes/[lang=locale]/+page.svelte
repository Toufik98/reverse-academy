<script lang="ts">
	import { locale } from '$stores/locale';
	import { ArrowRight, Terminal, BookOpen, Zap } from 'lucide-svelte';
	import SEOHead from '$components/shared/SEOHead.svelte';

	// SvelteKit router passes route params; declare to suppress warning
	export let params: Record<string, string> = {};

	const copy = {
		en: {
			hero: 'Learn by breaking things.',
			subtitle: 'Start with a broken app. Fix it. Discover the theory along the way. Every concept is the answer to a question you already have.',
			cta: 'Start Learning',
			ctaGuest: 'Try a demo',
			features: [
				{
					title: 'Problem First',
					description: 'Every lesson starts with a real, broken piece of code. You fix it before you learn the theory.',
					icon: Terminal
				},
				{
					title: 'Theory Earned',
					description: 'Concepts reveal themselves only after you struggle. The "aha" moment is the lesson.',
					icon: BookOpen
				},
				{
					title: 'Instant Feedback',
					description: 'Run code in the browser. See results immediately. No setup, no waiting.',
					icon: Zap
				}
			],
			paths: 'Learning Paths',
			pathsDesc: 'Curated reverse-engineering journeys.'
		},
		fr: {
			hero: 'Apprendre en cassant les choses.',
			subtitle: "Commencez avec une application cassée. Réparez-la. Découvrez la théorie en chemin. Chaque concept est la réponse à une question que vous avez déjà.",
			cta: 'Commencer',
			ctaGuest: 'Essayer une démo',
			features: [
				{
					title: "Le problème d'abord",
					description: "Chaque leçon commence avec du vrai code cassé. Vous le réparez avant d'apprendre la théorie.",
					icon: Terminal
				},
				{
					title: 'Théorie méritée',
					description: 'Les concepts se révèlent après la difficulté. Le moment "eurêka" est la leçon.',
					icon: BookOpen
				},
				{
					title: 'Retour instantané',
					description: "Exécutez du code dans le navigateur. Résultats immédiats. Pas d'installation.",
					icon: Zap
				}
			],
			paths: "Parcours d'apprentissage",
			pathsDesc: "Des parcours de rétro-ingénierie soigneusement conçus."
		}
	};

	$: t = copy[$locale] || copy.en;
</script>

<SEOHead locale={$locale} />

<div class="landing">
	<!-- Hero -->
	<section class="hero" aria-labelledby="hero-heading">
		<h1 id="hero-heading" class="hero-title">{t.hero}</h1>
		<p class="hero-subtitle">{t.subtitle}</p>
		<div class="hero-actions">
			<a href="/{$locale}/explore" class="btn-primary">
				<span>{t.cta}</span>
				<ArrowRight size={16} strokeWidth={1.5} />
			</a>
		</div>
	</section>

	<!-- Features -->
	<section class="features" aria-label={$locale === 'fr' ? 'Fonctionnalités' : 'Features'}>
		<div class="features-grid">
			{#each t.features as feature}
				<div class="feature-card">
					<div class="feature-icon" aria-hidden="true">
						<svelte:component this={feature.icon} size={24} strokeWidth={1.5} />
					</div>
					<h3 class="feature-title">{feature.title}</h3>
					<p class="feature-description">{feature.description}</p>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.landing {
		max-width: var(--max-width-content);
		margin: 0 auto;
		padding: 0 var(--space-6);
	}

	/* Hero */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-32) 0 var(--space-16);
		gap: var(--space-6);
	}

	.hero-title {
		font-family: var(--font-heading);
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1.05;
		margin: 0;
		max-width: 14ch;
	}

	.hero-subtitle {
		max-width: 520px;
		font-family: var(--font-body);
		font-size: var(--text-lg);
		color: var(--text-secondary);
		line-height: 1.55;
		margin: 0;
	}

	.hero-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		min-height: 44px;
		background: var(--accent);
		color: var(--text-inverse);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		text-decoration: none;
		transition: background-color 120ms ease-out;
	}

	.btn-primary:hover {
		background: var(--accent-hover);
	}

	/* Features */
	.features {
		padding: var(--space-16) 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-6);
	}

	@media (max-width: 768px) {
		.features-grid {
			grid-template-columns: 1fr;
		}
	}

	.feature-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-6);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		transition: border-color 150ms ease-out, transform 150ms ease-out;
	}

	.feature-card:hover {
		border-color: var(--accent-muted);
		transform: translateY(-2px);
	}

	@media (prefers-reduced-motion: reduce) {
		.feature-card:hover {
			transform: none;
		}
	}

	.feature-icon {
		color: var(--accent);
	}

	.feature-title {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text-primary);
	}

	.feature-description {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
	}
</style>
