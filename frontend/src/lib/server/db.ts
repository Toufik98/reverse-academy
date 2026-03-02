/**
 * Turso (libSQL) database client
 *
 * Provides a singleton client for Turso embedded replica or remote DB.
 * Uses the @libsql/client package.
 *
 * Environment:
 *   TURSO_DATABASE_URL — libsql:// or file: URL
 *   TURSO_AUTH_TOKEN   — Turso platform auth token (remote only)
 */

import { createClient, type Client, type InStatement } from '@libsql/client';

let _client: Client | null = null;

/**
 * Get or create the Turso database client singleton.
 */
export function getDb(): Client {
	if (_client) return _client;

	const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
	const authToken = process.env.TURSO_AUTH_TOKEN;

	_client = createClient({
		url,
		...(authToken ? { authToken } : {})
	});

	return _client;
}

/**
 * Execute a single SQL statement.
 */
export async function execute(sql: string, args?: Record<string, unknown> | unknown[]) {
	const db = getDb();
	return db.execute({ sql, args: args as any });
}

/**
 * Execute multiple statements in a batch (transaction).
 */
export async function batch(statements: InStatement[]) {
	const db = getDb();
	return db.batch(statements);
}

/**
 * Health check — verify DB connectivity.
 */
export async function checkDbHealth(): Promise<{ healthy: boolean; latencyMs: number }> {
	const start = performance.now();
	try {
		const db = getDb();
		await db.execute('SELECT 1');
		return { healthy: true, latencyMs: Math.round(performance.now() - start) };
	} catch {
		return { healthy: false, latencyMs: Math.round(performance.now() - start) };
	}
}

/**
 * Generate a ULID-like ID for primary keys.
 * Uses timestamp prefix + random suffix for sortability.
 */
export function generateId(): string {
	const timestamp = Date.now().toString(36).padStart(9, '0');
	const random = Array.from(crypto.getRandomValues(new Uint8Array(10)))
		.map((b) => b.toString(36).padStart(2, '0'))
		.join('')
		.slice(0, 16);
	return `${timestamp}${random}`;
}
