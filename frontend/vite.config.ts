import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		include: ['../tests/unit/**/*.test.ts', '../tests/component/**/*.test.ts'],
		globals: true
	},
	server: {
		port: 5173,
		strictPort: false,
		proxy: {
			'/api/v1': {
				target: 'http://localhost:8080',
				changeOrigin: true
			}
		}
	},
	build: {
		target: 'es2022'
	}
});
