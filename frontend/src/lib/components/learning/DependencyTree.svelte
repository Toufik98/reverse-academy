<script lang="ts">
	import { locale } from '$stores/locale';
	import type { Step } from '$types/path';
	import type { StepStatus } from '$types/progress';
	import ConceptCard from './ConceptCard.svelte';

	export let steps: Step[] = [];
	export let stepStatuses: Record<string, StepStatus> = {};
	export let pathTitle: string = '';

	// Group steps by type — challenges unlock theories
	$: nodes = steps.map((step, i) => ({
		step,
		index: i,
		status: stepStatuses[step.id] || 'locked',
		isUnlocked: stepStatuses[step.id] === 'completed' || stepStatuses[step.id] === 'available'
	}));
</script>

<div class="dependency-tree" role="list" aria-label={$locale === 'fr' ? `Arbre de ${pathTitle}` : `${pathTitle} dependency tree`}>
	{#each nodes as node, i (node.step.id)}
		<div class="tree-node" role="listitem">
			<!-- Connector line -->
			{#if i > 0}
				<div class="connector" class:completed={node.status === 'completed'}></div>
			{/if}

			<ConceptCard
				title={node.step.title}
				description={node.step.type === 'reveal' ? ($locale === 'fr' ? 'Théorie' : 'Theory') : ($locale === 'fr' ? 'Défi' : 'Challenge')}
				unlocked={node.isUnlocked}
			/>
		</div>
	{/each}
</div>

<style>
	.dependency-tree {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: var(--space-2) 0;
	}

	.tree-node {
		position: relative;
		padding-left: var(--space-6);
	}

	.connector {
		position: absolute;
		left: 18px;
		top: -12px;
		width: 2px;
		height: 12px;
		background: var(--surface-subtle);
	}

	.connector.completed {
		background: var(--accent);
	}
</style>
