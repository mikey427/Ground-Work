<script lang="ts">
	/** When backend is wired, pass form action error here */
	interface Props {
		error?: string | null;
	}

	let { error = null }: Props = $props();

	const categories = [
		{ value: 'health', label: 'Health' },
		{ value: 'learning', label: 'Learning' },
		{ value: 'mental', label: 'Mental' },
		{ value: 'creative', label: 'Creative' },
		{ value: 'other', label: 'Other' }
	];

	const colors = ['#7c9c6b', '#c17f59', '#8b7355', '#6b8e9c', '#9c7c6b', '#7c6b9c'];

const frequencies = [
		{ value: 'daily', label: 'Every day' },
		{ value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
		{ value: '6', label: '6× per week' },
		{ value: '5', label: '5× per week' },
		{ value: '4', label: '4× per week' },
		{ value: '3', label: '3× per week' },
		{ value: '2', label: '2× per week' },
		{ value: '1', label: '1× per week' }
	];
</script>

<div class="flex flex-col gap-4">
	<label for="habit-name" class="label">Name</label>
	<input id="habit-name" name="name" type="text" required placeholder="e.g. Morning stretch" class="input" />

	<label for="habit-icon" class="label">Icon (optional)</label>
	<input id="habit-icon" name="icon" type="text" placeholder="e.g. stretch" class="input" />

	<label for="habit-category" class="label">Category</label>
	<select id="habit-category" name="category" class="input">
		{#each categories as c}
			<option value={c.value}>{c.label}</option>
		{/each}
	</select>

	<fieldset class="flex flex-col gap-2">
		<legend class="label">Color</legend>
		<div class="flex flex-wrap gap-2">
			{#each colors as c}
				<label class="flex h-8 w-8 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 {c === colors[0] ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30' : 'border-[var(--color-border)]'}">
					<input type="radio" name="color" value={c} class="sr-only" checked={c === colors[0]} />
					<span class="block h-full w-full rounded-full" style="background-color: {c}"></span>
				</label>
			{/each}
		</div>
	</fieldset>

	<label for="habit-frequency" class="label">Frequency</label>
	<select id="habit-frequency" name="frequency" class="input">
		{#each frequencies as f}
			<option value={f.value}>{f.label}</option>
		{/each}
	</select>

	{#if error}
		<p class="text-sm text-red-600" role="alert">{error}</p>
	{/if}

	<div class="flex gap-2 pt-2">
		<button type="submit" class="btn-primary flex-1">Add habit</button>
	</div>
</div>
