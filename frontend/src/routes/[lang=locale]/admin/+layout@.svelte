<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { theme, resolvedTheme } from '$stores/theme';
	import { createAdminT } from '$lib/i18n/admin';
	import { getAlternateLocale } from '$lib/i18n';
	import type { SupportedLocale } from '$types/i18n';

	export let data: { adminToken: string; locale: string };

	$: lang = data.locale as SupportedLocale;
	$: t = createAdminT(lang);
	$: currentPath = $page.url.pathname;
	$: isLoginPage = currentPath.endsWith('/admin/login');
	$: altLocale = getAlternateLocale(lang);
	$: altPath = currentPath.replace(`/${lang}/`, `/${altLocale}/`);

	$: navItems = [
		{ label: t('nav.dashboard'), href: 'admin', icon: 'grid' },
		{ label: t('nav.paths'), href: 'admin/paths', icon: 'book' },
		{ label: t('nav.import'), href: 'admin/import', icon: 'upload' },
	];

	function isActive(href: string): boolean {
		const full = `/${lang}/${href}`;
		if (href === 'admin') return currentPath === full;
		return currentPath.startsWith(full);
	}

	function toggleTheme() {
		theme.update((t) => {
			if (t === 'system') return 'light';
			if (t === 'light') return 'dark';
			return 'system';
		});
	}

	function handleLogout() {
		document.cookie = 'ra-admin-token=; path=/; max-age=0';
		goto(`/${lang}/admin/login`);
	}
</script>

{#if isLoginPage}
	<slot />
{:else}
	<div class="admin-shell">
	<aside class="admin-sidebar">
		<div class="sidebar-header">
			<span class="sidebar-logo">RA</span>
			<span class="sidebar-title">Admin</span>
		</div>

		<nav class="sidebar-nav" aria-label="Admin navigation">
			{#each navItems as item}
				<a
					href="/{lang}/{item.href}"
					class="nav-item"
					class:active={isActive(item.href)}
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					<svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						{#if item.icon === 'grid'}
							<rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
						{:else if item.icon === 'book'}
							<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
						{:else if item.icon === 'upload'}
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
						{/if}
					</svg>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			<!-- Theme toggle -->
			<button class="nav-item theme-toggle" on:click={toggleTheme} aria-label="Toggle theme ({$theme})">
				<svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					{#if $theme === 'system'}
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
					{:else if $resolvedTheme === 'dark'}
						<circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
					{:else}
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					{/if}
				</svg>
				<span>{$theme === 'system' ? t('theme.system') : $resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
			</button>

			<!-- Language switcher -->
			<a href={altPath} class="nav-item">
				<svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
				</svg>
				<span>{altLocale.toUpperCase()}</span>
			</a>

			<div class="sidebar-divider"></div>

			<a href="/{lang}/explore" class="nav-item" target="_blank" rel="noopener">
				<svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
				</svg>
				<span>{t('nav.viewSite')}</span>
			</a>
			<button class="nav-item logout-btn" on:click={handleLogout}>
				<svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
				</svg>
				<span>{t('nav.logout')}</span>
			</button>
		</div>
	</aside>

	<div class="admin-main">
		<slot />
	</div>
</div>
{/if}

<style>
	.admin-shell {
		display: flex;
		min-height: 100vh;
		background: var(--surface-0);
	}

	.admin-sidebar {
		width: 240px;
		min-height: 100vh;
		background: var(--surface-1);
		border-right: 1px solid var(--surface-subtle);
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 40;
	}

	.sidebar-header {
		padding: var(--space-6) var(--space-5);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.sidebar-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--accent);
		color: var(--text-inverse);
		border-radius: var(--radius-sm);
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: var(--text-sm);
		letter-spacing: -0.02em;
	}

	.sidebar-title {
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	.sidebar-nav {
		flex: 1;
		padding: var(--space-4) var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.15s, background 0.15s;
		border: none;
		background: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}

	.nav-item:hover {
		color: var(--text-primary);
		background: var(--surface-3);
	}

	.nav-item.active {
		color: var(--accent);
		background: var(--accent-muted);
	}

	.nav-icon {
		flex-shrink: 0;
		opacity: 0.7;
	}

	.nav-item.active .nav-icon,
	.nav-item:hover .nav-icon {
		opacity: 1;
	}

	.sidebar-footer {
		padding: var(--space-4) var(--space-3);
		border-top: 1px solid var(--surface-subtle);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.sidebar-divider {
		height: 1px;
		background: var(--surface-subtle);
		margin: var(--space-2) var(--space-3);
	}

	.theme-toggle {
		color: var(--text-secondary);
	}

	.logout-btn {
		color: var(--error);
	}

	.logout-btn:hover {
		background: var(--error-muted);
		color: var(--error);
	}

	.admin-main {
		flex: 1;
		margin-left: 240px;
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.admin-sidebar {
			width: 60px;
		}

		.sidebar-title,
		.nav-item span {
			display: none;
		}

		.sidebar-header {
			justify-content: center;
			padding: var(--space-4) var(--space-2);
		}

		.nav-item {
			justify-content: center;
			padding: var(--space-2);
		}

		.admin-main {
			margin-left: 60px;
		}
	}
</style>
