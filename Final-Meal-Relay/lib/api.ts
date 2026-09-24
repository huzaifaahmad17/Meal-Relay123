/**
 * API configuration utility
 * All API calls should use this base URL instead of hardcoding localhost
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Helper to make authenticated API calls
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Get stored user data from localStorage
 */
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

/**
 * Get stored auth token from localStorage
 */
export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Clear auth data and redirect to login
 */
export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth/login';
}
