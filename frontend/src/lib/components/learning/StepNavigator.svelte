<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronLeft, ChevronRight, Check } from 'lucide-svelte';
	import { locale } from '$stores/locale';
	import type { Step } from '$types/path';
	import type { StepStatus } from '$types/progress';

	export let steps: Step[] = [];
	export let currentStepId: string = '';
	export let stepStatuses: Record<string, StepStatus> = {};
	export let pathSlug: string = '';

	const dispatch = createEventDispatcher<{
		navigate: { stepId: string };
	}>();

	$: currentIndex = steps.findIndex((s) => s.id === currentStepId);
	$: prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
	$: nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
	$: completedCount = Object.values(stepStatuses).filter((s) => s === 'completed').length;
	$: progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

	function goTo(stepId: string) {
		dispatch('navigate', { stepId });
	}
</script>

<nav class="step-navigator" aria-label={$locale === 'fr' ? 'Navigation des étapes' : 'Step navigation'}>
	<!-- Progress bar -->
	<div class="progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
		<div class="progress-fill" style="width: {progressPct}%"></div>
	</div>

	<div class="nav-content">
		<!-- Prev -->
		<button
			class="nav-btn"
			disabled={!prevStep}
			on:click={() => prevStep && goTo(prevStep.id)}
			aria-label={$locale === 'fr' ? 'Étape précédente' : 'Previous step'}
		>
			<ChevronLeft size={18} strokeWidth={1.5} />
		</button>

		<!-- Step indicators -->
		<div class="step-indicators">
			{#each steps as step, i}
				{@const status = stepStatuses[step.id] || 'locked'}
				<button
					class="step-dot"
					class:active={step.id === currentStepId}
					class:completed={status === 'completed'}
					class:available={status === 'available'}
					on:click={() => goTo(step.id)}
					aria-label="{$locale === 'fr' ? 'Étape' : 'Step'} {i + 1}: {step.title}"
					aria-current={step.id === currentStepId ? 'step' : undefined}
				>
					{#if status === 'completed'}
						<Check size={10} strokeWidth={2.5} />
					{:else}
						<span class="dot-number">{i + 1}</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Next -->
		<button
			class="nav-btn"
			disabled={!nextStep}
			on:click={() => nextStep && goTo(nextStep.id)}
			aria-label={$locale === 'fr' ? 'Étape suivante' : 'Next step'}
		>
			<ChevronRight size={18} strokeWidth={1.5} />
		</button>
	</div>

	<!-- Step counter -->
	<div class="step-counter">
		<span class="counter-text">
			{$locale === 'fr' ? 'Étape' : 'Step'} {currentIndex + 1} / {steps.length}
		</span>
	</div>
</nav>

<style>
	.step-navigator {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.progress-track {
		height: 2px;
		background: var(--surface-3);
		border-radius: 1px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		transition: width 300ms ease-out;
	}

	.nav-content {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		background: none;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 120ms ease-out;
		flex-shrink: 0;
	}

	.nav-btn:hover:not(:disabled) {
		background: var(--surface-2);
		color: var(--text-primary);
		border-color: var(--text-tertiary);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.step-indicators {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		justify-content: center;
		flex: 1;
	}

	.step-dot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		/* Ensure 44px touch target via transparent padding area */
		padding: 8px;
		box-sizing: content-box;
		border-radius: 50%;
		border: 1.5px solid var(--surface-subtle);
		background: none;
		color: var(--text-tertiary);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		transition: all 150ms ease-out;
	}

	.step-dot.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-subtle);
	}

	.step-dot.completed {
		border-color: var(--success);
		color: var(--success);
		background: transparent;
	}

	.step-dot.available:not(.active):not(.completed) {
		border-color: var(--text-tertiary);
	}

	.step-dot:hover:not(.active) {
		background: var(--surface-2);
	}

	.dot-number {
		font-size: 10px;
		line-height: 1;
	}

	.step-counter {
		text-align: center;
	}

	.counter-text {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
