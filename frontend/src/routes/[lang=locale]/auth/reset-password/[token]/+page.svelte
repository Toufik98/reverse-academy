<script lang="ts">
	import { base } from '$app/paths';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import type { ActionData } from './$types';
  import SEOHead from '$components/shared/SEOHead.svelte';

  export let form: ActionData;
  // SvelteKit passes route params internally
  export let params: Record<string, string> = {};

  const lang = $page?.params?.lang ?? 'en';
  const token = $page?.params?.token ?? '';

  const t = {
    en: {
      title: 'Reset Password',
      description: 'Enter your new password.',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      submit: 'Reset Password',
      success: 'Password reset successfully. You can now log in.',
      loginLink: 'Go to login',
      error: 'Invalid or expired reset link.',
      mismatch: 'Passwords do not match.',
      tooShort: 'Password must be at least 8 characters.',
    },
    fr: {
      title: 'Réinitialiser le mot de passe',
      description: 'Entrez votre nouveau mot de passe.',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      submit: 'Réinitialiser',
      success: 'Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.',
      loginLink: 'Aller à la connexion',
      error: 'Lien invalide ou expiré.',
      mismatch: 'Les mots de passe ne correspondent pas.',
      tooShort: 'Le mot de passe doit contenir au moins 8 caractères.',
    },
  };
  const i = t[lang as keyof typeof t] ?? t.en;
</script>

<SEOHead title="{i.title} — Reverse Academy" description={i.description} noindex={true} />

<main id="main-content" class="min-h-screen flex items-center justify-center px-4" style="background: var(--surface-0);">
  <div class="w-full max-w-md" style="background: var(--surface-1); border: 1px solid var(--surface-subtle); border-radius: var(--radius-lg);">
    <div class="p-8">
      <h1 class="text-2xl font-semibold mb-2" style="font-family: var(--font-heading); color: var(--text-primary);">
        {i.title}
      </h1>

      {#if form?.success}
        <div role="alert" class="p-4 mb-6 rounded-lg" style="background: var(--success-muted); color: var(--success);">
          <p>{i.success}</p>
          <a href="{base}/{lang}/auth/login" class="underline mt-2 inline-block" style="color: var(--accent);">{i.loginLink}</a>
        </div>
      {:else}
        {#if form?.error}
          <div role="alert" class="p-4 mb-6 rounded-lg" style="background: var(--error-muted); color: var(--error);">
            {form.message ?? i.error}
          </div>
        {/if}

        <form method="POST" use:enhance>
          <input type="hidden" name="token" value={token} />

          <label class="block mb-4">
            <span class="block mb-1" style="color: var(--text-secondary); font-size: var(--text-sm);">{i.newPassword}</span>
            <input
              type="password"
              name="password"
              required
              minlength={8}
              autocomplete="new-password"
              class="w-full px-4 py-3 rounded-lg outline-none"
              style="background: var(--surface-2); color: var(--text-primary); border: 1px solid var(--surface-subtle); min-height: 44px;"
            />
          </label>

          <label class="block mb-6">
            <span class="block mb-1" style="color: var(--text-secondary); font-size: var(--text-sm);">{i.confirmPassword}</span>
            <input
              type="password"
              name="confirmPassword"
              required
              minlength={8}
              autocomplete="new-password"
              class="w-full px-4 py-3 rounded-lg outline-none"
              style="background: var(--surface-2); color: var(--text-primary); border: 1px solid var(--surface-subtle); min-height: 44px;"
            />
          </label>

          <button
            type="submit"
            class="w-full py-3 rounded-lg font-medium"
            style="background: var(--accent); color: var(--text-inverse); min-height: 44px;"
          >
            {i.submit}
          </button>
        </form>
      {/if}
    </div>
  </div>
</main>
