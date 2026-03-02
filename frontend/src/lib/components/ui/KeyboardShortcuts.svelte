<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';

	const dispatch = createEventDispatcher<{
		run: void;
		closePanel: void;
		nextStep: void;
		prevStep: void;
		toggleHint: void;
		toggleTutor: void;
		showHelp: void;
	}>();

	export let editorFocused: boolean = false;

	function handleKeydown(e: KeyboardEvent) {
		// Cmd/Ctrl+Enter → Run code
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			dispatch('run');
			return;
		}

		// Cmd/Ctrl+S → Intercept (no-op / auto-save)
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			return;
		}

		// Escape → Close active panel
		if (e.key === 'Escape') {
			dispatch('closePanel');
			return;
		}

		// Don't fire navigation shortcuts while typing in editor
		if (editorFocused) return;

		// ? → Shortcuts help overlay
		if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
			e.preventDefault();
			dispatch('showHelp');
			return;
		}

		// Alt+→ → Next step
		if (e.altKey && e.key === 'ArrowRight') {
			e.preventDefault();
			dispatch('nextStep');
			return;
		}

		// Alt+← → Previous step
		if (e.altKey && e.key === 'ArrowLeft') {
			e.preventDefault();
			dispatch('prevStep');
			return;
		}

		// Alt+H → Toggle hint drawer
		if (e.altKey && (e.key === 'h' || e.key === 'H')) {
			e.preventDefault();
			dispatch('toggleHint');
			return;
		}

		// Alt+T → Toggle tutor panel
		if (e.altKey && (e.key === 't' || e.key === 'T')) {
			e.preventDefault();
			dispatch('toggleTutor');
			return;
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>
