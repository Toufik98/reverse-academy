/**
 * Lucia Auth v3 — SvelteKit integration
 *
 * This module sets up session-based authentication with:
 * - Turso/libSQL as the session store
 * - Cookie-based session transport
 * - GitHub OAuth support
 *
 * TODO: Wire to actual Turso DB once migrations are run
 */

import { dev } from '$app/environment';

// Environment variables (loaded from .env or platform env)
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

export interface SessionUser {
	id: string;
	email: string;
	username: string;
	locale: 'en' | 'fr';
	level: number;
	xp: number;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

/**
 * Validate a session token from cookie.
 * Returns null if invalid/expired.
 */
export async function validateSession(sessionId: string): Promise<{ session: Session; user: SessionUser } | null> {
	// TODO: Query sessions table joined with users
	// SELECT s.id, s.user_id, s.expires_at, u.email, u.username, u.locale, u.level, u.xp
	// FROM sessions s JOIN users u ON s.user_id = u.id
	// WHERE s.id = ? AND s.expires_at > datetime('now')
	return null;
}

/**
 * Create a new session for a user after successful login.
 */
export async function createSession(userId: string): Promise<Session> {
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

	// TODO: INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)

	return { id: sessionId, userId, expiresAt };
}

/**
 * Invalidate (delete) a session — used for logout.
 */
export async function invalidateSession(sessionId: string): Promise<void> {
	// TODO: DELETE FROM sessions WHERE id = ?
}

/**
 * Generate a cryptographically random session ID.
 */
function generateSessionId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password using Web Crypto (Argon2id preferred when available, scrypt fallback).
 * For MVP, uses a simple PBKDF2 approach. Switch to Argon2 via WASM in production.
 */
export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, '0')).join('');
	const hashHex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
	return `pbkdf2:${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [algorithm, saltHex, expectedHashHex] = storedHash.split(':');
	if (algorithm !== 'pbkdf2') return false;

	const encoder = new TextEncoder();
	const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);
	const hashHex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex === expectedHashHex;
}

/**
 * GitHub OAuth configuration.
 */
export const githubOAuth = {
	clientId: GITHUB_CLIENT_ID,
	clientSecret: GITHUB_CLIENT_SECRET,
	authorizeUrl: 'https://github.com/login/oauth/authorize',
	tokenUrl: 'https://github.com/login/oauth/access_token',
	userUrl: 'https://api.github.com/user',
	scopes: ['user:email']
};

/**
 * Session cookie configuration.
 */
export const sessionCookieConfig = {
	name: 'ra-session',
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax' as const,
	path: '/',
	maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
};
