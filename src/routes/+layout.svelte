<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if $navigating}
	<div
		class="fixed left-0 right-0 top-0 z-50 h-0.5 bg-[var(--color-primary)]/30"
		role="progressbar"
		aria-label="Loading"
		aria-valuetext="Loading"
	>
		<div class="h-full w-1/3 animate-pulse rounded-r bg-[var(--color-primary)]"></div>
	</div>
{/if}

{@render children()}
