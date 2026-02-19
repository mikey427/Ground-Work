# Habit Tracker — Product Brief

## Overview

A personal self-improvement dashboard for tracking daily habits, streaks, and reading progress. Built as a self-hosted web app for personal use only. The goal is a clean, motivating interface that makes it easy to check in daily and watch progress build over time.

---

## Features

### Habit Tracking

- Define custom habits with a name, category, color/icon, and target frequency (daily, weekdays only, X times per week)
- Daily check-off view — simple and fast to use each day
- Optional note per log entry
- Streak tracking — current streak and longest streak ever per habit
- Categories: health, learning, mental, creative, etc.

### Views

- **Daily view** — today's habit checklist
- **Weekly overview** — how the current week is going at a glance
- **Monthly heatmap** — GitHub-style contribution graph per habit
- **Stats dashboard** — overall completion rate, streaks, most consistent habit, yearly goal progress

### Reading Section

A dedicated section within the app, deeply integrated but with its own UI.

- **Currently Reading** — active book with current page and progress percentage, start date
- **Want to Read** — backlog shelf
- **Finished** — completed books with finish date, rating, and personal thoughts/notes
- **Did Not Finish** — optional shelf for abandoned books
- **Book details** — title, author, cover image (via Open Library or Google Books API), genre/tags, page count, start/finish dates

Reading also connects to the habit layer — "did I read today?" is a trackable daily habit that drills into the full book tracker when tapped.

#### Reading Stats
- Books read per year
- Total pages read
- Average rating
- Average time to finish a book
- Reading pace (pages per day)
- Yearly reading goal with progress bar

### Stretch Goals (Post-MVP)
- Weekly reflection prompts
- Simple mood log
- CSV export
- Mobile-friendly PWA
- Cloudflare Tunnel access outside home network

---

## Data Model

```sql
-- Habits
habits (id, name, category, color, icon, frequency, created_at)

-- Daily habit logs
habit_logs (id, habit_id, date, completed, note, created_at)

-- Books
books (id, title, author, cover_url, genre, page_count, status, rating, thoughts, start_date, finish_date, created_at)

-- Reading progress logs
reading_logs (id, book_id, date, current_page, note, created_at)
```

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | SvelteKit | New framework to learn; clean reactivity model, less boilerplate than React |
| Styling | Tailwind CSS | Already familiar |
| ORM | Drizzle ORM | Lightweight, TypeScript-first, great SQLite support |
| Database | SQLite | Simple, file-based, perfect for a personal app |
| Auth | Single password + session cookie | Personal use only, no need for full auth system |
| Containerization | Docker + Docker Compose | Clean self-hosting, easy to manage and restart |
| Reverse Proxy | Nginx | Sits in front of the app on the server |
| Server | Personal home server | Self-hosted, learning deployment as part of the project |

---

## UI Direction

- Warm, earthy tones
- Bento style grid
- Clean and minimal — fast to use daily
- Heatmap/grid visualizations for streaks
- Book cards with cover art
- Mobile-friendly layout (used daily on phone)

---

## Goals Beyond the App

This project is also an opportunity to learn:

- SvelteKit fundamentals (routing, loaders, form actions, stores)
- Drizzle ORM schema design and migrations
- SQLite in a production-ish context
- Docker + Docker Compose for containerizing a full-stack app
- Nginx reverse proxy configuration
- Self-hosting a web app on a personal server
- Optionally: Cloudflare Tunnel for external access without opening ports