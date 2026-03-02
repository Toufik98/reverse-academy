<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { locale } from '$stores/locale';
	import { ArrowRight, Code, Globe, Server, Cpu, Database, Shield } from 'lucide-svelte';

	const dispatch = createEventDispatcher<{
		select: string[];
		continue: void;
	}>();

	const domains = [
		{ id: 'programming', icon: Code, en: 'Programming', fr: 'Programmation' },
		{ id: 'web-dev', icon: Globe, en: 'Web Development', fr: 'Développement Web' },
		{ id: 'backend', icon: Server, en: 'Backend & APIs', fr: 'Backend & APIs' },
		{ id: 'systems', icon: Cpu, en: 'Systems', fr: 'Systèmes' },
		{ id: 'databases', icon: Database, en: 'Databases', fr: 'Bases de données' },
		{ id: 'security', icon: Shield, en: 'Security', fr: 'Sécurité' }
	];

	let selected: Set<string> = new Set();

	function toggle(id: string) {
		if (selected.has(id)) {
			selected.delete(id);
		} else if (selected.size < 3) {
			selected.add(id);
		}
		selected = selected; // trigger reactivity
		dispatch('select', [...selected]);
	}

	function proceed() {
		dispatch('continue');
	}

	$: canContinue = selected.size > 0;
</script>

<div class="interest-picker">
	<h2 class="picker-title">
		{$locale === 'fr' ? 'Qu\'est-ce qui vous intéresse ?' : 'What interests you?'}
	</h2>
	<p class="picker-subtitle">
		{$locale === 'fr' ? 'Choisissez 1 à 3 domaines' : 'Pick 1 to 3 domains'}
	</p>

	<div class="domain-grid" role="group" aria-label={$locale === 'fr' ? 'Domaines' : 'Domains'}>
		{#each domains as domain}
			<button
				class="domain-card"
				class:selected={selected.has(domain.id)}
				on:click={() => toggle(domain.id)}
				aria-pressed={selected.has(domain.id)}
			>
				<svelte:component this={domain.icon} size={24} strokeWidth={1.5} />
				<span class="domain-name">{$locale === 'fr' ? domain.fr : domain.en}</span>
			</button>
		{/each}
	</div>

	<button class="continue-btn" disabled={!canContinue} on:click={proceed}>
		<span>{$locale === 'fr' ? 'Continuer' : 'Continue'}</span>
		<ArrowRight size={16} strokeWidth={1.5} />
	</button>
</div>

<style>
	.interest-picker {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		text-align: center;
	}

	.picker-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.picker-subtitle {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin: 0;
	}

	.domain-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-3);
		width: 100%;
		max-width: 480px;
	}

	@media (max-width: 480px) {
		.domain-grid { grid-template-columns: repeat(2, 1fr); }
	}

	.domain-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-4);
		min-height: 44px;
		border: 1.5px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-1);
		cursor: pointer;
		transition: all 150ms ease-out;
		color: var(--text-secondary);
	}

	.domain-card:hover {
		border-color: var(--text-tertiary);
		background: var(--surface-2);
	}

	.domain-card.selected {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-subtle);
	}

	.domain-name {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
	}

	.continue-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		min-height: 44px;
		background: var(--accent);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease-out;
	}

	.continue-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.continue-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
