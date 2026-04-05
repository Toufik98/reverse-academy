<script lang="ts">
	import { locale } from '$stores/locale';
	import SEOHead from '$components/shared/SEOHead.svelte';
	import SettingsForm from '$components/settings/SettingsForm.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	export let params: Record<string, string> = {};

	const labels = {
		en: { title: 'Settings' },
		fr: { title: 'Paramètres' }
	};

	$: t = labels[$locale] || labels.en;
	$: userId = data.userId;

	async function handleSave(e: CustomEvent) {
		const prefs = e.detail;
		try {
			const res = await fetch(`/api/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					locale: prefs.locale,
					theme: prefs.theme,
					editor_font_size: prefs.editorFontSize,
					editor_tab_size: prefs.editorTabSize
				})
			});
			if (!res.ok) {
				console.error('Failed to save preferences');
			}
		} catch (err) {
			console.error('Error saving preferences:', err);
		}
	}
</script>

<SEOHead locale={$locale} title="{t.title} — Reverse Academy" path="/profile/settings" noindex />

<div class="settings-page">
	<h1 class="page-title">{t.title}</h1>
	<SettingsForm on:save={handleSave} />
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
