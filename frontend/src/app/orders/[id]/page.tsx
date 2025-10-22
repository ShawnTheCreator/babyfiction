"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchJson } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

export default function OrderDetailPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <OrderDetailInner />
    </RequireAuth>
  );
}

function OrderDetailInner() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params as any)?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res: any = await fetchJson(`/api/orders/${id}`);
        const data = res?.data || res;
        if (active) setOrder(data);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load order');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (!id) return null;
  if (loading) return <div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">Loading order…</div>;
  if (error) return <div className="mx-auto max-w-3xl p-6 text-sm text-red-500">{error}</div>;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 text-sm"><Link href="/orders" className="underline">← Back to Orders</Link></div>
      <h1 className="text-2xl font-semibold">Order #{order._id}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <div className="font-medium mb-2">Summary</div>
          <div className="text-sm text-muted-foreground">Status: {order.status}</div>
          <div className="text-sm text-muted-foreground">Items: {order.totalItems}</div>
          <div className="text-sm text-muted-foreground">Subtotal: {order?.pricing?.subtotal}</div>
          <div className="text-sm text-muted-foreground">Tax: {order?.pricing?.tax}</div>
          <div className="text-sm text-muted-foreground">Shipping: {order?.pricing?.shipping}</div>
          <div className="text-sm text-muted-foreground">Total: {order?.pricing?.total}</div>
          <div className="mt-3"><Link href={`/orders/${order._id}/tracking`} className="underline">View tracking</Link></div>
        </div>
        <div className="rounded border p-4">
          <div className="font-medium mb-2">Shipping address</div>
          <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{JSON.stringify(order.shippingAddress, null, 2)}</pre>
        </div>
      </div>
      <div className="mt-6 rounded border p-4">
        <div className="font-medium mb-2">Items</div>
        <ul className="space-y-3">
          {(order.items || []).map((it: any) => (
            <li key={it._id} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{it?.product?.name || it?.product}</span> × {it.quantity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
