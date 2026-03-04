// Token management functions for storing and retrieving authentication tokens in localStorage or cookies, depending on the environment and security requirements.

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}
