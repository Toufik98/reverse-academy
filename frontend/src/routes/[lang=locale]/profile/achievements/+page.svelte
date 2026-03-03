<script lang="ts">
	import { base } from '$app/paths';
  import { page } from '$app/stores';
  import SEOHead from '$components/shared/SEOHead.svelte';
  import AchievementGrid from '$components/gamification/AchievementGrid.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  // SvelteKit passes route params internally
  export let params: Record<string, string> = {};

  const lang = $page.params.lang ?? 'en';

  const t = {
    en: {
      title: 'Achievements',
      description: 'Track your earned achievements and progress milestones.',
      earned: 'Earned',
      locked: 'Locked',
      backToProfile: 'Back to profile',
      total: 'Total',
    },
    fr: {
      title: 'Succès',
      description: 'Suivez vos succès obtenus et vos jalons de progression.',
      earned: 'Obtenus',
      locked: 'Verrouillés',
      backToProfile: 'Retour au profil',
      total: 'Total',
    },
  };
  const i = t[lang as keyof typeof t] ?? t.en;

  $: allAchievements = data.achievements ?? [];
  $: userAchievements = data.userAchievements ?? [];
  $: earnedCount = userAchievements.length;
  $: totalCount = allAchievements.length;
</script>

<SEOHead title="{i.title} — Reverse Academy" description={i.description} />

<main id="main-content" class="min-h-screen" style="background: var(--surface-0);">
  <div class="max-w-4xl mx-auto px-4 py-12">
    <nav class="mb-8" aria-label="Breadcrumb">
      <a href="{base}/{lang}/profile" class="text-sm underline" style="color: var(--accent);">
        {i.backToProfile}
      </a>
    </nav>

    <h1 class="text-3xl font-bold mb-2" style="font-family: var(--font-heading); color: var(--text-primary);">
      {i.title}
    </h1>

    <div class="flex items-center gap-6 mb-8" style="font-size: var(--text-sm); color: var(--text-secondary);">
      <span>
        {i.earned}: <strong style="color: var(--accent);">{earnedCount}</strong>
      </span>
      <span>
        {i.locked}: <strong style="color: var(--text-tertiary);">{totalCount - earnedCount}</strong>
      </span>
      <span>
        {i.total}: <strong style="color: var(--text-primary);">{totalCount}</strong>
      </span>
    </div>

    <AchievementGrid achievements={allAchievements} earned={userAchievements} />
  </div>
</main>
