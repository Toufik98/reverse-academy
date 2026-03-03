<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { locale } from '$stores/locale';
	import SEOHead from '$components/shared/SEOHead.svelte';

	$: status = $page.status;
	$: message = $page.error?.message || '';

	const labels = {
		en: {
			'404': {
				title: 'Page Not Found',
				description: 'The page you are looking for does not exist or has been moved.',
				action: 'Back to Home'
			},
			'500': {
				title: 'Something Went Wrong',
				description: 'An unexpected error occurred. Please try again later.',
				action: 'Back to Home'
			},
			default: {
				title: 'Error',
				description: 'Something unexpected happened.',
				action: 'Back to Home'
			}
		},
		fr: {
			'404': {
				title: 'Page Introuvable',
				description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
				action: 'Retour à l\'accueil'
			},
			'500': {
				title: 'Une Erreur est Survenue',
				description: 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.',
				action: 'Retour à l\'accueil'
			},
			default: {
				title: 'Erreur',
				description: 'Quelque chose d\'inattendu s\'est produit.',
				action: 'Retour à l\'accueil'
			}
		}
	};

	$: loc = labels[$locale] || labels.en;
	$: errorLabels = loc[String(status) as keyof typeof loc] || loc.default;
</script>

<SEOHead locale={$locale} title="{errorLabels.title} — Reverse Academy" path="" noindex />

<div class="error-page">
	<span class="error-code">{status}</span>
	<h1 class="error-title">{errorLabels.title}</h1>
	<p class="error-description">{errorLabels.description}</p>
	{#if message}
		<p class="error-detail">{message}</p>
	{/if}
	<a href="{base}/{$locale}" class="error-cta">
		{errorLabels.action}
	</a>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 200px);
		padding: var(--space-8) var(--space-6);
		text-align: center;
		gap: var(--space-4);
	}

	.error-code {
		font-family: var(--font-heading);
		font-size: clamp(4rem, 10vw, 8rem);
		font-weight: 800;
		color: var(--accent);
		line-height: 1;
		opacity: 0.3;
	}

	.error-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}

	.error-description {
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--text-secondary);
		max-width: 480px;
		margin: 0;
	}

	.error-detail {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		max-width: 480px;
		margin: 0;
	}

	.error-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: var(--space-3) var(--space-6);
		background: var(--accent);
		color: var(--text-inverse);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: background 150ms ease;
		margin-top: var(--space-4);
	}

	.error-cta:hover {
		background: var(--accent-hover);
	}

	@media (prefers-reduced-motion: reduce) {
		.error-cta {
			transition: none;
		}
	}
</style>
