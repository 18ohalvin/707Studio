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

export const SESSION_EXPIRED_EVENT = 'studio:session-expired';

/**
 * The UI keeps the signed-in account in localStorage, separately from the
 * token. Without telling the app, an expired token left the studio looking
 * signed in while every save was refused with 401. Edits are already mirrored
 * locally and re-synced after the next sign-in, so nothing is lost by this.
 */
function handleUnauthorized(): void {
  clearToken();
  try {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  } catch {
    /* non-browser environment */
  }
}

function resolveUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  const envUrl = (env?.VITE_API_BASE_URL || env?.VITE_API_URL || '').replace(/\/+$/, '');

  if (envUrl) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${envUrl}${cleanPath}`;
  }

  // Fallback for Node / test environments where fetch requires an absolute origin
  if (typeof window === 'undefined') {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:3001${cleanPath}`;
  }

  return path;
}

/**
 * Browsers cap the combined body of in-flight keepalive requests at 64 KB and
 * reject anything larger outright with a network error — no request is sent.
 * Every image upload and any project holding a picture is far past that, so
 * keepalive (which only matters for a save racing a tab close) is used only
 * when the body is small enough to be accepted.
 */
const KEEPALIVE_BODY_LIMIT = 60 * 1024;

function bodyFitsKeepalive(body: RequestInit['body']): boolean {
  if (body === undefined || body === null) return true;
  if (typeof body === 'string') return new Blob([body]).size <= KEEPALIVE_BODY_LIMIT;
  return false;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const url = resolveUrl(path);
  const isMutation = !!options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase());
  const wantsKeepalive = options.keepalive !== undefined ? options.keepalive : isMutation;

  const res = await fetch(url, {
    ...options,
    keepalive: wantsKeepalive && bodyFitsKeepalive(options.body),
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (res.status === 401) {
    // Only treat this as an expired session if we actually had one. Without
    // this, a stray call made before sign-in bounces the page to /login and
    // can throw someone out of a session they had just started.
    if (token) {
      handleUnauthorized();
      throw new ApiError('Unauthorized or session expired.', 401);
    }
    throw new ApiError('Sign-in required.', 401);
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

  try {
    const res = await fetch(resolveUrl('/api/auth/login'), {
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
