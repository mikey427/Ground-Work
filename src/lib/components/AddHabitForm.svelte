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

	const iconOptions = [
		{ value: '📚', label: 'Reading' },
		{ value: '🏃‍♂️', label: 'Exercise' },
		{ value: '🧘', label: 'Mindfulness' },
		{ value: '✍️', label: 'Writing' },
		{ value: '🎨', label: 'Creative' },
		{ value: '🛏', label: 'Sleep' }
	];

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

	let selectedIcon = $state<string>('');
	let customIcon = $state('');
</script>

<div class="flex flex-col gap-4">
	<label for="habit-name" class="label">Name</label>
	<input id="habit-name" name="name" type="text" required placeholder="e.g. Morning stretch" class="input" />

	<label class="label">Icon (optional)</label>
	<input type="hidden" name="icon" value={customIcon || selectedIcon} />
	<div class="flex flex-wrap gap-2">
		{#each iconOptions as opt}
			<button
				type="button"
				class="flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition-colors {selectedIcon === opt.value
					? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
					: 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-border)]/40'}"
				onclick={() => {
					selectedIcon = opt.value;
					customIcon = '';
				}}
				aria-pressed={selectedIcon === opt.value}
			>
				<span>{opt.value}</span>
				<span>{opt.label}</span>
			</button>
		{/each}
	</div>
	<label for="habit-icon-custom" class="text-sm text-[var(--color-muted)]">Or enter a custom icon/label</label>
	<input
		id="habit-icon-custom"
		type="text"
		class="input"
		placeholder="e.g. 📖 or Short label"
		bind:value={customIcon}
		oninput={() => {
			if (customIcon) selectedIcon = '';
		}}
	/>

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
