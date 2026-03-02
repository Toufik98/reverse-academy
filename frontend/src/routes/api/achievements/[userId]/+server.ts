import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';

const API_BASE = BACKEND_URL ?? 'http://localhost:8080';

/**
 * Proxy: GET /api/achievements/:userId → Rust API GET /api/v1/achievements/:userId
 */
export const GET: RequestHandler = async ({ params, cookies, fetch: serverFetch }) => {
  const token = cookies.get('session');
  const { userId } = params;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await serverFetch(`${API_BASE}/api/v1/achievements/${userId}`, { headers });

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Proxy: POST /api/achievements/:userId → Rust API POST /api/v1/achievements/:userId/check
 */
export const POST: RequestHandler = async ({ params, request, cookies, fetch: serverFetch }) => {
  const token = cookies.get('session');
  const { userId } = params;
  const body = await request.text();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
