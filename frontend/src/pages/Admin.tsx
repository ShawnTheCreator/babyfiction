"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";
import { getAuthToken } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, ArrowUp, ArrowDown, FileDown, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Types for user analytics
type UserAnalytics = {
  totalUsers: number;
  newUsersLast7Days: number;
  activeUsers: number;
  usersByPlan: {
    free: number;
    premium: number;
    enterprise: number;
  };
};

export default function Admin() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Array<{ type: 'user' | 'order'; title: string; ts: string }>>([]);
  const [reportsDownloading, setReportsDownloading] = useState<{ users: boolean; orders: boolean }>({ users: false, orders: false });
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Fetching analytics from:', '/api/admin/analytics/users');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://babyfiction.onrender.com';
        const response = await fetch(`${API_URL}/api/admin/analytics/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch analytics');
        }
        
        console.log('Analytics data received:', data);
        setAnalytics(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAnalytics();
    } else {
      setIsLoading(false);
      setError('Unauthorized access');
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        const token = getAuthToken();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://babyfiction.onrender.com';
        const res = await fetch(`${API_URL}/api/analytics/summary?days=30`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message || 'Failed to fetch analytics summary');
        }
        setSummary(json);
        setSummaryError(null);
      } catch (e: any) {
        setSummaryError(e.message || 'Failed to load charts');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    let timer: any;
    const loadRecent = async () => {
      try {
        const token = getAuthToken();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://babyfiction.onrender.com';
        const [usersRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/users?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/orders/admin/all?limit=5`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const usersJson = await usersRes.json();
        const ordersJson = await ordersRes.json();
        const users = Array.isArray(usersJson?.data) ? usersJson.data : [];
        const orders = Array.isArray(ordersJson?.data) ? ordersJson.data : [];
        const events: Array<{ type: 'user' | 'order'; title: string; ts: string }> = [
          ...users.map((u: any) => ({ type: 'user' as const, title: `New user: ${u.email}`, ts: u.createdAt })),
          ...orders.map((o: any) => ({ type: 'order' as const, title: `New order: #${o._id}`, ts: o.createdAt })),
        ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 10);
        setRecent(events);
      } catch (e) {
        // silent
      }
    };
    loadRecent();
    timer = setInterval(loadRecent, 10000); // live-ish every 10s
    return () => timer && clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/login");
      else if (user.role !== "admin") router.replace("/");
    }
  }, [user, loading, router]);

  // Simple client-side CSV helpers
  const downloadCSV = async (type: 'users' | 'orders') => {
    try {
      setReportsDownloading((s) => ({ ...s, [type]: true }));
      const token = getAuthToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://babyfiction.onrender.com';
      const url = type === 'users'
        ? `${API_URL}/api/admin/users?limit=1000`
        : `${API_URL}/api/orders/admin/all?limit=1000`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      if (!rows.length) return;
      
      // Flatten fields for readable CSVs
      const headers = type === 'orders'
        ? ['_id', 'status', 'total', 'userEmail', 'createdAt']
        : ['_id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt'];
    
      const normalized = rows.map((r: any) => {
        if (type === 'orders') {
          return {
            _id: r._id,
            status: r.status ?? '',
            total: r?.pricing?.total ?? '',
            userEmail: r?.user?.email ?? '',
            createdAt: r.createdAt ?? '',
          };
        } else {
          return {
            _id: r._id,
            firstName: r.firstName ?? '',
            lastName: r.lastName ?? '',
            email: r.email ?? '',
            role: r.role ?? '',
            isActive: r.isActive ?? '',
            createdAt: r.createdAt ?? '',
          };
        }
      });
    
      const csv = [
        headers.join(','),
        ...normalized.map((row: any) => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
      ].join('\n');
    
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${type}-report-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error('CSV download failed', e);
    } finally {
      setReportsDownloading((s) => ({ ...s, [type]: false }));
    }
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pt-24 pb-16 px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Grid — now only 3 cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Optional: changed lg:grid-cols-4 → lg:grid-cols-3 */}
        {/* Users Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : (
                <h3 className="text-2xl font-bold">{formatNumber(analytics?.totalUsers || 0)}</h3>
              )}
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
          {!isLoading && !error && analytics && analytics.newUsersLast7Days !== undefined && (
            <div className="mt-4 flex items-center text-sm">
              {analytics.newUsersLast7Days >= 0 ? (
                <span className="flex items-center text-green-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {analytics.newUsersLast7Days} new this week
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  {Math.abs(analytics.newUsersLast7Days)} fewer this week
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Active Users Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : (
                <h3 className="text-2xl font-bold">{formatNumber(analytics?.activeUsers || 0)}</h3>
              )}
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Active in last 30 days</p>
        </Card>

        {/* Reports Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Reports</h3>
            <FileDown className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => downloadCSV('orders')}
              disabled={reportsDownloading.orders}
            >
              <FileDown className="h-4 w-4" />
              {reportsDownloading.orders ? 'Preparing Orders CSV…' : 'Download Orders CSV'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => downloadCSV('users')}
              disabled={reportsDownloading.users}
            >
              <FileDown className="h-4 w-4" />
              {reportsDownloading.users ? 'Preparing Users CSV…' : 'Download Users CSV'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Second Row - Recent Activity */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Recent Activity</h3>
            <RefreshCcw className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                </div>
              ))
            ) : error ? (
              <p className="text-red-500 text-sm">Error loading activity</p>
            ) : recent.length > 0 ? (
              <div className="space-y-4">
                {recent.slice(0, 5).map((event, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      event.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {event.type === 'user' ? <Users className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.ts).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create, edit, and manage products.
          </p>
          <div className="flex gap-3">
            <Link href="/admin/products">
              <Button variant="outline">Manage Products</Button>
            </Link>
            <Link href="/admin/products/new">
              <Button>Add Product</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-sm text-muted-foreground mb-4">
            View and update customer orders.
          </p>
          <div>
            <Link href="/admin/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}