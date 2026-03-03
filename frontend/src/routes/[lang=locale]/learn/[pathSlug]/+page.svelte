<script lang="ts">
	import { base } from '$app/paths';
  import { page } from '$app/stores';
  import SEOHead from '$components/shared/SEOHead.svelte';
  import DependencyTree from '$components/learning/DependencyTree.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  // SvelteKit passes route params internally
  export let params: Record<string, string> = {};

  const lang = $page.params.lang ?? 'en';
  const path = data.path;

  const t = {
    en: {
      start: 'Start Path',
      resume: 'Resume',
      steps: 'Steps',
      difficulty: 'Difficulty',
      duration: 'Estimated time',
      xp: 'XP Reward',
      prerequisites: 'Prerequisites',
      overview: 'Overview',
      concepts: 'Concepts you will discover',
      noPrereqs: 'None — great for beginners!',
      backToExplore: 'Back to explore',
    },
    fr: {
      start: 'Commencer le parcours',
      resume: 'Reprendre',
      steps: 'Étapes',
      difficulty: 'Difficulté',
      duration: 'Durée estimée',
      xp: 'Récompense XP',
      prerequisites: 'Prérequis',
      overview: 'Aperçu',
      concepts: 'Concepts que vous allez découvrir',
      noPrereqs: 'Aucun — idéal pour les débutants !',
      backToExplore: "Retour à l'exploration",
    },
  };
  const i = t[lang as keyof typeof t] ?? t.en;

  const difficultyColors: Record<string, string> = {
    beginner: 'var(--success)',
    intermediate: 'var(--accent)',
    advanced: 'var(--error)',
  };
</script>

<SEOHead
  title="{path?.title ?? 'Path'} — Reverse Academy"
  description={path?.description ?? ''}
/>

<main id="main-content" class="min-h-screen" style="background: var(--surface-0);">
  <div class="max-w-4xl mx-auto px-4 py-12">
    <nav class="mb-8" aria-label="Breadcrumb">
      <a href="{base}/{lang}/explore" class="text-sm underline" style="color: var(--accent);">
        {i.backToExplore}
      </a>
    </nav>

    {#if path}
      <header class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <span
            class="inline-block px-3 py-1 rounded-full text-xs font-medium"
            style="color: {difficultyColors[path.difficulty] ?? 'var(--text-secondary)'}; border: 1px solid currentColor;"
          >
            {path.difficulty}
          </span>
          <span class="text-xs" style="color: var(--text-tertiary);">
            {path.domain}
          </span>
        </div>

        <h1
          class="text-4xl font-bold mb-4"
          style="font-family: var(--font-heading); color: var(--text-primary);"
        >
          {path.title}
        </h1>

        <p class="text-lg mb-8" style="color: var(--text-secondary);">
          {path.description}
        </p>

        <div class="flex flex-wrap gap-6 mb-8" style="font-size: var(--text-sm); color: var(--text-tertiary);">
          <div>
            <span class="block" style="color: var(--text-secondary);">{i.steps}</span>
            <span style="color: var(--text-primary);">{path.steps?.length ?? 0}</span>
          </div>
          <div>
            <span class="block" style="color: var(--text-secondary);">{i.duration}</span>
            <span style="color: var(--text-primary);">{path.estimatedMinutes} min</span>
          </div>
          <div>
            <span class="block" style="color: var(--text-secondary);">{i.difficulty}</span>
            <span style="color: {difficultyColors[path.difficulty] ?? 'var(--text-primary)'};">{path.difficulty}</span>
          </div>
          <div>
            <span class="block" style="color: var(--text-secondary);">{i.xp}</span>
            <span style="color: var(--accent);">{path.xpReward} XP</span>
          </div>
        </div>

        <a
          href="{base}/{lang}/learn/{path.slug}/{path.steps?.[0]?.id ?? '1'}"
          class="inline-flex items-center px-8 py-3 rounded-lg font-medium transition-colors"
          style="background: var(--accent); color: var(--text-inverse); min-height: 44px;"
        >
          {i.start}
        </a>
      </header>

      <!-- Steps Overview -->
      <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-6" style="font-family: var(--font-heading); color: var(--text-primary);">
          {i.overview}
        </h2>
        <ol class="space-y-3">
          {#each path.steps ?? [] as step, idx}
            <li
              class="flex items-start gap-4 p-4 rounded-lg"
              style="background: var(--surface-1); border: 1px solid var(--surface-subtle);"
            >
              <span
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style="background: var(--surface-2); color: var(--text-secondary); border: 1px solid var(--surface-subtle);"
              >
                {idx + 1}
              </span>
              <div>
                <h3 class="font-medium" style="color: var(--text-primary);">{step.title}</h3>
                {#if step.type}
                  <span class="text-xs" style="color: var(--text-tertiary);">{step.type}</span>
                {/if}
              </div>
              <span class="ml-auto text-xs" style="color: var(--accent);">
                +{step.xpReward ?? 0} XP
              </span>
            </li>
          {/each}
        </ol>
      </section>

      <!-- Dependency Tree -->
      {#if path.steps && path.steps.length > 1}
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-6" style="font-family: var(--font-heading); color: var(--text-primary);">
            {i.concepts}
          </h2>
          <DependencyTree steps={path.steps} />
        </section>
      {/if}
    {:else}
      <p style="color: var(--text-secondary);">Path not found.</p>
    {/if}
  </div>
</main>
