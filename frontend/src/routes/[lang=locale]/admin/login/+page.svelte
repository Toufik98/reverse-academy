<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { createAdminT } from '$lib/i18n/admin';
	import type { SupportedLocale } from '$types/i18n';

	let token = '';
	let error = '';
	let loading = false;

	$: lang = $page.params.lang as SupportedLocale;
	$: t = createAdminT(lang);

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			// Validate token against the admin stats endpoint
			const res = await fetch('/api/v1/admin/stats', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (res.ok) {
				// Store token in cookie (httpOnly=false so JS can read; short-lived admin session)
				document.cookie = `ra-admin-token=${token}; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
				goto(`${base}/${lang}/admin`);
			} else if (res.status === 401) {
				error = t('login.invalidToken');
			} else {
				error = `${t('login.serverError')} (${res.status})`;
			}
		} catch (e) {
			error = t('login.connectError');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{t('login.title')} — Reverse Academy</title>
</svelte:head>

<div class="login-wrapper">
	<div class="login-card">
		<div class="login-header">
			<span class="login-logo">RA</span>
			<h1>{t('login.title')}</h1>
			<p>{t('login.subtitle')}</p>
		</div>

		<form on:submit|preventDefault={handleLogin} class="login-form">
			<div class="field">
				<label for="admin-token">{t('login.label')}</label>
				<input
					id="admin-token"
					type="password"
					bind:value={token}
					placeholder={t('login.placeholder')}
					required
					autocomplete="off"
					class:error-input={!!error}
				/>
				{#if error}
					<span class="error-msg" role="alert">{error}</span>
				{/if}
			</div>

			<button type="submit" class="login-btn" disabled={loading || !token}>
				{#if loading}
					<span class="spinner" aria-hidden="true"></span>
					{t('login.verifying')}
				{:else}
					{t('login.submit')}
				{/if}
			</button>
		</form>

		<div class="login-footer">
			<a href="{base}/{lang}" class="back-link">{t('login.backToSite')}</a>
		</div>
	</div>
</div>

<style>
	.login-wrapper {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface-0);
		padding: var(--space-4);
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-8);
	}

	.login-header {
		text-align: center;
		margin-bottom: var(--space-8);
	}

	.login-logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: var(--accent);
		color: var(--text-inverse);
		border-radius: var(--radius-md);
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: var(--text-lg);
		margin-bottom: var(--space-4);
	}

	.login-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-2);
	}

	.login-header p {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.field input {
		padding: var(--space-3) var(--space-4);
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		outline: none;
		transition: border-color 0.15s;
	}

	.field input:focus {
		border-color: var(--accent);
	}

	.field input.error-input {
		border-color: var(--error);
	}

	.error-msg {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--error);
	}

	.login-btn {
		padding: var(--space-3) var(--space-4);
		background: var(--accent);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: 44px;
	}

	.login-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.login-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.login-footer {
		text-align: center;
		margin-top: var(--space-6);
	}

	.back-link {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		text-decoration: none;
	}

	.back-link:hover {
		color: var(--text-secondary);
	}
</style>
