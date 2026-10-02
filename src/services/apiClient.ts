/**
 * Single entry point for talking to the API.
 *
 * Every studio endpoint requires a bearer token, so all calls go through here
 * rather than calling fetch directly — that way a token is never forgotten on a
 * new call site, and an expired session lands the user on the sign-in screen
 * instead of failing silently somewhere deep in a store.
 */

const TOKEN_KEY = 'studio_token';

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode / storage disabled — session lasts for this page only */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
}

export function isAuthenticated(): boolean {
  return getToken().length > 0;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function redirectToLogin(): void {
  clearToken();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (res.status === 401) {
    redirectToLogin();
    throw new ApiError('Session expired, please sign in again.', 401);
  }

  return res;
}

/** apiFetch plus JSON parsing, for the common case. */
export async function apiJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    throw new ApiError(body?.error || body?.message || `HTTP ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = (password || '').trim();

  // The server is the only thing that decides whether a password is valid.
  // Accepting known passwords here, or minting a token when the backend cannot
  // be reached, hands out a session this server never issued — every API call
  // then fails with 401 anyway, so it only looks like a successful sign-in.
  // Running locally still works without any setup: the server itself falls back
  // to a development password outside production.
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed })
    });

    const data = await res.json().catch(() => ({} as any));

    if (res.ok && data?.success && data?.token) {
      setToken(data.token);
      return { success: true };
    }

    return { success: false, error: data?.error || 'Incorrect studio password.' };
  } catch {
    return { success: false, error: 'Cannot reach the server. Check your connection and try again.' };
  }
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    /* signing out locally is what matters */
  } finally {
    clearToken();
  }
}
