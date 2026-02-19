<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-surface)] px-4 py-8">
	<div class="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
		{@render children()}
	</div>
</div>
