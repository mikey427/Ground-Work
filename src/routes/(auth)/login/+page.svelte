<script lang="ts">
	import { page } from '$app/stores';
	import LoginForm from '$lib/components/LoginForm.svelte';

	const error = $derived(($page.data.form as { error?: string } | undefined)?.error ?? null);
	const loading = $derived($page.status === 'submitting');
</script>

<svelte:head>
	<title>Sign in — Habit Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<header class="text-center">
		<h1 class="font-display text-2xl font-semibold tracking-tight text-[var(--color-muted)]">
			Habit Tracker
		</h1>
		<p class="mt-1 text-sm text-[var(--color-muted)]">
			Enter your password to continue
		</p>
	</header>
	<LoginForm {error} {loading} />
</div>
