<script lang="ts">
	import { setContext } from 'svelte';
	import { locale, setLocale } from '$stores/locale';
	import SkipLink from '$components/ui/SkipLink.svelte';
	import Navbar from '$components/ui/Navbar.svelte';
	import Footer from '$components/ui/Footer.svelte';
	import KeyboardShortcuts from '$components/ui/KeyboardShortcuts.svelte';
	import ShortcutsHelp from '$components/ui/ShortcutsHelp.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	// SvelteKit router passes route params; declare to suppress warning
	export let params: Record<string, string> = {};

	$: setLocale(data.locale);

	let shortcutsOpen = false;
</script>

<SkipLink />

<KeyboardShortcuts
	on:showHelp={() => (shortcutsOpen = true)}
/>

<ShortcutsHelp bind:open={shortcutsOpen} />

<Navbar
	authenticated={data.authenticated}
/>

<main id="main-content" tabindex="-1">
	<slot />
</main>

<Footer />

<style>
	main {
		min-height: calc(100vh - 160px);
		outline: none;
	}

	main:focus {
		outline: none;
	}
</style>
