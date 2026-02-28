<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	let { children } = $props();

	// Sync user's timezone to a cookie so server can show "today" in their local date
	$effect(() => {
		const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
		if (!tz) return;
		const existing = typeof document !== 'undefined' ? document.cookie.replace(/.*\btz=([^;]*).*/, '$1') : '';
		if (decodeURIComponent(existing) === tz) return;
		document.cookie = `tz=${encodeURIComponent(tz)};path=/;max-age=31536000;SameSite=Lax`;
		invalidateAll();
	});

	const navItems = [
		{ href: '/', label: 'Today' },
		{ href: '/week', label: 'Week' },
		{ href: '/month', label: 'Month' },
		{ href: '/todos', label: 'Todos' },
		{ href: '/stats', label: 'Stats' },
		{ href: '/reading', label: 'Reading' },
		{ href: '/settings', label: 'Settings' }
	];

	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		if (href === '/') return path === '' || path === '/';
		return path === href || path.startsWith(href + '/');
	}
</script>

<div class="flex min-h-dvh flex-col bg-[var(--color-surface)]">
	<main class="flex-1 overflow-auto px-4 pb-24 pt-4 md:pb-6 md:pt-6">
		{@render children()}
	</main>

	<nav
		class="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2 md:static md:justify-start md:gap-1 md:border-t-0 md:px-4 md:py-0"
		aria-label="Main"
	>
		{#each navItems as { href, label }}
			<a
				href={href}
				class="flex min-h-[2.75rem] min-w-[2.75rem] flex-1 items-center justify-center rounded-[var(--radius-button)] text-sm font-medium transition-colors duration-[var(--duration-fast)] md:flex-initial md:px-4 md:py-2 {isActive(href)
					? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
					: 'text-[var(--color-muted)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-muted)]'}"
			>
				{label}
			</a>
		{/each}
		<form method="POST" action="/?/logout" class="flex flex-1 md:flex-initial">
			<button
				type="submit"
				class="flex min-h-[2.75rem] min-w-[2.75rem] flex-1 items-center justify-center rounded-[var(--radius-button)] text-sm font-medium text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-muted)] md:flex-initial md:px-4 md:py-2"
			>
				Sign out
			</button>
		</form>
	</nav>
</div>
