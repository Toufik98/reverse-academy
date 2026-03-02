<script lang="ts">
	import type { TutorMessage as TutorMessageType } from '$types/tutor';
	import { fade } from 'svelte/transition';
	import { reducedMotion } from '$stores/reducedMotion';

	export let message: TutorMessageType;
</script>

<div
	class="tutor-message"
	class:action={message.action === 'OFFER_HINT' || message.action === 'FAST_TRACK'}
	class:info={message.action === 'SUGGEST_DECOMPOSE' || message.action === 'REVEAL_PARTIAL_THEORY'}
	transition:fade={{ duration: $reducedMotion ? 0 : 150 }}
	role="status"
>
	<p class="message-text">{message.text}</p>
	{#if message.timestamp}
		<time class="message-time" datetime={new Date(message.timestamp).toISOString()}>
			{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
		</time>
	{/if}
</div>

<style>
	.tutor-message {
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--surface-2);
	}

	.tutor-message.action {
		border-left: 3px solid var(--accent);
		background: var(--accent-subtle);
	}

	.tutor-message.info {
		border-left: 3px solid var(--text-tertiary);
	}

	.message-text {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text-primary);
		line-height: 1.5;
	}

	.message-time {
		display: block;
		margin-top: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
