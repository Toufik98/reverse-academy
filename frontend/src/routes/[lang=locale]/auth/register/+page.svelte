<script lang="ts">
	import { locale } from '$stores/locale';
	import { base } from '$app/paths';
	import SEOHead from '$components/shared/SEOHead.svelte';

	// SvelteKit passes route params internally
	export let params: Record<string, string> = {};

	let email = '';
	let username = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	const copy = {
		en: {
			title: 'Create account',
			email: 'Email',
			username: 'Username',
			password: 'Password',
			confirmPassword: 'Confirm password',
			submit: 'Create Account',
			loading: 'Creating...',
			hasAccount: 'Already have an account?',
			login: 'Sign in',
			or: 'or',
			github: 'Continue with GitHub'
		},
		fr: {
			title: 'Créer un compte',
			email: 'E-mail',
			username: "Nom d'utilisateur",
			password: 'Mot de passe',
			confirmPassword: 'Confirmer le mot de passe',
			submit: 'Créer le compte',
			loading: 'Création...',
			hasAccount: 'Déjà un compte ?',
			login: 'Se connecter',
			or: 'ou',
			github: 'Continuer avec GitHub'
		}
	};

	$: t = copy[$locale] || copy.en;

	async function handleSubmit() {
		if (password !== confirmPassword) {
			error = $locale === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match';
			return;
		}

		loading = true;
		error = '';

		try {
			const res = await fetch(`/${$locale}/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, username, password })
			});

			if (!res.ok) {
				const data = await res.json();
				error = data.message || 'Registration failed';
				return;
			}

			window.location.href = `${base}/${$locale}/onboarding`;
		} catch {
			error = $locale === 'fr' ? 'Erreur réseau' : 'Network error';
		} finally {
			loading = false;
		}
	}
</script>

<SEOHead locale={$locale} title={t.title} path="/auth/register" noindex />

<div class="auth-page">
	<div class="auth-card">
		<h1 class="auth-title">{t.title}</h1>

		{#if error}
			<div class="auth-error" role="alert">{error}</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="auth-form">
			<div class="field">
				<label for="username" class="field-label">{t.username}</label>
				<input id="username" type="text" bind:value={username} required autocomplete="username" class="field-input" />
			</div>

			<div class="field">
				<label for="email" class="field-label">{t.email}</label>
				<input id="email" type="email" bind:value={email} required autocomplete="email" class="field-input" />
			</div>

			<div class="field">
				<label for="password" class="field-label">{t.password}</label>
				<input id="password" type="password" bind:value={password} required minlength="8" autocomplete="new-password" class="field-input" />
			</div>

			<div class="field">
				<label for="confirm-password" class="field-label">{t.confirmPassword}</label>
				<input id="confirm-password" type="password" bind:value={confirmPassword} required minlength="8" autocomplete="new-password" class="field-input" />
			</div>

			<button type="submit" class="auth-submit" disabled={loading}>
				{loading ? t.loading : t.submit}
			</button>
		</form>

		<div class="auth-divider"><span>{t.or}</span></div>

		<a href="{base}/{$locale}/auth/github" class="github-btn">{t.github}</a>

		<p class="auth-footer">
			{t.hasAccount}
			<a href="{base}/{$locale}/auth/login">{t.login}</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: var(--space-16) var(--space-6);
		min-height: calc(100vh - 200px);
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.auth-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
		text-align: center;
	}

	.auth-error {
		padding: var(--space-3) var(--space-4);
		background: var(--error-muted);
		border: 1px solid var(--error);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--error);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.field-input {
		width: 100%;
		padding: var(--space-3);
		min-height: 44px;
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		background: var(--surface-1);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-base);
	}

	.field-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-subtle);
	}

	.auth-submit {
		min-height: 44px;
		padding: var(--space-3);
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

	.auth-submit:hover:not(:disabled) { background: var(--accent-hover); }
	.auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }

	.auth-divider {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--text-tertiary);
		font-size: var(--text-sm);
	}

	.auth-divider::before,
	.auth-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--surface-subtle);
	}

	.github-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 44px;
		padding: var(--space-3);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		background: none;
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		text-decoration: none;
		transition: background 120ms ease-out;
	}

	.github-btn:hover { background: var(--surface-2); }

	.auth-footer {
		text-align: center;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.auth-footer a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
</style>
