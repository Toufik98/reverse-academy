<script lang="ts">
	import { locale } from '$stores/locale';
	import { Github } from 'lucide-svelte';
	import { getAlternateLocale, localizedPath } from '$lib/i18n';

	$: altLocale = getAlternateLocale($locale);
</script>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-left">
			<span class="footer-brand">Reverse Academy</span>
			<span class="footer-sep">·</span>
			<span class="footer-tagline">
				{$locale === 'fr' ? 'Apprendre en cassant les choses.' : 'Learn by breaking things.'}
			</span>
		</div>

		<div class="footer-right">
			<a href={localizedPath('/', altLocale)} class="footer-link">
				{altLocale === 'fr' ? 'Français' : 'English'}
			</a>
			<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="footer-link" aria-label="GitHub">
				<Github size={16} strokeWidth={1.5} />
			</a>
		</div>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--surface-subtle);
		padding: var(--space-6);
		margin-top: var(--space-16);
	}

	.footer-inner {
		max-width: var(--max-width-content);
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.footer-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
	}

	.footer-brand {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--text-secondary);
	}

	.footer-sep {
		color: var(--text-tertiary);
	}

	.footer-tagline {
		color: var(--text-tertiary);
	}

	.footer-right {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.footer-link {
		display: flex;
		align-items: center;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--text-sm);
		transition: color 120ms ease-out;
	}

	.footer-link:hover {
		color: var(--text-primary);
	}
</style>
