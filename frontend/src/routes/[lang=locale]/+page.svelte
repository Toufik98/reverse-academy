<script lang="ts">
	import { base } from '$app/paths';
	import { locale } from '$stores/locale';
	import { ArrowRight, Terminal, BookOpen, Zap, Wrench, Lightbulb, Brain } from 'lucide-svelte';
	import SEOHead from '$components/shared/SEOHead.svelte';

	export let params: Record<string, string> = {};

	const demoCode = `function greet(name: string) {
  return 'Hello, ' + name;
}

greet(42);`;

	const demoFix = `function greet(name: string) {
  return 'Hello, ' + name;
}

greet('World');`;

	const copy = {
		en: {
			hero: 'Learn by breaking things.',
			subtitle: 'Start with a broken app. Fix it. Discover the theory along the way. Every concept is the answer to a question you already have.',
			cta: 'Start Learning',
			ctaGuest: 'Try a demo',
			demoTitle: 'Try it right now',
			demoSubtitle: 'This code is broken. Can you fix it? Change the code below and hit Run.',
			demoHint: 'Hint: the function expects a string, not a number.',
			demoSuccess: 'You fixed it! That type error? TypeScript caught it before runtime. That\'s reverse learning.',
			demoCTA: 'Create Free Account',
			stepsTitle: 'How It Works',
			steps: [
				{
					number: '1',
					title: 'Break',
					description: 'See broken code. Understand what it\'s supposed to do. Try to fix it.',
					icon: Wrench
				},
				{
					number: '2',
					title: 'Fix',
					description: 'Debug and repair. Run your solution. Get instant feedback.',
					icon: Terminal
				},
				{
					number: '3',
					title: 'Learn',
					description: 'Theory reveals itself as the answer to your question. The "aha" moment is the lesson.',
					icon: Lightbulb
				}
			],
			paths: 'Learning Paths',
			pathsDesc: 'Curated reverse-engineering journeys.',
			startPath: 'Start Path',
			philosophy: 'Traditional education: Theory → Examples → Maybe a real problem.\nReverse Academy: Real problem → Attempt → "Why?" → Discover concept.\nEvery piece of theory is the answer to a question you already have.',
			features: [
				{
					title: 'Problem First',
					description: 'Every lesson starts with a real, broken piece of code. You fix it before you learn the theory.',
					icon: Terminal
				},
				{
					title: 'Theory Earned',
					description: 'Concepts reveal themselves only after you struggle. The "aha" moment is the lesson.',
					icon: BookOpen
				},
				{
					title: 'Instant Feedback',
					description: 'Run code in the browser. See results immediately. No setup, no waiting.',
					icon: Zap
				}
			],
			pathsList: [
				{
					title: 'TypeScript Error Detective',
					difficulty: 'Beginner',
					time: '~30 min',
					scenario: 'A colleague pushed broken code. Find the type errors and fix them.',
					slug: 'typescript-error-detective'
				},
				{
					title: 'Build a REST API — Backward',
					difficulty: 'Intermediate',
					time: '~45 min',
					scenario: 'Deploy an endpoint, then discover HTTP, routing, and middleware.',
					slug: 'build-rest-api-backward'
				},
				{
					title: 'Rust Ownership: Why Does the Compiler Hate Me?',
					difficulty: 'Intermediate',
					time: '~40 min',
					scenario: 'Fix borrow checker errors and discover ownership, borrowing, and lifetimes.',
					slug: 'rust-ownership-from-bugs'
				}
			]
		},
		fr: {
			hero: 'Apprendre en cassant les choses.',
			subtitle: "Commencez avec une application cassée. Réparez-la. Découvrez la théorie en chemin. Chaque concept est la réponse à une question que vous avez déjà.",
			cta: 'Commencer',
			ctaGuest: 'Essayer une démo',
			demoTitle: 'Essayez maintenant',
			demoSubtitle: 'Ce code est cassé. Pouvez-vous le réparer ? Modifiez le code ci-dessous et cliquez sur Exécuter.',
			demoHint: 'Indice : la fonction attend une chaîne, pas un nombre.',
			demoSuccess: 'Bien joué ! Cette erreur de type ? TypeScript l\'a attrapée avant l\'exécution. C\'est ça, l\'apprentissage inversé.',
			demoCTA: 'Créer un compte gratuit',
			stepsTitle: 'Comment ça marche',
			steps: [
				{
					number: '1',
					title: 'Casser',
					description: 'Voyez du code cassé. Comprenez ce qu\'il est censé faire. Essayez de le réparer.',
					icon: Wrench
				},
				{
					number: '2',
					title: 'Réparer',
					description: 'Déboguez et réparez. Exécutez votre solution. Obtenez un retour instantané.',
					icon: Terminal
				},
				{
					number: '3',
					title: 'Apprendre',
					description: 'La théorie se révèle comme la réponse à votre question. Le moment "eurêka" est la leçon.',
					icon: Lightbulb
				}
			],
			paths: "Parcours d'apprentissage",
			pathsDesc: "Des parcours de rétro-ingénierie soigneusement conçus.",
			startPath: 'Commencer',
			philosophy: 'Éducation traditionnelle : Théorie → Exemples → Peut-être un vrai problème.\nReverse Academy : Vrai problème → Tentative → "Pourquoi ?" → Découvrir le concept.\nChaque morceau de théorie est la réponse à une question que vous avez déjà.',
			features: [
				{
					title: "Le problème d'abord",
					description: "Chaque leçon commence avec du vrai code cassé. Vous le réparez avant d'apprendre la théorie.",
					icon: Terminal
				},
				{
					title: 'Théorie méritée',
					description: 'Les concepts se révèlent après la difficulté. Le moment "eurêka" est la leçon.',
					icon: BookOpen
				},
				{
					title: 'Retour instantané',
					description: "Exécutez du code dans le navigateur. Résultats immédiats. Pas d'installation.",
					icon: Zap
				}
			],
			pathsList: [
				{
					title: 'TypeScript : Détective d\'Erreurs',
					difficulty: 'Débutant',
					time: '~30 min',
					scenario: 'Un collègue a poussé du code cassé. Trouvez les erreurs de type et corrigez-les.',
					slug: 'typescript-error-detective'
				},
				{
					title: 'Construire une API REST — À l\'envers',
					difficulty: 'Intermédiaire',
					time: '~45 min',
					scenario: 'Déployez un endpoint, puis découvrez HTTP, le routage et les middlewares.',
					slug: 'build-rest-api-backward'
				},
				{
					title: 'Rust : Pourquoi le compilateur me déteste ?',
					difficulty: 'Intermédiaire',
					time: '~40 min',
					scenario: 'Corrigez les erreurs du borrow checker et découvrez ownership, borrowing et lifetimes.',
					slug: 'rust-ownership-from-bugs'
				}
			]
		}
	};

	$: t = copy[$locale] || copy.en;

	let demoCodeValue = demoCode;
	let demoOutput = '';
	let demoError = '';
	let demoSuccess = false;
	let demoRunning = false;

	function runDemo() {
		demoRunning = true;
		demoOutput = '';
		demoError = '';
		demoSuccess = false;

		setTimeout(() => {
			const code = demoCodeValue.trim();
			const hasStringArg = /greet\s*\(\s*['"`]/.test(code);
			const hasNumberArg = /greet\s*\(\s*\d+/.test(code);

			if (hasStringArg && !hasNumberArg) {
				demoOutput = `Hello, ${code.match(/greet\s*\(\s*['"`]([^'"`]*)['"`]/)?.[1] || 'World'}!`;
				demoSuccess = true;
			} else if (hasNumberArg) {
				demoError = `Argument of type 'number' is not assignable to parameter of type 'string'.`;
			} else {
				demoError = `Expected 1 argument, but got 0.`;
			}
			demoRunning = false;
		}, 300);
	}

	function resetDemo() {
		demoCodeValue = demoCode;
		demoOutput = '';
		demoError = '';
		demoSuccess = false;
	}
</script>

<SEOHead locale={$locale} />

<div class="landing">
	<!-- 1. Hero -->
	<section class="hero" aria-labelledby="hero-heading">
		<h1 id="hero-heading" class="hero-title">{t.hero}</h1>
		<p class="hero-subtitle">{t.subtitle}</p>
		<div class="hero-actions">
			<a href="{base}/{$locale}/explore" class="btn-primary">
				<span>{t.cta}</span>
				<ArrowRight size={16} strokeWidth={1.5} />
			</a>
			<a href="#demo" class="btn-secondary">
				<span>{t.ctaGuest}</span>
			</a>
		</div>
	</section>

	<!-- 2. Interactive Demo -->
	<section id="demo" class="demo-section" aria-labelledby="demo-heading">
		<h2 id="demo-heading" class="demo-title">{t.demoTitle}</h2>
		<p class="demo-subtitle">{t.demoSubtitle}</p>

		<div class="demo-container">
			<div class="demo-editor">
				<div class="demo-editor-header">
					<span class="demo-filename">main.ts</span>
					<span class="demo-lang">TypeScript</span>
				</div>
				<textarea
					bind:value={demoCodeValue}
					class="demo-textarea"
					spellcheck="false"
					aria-label="Code editor"
				></textarea>
				<div class="demo-actions">
					<button class="demo-run-btn" on:click={runDemo} disabled={demoRunning}>
						<Zap size={14} strokeWidth={1.5} />
						<span>{demoRunning ? ($locale === 'fr' ? 'Exécution...' : 'Running...') : ($locale === 'fr' ? 'Exécuter' : 'Run')}</span>
					</button>
					<button class="demo-reset-btn" on:click={resetDemo} aria-label={$locale === 'fr' ? 'Réinitialiser' : 'Reset'}>
						{$locale === 'fr' ? 'Réinitialiser' : 'Reset'}
					</button>
				</div>
			</div>

			<div class="demo-output" class:success={demoSuccess} class:error={demoError}>
				{#if demoSuccess}
					<div class="output-success">
						<Lightbulb size={16} strokeWidth={1.5} />
						<p>{t.demoSuccess}</p>
					</div>
					<a href="{base}/{$locale}/auth/register" class="demo-cta">
						<span>{t.demoCTA}</span>
						<ArrowRight size={14} strokeWidth={1.5} />
					</a>
				{:else if demoError}
					<div class="output-error">
						<Terminal size={16} strokeWidth={1.5} />
						<p>{demoError}</p>
					</div>
					<p class="demo-hint">{t.demoHint}</p>
				{:else if demoRunning}
					<div class="output-loading"></div>
				{/if}
			</div>
		</div>
	</section>

	<!-- 3. How It Works -->
	<section class="steps-section" aria-labelledby="steps-heading">
		<h2 id="steps-heading" class="steps-title">{t.stepsTitle}</h2>
		<div class="steps-grid">
			{#each t.steps as step}
				<div class="step-card">
					<div class="step-number">{step.number}</div>
					<div class="step-icon" aria-hidden="true">
						<svelte:component this={step.icon} size={24} strokeWidth={1.5} />
					</div>
					<h3 class="step-card-title">{step.title}</h3>
					<p class="step-card-description">{step.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- 4. Features -->
	<section class="features" aria-label={$locale === 'fr' ? 'Fonctionnalités' : 'Features'}>
		<div class="features-grid">
			{#each t.features as feature}
				<div class="feature-card">
					<div class="feature-icon" aria-hidden="true">
						<svelte:component this={feature.icon} size={24} strokeWidth={1.5} />
					</div>
					<h3 class="feature-title">{feature.title}</h3>
					<p class="feature-description">{feature.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- 5. Featured Paths -->
	<section class="paths-section" aria-labelledby="paths-heading">
		<h2 id="paths-heading" class="paths-title">{t.paths}</h2>
		<p class="paths-subtitle">{t.pathsDesc}</p>
		<div class="paths-grid">
			{#each t.pathsList as path}
				<a href="{base}/{$locale}/learn/{path.slug}" class="path-card">
					<div class="path-card-header">
						<h3 class="path-card-title">{path.title}</h3>
						<div class="path-badges">
							<span class="badge badge-difficulty">{path.difficulty}</span>
							<span class="badge badge-time">{path.time}</span>
						</div>
					</div>
					<p class="path-card-scenario">{path.scenario}</p>
					<div class="path-card-footer">
						<span class="path-cta-text">{t.startPath}</span>
						<ArrowRight size={14} strokeWidth={1.5} />
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- 6. Philosophy Block -->
	<section class="philosophy-section" aria-label={$locale === 'fr' ? 'Philosophie' : 'Philosophy'}>
		<div class="philosophy-content">
			{#each t.philosophy.split('\n') as line}
				<p class="philosophy-line">{line}</p>
			{/each}
		</div>
	</section>
</div>

<style>
	.landing {
		max-width: var(--max-width-content);
		margin: 0 auto;
		padding: 0 var(--space-6);
	}

	/* Hero */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-32) 0 var(--space-16);
		gap: var(--space-6);
	}

	.hero-title {
		font-family: var(--font-heading);
		font-size: var(--text-hero);
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1.05;
		margin: 0;
		max-width: 14ch;
	}

	.hero-subtitle {
		max-width: 520px;
		font-family: var(--font-body);
		font-size: var(--text-lg);
		color: var(--text-secondary);
		line-height: 1.55;
		margin: 0;
	}

	.hero-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		min-height: 44px;
		background: var(--accent);
		color: var(--text-inverse);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		text-decoration: none;
		transition: background-color 120ms ease-out;
	}

	.btn-primary:hover {
		background: var(--accent-hover);
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		min-height: 44px;
		background: transparent;
		color: var(--text-primary);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		text-decoration: none;
		transition: border-color 120ms ease-out, background-color 120ms ease-out;
	}

	.btn-secondary:hover {
		border-color: var(--text-tertiary);
		background: var(--surface-3);
	}

	/* Demo Section */
	.demo-section {
		padding: var(--space-16) 0;
		text-align: center;
	}

	.demo-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-3) 0;
	}

	.demo-subtitle {
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--text-secondary);
		margin: 0 0 var(--space-8) 0;
	}

	.demo-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		max-width: 800px;
		margin: 0 auto;
		text-align: left;
	}

	@media (max-width: 768px) {
		.demo-container {
			grid-template-columns: 1fr;
		}
	}

	.demo-editor {
		background: var(--code-bg);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.demo-editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		background: var(--surface-2);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.demo-filename {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.demo-lang {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.demo-textarea {
		width: 100%;
		min-height: 180px;
		padding: var(--space-4);
		background: transparent;
		border: none;
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.6;
		resize: vertical;
		tab-size: 2;
	}

	.demo-textarea:focus {
		outline: none;
	}

	.demo-actions {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--surface-subtle);
	}

	.demo-run-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		min-height: 36px;
		background: var(--accent);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: background-color 120ms ease-out;
	}

	.demo-run-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.demo-run-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.demo-reset-btn {
		padding: var(--space-2) var(--space-3);
		min-height: 36px;
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: border-color 120ms ease-out;
	}

	.demo-reset-btn:hover {
		border-color: var(--text-tertiary);
	}

	.demo-output {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-4);
	}

	.demo-output.success {
		border-color: var(--success);
		background: var(--success-muted);
	}

	.demo-output.error {
		border-color: var(--error);
		background: var(--error-muted);
	}

	.output-success,
	.output-error {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
	}

	.output-success {
		color: var(--success);
	}

	.output-error {
		color: var(--error);
	}

	.output-success p,
	.output-error p {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.output-error p {
		font-family: var(--font-mono);
	}

	.demo-hint {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		font-style: italic;
	}

	.demo-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--accent);
		color: var(--text-inverse);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
		align-self: flex-start;
		transition: background-color 120ms ease-out;
	}

	.demo-cta:hover {
		background: var(--accent-hover);
	}

	.output-loading {
		width: 24px;
		height: 24px;
		border: 2px solid var(--surface-subtle);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.output-loading {
			animation: none;
			opacity: 0.5;
		}
	}

	/* Steps Section */
	.steps-section {
		padding: var(--space-16) 0;
		text-align: center;
	}

	.steps-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-8) 0;
	}

	.steps-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-6);
	}

	@media (max-width: 768px) {
		.steps-grid {
			grid-template-columns: 1fr;
		}
	}

	.step-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-6);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		position: relative;
	}

	.step-number {
		position: absolute;
		top: var(--space-3);
		left: var(--space-4);
		font-family: var(--font-heading);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--accent-muted);
		line-height: 1;
	}

	.step-icon {
		color: var(--accent);
		margin-top: var(--space-4);
	}

	.step-card-title {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text-primary);
	}

	.step-card-description {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
		text-align: center;
	}

	/* Features */
	.features {
		padding: var(--space-16) 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-6);
	}

	@media (max-width: 768px) {
		.features-grid {
			grid-template-columns: 1fr;
		}
	}

	.feature-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-6);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		transition: border-color 150ms ease-out, transform 150ms ease-out;
	}

	.feature-card:hover {
		border-color: var(--accent-muted);
		transform: translateY(-2px);
	}

	@media (prefers-reduced-motion: reduce) {
		.feature-card:hover {
			transform: none;
		}
	}

	.feature-icon {
		color: var(--accent);
	}

	.feature-title {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text-primary);
	}

	.feature-description {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
	}

	/* Paths Section */
	.paths-section {
		padding: var(--space-16) 0;
	}

	.paths-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 var(--space-2) 0;
		text-align: center;
	}

	.paths-subtitle {
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--text-secondary);
		margin: 0 0 var(--space-8) 0;
		text-align: center;
	}

	.paths-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-6);
	}

	@media (max-width: 768px) {
		.paths-grid {
			grid-template-columns: 1fr;
		}
	}

	.path-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-6);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 150ms ease-out, transform 150ms ease-out;
	}

	.path-card:hover {
		border-color: var(--accent-muted);
		transform: translateY(-2px);
	}

	@media (prefers-reduced-motion: reduce) {
		.path-card:hover {
			transform: none;
		}
	}

	.path-card-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.path-card-title {
		margin: 0;
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text-primary);
	}

	.path-badges {
		display: flex;
		gap: var(--space-2);
	}

	.badge {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.badge-difficulty {
		background: var(--accent-muted);
		color: var(--accent-text);
	}

	.badge-time {
		background: var(--surface-subtle);
		color: var(--text-secondary);
	}

	.path-card-scenario {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.55;
	}

	.path-card-footer {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: auto;
		padding-top: var(--space-3);
		border-top: 1px solid var(--surface-subtle);
		color: var(--accent);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	/* Philosophy Section */
	.philosophy-section {
		padding: var(--space-24) 0;
		display: flex;
		justify-content: center;
	}

	.philosophy-content {
		max-width: 680px;
		text-align: center;
		border-left: 3px solid var(--accent);
		padding-left: var(--space-6);
	}

	.philosophy-line {
		margin: 0 0 var(--space-4) 0;
		font-family: var(--font-body);
		font-size: var(--text-lg);
		color: var(--text-secondary);
		line-height: 1.65;
	}

	.philosophy-line:last-child {
		margin-bottom: 0;
		color: var(--accent-text);
		font-weight: 600;
	}
</style>
