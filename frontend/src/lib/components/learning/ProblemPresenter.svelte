<script lang="ts">
	import type { ChallengeContent, SandboxContent } from '$types/path';
	import { locale } from '$stores/locale';

	export let content: ChallengeContent | SandboxContent;

	$: isChallenge = content.type === 'challenge';
	$: challenge = content as ChallengeContent;
	$: sandbox = content as SandboxContent;
</script>

<div class="problem-presenter" role="region" aria-label="Problem description">
	{#if isChallenge}
		<div class="scenario">
			<p class="scenario-text">{challenge.scenario}</p>
		</div>

		{#if challenge.errorMessage}
			<div class="error-display" role="alert">
				<div class="error-label">
					{$locale === 'fr' ? 'Erreur' : 'Error'}
				</div>
				<pre class="error-message"><code>{challenge.errorMessage}</code></pre>
			</div>
		{/if}
	{:else}
		<div class="scenario">
			<p class="scenario-text">{sandbox.prompt}</p>
		</div>
	{/if}
</div>

<style>
	.problem-presenter {
		margin-bottom: var(--space-6);
	}

	.scenario {
		padding: var(--space-6);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-4);
	}

	.scenario-text {
		font-size: var(--text-base);
		line-height: 1.65;
		color: var(--text-primary);
		margin: 0;
	}

	.error-display {
		background: var(--error-muted);
		border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.error-label {
		padding: var(--space-2) var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--error);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid color-mix(in srgb, var(--error) 15%, transparent);
	}

	.error-message {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--error);
		overflow-x: auto;
	}

	.error-message code {
		background: none;
		padding: 0;
	}
</style>
