<script lang="ts">
	import type { TodoCadence, EmailReminderWhen } from '$lib/types/todo';

	interface Props {
		cadence?: TodoCadence;
		error?: string | null;
		disabled?: boolean;
		submitLabel?: string;
	}

	let { cadence = 'daily', error = null, disabled = false, submitLabel = 'Add task' }: Props = $props();

	const cadenceOptions: { value: TodoCadence; label: string }[] = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' }
	];

	const reminderWhenOptions: { value: EmailReminderWhen; label: string }[] = [
		{ value: 'at_time', label: 'At a specific time' },
		{ value: 'before', label: 'Before due (minutes)' },
		{ value: 'day_before', label: 'Day before' }
	];

	let reminderEnabled = $state(false);
	let reminderWhen = $state<EmailReminderWhen>('at_time');
	let reminderValue = $state('09:00'); // time or minutes
	let selectedCadence = $state<TodoCadence>(cadence);
	$effect(() => {
		selectedCadence = (() => cadence)();
	});
</script>

<div class="flex flex-col gap-4">
	<label for="todo-title" class="label">Task</label>
	<input
		id="todo-title"
		name="title"
		type="text"
		required
		placeholder="e.g. Review goals"
		class="input"
	/>

	<label for="todo-cadence" class="label">When</label>
	<select id="todo-cadence" name="cadence" class="input" bind:value={selectedCadence}>
		{#each cadenceOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>

	<label class="flex cursor-pointer items-center gap-2">
		<input type="checkbox" name="recurring" value="1" class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20" />
		<span class="label mb-0 text-[var(--color-muted)]">Repeating task (repeats every period)</span>
	</label>

	<fieldset class="flex flex-col gap-2 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3">
		<legend class="label">Email reminder</legend>
		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				bind:checked={reminderEnabled}
				class="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
			/>
			<span class="text-sm text-[var(--color-muted)]">Send me an email reminder</span>
		</label>
		{#if reminderEnabled}
			<input type="hidden" name="emailReminderEnabled" value="1" />
			<input type="hidden" name="emailReminderWhen" value={reminderWhen} />
			<label for="reminder-when" class="label">When to remind</label>
			<select id="reminder-when" bind:value={reminderWhen} class="input">
				{#each reminderWhenOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
			{#if reminderWhen === 'at_time'}
				<label for="reminder-time" class="label">Time</label>
				<input
					id="reminder-time"
					type="time"
					bind:value={reminderValue}
					class="input"
					name="emailReminderValue"
				/>
			{:else if reminderWhen === 'before'}
				<label for="reminder-mins" class="label">Minutes before</label>
				<input
					id="reminder-mins"
					type="number"
					min="1"
					max="10080"
					placeholder="e.g. 30"
					bind:value={reminderValue}
					class="input"
					name="emailReminderValue"
				/>
			{/if}
		{/if}
	</fieldset>

	{#if error}
		<p class="text-sm text-red-600" role="alert">{error}</p>
	{/if}

	<div class="flex gap-2 pt-2">
		<button type="submit" class="btn-primary flex-1" disabled={disabled}>{submitLabel}</button>
	</div>
</div>
