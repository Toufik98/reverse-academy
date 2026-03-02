import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, fetch, params }) => {
    const data = await request.formData();
    const password = data.get('password')?.toString();
    const confirmPassword = data.get('confirmPassword')?.toString();
    const token = params.token;

    if (!password || password.length < 8) {
      return fail(400, { error: true, message: 'Password must be at least 8 characters.' });
    }

    if (password !== confirmPassword) {
      return fail(400, { error: true, message: 'Passwords do not match.' });
    }

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        return fail(400, { error: true, message: 'Invalid or expired reset link.' });
      }

      return { success: true };
    } catch {
      return fail(500, { error: true, message: 'Something went wrong.' });
    }
  },
};
