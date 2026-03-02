<script lang="ts">
	import { locale } from '$stores/locale';
	import SEOHead from '$components/shared/SEOHead.svelte';
	import SettingsForm from '$components/settings/SettingsForm.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	// SvelteKit passes route params internally
	export let params: Record<string, string> = {};

	const labels = {
		en: { title: 'Settings' },
		fr: { title: 'Paramètres' }
	};

	$: t = labels[$locale] || labels.en;

	function handleSave(e: CustomEvent) {
		// TODO: POST to /api/v1/users/:userId/preferences
		console.log('Saving preferences:', e.detail);
	}
</script>

<SEOHead locale={$locale} title="{t.title} — Reverse Academy" path="/profile/settings" noindex />

<div class="settings-page">
	<h1 class="page-title">{t.title}</h1>
	<SettingsForm />
</div>

<style>
	.settings-page {
		max-width: var(--max-width-reading);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
	}

	.page-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0 0 var(--space-6) 0;
	}
</style>
