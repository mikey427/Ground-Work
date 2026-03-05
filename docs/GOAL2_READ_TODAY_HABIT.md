# Goal 2 — "Read Today?" Habit — Implementation Summary

## Files created

- `src/routes/api/read-today/+server.ts` — POST API to toggle "Read today": create or delete a `reading_log` for a given date (uses most recent "Currently Reading" book).

## Files modified

- `src/routes/(app)/+page.server.ts` — Export `READ_TODAY_HABIT_ID`; load virtual "Read today" habit and `readTodayLogId` / `readTodayBookId` from current book and today's reading_log.
- `src/routes/(app)/+page.svelte` — Use virtual habit; toggle read-today via `/api/read-today`; pass `nameHref="/reading"` and no `onDelete`/`onNoteSave` for read-today; remove "Read today →" link.
- `src/lib/components/HabitRow.svelte` — Add optional `nameHref`; when set, render name as link and show note UI only when `onNoteSave` is defined.
- `src/routes/(app)/stats/+page.server.ts` — Add synthetic "Read today" habit (id `-1`) and merge completion from `reading_logs` (one row per date with any log) into window/year logs for streak and completion rate.
- `src/routes/(app)/week/+page.server.ts` — Add virtual "Read today" habit; populate `logByKey` from `reading_logs` for most recent reading book; include read-today in per-day completion count.
- `src/routes/(app)/week/+page.svelte` — When toggling habit `read-today`, call `POST /api/read-today` with `date` and optional `logId` instead of habit-logs API.
- `src/routes/(app)/month/+page.server.ts` — Include `reading_logs` in heatmap (one completed slot per date with any reading log).
- `project.md` — Document virtual-habit approach, behavior, and edge cases.

## Manual test plan

1. **Today page**
   - Open Today; "Read today" appears in the habit list (with or without other habits).
   - Click habit name → navigates to `/reading`.
   - Toggle ON (no "Currently Reading" book) → request fails; toggle reverts; optional: show/check error (e.g. 400).
   - Add a book as "Currently Reading" on Reading page; return to Today; toggle Read today ON → one `reading_log` for today for that book; checkbox stays on after reload.
   - Toggle Read today OFF → that `reading_log` is deleted; checkbox off after reload.
   - Confirm no delete button and no "Add note" for the Read today row.

2. **Streak on Stats**
   - With at least one `reading_log` on consecutive days (e.g. today and yesterday), open Stats → Streak card shows current/longest streak including those days (Read today is in the pool).
   - Completion rate and "Most consistent" can reflect Read today if it’s the only or most consistent habit.

3. **Week view**
   - Open Week; "Read today" appears in the table.
   - For a day with a reading_log for the current book, cell is marked done; toggling that cell off removes the log; toggling on creates it (same as Today).

4. **Month heatmap**
   - Ensure days with at least one `reading_log` show higher activity (one extra completed slot per such day).

## Approach: virtual vs `is_system`

**Chosen: virtual habit.**

- No row in `habits`; no schema change. The "Read today" entry is built in server load and appended to the habit list.
- Completion is defined by `reading_logs` (any log on a date = read that day). A virtual habit allows stats/week/month to derive completion from `reading_logs` without a separate `habit_logs` row or an `is_system` habit row.
- Toggle is handled only by `POST /api/read-today`, which creates/deletes `reading_logs`; no `habit_logs` involved for this habit.

**Alternative (not used):** Add `is_system` to `habits`, seed one "Read today" row, and prevent delete in the API. Would require a migration, seed, and extra logic to sync completion from `reading_logs` into `habit_logs` or to special-case this habit everywhere. Virtual avoids that and keeps "Read today" logic localized.

## Edge cases

- **No "Currently Reading" book when toggling ON** — API returns 400 with message to add a book from Reading; client reverts the toggle.
- **Multiple "Currently Reading" books** — We use the most recent by `books.id`; no UI to choose. Consider showing which book was logged (e.g. in a toast or subtitle) if needed.
- **Toggle OFF** — Uses `logId` from load (Today) or from `logByKey` (Week), so the correct `reading_log` is always deleted.
- **Read today and real habits** — Read today is always last in the list; empty state ("No habits yet") is never shown because the list always has at least Read today.
