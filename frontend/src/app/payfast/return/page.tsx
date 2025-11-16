"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/api';
import { Truck, Loader2, PackageCheck } from 'lucide-react';

export default function PayFastReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'polling' | 'redirecting' | 'timeout' | 'error'>('polling');

  useEffect(() => {
    (async () => {
      try {
        const maxWaitMs = 25000; // ~25s window to wait for ITN-created order
        const intervalMs = 2000;
        const start = Date.now();

        // Read geolocation captured before redirect (optional)
        let lat: number | undefined;
        let lon: number | undefined;
        try {
          const raw = localStorage.getItem('bf_checkout_geo');
          const geo = raw ? JSON.parse(raw) : null;
          if (geo && typeof geo.lat === 'number' && typeof geo.lon === 'number') {
            lat = geo.lat; lon = geo.lon;
          }
        } catch {}

        while (Date.now() - start < maxWaitMs) {
          const res: any = await fetchJson('/api/orders');
          const orders: any[] = Array.isArray(res?.orders) ? res.orders : Array.isArray(res?.data) ? res.data : [];

          if (orders && orders.length > 0) {
            const latest = [...orders].sort((a, b) => {
              const ta = new Date(a.createdAt || 0).getTime();
              const tb = new Date(b.createdAt || 0).getTime();
              return tb - ta;
            })[0];

            const recentPayment =
              latest && latest?.paymentInfo?.status === 'paid' &&
              Date.now() - new Date(latest.createdAt || Date.now()).getTime() < 1000 * 60 * 60 * 24;

            if (recentPayment) {
              setStatus('redirecting');
              try {
                // Notify UI to refresh cart counts immediately
                if (typeof window !== 'undefined') {
                  // Clear any local guest cart (defensive)
                  try { localStorage.setItem('bf_cart', JSON.stringify([])); } catch {}
                  window.dispatchEvent(new Event('bf_cart_updated'));
                }
              } catch {}
              const qs = lat && lon ? `?lat=${lat}&lon=${lon}&source=payfast` : '?source=payfast';
              router.replace(`/orders/${latest._id}/tracking${qs}`);
              return;
            }
          }

          // Wait and check again
          await new Promise(r => setTimeout(r, intervalMs));
        }

        // No paid order detected within window
        setStatus('timeout');
      } catch {
        setStatus('error');
      }
    })();
  }, [router]);

  const goToOrders = () => router.replace('/orders');
  const retry = () => window.location.reload();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center gap-3">
        <Truck className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Payment Complete</h1>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        We’re preparing your order. Tracking will be available shortly.
      </p>

      {/* Shipping animation */}
      <div className="mt-6 rounded-lg border p-6 flex items-center gap-4">
        <div className="relative">
          <Truck className="w-12 h-12 animate-bounce" />
          <span className="sr-only">Shipping animation</span>
        </div>
        <div className="flex-1">
          {status === 'polling' && (
            <>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Confirming your payment and generating tracking…</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Please wait, this should only take a moment.
              </p>
            </>
          )}
          {status === 'redirecting' && (
            <div className="flex items-center gap-2 text-green-600">
              <PackageCheck className="w-4 h-4" />
              <span className="text-sm">Order confirmed — redirecting to tracking…</span>
            </div>
          )}
          {status === 'timeout' && (
            <>
              <div className="text-sm">
                Taking longer than expected. You can retry or view your orders.
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={retry}
                  className="bg-black text-white px-3 py-2 rounded-md text-sm hover:bg-black/80"
                >
                  Retry
                </button>
                <button
                  onClick={goToOrders}
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                >
                  Go to Orders
                </button>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-sm text-red-600">
                We couldn’t confirm the payment yet. You can retry or view your orders.
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={retry}
                  className="bg-black text-white px-3 py-2 rounded-md text-sm hover:bg-black/80"
                >
                  Retry
                </button>
                <button
                  onClick={goToOrders}
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                >
                  Go to Orders
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}