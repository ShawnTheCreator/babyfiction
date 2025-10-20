const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getAuthToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('bf_token');
  } catch { return null; }
}

export function setAuthToken(token: string | null) {
  try {
    if (typeof window === 'undefined') return;
    if (token) localStorage.setItem('bf_token', token);
    else localStorage.removeItem('bf_token');
  } catch {}
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}


