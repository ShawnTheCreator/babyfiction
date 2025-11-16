"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/api';

export default function PayFastReturnPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res: any = await fetchJson('/api/orders');
        const orders: any[] = Array.isArray(res?.orders) ? res.orders : Array.isArray(res?.data) ? res.data : [];
        if (!orders || orders.length === 0) {
          router.replace('/orders');
          return;
        }

        const latest = [...orders].sort((a, b) => {
          const ta = new Date(a.createdAt || 0).getTime();
          const tb = new Date(b.createdAt || 0).getTime();
          return tb - ta;
        })[0];

        const recentPayment =
          latest && latest?.paymentInfo?.status === 'paid' &&
          Date.now() - new Date(latest.createdAt || Date.now()).getTime() < 1000 * 60 * 60 * 24;

        let lat: number | undefined;
        let lon: number | undefined;
        try {
          const raw = localStorage.getItem('bf_checkout_geo');
          const geo = raw ? JSON.parse(raw) : null;
          if (geo && typeof geo.lat === 'number' && typeof geo.lon === 'number') {
            lat = geo.lat; lon = geo.lon;
          }
        } catch {}

        if (recentPayment) {
          const qs = lat && lon ? `?lat=${lat}&lon=${lon}&source=payfast` : '?source=payfast';
          router.replace(`/orders/${latest._id}/tracking${qs}`);
        } else {
          router.replace('/orders');
        }
      } catch {
        router.replace('/orders');
      }
    })();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Payment Complete</h1>
      <p className="mt-2 text-sm text-muted-foreground">Redirecting to tracking…</p>
    </main>
  );
}