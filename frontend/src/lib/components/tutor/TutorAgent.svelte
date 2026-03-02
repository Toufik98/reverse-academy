<script lang="ts">
	import { tutorStore, type TutorStoreValue } from '$stores/tutor';
	import { locale } from '$stores/locale';
	import TutorMessage from './TutorMessage.svelte';
	import TutorActionBar from './TutorActionBar.svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { X, Bot } from 'lucide-svelte';
	import { reducedMotion } from '$stores/reducedMotion';

	export let open: boolean = true;

	let storeValue: TutorStoreValue;
	tutorStore.subscribe((v) => (storeValue = v));

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

{#if open}
	<aside
		class="tutor-agent"
		transition:fly={{ x: 300, duration: $reducedMotion ? 0 : 250, easing: quintOut }}
		on:keydown={handleKeydown}
		role="complementary"
		aria-label={$locale === 'fr' ? 'Agent tuteur' : 'Tutor agent'}
	>
		<div class="tutor-header">
			<div class="tutor-identity">
				<div class="tutor-avatar" aria-hidden="true">
					<Bot size={18} strokeWidth={1.5} />
				</div>
				<div class="tutor-name">
					<span class="name">{$locale === 'fr' ? 'Guide' : 'Guide'}</span>
					<span class="status-dot" class:active={storeValue.state !== 'IDLE'}></span>
				</div>
			</div>
			<button class="close-btn" on:click={close} aria-label={$locale === 'fr' ? 'Fermer le tuteur' : 'Close tutor'}>
				<X size={16} strokeWidth={1.5} />
			</button>
		</div>

		<div class="tutor-messages" role="log" aria-live="polite">
			{#if storeValue.messages.length === 0}
				<div class="empty-state">
					<p>{$locale === 'fr' ? 'Je suis là pour vous aider si vous êtes bloqué.' : "I'm here to help if you get stuck."}</p>
				</div>
			{:else}
				{#each storeValue.messages as message (message.id)}
					<TutorMessage {message} />
				{/each}
			{/if}
		</div>

		<TutorActionBar
			state={storeValue.state}
			hintUsed={storeValue.context.hintUsed}
		/>
	</aside>
{/if}

<style>
	.tutor-agent {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--surface-1);
		border-left: 1px solid var(--surface-subtle);
		width: 320px;
		max-width: 100%;
	}

	.tutor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--surface-subtle);
	}

	.tutor-identity {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.tutor-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--accent-subtle);
		color: var(--accent);
	}

	.tutor-name {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.name {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-tertiary);
	}

	.status-dot.active {
		background: var(--success);
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-tertiary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background 120ms ease-out;
	}

	.close-btn:hover {
		background: var(--surface-3);
		color: var(--text-primary);
	}

	.tutor-messages {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
	}

	.empty-state p {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin: 0;
		line-height: 1.5;
	}
</style>
