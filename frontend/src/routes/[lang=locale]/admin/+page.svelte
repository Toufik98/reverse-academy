<script lang="ts">
	import { page } from '$app/stores';
	import { createAdminT } from '$lib/i18n/admin';
	import type { SupportedLocale } from '$types/i18n';

	export let data: {
		stats: {
			total_paths: number;
			total_steps: number;
			total_users: number;
			total_achievements: number;
			paths_by_domain: Array<{ domain: string; count: number }>;
			paths_by_difficulty: Array<{ difficulty: string; count: number }>;
		} | null;
		paths: Array<{
			id: string;
			slug: string;
			title: string;
			domain: string;
			difficulty: string;
			stepCount: number;
			xpReward: number;
		}>;
	};

	$: lang = $page.params.lang as SupportedLocale;
	$: t = createAdminT(lang);

	const domainColors: Record<string, string> = {
		programming: 'var(--accent)',
		'web-dev': 'var(--info)',
		systems: 'var(--success)',
		stem: 'var(--warning)',
		languages: 'var(--code-keyword)'
	};

	const difficultyColors: Record<string, string> = {
		beginner: 'var(--success)',
		intermediate: 'var(--accent)',
		advanced: 'var(--error)'
	};
</script>

<svelte:head>
	<title>{t('dashboard.title')} — Reverse Academy Admin</title>
</svelte:head>

<div class="dashboard">
	<header class="page-header">
		<h1>{t('dashboard.title')}</h1>
		<p>{t('dashboard.subtitle')}</p>
	</header>

	{#if data.stats}
		<section class="stats-grid" aria-label="Platform statistics">
			<div class="stat-card">
				<span class="stat-value">{data.stats.total_paths}</span>
				<span class="stat-label">{t('dashboard.learningPaths')}</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{data.stats.total_steps}</span>
				<span class="stat-label">{t('dashboard.totalSteps')}</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{data.stats.total_users}</span>
				<span class="stat-label">{t('dashboard.users')}</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">{data.stats.total_achievements}</span>
				<span class="stat-label">{t('dashboard.achievements')}</span>
			</div>
		</section>

		<div class="breakdown-grid">
			<section class="breakdown-card" aria-label={t('dashboard.byDomain')}>
				<h2>{t('dashboard.byDomain')}</h2>
				<ul class="breakdown-list">
					{#each data.stats.paths_by_domain as item}
						<li>
							<span class="breakdown-dot" style="background: {domainColors[item.domain] || 'var(--text-tertiary)'}"></span>
							<span class="breakdown-name">{item.domain}</span>
							<span class="breakdown-count">{item.count}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="breakdown-card" aria-label={t('dashboard.byDifficulty')}>
				<h2>{t('dashboard.byDifficulty')}</h2>
				<ul class="breakdown-list">
					{#each data.stats.paths_by_difficulty as item}
						<li>
							<span class="breakdown-dot" style="background: {difficultyColors[item.difficulty] || 'var(--text-tertiary)'}"></span>
							<span class="breakdown-name">{item.difficulty}</span>
							<span class="breakdown-count">{item.count}</span>
						</li>
					{/each}
				</ul>
			</section>
		</div>
	{:else}
		<div class="empty-state">
			<p>{t('dashboard.noStats')}</p>
		</div>
	{/if}

	<section class="recent-paths" aria-label={t('dashboard.learningPaths')}>
		<div class="section-header">
			<h2>{t('dashboard.learningPaths')}</h2>
			<div class="section-actions">
				<a href="/{lang}/admin/import" class="btn btn-secondary">{t('dashboard.importJson')}</a>
				<a href="/{lang}/admin/paths/new" class="btn btn-primary">{t('dashboard.newPath')}</a>
			</div>
		</div>

		{#if data.paths.length > 0}
			<div class="paths-table-wrapper">
				<table class="paths-table">
					<thead>
						<tr>
							<th>{t('table.title')}</th>
							<th>{t('table.domain')}</th>
							<th>{t('table.difficulty')}</th>
							<th>{t('table.steps')}</th>
							<th>{t('table.xp')}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.paths as path}
							<tr>
								<td class="path-title-cell">
									<a href="/{lang}/admin/paths/{path.id}">{path.title}</a>
									<span class="slug">{path.slug}</span>
								</td>
								<td>
									<span class="badge" style="color: {domainColors[path.domain] || 'var(--text-secondary)'}">
										{path.domain}
									</span>
								</td>
								<td>
									<span class="badge" style="color: {difficultyColors[path.difficulty] || 'var(--text-secondary)'}">
										{path.difficulty}
									</span>
								</td>
								<td class="num">{path.stepCount}</td>
								<td class="num">{path.xpReward}</td>
								<td>
									<a href="/{lang}/admin/paths/{path.id}" class="action-link">{t('table.edit')}</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="empty-state">
				<p>{t('dashboard.noPathsYet')}</p>
				<a href="/{lang}/admin/paths/new" class="btn btn-primary">{t('dashboard.createFirst')}</a>
			</div>
		{/if}
	</section>
</div>

<style>
	.dashboard {
		padding: var(--space-8);
		max-width: 1200px;
	}

	.page-header {
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-2);
	}

	.page-header p {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	/* Stats grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.stat-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.stat-value {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
	}

	.stat-label {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Breakdown */
	.breakdown-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.breakdown-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
	}

	.breakdown-card h2 {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0 0 var(--space-4);
	}

	.breakdown-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.breakdown-list li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.breakdown-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.breakdown-name {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-primary);
		flex: 1;
		text-transform: capitalize;
	}

	.breakdown-count {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	/* Paths table */
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.section-header h2 {
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.section-actions {
		display: flex;
		gap: var(--space-3);
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: none;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 36px;
		transition: background 0.15s, border-color 0.15s;
	}

	.btn-primary {
		background: var(--accent);
		color: var(--text-inverse);
	}

	.btn-primary:hover {
		background: var(--accent-hover);
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--surface-subtle);
	}

	.btn-secondary:hover {
		border-color: var(--text-tertiary);
		color: var(--text-primary);
	}

	.paths-table-wrapper {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.paths-table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-body);
		font-size: var(--text-sm);
	}

	.paths-table thead {
		background: var(--surface-2);
	}

	.paths-table th {
		padding: var(--space-3) var(--space-4);
		text-align: left;
		font-weight: 500;
		color: var(--text-tertiary);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--surface-subtle);
	}

	.paths-table td {
		padding: var(--space-3) var(--space-4);
		color: var(--text-primary);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.paths-table tbody tr:last-child td {
		border-bottom: none;
	}

	.paths-table tbody tr:hover {
		background: var(--surface-2);
	}

	.path-title-cell {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.path-title-cell a {
		color: var(--text-primary);
		text-decoration: none;
		font-weight: 500;
	}

	.path-title-cell a:hover {
		color: var(--accent);
	}

	.slug {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.badge {
		font-size: var(--text-xs);
		font-weight: 500;
		text-transform: capitalize;
	}

	.num {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-align: right;
	}

	.action-link {
		font-size: var(--text-xs);
		color: var(--accent);
		text-decoration: none;
	}

	.action-link:hover {
		text-decoration: underline;
	}

	.empty-state {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-12);
		text-align: center;
	}

	.empty-state p {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0 0 var(--space-4);
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: var(--space-4);
		}
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.breakdown-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
