<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import SEOHead from '$components/shared/SEOHead.svelte';

  // SvelteKit passes route params internally
  export let params: Record<string, string> = {};

  const lang = $page?.params?.lang ?? 'en';
  const token = $page?.params?.token ?? '';

  let status: 'loading' | 'success' | 'error' = 'loading';

  const t = {
    en: {
      title: 'Verify Email',
      loading: 'Verifying your email...',
      success: 'Email verified successfully! You can now log in.',
      error: 'Invalid or expired verification link.',
      loginLink: 'Go to login',
      resend: 'Resend verification email',
    },
    fr: {
      title: "Vérification de l'email",
      loading: 'Vérification en cours...',
      success: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
      error: 'Lien de vérification invalide ou expiré.',
      loginLink: 'Aller à la connexion',
      resend: "Renvoyer l'email de vérification",
    },
  };
  const i = t[lang as keyof typeof t] ?? t.en;

  onMount(async () => {
    try {
      const res = await fetch(`/api/v1/auth/verify-email/${token}`);
      status = res.ok ? 'success' : 'error';
    } catch {
      status = 'error';
    }
  });
</script>

<SEOHead title="{i.title} — Reverse Academy" description="" noindex={true} />

<main id="main-content" class="min-h-screen flex items-center justify-center px-4" style="background: var(--surface-0);">
  <div class="w-full max-w-md text-center" style="background: var(--surface-1); border: 1px solid var(--surface-subtle); border-radius: var(--radius-lg);">
    <div class="p-8">
      <h1 class="text-2xl font-semibold mb-6" style="font-family: var(--font-heading); color: var(--text-primary);">
        {i.title}
      </h1>

      {#if status === 'loading'}
        <p style="color: var(--text-secondary);" aria-live="polite">{i.loading}</p>
        <div
          class="mx-auto mt-4 w-6 h-6 rounded-full border-2 animate-spin"
          style="border-color: var(--surface-subtle); border-top-color: var(--accent);"
          role="status"
          aria-label={i.loading}
        ></div>
      {:else if status === 'success'}
        <div role="alert" class="p-4 mb-6 rounded-lg" style="background: var(--success-muted); color: var(--success);">
          <svg class="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p>{i.success}</p>
        </div>
        <a
          href="/{lang}/auth/login"
          class="inline-block px-6 py-3 rounded-lg font-medium"
          style="background: var(--accent); color: var(--text-inverse); min-height: 44px; line-height: 44px;"
        >
          {i.loginLink}
        </a>
      {:else}
        <div role="alert" class="p-4 mb-6 rounded-lg" style="background: var(--error-muted); color: var(--error);">
          <svg class="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p>{i.error}</p>
        </div>
        <a
          href="/{lang}/auth/login"
          class="inline-block px-6 py-3 rounded-lg font-medium"
          style="background: var(--accent); color: var(--text-inverse); min-height: 44px; line-height: 44px;"
        >
          {i.loginLink}
        </a>
      {/if}
    </div>
  </div>
</main>

<style>
  @media (prefers-reduced-motion: reduce) {
    .animate-spin {
      animation: none;
    }
  }
</style>
