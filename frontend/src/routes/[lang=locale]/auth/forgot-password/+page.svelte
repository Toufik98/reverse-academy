<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import SEOHead from '$components/shared/SEOHead.svelte';

  export let form: ActionData;
  // SvelteKit passes route params internally
  export let params: Record<string, string> = {};

  const lang = $page?.params?.lang ?? 'en';
  const t = {
    en: {
      title: 'Forgot Password',
      description: 'Enter your email to receive a password reset link.',
      email: 'Email address',
      submit: 'Send Reset Link',
      backToLogin: 'Back to login',
      success: 'If an account with that email exists, we sent a reset link.',
      error: 'Something went wrong. Please try again.',
    },
    fr: {
      title: 'Mot de passe oublié',
      description: 'Entrez votre email pour recevoir un lien de réinitialisation.',
      email: 'Adresse email',
      submit: 'Envoyer le lien',
      backToLogin: 'Retour à la connexion',
      success: "Si un compte avec cet email existe, nous avons envoyé un lien de réinitialisation.",
      error: 'Une erreur est survenue. Veuillez réessayer.',
    },
  };
  const i = t[lang as keyof typeof t] ?? t.en;

  import { page } from '$app/stores';
</script>

<SEOHead
  title="{i.title} — Reverse Academy"
  description={i.description}
  noindex={true}
/>

<main id="main-content" class="min-h-screen flex items-center justify-center px-4" style="background: var(--surface-0);">
  <div class="w-full max-w-md" style="background: var(--surface-1); border: 1px solid var(--surface-subtle); border-radius: var(--radius-lg);">
    <div class="p-8">
      <h1 class="text-2xl font-semibold mb-2" style="font-family: var(--font-heading); color: var(--text-primary);">
        {i.title}
      </h1>
      <p class="mb-6" style="color: var(--text-secondary); font-size: var(--text-sm);">
        {i.description}
      </p>

      {#if form?.success}
        <div
          role="alert"
          class="p-4 mb-6 rounded-lg"
          style="background: var(--success-muted); color: var(--success); border: 1px solid var(--success);"
        >
          {i.success}
        </div>
      {/if}

      {#if form?.error}
        <div
          role="alert"
          class="p-4 mb-6 rounded-lg"
          style="background: var(--error-muted); color: var(--error); border: 1px solid var(--error);"
        >
          {i.error}
        </div>
      {/if}

      <form method="POST" use:enhance>
        <label class="block mb-4">
          <span class="block mb-1" style="color: var(--text-secondary); font-size: var(--text-sm);">{i.email}</span>
          <input
            type="email"
            name="email"
            required
            autocomplete="email"
            class="w-full px-4 py-3 rounded-lg outline-none transition-colors"
            style="background: var(--surface-2); color: var(--text-primary); border: 1px solid var(--surface-subtle); min-height: 44px;"
          />
        </label>

        <button
          type="submit"
          class="w-full py-3 rounded-lg font-medium transition-colors"
          style="background: var(--accent); color: var(--text-inverse); min-height: 44px;"
        >
          {i.submit}
        </button>
      </form>

      <p class="mt-6 text-center" style="color: var(--text-secondary); font-size: var(--text-sm);">
        <a href="/{lang}/auth/login" class="underline" style="color: var(--accent);">
          {i.backToLogin}
        </a>
      </p>
    </div>
  </div>
</main>
