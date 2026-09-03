'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // Use Next's same-origin API rewrite. A cookie issued by the backend host
  // cannot be sent to localhost or the deployed frontend.
  baseURL: typeof window === 'undefined' ? undefined : window.location.origin,
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
});
