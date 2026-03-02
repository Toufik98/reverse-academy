<script lang="ts">
	import { locale } from '$stores/locale';
	import OnboardingFlow from '$components/onboarding/OnboardingFlow.svelte';
	import SEOHead from '$components/shared/SEOHead.svelte';
	import { goto } from '$app/navigation';

	// SvelteKit passes route params internally
	export let params: Record<string, string> = {};

	function handleComplete() {
		goto(`/${$locale}/explore`);
	}
</script>

<SEOHead locale={$locale} title={$locale === 'fr' ? 'Bienvenue — Reverse Academy' : 'Welcome — Reverse Academy'} path="/onboarding" noindex />

<div class="onboarding-page">
	<OnboardingFlow on:complete={handleComplete} />
</div>

<style>
	.onboarding-page {
		min-height: calc(100vh - 120px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-6);
	}
</style>
