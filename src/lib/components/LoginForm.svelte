<script lang="ts">
	interface Props {
		error?: string | null;
		loading?: boolean;
	}

	let { error = null, loading = false }: Props = $props();
</script>

<form
	method="POST"
	action="?/login"
	class="flex flex-col gap-4"
>
	<label for="password" class="sr-only">Password</label>
	<input
		id="password"
		name="password"
		type="password"
		autocomplete="current-password"
		required
		disabled={loading}
		class="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-muted)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
		placeholder="Password"
	/>
	{#if error}
		<p class="text-sm text-red-600" role="alert">{error}</p>
	{/if}
	<button
		type="submit"
		disabled={loading}
		class="w-full rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-3 font-medium text-white transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
	>
		{#if loading}
			<span class="inline-block animate-pulse">Signing in…</span>
		{:else}
			Sign in
		{/if}
	</button>
</form>
