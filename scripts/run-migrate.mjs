import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname.replace(/\/scripts$/, '');
const dbPath = process.env.DB_URL || `${root}/data/sqlite.db`;
const migrationsFolder = `${root}/drizzle`;

const dir = dirname(dbPath);
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder });
sqlite.close();
console.log('Migrations applied.');
