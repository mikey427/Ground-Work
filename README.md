# Ground Work

Self-hosted habit tracker and reading dashboard. See [project.md](project.md) for the product brief and goals.

## Tech stack

- **SvelteKit** (Svelte 5) + **Tailwind CSS**
- **Drizzle ORM** + **SQLite** (better-sqlite3)
- **Docker** + Docker Compose for deployment

Auth is single-password + session cookie; the DB schema includes habits, habit_logs, books, reading_logs, and sessions.

---

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set at least `APP_PASSWORD_HASH` (required for login). Optionally set `DB_URL` (default: `./data/sqlite.db`).

   Generate a bcrypt hash for your password:

   ```bash
   cp .env.example .env
   node -e "const bcrypt=require('bcrypt');console.log(bcrypt.hashSync('yourpassword',10))"
   ```

   Put the printed hash in `.env` as `APP_PASSWORD_HASH=...`

3. **Database**

   The app creates the SQLite file and directory on first use. To apply migrations (e.g. after pulling schema changes):

   ```bash
   npm run db:migrate
   ```

   Other DB scripts:

   - `npm run db:generate` — generate migrations from schema changes
   - `npm run db:push` — push schema to DB without migration files (dev only)
   - `npm run db:studio` — open Drizzle Studio

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   App: http://localhost:5173

---

## Production build (local)

```bash
npm run build
DB_URL=./data/sqlite.db node build
```

Server listens on `http://0.0.0.0:3000` (or `PORT` if set). Use `HOST` and `PORT` to override.

---

## Docker

**Build and run with Docker Compose:**

```bash
docker compose up --build
```

- App: http://localhost:3000  
- SQLite data is stored in a named volume `app-data` (persists across restarts).  
- On startup, the container runs migrations then starts the app. Set `APP_PASSWORD_HASH` in the compose file or via `env_file: .env` so login works.

**Without Compose:**

```bash
docker build -t ground-work .
docker run -p 3000:3000 -v app-data:/app/data -e DB_URL=/app/data/sqlite.db ground-work
```

---

## Project layout (relevant to this boilerplate)

| Path | Purpose |
|------|--------|
| `src/lib/server/db/` | Drizzle schema and DB client (use `db` from `$lib/server/db` in server code) |
| `drizzle/` | Generated SQL migrations |
| `scripts/run-migrate.mjs` | Migration runner used in Docker entrypoint |
| `drizzle.config.ts` | Drizzle Kit config (schema path, DB URL) |

**Auth:** Login at `/login` with the password whose hash is in `APP_PASSWORD_HASH`. Sessions last 30 days. Use "Sign out" in the app nav to logout.
