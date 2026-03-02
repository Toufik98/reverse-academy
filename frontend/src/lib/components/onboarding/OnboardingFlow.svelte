<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import WelcomeStep from './WelcomeStep.svelte';
	import InterestPicker from './InterestPicker.svelte';
	import SkillAssessment from './SkillAssessment.svelte';
	import MicroChallenge from './MicroChallenge.svelte';
	import { locale } from '$stores/locale';
	import { reducedMotion } from '$stores/reducedMotion';

	const dispatch = createEventDispatcher<{
		complete: { interests: string[]; skillLevel: string };
	}>();

	let currentStep = 0;
	let interests: string[] = [];
	let skillLevel = 'beginner';

	const totalSteps = 4;

	function next() {
		if (currentStep < totalSteps - 1) {
			currentStep += 1;
		} else {
			dispatch('complete', { interests, skillLevel });
		}
	}

	function skip() {
		next();
	}

	function handleInterests(e: CustomEvent<string[]>) {
		interests = e.detail;
	}

	function handleSkill(e: CustomEvent<string>) {
		skillLevel = e.detail;
	}
</script>

<div class="onboarding-flow" role="region" aria-label={$locale === 'fr' ? 'Intégration' : 'Onboarding'}>
	<!-- Step indicators -->
	<div class="step-indicators" role="group" aria-label={$locale === 'fr' ? 'Étapes' : 'Steps'}>
		{#each Array(totalSteps) as _, i}
			<div class="indicator" class:active={i === currentStep} class:done={i < currentStep}></div>
		{/each}
	</div>

	<!-- Step content -->
	<div class="step-content">
		{#if currentStep === 0}
			<div transition:fly={{ x: 100, duration: $reducedMotion ? 0 : 250 }}>
				<WelcomeStep on:continue={next} />
			</div>
		{:else if currentStep === 1}
			<div transition:fly={{ x: 100, duration: $reducedMotion ? 0 : 250 }}>
				<InterestPicker on:select={handleInterests} on:continue={next} />
			</div>
		{:else if currentStep === 2}
			<div transition:fly={{ x: 100, duration: $reducedMotion ? 0 : 250 }}>
				<SkillAssessment on:select={handleSkill} on:continue={next} on:skip={skip} />
			</div>
		{:else if currentStep === 3}
			<div transition:fly={{ x: 100, duration: $reducedMotion ? 0 : 250 }}>
				<MicroChallenge on:complete={next} />
			</div>
		{/if}
	</div>
</div>

<style>
	.onboarding-flow {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.step-indicators {
		display: flex;
		justify-content: center;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
	}

	.indicator {
		width: 32px;
		height: 3px;
		border-radius: 2px;
		background: var(--surface-3);
		transition: background 200ms ease-out;
	}

	.indicator.active {
		background: var(--accent);
	}

	.indicator.done {
		background: var(--success);
	}

	.step-content {
		min-height: 400px;
	}
</style>
