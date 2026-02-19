<script lang="ts">
	interface Props {
		message: string;
		detail?: string;
		ctaLabel?: string;
		ctaHref?: string;
		class?: string;
	}

	let { message, detail, ctaLabel, ctaHref, class: className = '' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 py-12 text-center {className}">
	<span class="text-3xl text-[var(--color-muted)]" aria-hidden="true">📚</span>
	<p class="mt-2 font-medium text-[var(--color-muted)]">{message}</p>
	{#if detail}
		<p class="mt-1 text-sm text-[var(--color-muted)]/80">{detail}</p>
	{/if}
	{#if ctaLabel && ctaHref}
		<a
			href={ctaHref}
			class="mt-4 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
		>
			{ctaLabel}
		</a>
	{/if}
</div>
