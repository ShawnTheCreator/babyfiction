"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchJson } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

export default function TrackingPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <TrackingInner />
    </RequireAuth>
  );
}

function TrackingInner() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params as any)?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res: any = await fetchJson(`/api/orders/${id}/tracking`);
        const data = res?.data || res;
        if (active) setTracking(data);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load tracking');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (!id) return null;
  if (loading) return <div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">Loading tracking…</div>;
  if (error) return <div className="mx-auto max-w-3xl p-6 text-sm text-red-500">{error}</div>;

  const events = tracking?.events || [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 text-sm"><Link href={`/orders/${id}`} className="underline">← Back to Order</Link></div>
      <h1 className="text-2xl font-semibold">Order Tracking</h1>
      <div className="mt-4 rounded border p-4">
        <div className="text-sm text-muted-foreground">Courier</div>
        <div className="font-medium">{tracking?.courier || '—'}</div>
        <div className="text-sm text-muted-foreground mt-2">Tracking Number</div>
        <div className="font-medium">{tracking?.trackingNumber || '—'}</div>
        {tracking?.trackingUrl && (
          <div className="mt-2"><a href={tracking.trackingUrl} target="_blank" rel="noreferrer" className="underline">Open tracking page</a></div>
        )}
        {tracking?.status && (
          <div className="mt-2 text-sm text-muted-foreground">Status: {tracking.status}</div>
        )}
        {tracking?.estimatedDelivery && (
          <div className="mt-2 text-sm text-muted-foreground">ETA: {new Date(tracking.estimatedDelivery).toLocaleString()}</div>
        )}
      </div>
      <div className="mt-6 rounded border p-4">
        <div className="font-medium mb-2">Events</div>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tracking events yet.</div>
        ) : (
          <ul className="space-y-3">
            {events.map((ev: any, idx: number) => (
              <li key={idx} className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground">{ev.status}</div>
                <div>{ev.description}</div>
                <div className="text-xs">{ev.location} • {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
