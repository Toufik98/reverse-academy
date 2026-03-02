<script lang="ts">
	import type { SupportedLocale } from '$types/i18n';
	import { locale as localeStore } from '$stores/locale';

	export let locale: SupportedLocale | undefined = undefined;
	export let title: string = 'Reverse Academy';

	// Fall back to the global locale store if prop not provided
	$: resolvedLocale = locale ?? $localeStore ?? 'en';
	export let description: string = 'Learn by breaking things. Start with a problem, discover the theory.';
	export let path: string = '/';
	export let ogImage: string = '/og-image.png';
	export let noindex: boolean = false;

	const baseUrl = 'https://reverse.academy';
	$: canonicalUrl = `${baseUrl}/${resolvedLocale}${path === '/' ? '' : path}`;
	$: enUrl = `${baseUrl}/en${path === '/' ? '' : path}`;
	$: frUrl = `${baseUrl}/fr${path === '/' ? '' : path}`;
	$: fullTitle = title === 'Reverse Academy' ? title : `${title} — Reverse Academy`;
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<link rel="alternate" hreflang="en" href={enUrl} />
	<link rel="alternate" hreflang="fr" href={frUrl} />
	<link rel="alternate" hreflang="x-default" href={enUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="{baseUrl}{ogImage}" />
	<meta property="og:locale" content={resolvedLocale === 'fr' ? 'fr_FR' : 'en_US'} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{baseUrl}{ogImage}" />

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>
