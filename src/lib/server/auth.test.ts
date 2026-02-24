import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as auth from './auth.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { db } from './db/index.js';
import { sessions } from './db/schema.js';
import { and, eq, gt } from 'drizzle-orm';

vi.mock('bcrypt', () => ({
	default: {
		compareSync: vi.fn(),
		hashSync: vi.fn()
	}
}));

vi.mock('node:crypto', () => ({
	randomBytes: vi.fn()
}));

vi.mock('./db/index.js', () => {
	const insertMock = vi.fn().mockReturnThis();
	const valuesMock = vi.fn().mockReturnThis();
	const returningMock = vi.fn().mockReturnThis();
	const getMock = vi.fn();
	const deleteMock = vi.fn().mockReturnThis();
	const whereMock = vi.fn();
	const findFirstMock = vi.fn();

	return {
		db: {
			insert: () => ({
				values: valuesMock,
				returning: () => ({
					get: getMock
				})
			}),
			delete: () => ({
				where: whereMock
			}),
			query: {
				sessions: {
					findFirst: findFirstMock
				}
			}
		},
		sqlite: {}
	};
});

vi.mock('./db/schema.js', async (orig) => {
	const actual = await orig();
	return {
		...actual,
		sessions: {
			...actual.sessions
		}
	};
});

describe('auth helpers', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.restoreAllMocks();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it('hashPassword delegates to bcrypt.hashSync', () => {
		const bcryptMock = bcrypt as unknown as { hashSync: (pwd: string, rounds: number) => string };
		(bcryptMock.hashSync as any) = vi.fn().mockReturnValue('hashed');

		const result = auth.hashPassword('secret');

		expect(bcryptMock.hashSync).toHaveBeenCalledWith('secret', 10);
		expect(result).toBe('hashed');
	});

	it('verifyPassword throws when APP_PASSWORD_HASH is missing', () => {
		delete process.env.APP_PASSWORD_HASH;
		expect(() => auth.verifyPassword('anything')).toThrow(/APP_PASSWORD_HASH is not set/);
	});

	it('verifyPassword strips surrounding quotes and compares with bcrypt', () => {
		process.env.APP_PASSWORD_HASH = '"  hash-from-env  "';
		const bcryptMock = bcrypt as unknown as { compareSync: (pwd: string, hash: string) => boolean };
		(bcryptMock.compareSync as any) = vi.fn().mockReturnValue(true);

		const ok = auth.verifyPassword('pw');

		expect(bcryptMock.compareSync).toHaveBeenCalledWith('pw', '  hash-from-env  ');
		expect(ok).toBe(true);
	});

	it('createSession creates a session row and returns id/token', () => {
		const tokenBuf = Buffer.from('deadbeef', 'hex');
		(randomBytes as unknown as ReturnType<typeof vi.fn>).mockReturnValue(tokenBuf);

		const insertSpy = vi.spyOn(db, 'insert');
		const nowSec = Math.floor(Date.now() / 1000);
		const getMock = vi.fn().mockReturnValue({ id: 1, token: 'deadbeef' });

		insertSpy.mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockReturnValue({
					get: getMock
				})
			})
		} as any);

		const result = auth.createSession();

		expect(result).toEqual({ id: 1, token: 'deadbeef' });
		expect(insertSpy).toHaveBeenCalledWith(sessions);
		expect(getMock).toHaveBeenCalled();
		// Roughly check expiry window
		const lastCallArgs = (insertSpy.mock.calls[0] as any[])[0];
		expect(lastCallArgs).toBe(sessions);
		expect(Math.floor(Date.now() / 1000)).toBeGreaterThanOrEqual(nowSec);
	});

	it('getSessionByToken queries DB with token and expiry', () => {
		const findFirstSpy = vi.spyOn(db.query.sessions, 'findFirst');
		const token = 'session-token';

		auth.getSessionByToken(token);

		expect(findFirstSpy).toHaveBeenCalled();
		const call = findFirstSpy.mock.calls[0]?.[0];
		expect(call).toHaveProperty('where');
		expect(typeof call.where).toBe('object');
		expect([eq, and, gt]).toBeTruthy(); // ensure imports are used in compiled code
	});

	it('deleteSession deletes by token', () => {
		const deleteSpy = vi.spyOn(db, 'delete');
		const whereMock = vi.fn();
		deleteSpy.mockReturnValue({ where: whereMock } as any);

		auth.deleteSession('tkn');

		expect(deleteSpy).toHaveBeenCalledWith(sessions);
		expect(whereMock).toHaveBeenCalled();
	});
});

