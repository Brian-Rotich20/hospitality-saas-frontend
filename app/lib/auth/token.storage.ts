// Token storage is now minimal:
// - Access token: memory only (in ApiClient + AuthContext)
// - Refresh token: httpOnly cookie (set/cleared by backend)
//
// This file is kept only for any legacy references — do not use for auth tokens.

export function clearAllTokens(): void {
  if (typeof window === 'undefined') return;
  // Clean up any old localStorage tokens from previous implementation
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth_token');
}