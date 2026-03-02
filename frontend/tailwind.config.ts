import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: ['class', '[data-theme="dark"]'],
	theme: {
		extend: {
			fontFamily: {
				display: ['Fraunces', 'Georgia', 'serif'],
				body: ['Satoshi', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
			},
			colors: {
				surface: {
					0: 'var(--surface-0)',
					1: 'var(--surface-1)',
					2: 'var(--surface-2)',
					3: 'var(--surface-3)',
					subtle: 'var(--surface-subtle)'
				},
				text: {
					primary: 'var(--text-primary)',
					secondary: 'var(--text-secondary)',
					tertiary: 'var(--text-tertiary)',
					inverse: 'var(--text-inverse)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					hover: 'var(--accent-hover)',
					muted: 'var(--accent-muted)',
					text: 'var(--accent-text)'
				},
				success: {
					DEFAULT: 'var(--success)',
					muted: 'var(--success-muted)'
				},
				error: {
					DEFAULT: 'var(--error)',
					muted: 'var(--error-muted)'
				},
				info: {
					DEFAULT: 'var(--info)',
					muted: 'var(--info-muted)'
				},
				warning: 'var(--warning)',
				code: {
					bg: 'var(--code-bg)',
					keyword: 'var(--code-keyword)',
					string: 'var(--code-string)',
					function: 'var(--code-function)',
					comment: 'var(--code-comment)',
					type: 'var(--code-type)'
				}
			},
			fontSize: {
				xs: 'var(--text-xs)',
				sm: 'var(--text-sm)',
				base: 'var(--text-base)',
				lg: 'var(--text-lg)',
				xl: 'var(--text-xl)',
				'2xl': 'var(--text-2xl)',
				'3xl': 'var(--text-3xl)',
				hero: 'var(--text-hero)'
			},
			borderRadius: {
				sm: 'var(--radius-sm)',
				md: 'var(--radius-md)',
				lg: 'var(--radius-lg)',
				xl: 'var(--radius-xl)'
			},
			spacing: {
				1: 'var(--space-1)',
				2: 'var(--space-2)',
				3: 'var(--space-3)',
				4: 'var(--space-4)',
				6: 'var(--space-6)',
				8: 'var(--space-8)',
				12: 'var(--space-12)',
				16: 'var(--space-16)',
				24: 'var(--space-24)',
				32: 'var(--space-32)'
			},
			transitionTimingFunction: {
				'panel': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
			}
		}
	},
	plugins: []
} satisfies Config;
