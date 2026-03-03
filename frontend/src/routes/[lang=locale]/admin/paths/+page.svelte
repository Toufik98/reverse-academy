<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { createAdminT } from '$lib/i18n/admin';
	import type { SupportedLocale } from '$types/i18n';

	export let data: {
		paths: Array<{
			id: string;
			slug: string;
			title: string;
			domain: string;
			mode: string;
			difficulty: string;
			description: string;
			estimatedMinutes: number;
			xpReward: number;
			stepCount: number;
		}>;
		adminToken: string;
	};

	$: lang = $page.params.lang as SupportedLocale;
	$: t = createAdminT(lang);

	let filter = '';
	let domainFilter = '';
	let difficultyFilter = '';
	let deleteConfirm = '';

	$: filtered = data.paths.filter((p) => {
		const text = `${p.title} ${p.slug} ${p.description}`.toLowerCase();
		const matchText = !filter || text.includes(filter.toLowerCase());
		const matchDomain = !domainFilter || p.domain === domainFilter;
		const matchDiff = !difficultyFilter || p.difficulty === difficultyFilter;
		return matchText && matchDomain && matchDiff;
	});

	$: domains = [...new Set(data.paths.map((p) => p.domain))].sort();
	$: difficulties = [...new Set(data.paths.map((p) => p.difficulty))].sort();

	$: totalSteps = data.paths.reduce((sum, p) => sum + p.stepCount, 0);
	$: totalXP = data.paths.reduce((sum, p) => sum + p.xpReward, 0);

	async function handleDelete(pathId: string) {
		if (deleteConfirm !== pathId) {
			deleteConfirm = pathId;
			return;
		}

		try {
			const res = await fetch(`/api/v1/admin/paths/${pathId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${data.adminToken}` }
			});

			if (res.ok) {
				await invalidateAll();
				deleteConfirm = '';
			}
		} catch (e) {
			console.error('Delete failed:', e);
		}
	}

	async function handleExport(pathId: string) {
		try {
			const res = await fetch(`/api/v1/admin/paths/${pathId}/export`, {
				headers: { Authorization: `Bearer ${data.adminToken}` }
			});

			if (res.ok) {
				const json = await res.json();
				const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${json.slug || pathId}.json`;
				a.click();
				URL.revokeObjectURL(url);
			}
		} catch (e) {
			console.error('Export failed:', e);
		}
	}

	const modeLabels: Record<string, string> = {
		'fix-broken': 'Fix Broken',
		'problem-first': 'Problem First',
		'reverse-engineer': 'Reverse Engineer',
		'goal-tree': 'Goal Tree'
	};

	const diffColors: Record<string, string> = {
		beginner: 'var(--success)',
		intermediate: 'var(--accent)',
		advanced: 'var(--error)'
	};
</script>

<svelte:head>
	<title>{t('paths.title')} — Reverse Academy Admin</title>
</svelte:head>

<div class="paths-page">
	<header class="page-header">
		<div>
			<h1>{t('paths.title')}</h1>
			<p>{data.paths.length} {t('paths.totalPaths')}, {totalSteps} {t('paths.totalSteps')}, {totalXP} {t('paths.totalXP')}</p>
		</div>
		<div class="header-actions">
			<a href="{base}/{lang}/admin/import" class="btn btn-secondary">{t('dashboard.importJson')}</a>
			<a href="{base}/{lang}/admin/paths/new" class="btn btn-primary">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				{t('dashboard.newPath')}
			</a>
		</div>
	</header>

	<!-- Filters -->
	<div class="filters">
		<input
			type="search"
			placeholder={t('paths.search')}
			bind:value={filter}
			class="search-input"
		/>
		<select bind:value={domainFilter} class="filter-select" aria-label={t('table.domain')}>
			<option value="">{t('paths.allDomains')}</option>
			{#each domains as d}
				<option value={d}>{d}</option>
			{/each}
		</select>
		<select bind:value={difficultyFilter} class="filter-select" aria-label={t('table.difficulty')}>
			<option value="">{t('paths.allDifficulties')}</option>
			{#each difficulties as d}
				<option value={d}>{d}</option>
			{/each}
		</select>
	</div>

	<!-- Path list -->
	{#if filtered.length > 0}
		<div class="path-list">
			{#each filtered as path (path.id)}
				<article class="path-row">
					<div class="path-info">
						<div class="path-title-row">
							<a href="{base}/{lang}/admin/paths/{path.id}" class="path-title">{path.title}</a>
							<div class="path-badges">
								<span class="badge domain-badge">{path.domain}</span>
								<span class="badge diff-badge" style="color: {diffColors[path.difficulty] || 'var(--text-secondary)'}">
									{path.difficulty}
								</span>
								<span class="badge mode-badge">{modeLabels[path.mode] || path.mode}</span>
							</div>
						</div>
						<p class="path-desc">{path.description}</p>
						<div class="path-meta">
							<span class="meta-item">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
								{path.stepCount} {t('paths.steps')}
							</span>
							<span class="meta-item">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
								{path.estimatedMinutes} {t('paths.min')}
							</span>
							<span class="meta-item">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
								{path.xpReward} XP
							</span>
							<span class="meta-slug">{path.slug}</span>
						</div>
					</div>
					<div class="path-actions">
						<a href="{base}/{lang}/admin/paths/{path.id}" class="action-btn edit-btn" title="Edit path">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
						</a>
						<button class="action-btn export-btn" title="Export JSON" on:click={() => handleExport(path.id)}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
							</svg>
						</button>
						<button
							class="action-btn delete-btn"
							class:confirming={deleteConfirm === path.id}
							title={deleteConfirm === path.id ? 'Click again to confirm' : 'Delete path'}
							on:click={() => handleDelete(path.id)}
						>
							{#if deleteConfirm === path.id}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{:else}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
								</svg>
							{/if}
						</button>
					</div>
				</article>
			{/each}
		</div>
	{:else if data.paths.length > 0}
		<div class="empty-state">
			<p>{t('paths.noResults')}</p>
		</div>
	{:else}
		<div class="empty-state">
			<p>{t('dashboard.noPathsYet')}</p>
			<a href="{base}/{lang}/admin/paths/new" class="btn btn-primary">{t('dashboard.createFirst')}</a>
		</div>
	{/if}
</div>

<style>
	.paths-page {
		padding: var(--space-8);
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-1);
	}

	.page-header p {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.header-actions {
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
		transition: background 0.15s;
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

	/* Filters */
	.filters {
		display: flex;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.search-input {
		flex: 1;
		padding: var(--space-2) var(--space-4);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
	}

	.search-input:focus {
		border-color: var(--accent);
	}

	.search-input::placeholder {
		color: var(--text-tertiary);
	}

	.filter-select {
		padding: var(--space-2) var(--space-4);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
		cursor: pointer;
	}

	.filter-select:focus {
		border-color: var(--accent);
	}

	/* Path list */
	.path-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.path-row {
		display: flex;
		gap: var(--space-4);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		transition: border-color 0.15s;
	}

	.path-row:hover {
		border-color: var(--accent-muted);
	}

	.path-info {
		flex: 1;
		min-width: 0;
	}

	.path-title-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-2);
		flex-wrap: wrap;
	}

	.path-title {
		font-family: var(--font-heading);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-primary);
		text-decoration: none;
	}

	.path-title:hover {
		color: var(--accent);
	}

	.path-badges {
		display: flex;
		gap: var(--space-2);
	}

	.badge {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
		text-transform: capitalize;
	}

	.domain-badge {
		color: var(--info);
	}

	.mode-badge {
		color: var(--text-tertiary);
	}

	.path-desc {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0 0 var(--space-3);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.path-meta {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.meta-slug {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	/* Actions */
	.path-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-1);
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		cursor: pointer;
		color: var(--text-tertiary);
		transition: color 0.15s, background 0.15s;
	}

	.edit-btn:hover {
		color: var(--accent);
		background: var(--accent-muted);
	}

	.export-btn:hover {
		color: var(--info);
		background: var(--info-muted);
	}

	.delete-btn:hover {
		color: var(--error);
		background: var(--error-muted);
	}

	.delete-btn.confirming {
		color: var(--error);
		background: var(--error-muted);
		animation: pulse 1s ease infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
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
		.paths-page {
			padding: var(--space-4);
		}
		.page-header {
			flex-direction: column;
			gap: var(--space-4);
		}
		.filters {
			flex-direction: column;
		}
		.path-row {
			flex-direction: column;
		}
		.path-actions {
			flex-direction: row;
		}
	}
</style>
