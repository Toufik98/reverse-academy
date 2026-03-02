<script lang="ts">
	import { page } from '$app/stores';
	import { locale } from '$stores/locale';
	import { getAlternateLocale, localizedPath } from '$lib/i18n';

	$: altLocale = getAlternateLocale($locale);
	$: currentPath = $page.url.pathname;
	$: altPath = localizedPath(currentPath.replace(`/${$locale}`, ''), altLocale);

	const localeNames: Record<string, { en: string; fr: string }> = {
		en: { en: 'English', fr: 'Anglais' },
		fr: { en: 'French', fr: 'Français' }
	};
</script>

<a
	href={altPath}
	class="language-switcher"
	aria-label={$locale === 'fr'
		? `Passer en ${localeNames[altLocale].fr}`
		: `Switch to ${localeNames[altLocale].en}`}
>
	<span class="current-lang">{$locale.toUpperCase()}</span>
	<span class="separator" aria-hidden="true">/</span>
	<span class="alt-lang">{altLocale.toUpperCase()}</span>
</a>

<style>
	.language-switcher {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		min-height: 44px;
		min-width: 44px;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		justify-content: center;
		transition: background-color 120ms ease-out;
	}

	.language-switcher:hover {
		background: var(--surface-2);
	}

	.current-lang {
		color: var(--text-primary);
	}

	.separator {
		color: var(--text-tertiary);
	}

	.alt-lang {
		color: var(--text-tertiary);
	}
</style>
