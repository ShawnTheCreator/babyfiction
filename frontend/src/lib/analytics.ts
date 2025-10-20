export type AnalyticsEvent =
  | { type: 'page_view'; route: string; referrer?: string | null; utm?: Record<string, string>; userId?: string | null }
  | { type: 'product_view'; productId: string; userId?: string | null }
  | { type: 'add_to_cart'; productId: string; quantity?: number; userId?: string | null }
  | { type: 'checkout_start'; cartSize?: number; amount?: number; userId?: string | null }
  | { type: 'purchase'; orderId?: string; amount?: number; userId?: string | null }
  | { type: 'review_submitted'; productId: string; rating: number; userId?: string | null };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://babyfiction.onrender.com';

async function post(path: string, body: unknown) {
  try {
    await fetch(`${API_BASE}${path}`.replace(/\/$/, ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (_) {
    // swallow errors; analytics must never break UX
  }
}

export async function track(event: AnalyticsEvent) {
  await post('/api/analytics/events', {
    ...event,
    ts: Date.now(),
    sessionId: getSessionId(),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  });
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const key = 'bf_session_id';
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return 'anon';
  }
}
