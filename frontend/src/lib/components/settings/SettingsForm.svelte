<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { locale } from '$stores/locale';
	import { settings, type UserSettings } from '$stores/settings';
	import { Sun, Moon, Save } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	let formValues: UserSettings = { ...$settings };
	let saving = false;
	let saved = false;

	$: formValues = { ...$settings };

	async function save() {
		saving = true;
		saved = false;
		settings.set(formValues);
		dispatch('save', formValues);
		saving = false;
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}
</script>

<form class="settings-form" on:submit|preventDefault={save}>
	<h2 class="form-title">{$locale === 'fr' ? 'Préférences' : 'Preferences'}</h2>

	<!-- Theme -->
	<fieldset class="form-group">
		<legend class="group-label">{$locale === 'fr' ? 'Thème' : 'Theme'}</legend>
		<div class="theme-options">
			<label class="radio-option" class:selected={formValues.theme === 'dark'}>
				<input type="radio" name="theme" value="dark" bind:group={formValues.theme} />
				<Moon size={14} strokeWidth={1.5} />
				<span>Dark</span>
			</label>
			<label class="radio-option" class:selected={formValues.theme === 'light'}>
				<input type="radio" name="theme" value="light" bind:group={formValues.theme} />
				<Sun size={14} strokeWidth={1.5} />
				<span>Light</span>
			</label>
			<label class="radio-option" class:selected={formValues.theme === 'system'}>
				<input type="radio" name="theme" value="system" bind:group={formValues.theme} />
				<span>System</span>
			</label>
		</div>
	</fieldset>

	<!-- Language -->
	<fieldset class="form-group">
		<legend class="group-label">{$locale === 'fr' ? 'Langue' : 'Language'}</legend>
		<div class="theme-options">
			<label class="radio-option" class:selected={formValues.locale === 'en'}>
				<input type="radio" name="locale" value="en" bind:group={formValues.locale} />
				<span>English</span>
			</label>
			<label class="radio-option" class:selected={formValues.locale === 'fr'}>
				<input type="radio" name="locale" value="fr" bind:group={formValues.locale} />
				<span>Français</span>
			</label>
		</div>
	</fieldset>

	<!-- Editor settings -->
	<fieldset class="form-group">
		<legend class="group-label">{$locale === 'fr' ? 'Éditeur de code' : 'Code Editor'}</legend>
		<div class="input-row">
			<label class="input-label" for="font-size">
				{$locale === 'fr' ? 'Taille de police' : 'Font size'}
			</label>
			<input
				id="font-size"
				type="number"
				min="10"
				max="24"
				bind:value={formValues.editorFontSize}
				class="input-number"
			/>
		</div>
		<div class="input-row">
			<label class="input-label" for="tab-size">
				{$locale === 'fr' ? 'Taille de tabulation' : 'Tab size'}
			</label>
			<select id="tab-size" bind:value={formValues.editorTabSize} class="input-select">
				<option value={2}>2</option>
				<option value={4}>4</option>
			</select>
		</div>
	</fieldset>

	<button class="save-btn" type="submit" disabled={saving}>
		<Save size={14} strokeWidth={1.5} />
		<span>
			{#if saved}
				{$locale === 'fr' ? 'Enregistré !' : 'Saved!'}
			{:else if saving}
				{$locale === 'fr' ? 'Enregistrement...' : 'Saving...'}
			{:else}
				{$locale === 'fr' ? 'Enregistrer' : 'Save'}
			{/if}
		</span>
	</button>
</form>

<style>
	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 480px;
	}

	.form-title {
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.form-group {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.group-label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
	}

	.theme-options {
		display: flex;
		gap: var(--space-2);
	}

	.radio-option {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		min-height: 44px;
		border: 1.5px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 120ms ease-out;
	}

	.radio-option input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.radio-option.selected {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-subtle);
	}

	.radio-option:hover:not(.selected) {
		border-color: var(--text-tertiary);
	}

	.input-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.input-label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.input-number,
	.input-select {
		width: 80px;
		padding: var(--space-2) var(--space-2);
		border: 1px solid var(--surface-subtle);
		border-radius: var(--radius-sm);
		background: var(--surface-1);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	.input-number:focus,
	.input-select:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-subtle);
	}

	.save-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		align-self: flex-start;
		padding: var(--space-2) var(--space-4);
		min-height: 44px;
		background: var(--accent);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease-out;
	}

	.save-btn:hover:not(:disabled) { background: var(--accent-hover); }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
