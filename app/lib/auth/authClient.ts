'use client';

import { createAuthClient } from 'better-auth/react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Better Auth's client wants the server origin; our catch-all route is mounted
// at basePath '/api/auth', separate from the '/api' prefix your other routes use.
const ORIGIN = API.replace(/\/api\/?$/, '');

export const authClient = createAuthClient({
  baseURL: ORIGIN,
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',   // always send the session cookie cross-domain
  },
});