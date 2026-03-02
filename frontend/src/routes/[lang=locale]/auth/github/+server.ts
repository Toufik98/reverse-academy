import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

/**
 * GitHub OAuth initiation — redirects to GitHub authorization URL.
 * The callback is handled by the Rust API at /api/v1/auth/github/callback,
 * which then redirects back to the frontend with a session token.
 */
export const GET: RequestHandler = async ({ url, cookies, params }) => {
  const lang = params.lang ?? 'en';

  // Generate a random state parameter for CSRF protection
  const state = crypto.randomUUID();
  cookies.set('github_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  // Store the locale so callback can redirect to correct language
  cookies.set('oauth_locale', lang, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  const clientId = env.GITHUB_CLIENT_ID ?? '';
  const redirectUri = env.GITHUB_REDIRECT_URI ?? `${url.origin}/api/v1/auth/github/callback`;

  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', clientId);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  githubUrl.searchParams.set('scope', 'read:user user:email');
  githubUrl.searchParams.set('state', state);

  throw redirect(302, githubUrl.toString());
};
