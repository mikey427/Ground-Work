# Backend API (CRUD)

All `/api/*` routes require an authenticated session (cookie `session_token`). Unauthenticated requests receive `401` with `{ "error": "Unauthorized" }`. Use `fetch` with `credentials: 'include'` so the cookie is sent.

Base URL: same origin (e.g. `http://localhost:5173` in dev). Request/response bodies are JSON unless noted.

---

## Habits

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/habits` | List all habits (ordered by id). |
| GET | `/api/habits/[id]` | Get one habit. 404 if not found. |
| POST | `/api/habits` | Create habit. Body: `{ name, category, color?, icon?, frequency? }`. Defaults: `color: "#6b7280"`, `icon: ""`, `frequency: "daily"`. |
| PATCH | `/api/habits/[id]` | Update habit. Body: any of `{ name, category, color, icon, frequency }`. |
| DELETE | `/api/habits/[id]` | Delete habit. 204 on success, 404 if not found. |

---

## Habit logs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/habit-logs` | List all habit logs. |
| GET | `/api/habit-logs?habitId=1` | Logs for habit 1. |
| GET | `/api/habit-logs?date=2025-01-15` | Logs for that date. |
| GET | `/api/habit-logs?habitId=1&date=2025-01-15` | Logs for habit 1 on that date. |
| GET | `/api/habit-logs/[id]` | Get one log. |
| POST | `/api/habit-logs` | Create log. Body: `{ habitId, date, completed, note? }`. `date` = YYYY-MM-DD. |
| PATCH | `/api/habit-logs/[id]` | Update log. Body: any of `{ completed, note }`. |
| DELETE | `/api/habit-logs/[id]` | Delete log. 204 on success. |

---

## Books

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/books` | List all books. |
| GET | `/api/books?status=reading` | List books by status: `reading`, `want`, `finished`, `dnf`. |
| GET | `/api/books/[id]` | Get one book. |
| POST | `/api/books` | Create book. Body: `{ title, author, coverUrl?, genre?, pageCount?, status?, rating?, thoughts?, startDate?, finishDate? }`. Default `status: "want"`. |
| PATCH | `/api/books/[id]` | Update book. Body: any of the same fields. |
| DELETE | `/api/books/[id]` | Delete book. 204 on success. |

---

## Reading logs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reading-logs` | List all reading logs. |
| GET | `/api/reading-logs?bookId=1` | Logs for book 1. |
| GET | `/api/reading-logs?bookId=1&date=2025-01-15` | Log for book 1 on that date. |
| GET | `/api/reading-logs?date=2025-01-15` | Logs for that date. |
| GET | `/api/reading-logs/[id]` | Get one log. |
| POST | `/api/reading-logs` | Create log. Body: `{ bookId, date, currentPage, note? }`. |
| PATCH | `/api/reading-logs/[id]` | Update log. Body: any of `{ currentPage, note }`. |
| DELETE | `/api/reading-logs/[id]` | Delete log. 204 on success. |

---

## Errors

- `400` – Invalid input or body. Response: `{ "error": "message" }`.
- `401` – Not authenticated. Response: `{ "error": "Unauthorized" }`.
- `404` – Resource not found. Response: `{ "error": "Not found" }`.
- `500` – Server error (e.g. insert failed).
