import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';

const API_BASE = BACKEND_URL ?? 'http://localhost:8080';

/**
 * Proxy: GET /api/achievements → Rust API GET /api/v1/achievements
 * Proxy: GET /api/achievements/:userId → Rust API GET /api/v1/achievements/:userId
 */
export const GET: RequestHandler = async ({ url, cookies, fetch: serverFetch }) => {
  const token = cookies.get('session');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Forward the full path after /api/achievements
  const backendUrl = `${API_BASE}/api/v1/achievements${url.search}`;

  const res = await serverFetch(backendUrl, { headers });

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Proxy: POST /api/achievements → Rust API POST /api/v1/achievements/:userId/check
 */
export const POST: RequestHandler = async ({ request, cookies, fetch: serverFetch }) => {
  const token = cookies.get('session');
  const body = await request.text();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = JSON.parse(body);
  const userId = payload.userId;

  const res = await serverFetch(`${API_BASE}/api/v1/achievements/${userId}/check`, {
    method: 'POST',
    headers,
    body,
  });

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
