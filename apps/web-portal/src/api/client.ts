export interface ApiError {
  statusCode: number;
  message: string;
}

const TOKEN_STORAGE_KEY = 'smartschool_auth';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    roles: string[];
    permissions: string[];
  };
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession | null): void {
  if (!session) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
}

async function refreshAccessToken(session: StoredSession): Promise<StoredSession | null> {
  const res = await fetch('/api/v1/core/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  if (!res.ok) {
    saveSession(null);
    return null;
  }
  const updated = (await res.json()) as StoredSession;
  saveSession(updated);
  return updated;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> {
  let session = loadSession();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (requireAuth && session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  let response = await fetch(path, { ...options, headers });

  if (response.status === 401 && requireAuth && session?.refreshToken) {
    const refreshed = await refreshAccessToken(session);
    if (refreshed) {
      session = refreshed;
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      response = await fetch(path, { ...options, headers });
    }
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errBody.message)) {
        message = errBody.message.join(', ');
      } else if (errBody.message) {
        message = errBody.message;
      }
    } catch {
      // keep default HTTP status message
    }
    throw { statusCode: response.status, message } satisfies ApiError;
  }

  return (await response.json()) as T;
}
