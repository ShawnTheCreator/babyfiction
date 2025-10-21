const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://babyfiction.onrender.com';

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
    let msg = '';
    try {
      const data = await res.json();
      msg = data?.message || data?.error || (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg || e.message).join(', ') : '');
    } catch {
      try { msg = await res.text(); } catch { msg = ''; }
    }
    const err: any = new Error(msg || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchForm<T>(path: string, form: FormData, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    body: form,
    cache: 'no-store',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...(init || {}),
  });
  if (!res.ok) {
    let msg = '';
    try {
      const data = await res.json();
      msg = data?.message || data?.error || (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg || e.message).join(', ') : '');
    } catch {
      try { msg = await res.text(); } catch { msg = ''; }
    }
    const err: any = new Error(msg || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
