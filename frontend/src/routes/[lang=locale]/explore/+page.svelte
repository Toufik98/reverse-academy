<script lang="ts">
	import { locale } from '$stores/locale';
	import { ArrowRight, Clock, Zap, Search } from 'lucide-svelte';
	import SEOHead from '$components/shared/SEOHead.svelte';
	import type { LearningPath } from '$types/path';
	import type { PageData } from './$types';

	export let data: PageData;
	// SvelteKit passes route params internally
	export let params: Record<string, string> = {};

	let searchQuery = '';
	let selectedDomain = '';

	$: paths = (data.paths || []) as LearningPath[];
	$: filteredPaths = paths.filter((p) => {
		const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesDomain = !selectedDomain || p.domain === selectedDomain;
		return matchesSearch && matchesDomain;
	});

	$: domains = [...new Set(paths.map((p) => p.domain))];

	const copy = {
		en: { title: 'Explore', subtitle: 'Choose a learning path and start reverse-engineering.', search: 'Search paths...', all: 'All' },
		fr: { title: 'Explorer', subtitle: 'Choisissez un parcours et commencez la rétro-ingénierie.', search: 'Rechercher...', all: 'Tous' }
	};

	$: t = copy[$locale] || copy.en;

	const difficultyLabels: Record<string, Record<string, string>> = {
		beginner: { en: 'Beginner', fr: 'Débutant' },
		intermediate: { en: 'Intermediate', fr: 'Intermédiaire' },
		advanced: { en: 'Advanced', fr: 'Avancé' }
	};
</script>

<SEOHead locale={$locale} title={t.title} path="/explore" />

<div class="explore-page">
	<header class="explore-header">
		<h1 class="explore-title">{t.title}</h1>
		<p class="explore-subtitle">{t.subtitle}</p>
	</header>

	<!-- Filters -->
	<div class="filters" role="search">
		<div class="search-box">
			<Search size={16} strokeWidth={1.5} />
			<input type="text" bind:value={searchQuery} placeholder={t.search} class="search-input" aria-label={t.search} />
		</div>

		<div class="domain-filters" role="group" aria-label={$locale === 'fr' ? 'Filtrer par domaine' : 'Filter by domain'}>
			<button class="filter-chip" class:active={!selectedDomain} on:click={() => (selectedDomain = '')}>{t.all}</button>
			{#each domains as domain}
				<button class="filter-chip" class:active={selectedDomain === domain} on:click={() => (selectedDomain = domain)}>
					{domain}
				</button>
			{/each}
		</div>
	</div>

	<!-- Path grid -->
	<div class="path-grid">
		{#each filteredPaths as path (path.slug)}
			<a href="/{$locale}/learn/{path.slug}" class="path-card">
				<div class="card-top">
					<span class="card-domain">{path.domain}</span>
					<span class="card-difficulty">{difficultyLabels[path.difficulty]?.[$locale] || path.difficulty}</span>
				</div>
				<h3 class="card-title">{path.title}</h3>
				<p class="card-desc">{path.description}</p>
				<div class="card-meta">
					<span class="meta"><Clock size={12} strokeWidth={1.5} />{path.estimatedMinutes}m</span>
					<span class="meta"><Zap size={12} strokeWidth={1.5} />{path.xpReward} XP</span>
					<span class="meta">{path.stepCount ?? path.steps?.length ?? 0} {$locale === 'fr' ? 'étapes' : 'steps'}</span>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.explore-page {
		max-width: var(--max-width-content);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
	}

	.explore-header {
		text-align: center;
		margin-bottom: var(--space-8);
	}

	.explore-title {
		font-family: var(--font-heading);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0 0 var(--space-3);
	}

	.explore-subtitle {
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--text-secondary);
		margin: 0;
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0 var(--space-4);
		min-height: 44px;
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-1);
		color: var(--text-tertiary);
	}

	.search-box:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-subtle);
	}

	.search-input {
		flex: 1;
		border: none;
		background: none;
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
	}

	.domain-filters {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.filter-chip {
		padding: var(--space-2) var(--space-3);
		min-height: 44px;
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-full);
		background: none;
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
		cursor: pointer;
		transition: all 120ms ease-out;
	}

	.filter-chip.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-subtle);
	}

	.filter-chip:hover:not(.active) {
		border-color: var(--text-tertiary);
	}

	.path-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-6);
	}

	.path-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-6);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 150ms ease-out, transform 150ms ease-out;
	}

	.path-card:hover {
		border-color: var(--accent-muted);
		transform: translateY(-2px);
	}

	@media (prefers-reduced-motion: reduce) {
		.path-card:hover { transform: none; }
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.card-domain {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.card-difficulty {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.card-title {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text-primary);
	}

	.card-desc {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-meta {
		display: flex;
		gap: var(--space-4);
		margin-top: auto;
	}

	.meta {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
