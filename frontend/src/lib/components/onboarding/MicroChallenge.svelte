<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { locale } from '$stores/locale';
	import CodeSandbox from '$components/learning/CodeSandbox.svelte';
	import type { ExecutionResult } from '$types/execution';
	import { Sparkles } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	let solved = false;

	const code = `function greet(name: string) {
  return 'Hello, ' + name;
}

// Fix this line — the function expects a string!
greet(42);`;

	function handleExecute(e: CustomEvent<ExecutionResult>) {
		// If they fixed the error, consider it solved
		if (e.detail.success && !e.detail.error) {
			solved = true;
		}
	}
</script>

<div class="micro-challenge">
	<h2 class="challenge-title">
		{$locale === 'fr' ? 'Votre premier défi' : 'Your first challenge'}
	</h2>
	<p class="challenge-desc">
		{$locale === 'fr'
			? 'Ce code est cassé. Corrigez l\'erreur et cliquez sur Exécuter.'
			: 'This code is broken. Fix the error and click Run.'}
	</p>

	<CodeSandbox
		initialCode={code}
		language="typescript"
		on:execute={handleExecute}
	/>

	{#if solved}
		<div class="success-banner" role="alert">
			<Sparkles size={18} strokeWidth={1.5} />
			<div>
				<strong>{$locale === 'fr' ? 'Bravo !' : 'Nice!'}</strong>
				<p>
					{$locale === 'fr'
						? 'C\'est ça l\'apprentissage inversé. Prêt à continuer ?'
						: "That's reverse learning. Ready for more?"}
				</p>
			</div>
		</div>
		<button class="start-btn" on:click={() => dispatch('complete')}>
			{$locale === 'fr' ? 'Commencer à apprendre' : 'Start Learning'}
		</button>
	{/if}
</div>

<style>
	.micro-challenge {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		text-align: center;
	}

	.challenge-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.challenge-desc {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.success-banner {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--accent-subtle);
		border: 1px solid var(--accent);
		border-radius: var(--radius-md);
		text-align: left;
		color: var(--accent);
	}

	.success-banner strong {
		display: block;
		font-family: var(--font-heading);
		font-size: var(--text-base);
		color: var(--text-primary);
	}

	.success-banner p {
		margin: var(--space-1) 0 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.start-btn {
		align-self: center;
		padding: var(--space-3) var(--space-8);
		min-height: 44px;
		background: var(--accent);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-lg);
		font-weight: 700;
		cursor: pointer;
		transition: background 120ms ease-out;
	}

	.start-btn:hover {
		background: var(--accent-hover);
	}
</style>
