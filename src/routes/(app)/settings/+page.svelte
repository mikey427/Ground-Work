<script lang="ts">
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Settings — Habit Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<h1 class="font-display text-xl font-semibold text-[var(--color-muted)]">Settings</h1>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-sm">
			<h2 class="mb-4 text-sm font-semibold text-[var(--color-muted)]">Reading goal</h2>
			<p class="mb-4 text-sm text-[var(--color-muted)]">
				How many books do you want to finish this year? Shown as a progress bar on the Stats page.
			</p>

			{#if form?.success}
				<p class="mb-3 rounded-[var(--radius-input)] bg-green-500/10 px-3 py-2 text-sm text-green-700" role="status">
					Settings saved.
				</p>
			{/if}
			{#if form?.error}
				<p class="mb-3 rounded-[var(--radius-input)] bg-red-500/10 px-3 py-2 text-sm text-red-600" role="alert">
					{form.error}
				</p>
			{/if}

			<form method="POST" class="flex flex-col gap-3">
				<label for="yearly-goal" class="label">Books per year</label>
				<input
					id="yearly-goal"
					name="yearlyGoal"
					type="number"
					min="1"
					max="365"
					value={form?.error ? (form as { yearlyGoal?: number }).yearlyGoal ?? data.yearlyGoal : data.yearlyGoal}
					required
					class="input w-32"
				/>
				<div>
					<button type="submit" class="btn-primary">Save</button>
				</div>
			</form>
		</div>

		<div class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-sm">
			<h2 class="mb-4 text-sm font-semibold text-[var(--color-muted)]">Timezone</h2>
			<p class="mb-4 text-sm text-[var(--color-muted)]">
				Detected automatically from your browser. All dates and streaks use this timezone.
			</p>
			<p class="rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-3 py-2 text-sm font-medium">
				{data.timezone ?? 'UTC (not yet detected)'}
			</p>
		</div>
	</div>
</div>
