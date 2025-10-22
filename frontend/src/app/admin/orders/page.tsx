"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/api';
import { useCurrentUser } from '@/lib/auth';

export default function AdminOrdersPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/auth/login');
      else if (user.role !== 'admin') router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">Checking access…</div>;
  }

  return <AdminOrdersInner />;
}

function AdminOrdersInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res: any = await fetchJson('/api/orders/admin/all');
        const list = res?.data || res?.orders || [];
        if (active) setOrders(list);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load orders');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="mx-auto max-w-5xl p-6 text-sm text-muted-foreground">Loading orders…</div>;
  if (error) return <div className="mx-auto max-w-5xl p-6 text-sm text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">All Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o._id} className="border-b">
                  <td className="py-2 pr-4">#{o._id}</td>
                  <td className="py-2 pr-4">{o?.user?.email || `${o?.user?.firstName || ''} ${o?.user?.lastName || ''}`}</td>
                  <td className="py-2 pr-4">{o.status}</td>
                  <td className="py-2 pr-4">{o?.pricing?.total}</td>
                  <td className="py-2 pr-4">{o?.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                  <td className="py-2 pr-4">
                    <Link className="underline" href={`/admin/orders/${o._id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
