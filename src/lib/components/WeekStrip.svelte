<script lang="ts">
	interface DayState {
		date: string;
		label: string;
		completed: boolean;
		count?: number;
	}

	interface Props {
		days: DayState[];
		class?: string;
	}

	let { days, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-1 {className}" role="list" aria-label="Week days">
	{#each days as day (day.date)}
		<div
			class="flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2"
			role="listitem"
			title="{day.date}: {day.completed ? 'Done' : 'Not done'}"
		>
			<span class="text-xs font-medium text-[var(--color-muted)]">{day.label}</span>
			<span
				class="h-2 w-2 rounded-full transition-colors {day.completed
					? 'bg-[var(--color-success)]'
					: 'bg-[var(--color-heat-0)]'}"
				aria-hidden="true"
			></span>
		</div>
	{/each}
</div>
