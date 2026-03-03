<script lang="ts">
	import { base } from '$app/paths';
  import { page } from '$app/stores';
  import SEOHead from '$components/shared/SEOHead.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  // SvelteKit passes route params internally
  export let params: Record<string, string> = {};

  const lang = $page.params.lang ?? 'en';
  const domain = $page.params.domain;

  const t = {
    en: {
      title: `Explore ${domain} Paths`,
      description: `Browse learning paths in the ${domain} domain.`,
      backToAll: 'All domains',
      difficulty: 'Difficulty',
      duration: 'Duration',
      steps: 'steps',
      start: 'Start',
      empty: 'No learning paths available in this domain yet.',
    },
    fr: {
      title: `Explorer les parcours ${domain}`,
      description: `Parcourez les chemins d'apprentissage dans le domaine ${domain}.`,
      backToAll: 'Tous les domaines',
      difficulty: 'Difficulté',
      duration: 'Durée',
      steps: 'étapes',
      start: 'Commencer',
      empty: "Aucun parcours d'apprentissage disponible dans ce domaine pour le moment.",
    },
  };
  const i = t[lang as keyof typeof t] ?? t.en;
</script>

<SEOHead title="{i.title} — Reverse Academy" description={i.description} />

<main id="main-content" class="min-h-screen" style="background: var(--surface-0);">
  <div class="max-w-5xl mx-auto px-4 py-12">
    <nav class="mb-8" aria-label="Breadcrumb">
      <a href="{base}/{lang}/explore" class="text-sm underline" style="color: var(--accent);">
        {i.backToAll}
      </a>
      <span class="mx-2" style="color: var(--text-tertiary);">/</span>
      <span class="text-sm" style="color: var(--text-secondary);">{domain}</span>
    </nav>

    <h1 class="text-3xl font-bold mb-8" style="font-family: var(--font-heading); color: var(--text-primary);">
      {i.title}
    </h1>

    {#if data.paths && data.paths.length > 0}
      <div class="grid gap-6 md:grid-cols-2">
        {#each data.paths as path}
          <a
            href="{base}/{lang}/learn/{path.slug}"
            class="block p-6 transition-transform"
            style="
              background: var(--surface-1);
              border: 1px solid var(--surface-subtle);
              border-radius: var(--radius-lg);
            "
          >
            <h2 class="text-xl font-semibold mb-2" style="font-family: var(--font-heading); color: var(--text-primary);">
              {path.title}
            </h2>
            <p class="mb-4" style="color: var(--text-secondary); font-size: var(--text-sm);">
              {path.description}
            </p>
            <div class="flex items-center gap-4" style="font-size: var(--text-xs); color: var(--text-tertiary);">
              <span>{i.difficulty}: {path.difficulty}</span>
              <span>{path.estimatedMinutes} min</span>
              <span>{path.steps?.length ?? 0} {i.steps}</span>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <p style="color: var(--text-secondary);">{i.empty}</p>
    {/if}
  </div>
</main>

<style>
  a[href*="/learn/"] {
    will-change: transform;
  }
  a[href*="/learn/"]:hover {
    border-color: var(--accent-muted) !important;
    transform: translateY(-2px);
  }
  @media (prefers-reduced-motion: reduce) {
    a[href*="/learn/"]:hover {
      transform: none;
    }
  }
</style>
