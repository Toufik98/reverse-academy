<script lang="ts">
	import { locale } from '$stores/locale';
	import { goto } from '$app/navigation';
	import SEOHead from '$components/shared/SEOHead.svelte';
	import ProblemPresenter from '$components/learning/ProblemPresenter.svelte';
	import CodeSandbox from '$components/learning/CodeSandbox.svelte';
	import TheoryRevealer from '$components/learning/TheoryRevealer.svelte';
	import HintDrawer from '$components/learning/HintDrawer.svelte';
	import StepNavigator from '$components/learning/StepNavigator.svelte';
	import TutorAgent from '$components/tutor/TutorAgent.svelte';
	import KeyboardShortcuts from '$components/ui/KeyboardShortcuts.svelte';
	import { tutorStore } from '$stores/tutor';
	import { validateStep } from '$engine/step-validator';
	import type { ExecutionResult, SupportedLanguage } from '$types/execution';
	import type { ChallengeContent, RevealContent, SandboxContent } from '$types/path';
	import type { PageData } from './$types';

	export let data: PageData;
	// SvelteKit passes route params internally
	export let params: Record<string, string> = {};

	$: ({ path, step, stepId, pathSlug } = data);

	let hintOpen = false;
	let tutorOpen = true;
	let theoryRevealed = false;
	let editorFocused = false;
	let currentCode = '';
	let stepStatuses: Record<string, import('$types/progress').StepStatus> = {};

	// Type-safe content access
	$: isChallenge = step.type === 'challenge';
	$: isSandbox = step.type === 'sandbox';
	$: isReveal = step.type === 'reveal';
	$: challengeContent = isChallenge ? (step.content as ChallengeContent) : null;
	$: sandboxContent = isSandbox ? (step.content as SandboxContent) : null;
	$: revealContent = isReveal ? (step.content as RevealContent) : null;

	// Get code and language for the editor
	$: editorCode = challengeContent?.code || sandboxContent?.initialCode || '';
	$: editorLanguage = (challengeContent?.language || sandboxContent?.language || 'typescript') as SupportedLanguage;

	// Get theory content (from reveal steps or after unlocking on challenge steps)
	$: theoryText = revealContent?.theory || '';
	$: keyInsightText = revealContent?.keyInsight || '';
	$: expandSections = revealContent?.expandableSections || [];

	// Derive hint from step-level or content-level
	$: stepHint = step.hint || challengeContent?.hint || '';

	// Initialize step statuses
	$: {
		const statuses: Record<string, import('$types/progress').StepStatus> = {};
		const currentIndex = path.steps.findIndex((s) => s.id === stepId);
		path.steps.forEach((s, i) => {
			if (i < currentIndex) statuses[s.id] = 'completed';
			else if (i === currentIndex) statuses[s.id] = 'in-progress';
			else statuses[s.id] = 'locked';
		});
		// First uncompleted step is available
		if (currentIndex + 1 < path.steps.length) {
			statuses[path.steps[currentIndex + 1].id] = 'available';
		}
		stepStatuses = statuses;
	}

	async function handleExecute(e: CustomEvent<ExecutionResult>) {
		const result = e.detail;

		if (step.type === 'challenge' || step.type === 'sandbox') {
			const validation = validateStep(step, currentCode, result);

			if (validation.correct) {
				theoryRevealed = true;
				stepStatuses[stepId] = 'completed';
				stepStatuses = { ...stepStatuses };
				tutorStore.transitionTo('CONCEPT_UNLOCKED');
			} else {
				tutorStore.recordAttempt(result);
			}
		}
	}

	function navigateToStep(e: CustomEvent<{ stepId: string }>) {
		goto(`/${$locale}/learn/${pathSlug}/${e.detail.stepId}`);
	}

	function handleNextStep() {
		const currentIndex = path.steps.findIndex((s) => s.id === stepId);
		if (currentIndex < path.steps.length - 1) {
			goto(`/${$locale}/learn/${pathSlug}/${path.steps[currentIndex + 1].id}`);
		}
	}

	function handlePrevStep() {
		const currentIndex = path.steps.findIndex((s) => s.id === stepId);
		if (currentIndex > 0) {
			goto(`/${$locale}/learn/${pathSlug}/${path.steps[currentIndex - 1].id}`);
		}
	}

	function handleCodeChange(e: CustomEvent<string>) {
		currentCode = e.detail;
	}
</script>

<SEOHead locale={$locale} title="{step.title} — {path.title}" path="/learn/{pathSlug}/{stepId}" noindex />

<KeyboardShortcuts
	{editorFocused}
	on:toggleHint={() => (hintOpen = !hintOpen)}
	on:toggleTutor={() => (tutorOpen = !tutorOpen)}
	on:nextStep={handleNextStep}
	on:prevStep={handlePrevStep}
	on:closePanel={() => { hintOpen = false; tutorOpen = false; }}
/>

<div class="learn-layout">
	<!-- Main content -->
	<div class="learn-main">
		<StepNavigator
			steps={path.steps}
			currentStepId={stepId}
			{stepStatuses}
			{pathSlug}
			on:navigate={navigateToStep}
		/>

		<h1 class="step-title">{step.title}</h1>

		{#if step.content && (isChallenge || isSandbox)}
			<ProblemPresenter content={challengeContent || sandboxContent} />
		{/if}

		{#if isChallenge || isSandbox}
			<CodeSandbox
				initialCode={editorCode}
				language={editorLanguage}
				{pathSlug}
				{stepId}
				on:execute={handleExecute}
				on:codeChange={handleCodeChange}
			/>
		{/if}

		{#if isReveal || theoryRevealed}
			<TheoryRevealer
				theory={theoryText}
				keyInsight={keyInsightText}
				expandableSections={expandSections}
				revealed={isReveal || theoryRevealed}
			/>
		{/if}
	</div>

	<!-- Sidebar: Tutor -->
	<aside class="learn-sidebar">
		<TutorAgent bind:open={tutorOpen} />
	</aside>
</div>

<!-- Hint drawer (overlay) -->
<HintDrawer hint={stepHint} bind:open={hintOpen} />

<style>
	.learn-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 0;
		max-width: var(--max-width-content);
		margin: 0 auto;
		min-height: calc(100vh - 160px);
	}

	@media (max-width: 1024px) {
		.learn-layout {
			grid-template-columns: 1fr;
		}

		.learn-sidebar {
			display: none;
		}
	}

	.learn-main {
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: var(--max-width-reading);
	}

	.step-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}

	.learn-sidebar {
		border-left: 1px solid var(--surface-subtle);
	}
</style>
