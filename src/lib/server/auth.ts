import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { db } from './db/index.js';
import { sessions } from './db/schema.js';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_DURATION_SEC = 30 * 24 * 60 * 60; // 30 days

export function getSessionByToken(token: string) {
	const now = Math.floor(Date.now() / 1000);
	return db.query.sessions.findFirst({
		where: and(eq(sessions.token, token), gt(sessions.expiresAt, now))
	});
}

export function createSession(): { id: number; token: string } {
	const token = randomBytes(32).toString('hex');
	const now = Math.floor(Date.now() / 1000);
	const expiresAt = now + SESSION_DURATION_SEC;
	const createdAt = new Date().toISOString();
	const row = db
		.insert(sessions)
		.values({ token, expiresAt, createdAt })
		.returning({ id: sessions.id, token: sessions.token })
		.get();
	if (!row) throw new Error('Failed to create session');
	return { id: row.id, token: row.token };
}

export function deleteSession(token: string): void {
	db.delete(sessions).where(eq(sessions.token, token));
}

/**
 * Verify submitted password against APP_PASSWORD_HASH env.
 * Uses process.env (populated by dotenv in hooks.server.ts). Returns true if valid, false if wrong.
 */
export function verifyPassword(password: string): boolean {
	let hash = process.env.APP_PASSWORD_HASH?.trim() ?? '';
	// Allow hash to be wrapped in double quotes in .env
	if (hash.startsWith('"') && hash.endsWith('"')) hash = hash.slice(1, -1);
	if (!hash) {
		throw new Error('APP_PASSWORD_HASH is not set in .env. Add a bcrypt hash of your password.');
	}
	return bcrypt.compareSync(password, hash);
}

/** Generate a hash for storing in APP_PASSWORD_HASH (run once: node -e "require('./src/lib/server/auth.js').hashPassword('yourpassword')") */
export function hashPassword(plain: string): string {
	return bcrypt.hashSync(plain, 10);
}
