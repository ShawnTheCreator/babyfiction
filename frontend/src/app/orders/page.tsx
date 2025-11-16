"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

export default function OrdersPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <OrdersInner />
    </RequireAuth>
  );
}

function OrdersInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [sim, setSim] = useState<{active: boolean; step: number; steps: string[]; location?: {lat:number;lon:number}}>({
    active: false,
    step: 0,
    steps: ['Processing order', 'Packed at warehouse', 'Dispatched', 'In transit near your location', 'Delivered'],
  });
  // Add router redirect
  // eslint-disable-next-line
  const router: any = (typeof window !== 'undefined' ? require('next/navigation').useRouter() : { replace: () => {} }).useRouter?.();
  
  useEffect(() => {
    if (!orders || orders.length === 0 || !router) return;
    let geo: any = null;
    try {
      const raw = localStorage.getItem('bf_checkout_geo');
      geo = raw ? JSON.parse(raw) : null;
    } catch {}
  
    const latest = [...orders].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    })[0];
  
    const recentPayment =
      latest && latest?.paymentInfo?.status === 'paid' &&
      Date.now() - new Date(latest.createdAt || Date.now()).getTime() < 1000 * 60 * 60 * 24;
  
    if (recentPayment && geo && typeof geo.lat === 'number' && typeof geo.lon === 'number') {
      router.replace(`/orders/${latest._id}/tracking?lat=${geo.lat}&lon=${geo.lon}&source=orders`);
      return;
    }
  
    if (recentPayment && geo && !sim.active) {
      setSim((s) => ({
        ...s,
        active: true,
        step: 0,
        location: typeof geo?.lat === 'number' && typeof geo?.lon === 'number'
          ? { lat: geo.lat, lon: geo.lon }
          : undefined,
      }));
  
      // staged updates every ~3 seconds
      let i = 0;
      const timer = setInterval(() => {
        i += 1;
        setSim((s) => ({ ...s, step: Math.min(i, s.steps.length - 1) }));
        if (i >= 4) {
          clearInterval(timer);
          try { localStorage.removeItem('bf_checkout_geo'); } catch {}
        }
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [orders]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Tracking simulation banner */}
      {sim.active && (
        <div className="mt-4 mb-6 rounded-lg border p-4 bg-green-50">
          <div className="text-sm text-black/70">
            {sim.location
              ? `Tracking: ${sim.steps[sim.step]} (near ${sim.location.lat.toFixed(3)}, ${sim.location.lon.toFixed(3)})`
              : `Tracking: ${sim.steps[sim.step]}`}
          </div>
          <div className="mt-2 h-2 bg-black/10 rounded">
            <div
              className="h-2 bg-[#4CAF50] rounded"
              style={{ width: `${((sim.step + 1) / sim.steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Orders list */}
      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o: any) => (
            <li key={o._id} className="rounded border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Order</div>
                  <div className="font-medium">#{o._id}</div>
                  <div className="text-sm text-muted-foreground">Status: {o.status}</div>
                  <div className="text-sm text-muted-foreground">Total: {o?.pricing?.total?.toFixed ? o.pricing.total.toFixed(2) : o?.pricing?.total}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/orders/${o._id}`} className="underline">View</Link>
                  <Link href={`/orders/${o._id}/tracking`} className="underline">Tracking</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
