/**
 * Email service — Resend API or SMTP fallback via lettre-compatible fetch.
 *
 * Used for:
 * - Email verification after registration
 * - Password reset links
 *
 * Environment:
 *   EMAIL_PROVIDER    — 'resend' | 'smtp' (default: resend)
 *   RESEND_API_KEY    — Resend API key
 *   EMAIL_FROM        — Sender address (e.g., noreply@reverseacademy.dev)
 *   SMTP_HOST         — SMTP server host (fallback)
 *   SMTP_PORT         — SMTP server port (fallback)
 *   SMTP_USER         — SMTP username
 *   SMTP_PASS         — SMTP password
 */

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Reverse Academy <noreply@reverseacademy.dev>';
const APP_URL = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

/**
 * Send an email using the configured provider.
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
	if (EMAIL_PROVIDER === 'resend') {
		return sendViaResend(options);
	}
	// TODO: Implement SMTP fallback
	console.warn('[email] SMTP provider not yet implemented, logging email:', options.to, options.subject);
	return { success: true, id: 'dev-noop' };
}

/**
 * Send via Resend API.
 */
async function sendViaResend(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
	if (!RESEND_API_KEY) {
		console.warn('[email] RESEND_API_KEY not set, skipping email to:', options.to);
		return { success: false, error: 'API key not configured' };
	}

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: EMAIL_FROM,
				to: options.to,
				subject: options.subject,
				html: options.html,
				...(options.text ? { text: options.text } : {})
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return { success: false, error: JSON.stringify(errorData) };
		}

		const data = await response.json();
		return { success: true, id: data.id };
	} catch (err) {
		return { success: false, error: String(err) };
	}
}

/**
 * Generate an email verification token hash.
 */
export async function generateEmailToken(): Promise<{ token: string; hash: string }> {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

	const encoder = new TextEncoder();
	const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(token));
	const hash = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('');

	return { token, hash };
}

/**
 * Send a verification email.
 */
export async function sendVerificationEmail(email: string, token: string, locale: 'en' | 'fr') {
	const verifyUrl = `${APP_URL}/${locale}/auth/verify-email?token=${token}`;

	const subjects = {
		en: 'Verify your email — Reverse Academy',
		fr: 'Vérifiez votre email — Reverse Academy'
	};

	const html = locale === 'fr'
		? `<p>Bienvenue sur Reverse Academy.</p><p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Ce lien expire dans 24 heures.</p>`
		: `<p>Welcome to Reverse Academy.</p><p>Click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`;

	return sendEmail({ to: email, subject: subjects[locale], html });
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(email: string, token: string, locale: 'en' | 'fr') {
	const resetUrl = `${APP_URL}/${locale}/auth/reset-password?token=${token}`;

	const subjects = {
		en: 'Reset your password — Reverse Academy',
		fr: 'Réinitialisez votre mot de passe — Reverse Academy'
	};

	const html = locale === 'fr'
		? `<p>Vous avez demandé une réinitialisation de mot de passe.</p><p>Cliquez sur le lien ci-dessous :</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>`
		: `<p>You requested a password reset.</p><p>Click the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you did not request this, ignore this email.</p>`;

	return sendEmail({ to: email, subject: subjects[locale], html });
}
