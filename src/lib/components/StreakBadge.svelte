<script lang="ts">
	interface Props {
		current: number;
		longest: number;
		class?: string;
	}

	let { current, longest, class: className = '' }: Props = $props();
</script>

<div class="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)]/10 px-2.5 py-1 text-sm font-medium text-[var(--color-success)] {className}">
	<span aria-hidden="true">🔥</span>
	<span>{current} / {longest}</span>
	<span class="text-[var(--color-muted)]">streak</span>
</div>
