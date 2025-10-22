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

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res: any = await fetchJson('/api/orders');
        const list = res?.data || res?.orders || [];
        if (active) setOrders(list);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load orders');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    }
  }, []);

  if (loading) return <div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">Loading your orders…</div>;
  if (error) return <div className="mx-auto max-w-3xl p-6 text-sm text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Your Orders</h1>
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
