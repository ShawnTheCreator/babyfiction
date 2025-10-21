"use client";
import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingCart, Users, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchJson, fetchForm } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";

const Admin = () => {
  const { user, loading: authLoading } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [productsTotal, setProductsTotal] = useState<number>(0);
  const [topReviewed, setTopReviewed] = useState<any[]>([]);
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{ url?: string; publicId?: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user || user.role !== 'admin') {
        if (active) setLoading(false);
        return;
      }
      try {
        const [statsRes, ordersRes, productsRes, analyticsRes]: any = await Promise.all([
          fetchJson('/api/orders/admin/stats'),
          fetchJson('/api/orders/admin/all?limit=5'),
          fetchJson('/api/products?limit=1'),
          fetchJson('/api/analytics/summary?days=90'),
        ]);
        const statsData = statsRes?.data || statsRes;
        const ordersData = ordersRes?.data || ordersRes?.orders || ordersRes?.data || [];
        const productsTotalCount = typeof productsRes?.total === 'number' ? productsRes.total : (productsRes?.data?.total ?? 0);
        const top = Array.isArray(analyticsRes?.topReviewed) ? analyticsRes.topReviewed.slice(0, 3) : [];
        if (!active) return;
        setOrderStats(statsData);
        setOrders(ordersData);
        setProductsTotal(productsTotalCount);
        setTopReviewed(top);
        const ids = top.map((t: any) => t._id).filter(Boolean);
        if (ids.length > 0) {
          const fetched: Record<string, any> = {};
          for (const id of ids) {
            try {
              const p: any = await fetchJson(`/api/products/${id}`);
              const prod = p?.product || p?.data || p;
              if (prod?._id) fetched[prod._id] = prod;
            } catch {}
          }
          if (active) setProductDetails(fetched);
        }
      } catch {
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, [user]);

  const customersCount = useMemo(() => {
    const set = new Set<string>();
    for (const o of orders) {
      const u = o?.user;
      const id = (typeof u === 'object' ? (u?._id || u?.id) : undefined) || o?.user;
      if (id) set.add(String(id));
    }
    return set.size;
  }, [orders]);

  const stats = useMemo(() => {
    const totalSales = orderStats?.totalSales || 0;
    const totalOrders = orderStats?.totalOrders || 0;
    return [
      { label: "Total Revenue", value: new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(totalSales), icon: TrendingUp, change: "" },
      { label: "Orders", value: String(totalOrders), icon: ShoppingCart, change: "" },
      { label: "Products", value: String(productsTotal), icon: Package, change: "" },
      { label: "Customers", value: String(customersCount), icon: Users, change: "" },
    ];
  }, [orderStats, productsTotal, customersCount]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/10 text-green-500";
      case "Shipped":
        return "bg-blue-500/10 text-blue-500";
      case "Processing":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadResult(null);
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(f);
  };

  const onUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res: any = await fetchForm('/api/media/upload', form);
      setUploadResult({ url: res?.url, publicId: res?.publicId });
      setFile(null);
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Checking your account…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Sign in required</h2>
          <p className="text-sm text-muted-foreground mb-4">You must be signed in to access the admin dashboard.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Unauthorized</h2>
          <p className="text-sm text-muted-foreground">Your account does not have access to the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-secondary/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center mb-12 animate-fade-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {(loading ? [1,2,3,4].map((_, index) => ({ label: '', value: '…', icon: TrendingUp, change: '' })) : stats).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-6 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-green-500">{stat.change}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="animate-fade-up">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">Top Reviewed</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card className="animate-fade-up">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">Recent Orders</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders || []).map((order: any) => {
                    const u = order?.user || {};
                    const customer = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || '—';
                    const amount = order?.pricing?.total || 0;
                    const status = String(order?.status || '').replace(/^./, (c: string) => c.toUpperCase());
                    const date = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
                    return (
                      <TableRow key={order?._id}>
                        <TableCell className="font-medium">{order?._id}</TableCell>
                        <TableCell>{customer}</TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell className="font-bold">{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>{status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="animate-fade-up">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">Top Reviewed</h2>
              </div>
              <div className="p-6 space-y-6">
                {(topReviewed || []).map((entry: any) => {
                  const p = productDetails[entry._id] || {};
                  const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : p.thumbnail || "";
                  return (
                    <div
                      key={entry._id}
                      className="flex items-center gap-6 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                        {img ? (
                          <img src={img} alt={p.name || entry._id} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{p.name || entry._id}</h3>
                        <p className="text-sm text-muted-foreground">{entry.reviews} reviews • Avg {Number(entry.avgRating || 0).toFixed(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl">{new Intl.NumberFormat('en-ZA').format(entry.reviews)} reviews</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card className="p-12 text-center animate-fade-up">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Customer Management</h3>
              <p className="text-muted-foreground">
                Customer management features coming soon
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card className="p-6 animate-fade-up">
              <h2 className="text-2xl font-bold mb-4">Upload Image</h2>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80"
                />
                <Button onClick={onUpload} disabled={!file || uploading}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
              {uploadError && (
                <div className="mt-3 text-sm text-red-500">{uploadError}</div>
              )}
              {uploadResult?.url && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Image URL</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={uploadResult.url}
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigator.clipboard?.writeText(uploadResult.url || '')}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
