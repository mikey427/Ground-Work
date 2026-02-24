<script lang="ts">

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		children: import('svelte').Snippet;
	}

	let { open, title, onclose, children }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	$effect(() => {
		if (!open) return;
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		aria-label={title}
	>
		<button
			type="button"
			class="absolute inset-0 bg-black/40 transition-opacity"
			aria-label="Close"
			onclick={onclose}
		></button>
		<div
			class="relative w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-lg"
			role="document"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 id="modal-title" class="font-display text-lg font-semibold text-[var(--color-muted)]">
					{title}
				</h2>
				<button
					type="button"
					class="rounded-[var(--radius-button)] p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
					aria-label="Close"
					onclick={onclose}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
			{@render children()}
		</div>
	</div>
{/if}
