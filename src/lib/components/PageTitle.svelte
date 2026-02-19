<script lang="ts">
	interface Props {
		title: string;
		backHref?: string;
		backLabel?: string;
		class?: string;
	}

	let { title, backHref, backLabel = 'Back', class: className = '' }: Props = $props();
</script>

<div class="{className}">
	{#if backHref}
		<a
			href={backHref}
			class="mb-2 inline-block text-sm text-[var(--color-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-2"
		>
			← {backLabel}
		</a>
	{/if}
	<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">{title}</h1>
</div>
