<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { locale } from '$stores/locale';
	import { reducedMotion } from '$stores/reducedMotion';
	import MarkdownRenderer from '$components/shared/MarkdownRenderer.svelte';
	import ExpandableSection from '$components/ui/ExpandableSection.svelte';

	export let theory: string;
	export let keyInsight: string = '';
	export let expandableSections: Array<{ title: string; content: string }> = [];
	export let revealed: boolean = false;

	function reveal() {
		revealed = true;
	}
</script>

{#if !revealed}
	<div class="theory-locked">
		<div class="locked-icon" aria-hidden="true">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
				<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
			</svg>
		</div>
		<p class="locked-text">
			{$locale === 'fr'
				? 'Résolvez le défi pour débloquer la théorie'
				: 'Solve the challenge to unlock the theory'}
		</p>
	</div>
{:else}
	<div class="theory-revealer" transition:slide={{ duration: $reducedMotion ? 0 : 400, easing: quintOut }} role="region" aria-label={$locale === 'fr' ? 'Théorie débloquée' : 'Theory unlocked'}>
		<div class="theory-accent" aria-hidden="true"></div>

		<div class="theory-body">
			{#if keyInsight}
				<div class="key-insight" aria-live="polite">
					<span class="insight-label">{$locale === 'fr' ? 'Idée clé' : 'Key Insight'}</span>
					<p class="insight-text">{keyInsight}</p>
				</div>
			{/if}

			<div class="theory-content">
				<MarkdownRenderer content={theory} />
			</div>

			{#if expandableSections.length > 0}
				<div class="deeper-sections">
					<span class="deeper-label">{$locale === 'fr' ? 'Aller plus loin' : 'Go deeper'}</span>
					{#each expandableSections as section}
						<ExpandableSection title={section.title}>
							<MarkdownRenderer content={section.content} />
						</ExpandableSection>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.theory-locked {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-8) var(--space-4);
		text-align: center;
		color: var(--text-tertiary);
	}

	.locked-icon {
		opacity: 0.4;
	}

	.locked-text {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		margin: 0;
	}

	.theory-revealer {
		position: relative;
		padding-left: var(--space-4);
	}

	.theory-accent {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--accent);
		border-radius: 2px;
	}

	.theory-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.key-insight {
		background: var(--surface-2);
		border: 1px solid var(--accent-subtle);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.insight-label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
		margin-bottom: var(--space-2);
	}

	.insight-text {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--text-primary);
		line-height: 1.6;
	}

	.theory-content {
		font-family: var(--font-body);
		font-size: var(--text-base);
		line-height: 1.7;
		color: var(--text-primary);
	}

	.deeper-sections {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.deeper-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-tertiary);
	}
</style>
