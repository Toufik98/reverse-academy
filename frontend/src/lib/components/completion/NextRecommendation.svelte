<script lang="ts">
	import { locale } from '$stores/locale';
	import { ArrowRight, Clock, Zap } from 'lucide-svelte';
	import type { LearningPath } from '$types/path';

	export let paths: LearningPath[] = [];
</script>

<div class="next-recommendation">
	<h3 class="rec-title">{$locale === 'fr' ? 'Et maintenant ?' : "What's next?"}</h3>

	<div class="rec-list">
		{#each paths.slice(0, 3) as path (path.slug)}
			<a class="rec-card" href="/{$locale}/learn/{path.slug}">
				<div class="rec-info">
					<h4 class="rec-name">{path.title}</h4>
					<p class="rec-desc">{path.description}</p>
					<div class="rec-meta">
						<span class="meta-item">
							<Zap size={12} strokeWidth={1.5} />
							{path.difficulty}
						</span>
						<span class="meta-item">
							<Clock size={12} strokeWidth={1.5} />
							{path.estimatedMinutes}m
						</span>
					</div>
				</div>
				<ArrowRight size={16} strokeWidth={1.5} class="rec-arrow" />
			</a>
		{/each}
	</div>
</div>

<style>
	.next-recommendation {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.rec-title {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
	}

	.rec-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.rec-card {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		background: var(--surface-1);
		text-decoration: none;
		transition: all 150ms ease-out;
	}

	.rec-card:hover {
		border-color: var(--accent-subtle);
		background: var(--surface-2);
	}

	.rec-info {
		flex: 1;
		min-width: 0;
		text-align: left;
	}

	.rec-name {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-primary);
	}

	.rec-desc {
		margin: var(--space-1) 0 0;
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.rec-meta {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.rec-card :global(.rec-arrow) {
		color: var(--text-tertiary);
		flex-shrink: 0;
	}
</style>
