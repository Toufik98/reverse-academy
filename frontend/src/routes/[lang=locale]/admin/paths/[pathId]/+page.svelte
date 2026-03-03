<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { createAdminT } from '$lib/i18n/admin';
	import type { SupportedLocale } from '$types/i18n';
	import type { LearningPath, Step, StepContent } from '$types/path';

	/** Access a property from a StepContent union safely. */
	function contentField(content: StepContent | undefined, field: string): any {
		if (!content) return undefined;
		return (content as Record<string, any>)[field];
	}

	export let data: {
		path: LearningPath;
		adminToken: string;
	};

	$: lang = $page.params.lang as SupportedLocale;
	$: t = createAdminT(lang);
	$: path = data.path;

	// ─── Path metadata form ──────────────────────────────────────
	let title = data.path.title;
	let slug = data.path.slug;
	let domain = data.path.domain;
	let mode = data.path.mode;
	let difficulty = data.path.difficulty;
	let description = data.path.description;
	let estimatedMinutes = data.path.estimatedMinutes;
	let xpReward = data.path.xpReward;

	let saving = false;
	let saveMsg = '';
	let saveError = '';

	async function savePath() {
		saving = true;
		saveMsg = '';
		saveError = '';

		try {
			const res = await fetch(`/api/v1/admin/paths/${path.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.adminToken}`
				},
				body: JSON.stringify({
					title, domain, mode, difficulty, description,
					estimatedMinutes, xpReward
				})
			});

			if (res.ok) {
				saveMsg = 'Path updated';
				await invalidateAll();
			} else {
				const text = await res.text();
				saveError = `Error (${res.status}): ${text}`;
			}
		} catch (e) {
			saveError = 'Failed to save';
		} finally {
			saving = false;
			setTimeout(() => { saveMsg = ''; saveError = ''; }, 4000);
		}
	}

	// ─── Step management ─────────────────────────────────────────
	let expandedStep: string | null = null;
	let editingStep: Step | null = null;
	let stepSaving = false;
	let stepMsg = '';
	let stepError = '';

	// New step form
	let newStepTitle = '';
	let newStepType = 'challenge';
	let newStepXP = 10;
	let showNewStep = false;

	function toggleStep(stepId: string) {
		expandedStep = expandedStep === stepId ? null : stepId;
		editingStep = null;
	}

	function startEditStep(step: Step) {
		editingStep = { ...step, content: JSON.parse(JSON.stringify(step.content)) };
	}

	function cancelEditStep() {
		editingStep = null;
	}

	async function saveStep() {
		if (!editingStep) return;
		stepSaving = true;
		stepMsg = '';
		stepError = '';

		// The step id from path response is like "pathId/step-1" — we need just the step part
		const fullId = editingStep.id;
		const stepIdPart = fullId.includes('/') ? fullId.split('/').pop() : fullId;

		try {
			const res = await fetch(`/api/v1/admin/paths/${path.id}/steps/${stepIdPart}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.adminToken}`
				},
				body: JSON.stringify({
					title: editingStep.title,
					stepType: editingStep.type,
					content: editingStep.content,
					hint: editingStep.hint || null,
					xpReward: editingStep.xpReward
				})
			});

			if (res.ok) {
				stepMsg = 'Step updated';
				editingStep = null;
				await invalidateAll();
			} else {
				const text = await res.text();
				stepError = `Error (${res.status}): ${text}`;
			}
		} catch (e) {
			stepError = 'Failed to save step';
		} finally {
			stepSaving = false;
			setTimeout(() => { stepMsg = ''; stepError = ''; }, 4000);
		}
	}

	async function addStep() {
		if (!newStepTitle) return;
		stepSaving = true;
		stepError = '';

		const content = newStepType === 'challenge'
			? { type: 'challenge', scenario: '', code: '', language: 'typescript', hint: '', expectedConcepts: [] }
			: { type: 'reveal', theory: '', keyInsight: '' };

		try {
			const res = await fetch(`/api/v1/admin/paths/${path.id}/steps`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.adminToken}`
				},
				body: JSON.stringify({
					title: newStepTitle,
					stepType: newStepType,
					content,
					xpReward: newStepXP
				})
			});

			if (res.ok) {
				newStepTitle = '';
				newStepXP = 10;
				showNewStep = false;
				await invalidateAll();
			} else {
				const text = await res.text();
				stepError = `Error: ${text}`;
			}
		} catch (e) {
			stepError = 'Failed to add step';
		} finally {
			stepSaving = false;
		}
	}

	async function deleteStep(stepId: string) {
		const stepIdPart = stepId.includes('/') ? stepId.split('/').pop() : stepId;

		try {
			const res = await fetch(`/api/v1/admin/paths/${path.id}/steps/${stepIdPart}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${data.adminToken}` }
			});

			if (res.ok) {
				await invalidateAll();
			}
		} catch (e) {
			console.error('Delete step failed:', e);
		}
	}

	let contentJson = '';
	$: if (editingStep) {
		contentJson = JSON.stringify(editingStep.content, null, 2);
	}

	function handleContentChange(e: Event) {
		const value = (e.target as HTMLTextAreaElement).value;
		contentJson = value;
		try {
			if (editingStep) {
				editingStep.content = JSON.parse(value);
			}
		} catch {
			// Allow incomplete JSON while typing
		}
	}

	// ─── Drag & drop reorder ────────────────────────────────────
	let dragIndex: number | null = null;

	function handleDragStart(index: number) {
		dragIndex = index;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	async function handleDrop(targetIndex: number) {
		if (dragIndex === null || dragIndex === targetIndex || !path.steps) return;

		const steps = [...path.steps];
		const [moved] = steps.splice(dragIndex, 1);
		steps.splice(targetIndex, 0, moved);

		const stepIds = steps.map(s => {
			const id = s.id;
			return id.includes('/') ? id.split('/').pop()! : id;
		});

		try {
			const res = await fetch(`/api/v1/admin/paths/${path.id}/steps/reorder`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.adminToken}`
				},
				body: JSON.stringify({ step_ids: stepIds })
			});

			if (res.ok) {
				await invalidateAll();
			}
		} catch (e) {
			console.error('Reorder failed:', e);
		} finally {
			dragIndex = null;
		}
	}

	async function handleExport() {
		try {
			const res = await fetch(`/api/v1/admin/paths/${path.id}/export`, {
				headers: { Authorization: `Bearer ${data.adminToken}` }
			});

			if (res.ok) {
				const json = await res.json();
				const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${path.slug}.json`;
				a.click();
				URL.revokeObjectURL(url);
			}
		} catch (e) {
			console.error('Export failed:', e);
		}
	}

	const typeIcons: Record<string, string> = {
		challenge: 'C',
		reveal: 'R',
		exercise: 'E',
		quiz: 'Q',
		sandbox: 'S',
		theory: 'T'
	};

	const typeColors: Record<string, string> = {
		challenge: 'var(--accent)',
		reveal: 'var(--info)',
		exercise: 'var(--success)',
		quiz: 'var(--warning)',
		sandbox: 'var(--code-keyword)',
		theory: 'var(--text-secondary)'
	};
</script>

<svelte:head>
	<title>{path.title} — Admin</title>
</svelte:head>

<div class="editor-page">
	<!-- Breadcrumb -->
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="{base}/{lang}/admin/paths">{t('nav.paths')}</a>
		<span class="sep">/</span>
		<span class="current">{path.title}</span>
	</nav>

	<!-- Path metadata section -->
	<section class="metadata-section">
		<div class="section-header">
			<h1>{t('editor.pathDetails')}</h1>
			<div class="section-actions">
				<button class="btn btn-secondary" on:click={handleExport}>{t('editor.exportJson')}</button>
			</div>
		</div>

		<form on:submit|preventDefault={savePath} class="metadata-form">
			<div class="form-grid">
				<div class="field span-2">
					<label for="path-title">{t('table.title')}</label>
					<input id="path-title" type="text" bind:value={title} required />
				</div>

				<div class="field">
					<label for="path-slug">{t('newPath.slug')}</label>
					<input id="path-slug" type="text" value={slug} disabled class="disabled-input" />
					<span class="field-help">Slug cannot be changed</span>
				</div>

				<div class="field">
					<label for="path-domain">{t('table.domain')}</label>
					<select id="path-domain" bind:value={domain}>
						<option value="programming">{t('common.programming')}</option>
						<option value="web-dev">{t('common.webDev')}</option>
						<option value="systems">{t('common.systems')}</option>
						<option value="stem">{t('common.stem')}</option>
						<option value="languages">{t('common.languages')}</option>
					</select>
				</div>

				<div class="field">
					<label for="path-mode">{t('editor.mode')}</label>
					<select id="path-mode" bind:value={mode}>
						<option value="fix-broken">{t('common.fixBroken')}</option>
						<option value="problem-first">{t('common.problemFirst')}</option>
						<option value="reverse-engineer">{t('common.reverseEngineer')}</option>
						<option value="goal-tree">{t('common.goalTree')}</option>
					</select>
				</div>

				<div class="field">
					<label for="path-difficulty">{t('table.difficulty')}</label>
					<select id="path-difficulty" bind:value={difficulty}>
						<option value="beginner">{t('common.beginner')}</option>
						<option value="intermediate">{t('common.intermediate')}</option>
						<option value="advanced">{t('common.advanced')}</option>
					</select>
				</div>

				<div class="field">
					<label for="path-minutes">{t('editor.estimatedMinutes')}</label>
					<input id="path-minutes" type="number" bind:value={estimatedMinutes} min="1" />
				</div>

				<div class="field">
					<label for="path-xp">{t('editor.xpReward')}</label>
					<input id="path-xp" type="number" bind:value={xpReward} min="0" />
				</div>

				<div class="field span-full">
					<label for="path-desc">{t('editor.description')}</label>
					<textarea id="path-desc" bind:value={description} rows="3"></textarea>
				</div>
			</div>

			<div class="form-footer">
				{#if saveMsg}
					<span class="msg success-msg" role="status">{saveMsg}</span>
				{/if}
				{#if saveError}
					<span class="msg error-msg" role="alert">{saveError}</span>
				{/if}
				<button type="submit" class="btn btn-primary" disabled={saving}>
					{saving ? t('editor.saving') : t('editor.save')}
				</button>
			</div>
		</form>
	</section>

	<!-- Steps section -->
	<section class="steps-section">
		<div class="section-header">
			<h2>{t('steps.title')} ({path.steps?.length || 0})</h2>
			<button class="btn btn-primary" on:click={() => { showNewStep = !showNewStep; }}>
				{showNewStep ? t('steps.cancel') : t('steps.addNew')}
			</button>
		</div>

		{#if stepMsg}
			<div class="msg success-msg" role="status">{stepMsg}</div>
		{/if}
		{#if stepError}
			<div class="msg error-msg" role="alert">{stepError}</div>
		{/if}

		{#if showNewStep}
			<form on:submit|preventDefault={addStep} class="new-step-form">
				<div class="new-step-fields">
					<input
						type="text"
						placeholder={t('steps.newTitle')}
						bind:value={newStepTitle}
						required
						class="new-step-input"
					/>
					<select bind:value={newStepType} class="new-step-select">
						<option value="challenge">Challenge</option>
						<option value="reveal">Reveal</option>
						<option value="exercise">Exercise</option>
						<option value="sandbox">Sandbox</option>
						<option value="theory">Theory</option>
					</select>
					<input
						type="number"
						bind:value={newStepXP}
						min="0"
						class="new-step-xp"
						aria-label="XP reward"
					/>
					<button type="submit" class="btn btn-primary" disabled={stepSaving}>{stepSaving ? t('steps.creating') : t('steps.create')}</button>
				</div>
			</form>
		{/if}

		<div class="step-list" role="list">
			{#each (path.steps || []) as step, i (step.id)}
				<div
					class="step-item"
					class:expanded={expandedStep === step.id}
					class:dragging={dragIndex === i}
					role="listitem"
					draggable="true"
					on:dragstart={() => handleDragStart(i)}
					on:dragover={handleDragOver}
					on:drop={() => handleDrop(i)}
				>
					<div class="step-header" on:click={() => toggleStep(step.id)} on:keydown={(e) => e.key === 'Enter' && toggleStep(step.id)} tabindex="0" role="button" aria-expanded={expandedStep === step.id}>
						<span class="step-drag" aria-hidden="true">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>
						</span>
						<span class="step-order">{step.order}</span>
						<span class="step-type-icon" style="color: {typeColors[step.type] || 'var(--text-secondary)'}">
							{typeIcons[step.type] || '?'}
						</span>
						<span class="step-title">{step.title}</span>
						<span class="step-xp">{step.xpReward} XP</span>
						<span class="step-type-label">{step.type}</span>
						<svg class="step-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</div>

					{#if expandedStep === step.id}
						<div class="step-body">
							{#if editingStep && editingStep.id === step.id}
								<!-- Edit mode -->
								<div class="edit-fields">
									<div class="field">
										<label for="edit-title-{step.id}">Title</label>
										<input id="edit-title-{step.id}" type="text" bind:value={editingStep.title} />
									</div>

									<div class="field-row">
										<div class="field">
											<label for="edit-type-{step.id}">{t('steps.type')}</label>
											<select id="edit-type-{step.id}" bind:value={editingStep.type}>
												<option value="challenge">Challenge</option>
												<option value="reveal">Reveal</option>
												<option value="exercise">Exercise</option>
												<option value="sandbox">Sandbox</option>
												<option value="theory">Theory</option>
											</select>
										</div>
										<div class="field">
											<label for="edit-xp-{step.id}">{t('editor.xpReward')}</label>
											<input id="edit-xp-{step.id}" type="number" bind:value={editingStep.xpReward} min="0" />
										</div>
									</div>

									<div class="field">
										<label for="edit-hint-{step.id}">{t('steps.hint')}</label>
										<input id="edit-hint-{step.id}" type="text" bind:value={editingStep.hint} placeholder="Optional hint text" />
									</div>

									<div class="field">
										<label for="edit-content-{step.id}">{t('steps.contentJson')}</label>
										<textarea
											id="edit-content-{step.id}"
											class="content-editor"
											value={contentJson}
											on:input={handleContentChange}
											rows="20"
											spellcheck="false"
										></textarea>
									</div>

									<div class="edit-actions">
										<button class="btn btn-secondary" on:click={cancelEditStep}>{t('steps.cancel')}</button>
										<button class="btn btn-primary" on:click={saveStep} disabled={stepSaving}>
											{stepSaving ? t('steps.saving') : t('steps.save')}
										</button>
									</div>
								</div>
							{:else}
								<!-- View mode -->
								<div class="step-preview">
									{#if contentField(step.content, 'scenario')}
										<div class="preview-block">
											<span class="preview-label">{t('steps.scenario')}</span>
											<p>{contentField(step.content, 'scenario')}</p>
										</div>
									{/if}
									{#if contentField(step.content, 'theory')}
										<div class="preview-block">
											<span class="preview-label">{t('steps.theory')}</span>
											<p class="theory-preview">{contentField(step.content, 'theory').slice(0, 300)}{contentField(step.content, 'theory').length > 300 ? '...' : ''}</p>
										</div>
									{/if}
									{#if contentField(step.content, 'keyInsight')}
										<div class="preview-block">
											<span class="preview-label">{t('steps.keyInsight')}</span>
											<p>{contentField(step.content, 'keyInsight')}</p>
										</div>
									{/if}
									{#if contentField(step.content, 'code')}
										<div class="preview-block">
											<span class="preview-label">{t('steps.code')} ({contentField(step.content, 'language') || 'unknown'})</span>
											<pre class="code-preview">{contentField(step.content, 'code')}</pre>
										</div>
									{/if}
								</div>

								<div class="step-actions">
									<button class="btn btn-secondary" on:click={() => startEditStep(step)}>{t('steps.edit')}</button>
									<button class="btn btn-danger" on:click={() => deleteStep(step.id)}>{t('steps.delete')}</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		{#if !path.steps || path.steps.length === 0}
			<div class="empty-state">
				<p>No steps yet. Add a step to get started.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.editor-page {
		padding: var(--space-8);
		max-width: 1000px;
	}

	/* Breadcrumb */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		font-family: var(--font-body);
		font-size: var(--text-sm);
	}

	.breadcrumb a {
		color: var(--text-tertiary);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--accent);
	}

	.sep {
		color: var(--text-tertiary);
	}

	.current {
		color: var(--text-primary);
		font-weight: 500;
	}

	/* Sections */
	.metadata-section,
	.steps-section {
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		margin-bottom: var(--space-6);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-5);
	}

	.section-header h1,
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

	/* Form */
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	.span-2 { grid-column: span 2; }
	.span-full { grid-column: 1 / -1; }

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field label {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.field input,
	.field select,
	.field textarea {
		padding: var(--space-2) var(--space-3);
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
		transition: border-color 0.15s;
	}

	.field input:focus,
	.field select:focus,
	.field textarea:focus {
		border-color: var(--accent);
	}

	.field textarea {
		resize: vertical;
		min-height: 80px;
	}

	.disabled-input {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.field-help {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.form-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-4);
		margin-top: var(--space-5);
		padding-top: var(--space-4);
		border-top: 1px solid var(--surface-subtle);
	}

	.field-row {
		display: flex;
		gap: var(--space-4);
	}

	.field-row .field {
		flex: 1;
	}

	/* Messages */
	.msg {
		font-family: var(--font-body);
		font-size: var(--text-sm);
	}

	.success-msg { color: var(--success); }
	.error-msg { color: var(--error); }

	/* Buttons */
	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
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

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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

	.btn-danger {
		background: transparent;
		color: var(--error);
		border: 1px solid var(--error-muted);
	}

	.btn-danger:hover {
		background: var(--error-muted);
	}

	/* New step form */
	.new-step-form {
		margin-bottom: var(--space-4);
		padding: var(--space-4);
		background: var(--surface-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
	}

	.new-step-fields {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.new-step-input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
	}

	.new-step-input:focus { border-color: var(--accent); }

	.new-step-select,
	.new-step-xp {
		padding: var(--space-2) var(--space-3);
		background: var(--surface-1);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
	}

	.new-step-xp { width: 80px; }

	/* Step list */
	.step-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.step-item {
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		transition: border-color 0.15s;
	}

	.step-item:hover {
		border-color: var(--surface-3);
	}

	.step-item.expanded {
		border-color: var(--accent-muted);
	}

	.step-item.dragging {
		opacity: 0.5;
	}

	.step-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		cursor: pointer;
		background: var(--surface-2);
	}

	.step-header:hover {
		background: var(--surface-3);
	}

	.step-drag {
		color: var(--text-tertiary);
		cursor: grab;
		flex-shrink: 0;
	}

	.step-order {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		min-width: 20px;
		text-align: center;
	}

	.step-type-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		background: var(--surface-1);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-title {
		flex: 1;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-primary);
	}

	.step-xp {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.step-type-label {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		text-transform: capitalize;
	}

	.step-chevron {
		color: var(--text-tertiary);
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.step-item.expanded .step-chevron {
		transform: rotate(180deg);
	}

	.step-body {
		padding: var(--space-4);
		border-top: 1px solid var(--surface-subtle);
	}

	/* Step preview */
	.step-preview {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.preview-block {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.preview-label {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.preview-block p {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	.theory-preview {
		white-space: pre-wrap;
	}

	.code-preview {
		background: var(--code-bg);
		padding: var(--space-4);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-primary);
		overflow-x: auto;
		white-space: pre;
		margin: 0;
	}

	.step-actions {
		display: flex;
		gap: var(--space-3);
	}

	/* Content editor textarea */
	.content-editor {
		font-family: var(--font-mono) !important;
		font-size: var(--text-xs) !important;
		line-height: 1.5;
		white-space: pre;
		tab-size: 2;
		background: var(--code-bg) !important;
		min-height: 300px;
	}

	/* Edit fields */
	.edit-fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.edit-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		padding-top: var(--space-3);
		border-top: 1px solid var(--surface-subtle);
	}

	.empty-state {
		padding: var(--space-8);
		text-align: center;
	}

	.empty-state p {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	@media (max-width: 768px) {
		.editor-page {
			padding: var(--space-4);
		}
		.form-grid {
			grid-template-columns: 1fr;
		}
		.span-2 { grid-column: span 1; }
		.new-step-fields {
			flex-direction: column;
			align-items: stretch;
		}
		.new-step-xp { width: 100%; }
	}
</style>
