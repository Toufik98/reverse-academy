<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { Sun, Moon, User, BookOpen, Compass, LogOut, Menu, X } from 'lucide-svelte';
	import { theme, resolvedTheme } from '$stores/theme';
	import { locale } from '$stores/locale';
	import { totalXP, levelInfo } from '$stores/gamification';
	import { getAlternateLocale, localizedPath } from '$lib/i18n';
	import type { SupportedLocale } from '$types/i18n';

	export let authenticated: boolean = false;

	let mobileMenuOpen = false;
	$: currentPath = $page.url.pathname;
	$: altLocale = getAlternateLocale($locale);
	$: altPath = localizedPath(currentPath.replace(`/${$locale}`, ''), altLocale);

	function toggleTheme() {
		theme.update((t) => {
			if (t === 'system') return 'light';
			if (t === 'light') return 'dark';
			return 'system';
		});
	}

	const navItems = [
		{ href: 'explore', label: 'Explore', labelFr: 'Explorer', icon: Compass },
	];
</script>

<nav class="navbar" aria-label="Main navigation">
	<div class="navbar-inner">
		<!-- Logo -->
		<a href="{base}/{$locale}" class="logo" aria-label="Reverse Academy home">
			<span class="logo-mark">RA</span>
			<span class="logo-text">Reverse Academy</span>
		</a>

		<!-- Desktop nav -->
		<div class="nav-links" role="menubar">
			{#each navItems as item}
				<a
					href="{base}/{$locale}/{item.href}"
					class="nav-link"
					class:active={currentPath.includes(item.href)}
					role="menuitem"
				>
					<svelte:component this={item.icon} size={18} strokeWidth={1.5} />
					<span>{$locale === 'fr' ? item.labelFr : item.label}</span>
				</a>
			{/each}
		</div>

		<!-- Right section -->
		<div class="nav-actions">
			<!-- Language switcher -->
			<a href={altPath} class="nav-action-btn" aria-label="Switch to {altLocale === 'fr' ? 'French' : 'English'}">
				{altLocale.toUpperCase()}
			</a>

			<!-- Theme toggle -->
			<button class="nav-action-btn" on:click={toggleTheme} aria-label="Toggle theme ({$theme})">
				{#if $theme === 'system'}
					<!-- Monitor icon for system/auto -->
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
					</svg>
				{:else if $resolvedTheme === 'dark'}
					<Sun size={18} strokeWidth={1.5} />
				{:else}
					<Moon size={18} strokeWidth={1.5} />
				{/if}
			</button>

			{#if authenticated}
				<!-- XP display -->
				<div class="xp-badge tabular-nums" aria-label="Experience points: {$totalXP}">
					<span class="xp-value">{$totalXP}</span>
					<span class="xp-label">XP</span>
				</div>

				<!-- Profile -->
				<a href="{base}/{$locale}/profile" class="nav-action-btn" aria-label="Profile">
					<User size={18} strokeWidth={1.5} />
				</a>
			{:else}
				<a href="{base}/{$locale}/auth/login" class="btn-primary">
					{$locale === 'fr' ? 'Connexion' : 'Sign In'}
				</a>
			{/if}

			<!-- Mobile menu toggle -->
			<button
				class="mobile-menu-btn"
				on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<X size={20} strokeWidth={1.5} />
				{:else}
					<Menu size={20} strokeWidth={1.5} />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="mobile-nav" role="menu">
			{#each navItems as item}
				<a
					href="{base}/{$locale}/{item.href}"
					class="mobile-nav-link"
					on:click={() => (mobileMenuOpen = false)}
					role="menuitem"
				>
					<svelte:component this={item.icon} size={20} strokeWidth={1.5} />
					{$locale === 'fr' ? item.labelFr : item.label}
				</a>
			{/each}
			{#if authenticated}
				<a href="{base}/{$locale}/profile" class="mobile-nav-link" on:click={() => (mobileMenuOpen = false)}>
					<User size={20} strokeWidth={1.5} />
					{$locale === 'fr' ? 'Profil' : 'Profile'}
				</a>
			{/if}
		</div>
	{/if}
</nav>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--surface-0);
		border-bottom: 1px solid var(--surface-subtle);
		backdrop-filter: blur(8px);
	}

	.navbar-inner {
		max-width: var(--max-width-content);
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-6);
		gap: var(--space-6);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		text-decoration: none;
		color: var(--text-primary);
	}

	.logo-mark {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--text-lg);
		color: var(--accent);
	}

	.logo-text {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.nav-links {
		display: flex;
		gap: var(--space-2);
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--text-sm);
		font-weight: 500;
		transition: color 120ms ease-out, background-color 120ms ease-out;
	}

	.nav-link:hover,
	.nav-link.active {
		color: var(--text-primary);
		background: var(--surface-2);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.nav-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-secondary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		text-decoration: none;
		font-size: var(--text-sm);
		font-weight: 600;
		font-family: var(--font-body);
		transition: color 120ms ease-out, background-color 120ms ease-out;
	}

	.nav-action-btn:hover {
		color: var(--text-primary);
		background: var(--surface-2);
	}

	.xp-badge {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		background: var(--accent-muted);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-family: var(--font-body);
	}

	.xp-value {
		color: var(--accent-text);
		font-weight: 700;
	}

	.xp-label {
		color: var(--accent);
		font-weight: 500;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		background: var(--accent);
		color: var(--text-inverse);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 500;
		font-family: var(--font-body);
		text-decoration: none;
		transition: background-color 120ms ease-out;
		min-height: 44px;
	}

	.btn-primary:hover {
		background: var(--accent-hover);
	}

	.mobile-menu-btn {
		display: none;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.mobile-nav {
		display: none;
		flex-direction: column;
		padding: var(--space-4) var(--space-6);
		border-top: 1px solid var(--surface-subtle);
	}

	.mobile-nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) 0;
		color: var(--text-primary);
		text-decoration: none;
		font-size: var(--text-base);
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}

		.logo-text {
			display: none;
		}

		.mobile-menu-btn {
			display: flex;
		}

		.mobile-nav {
			display: flex;
		}
	}
</style>
