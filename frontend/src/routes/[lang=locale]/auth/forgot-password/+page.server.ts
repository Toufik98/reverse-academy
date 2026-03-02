import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();

    if (!email) {
      return fail(400, { error: true });
    }

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Always return success to prevent email enumeration
      return { success: true };
    } catch {
      return { success: true };
    }
  },
};
