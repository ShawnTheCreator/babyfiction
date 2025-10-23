"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchJson } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DriverPortal() {
  const { user, loading: authLoading } = useCurrentUser();
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [activeRes, completedRes, statsRes]: any = await Promise.all([
        fetchJson('/api/driver/active'),
        fetchJson('/api/driver/completed'),
        fetchJson('/api/driver/stats')
      ]);
      
      setActiveOrders(activeRes?.orders || []);
      setCompletedOrders(completedRes?.orders || []);
      setStats(statsRes?.stats || {});
    } catch (error) {
      console.error('Failed to load driver data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'driver') {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await fetchJson(`/api/driver/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setUpdating(null);
    }
  };

  const markOutForDelivery = async (orderId: string) => {
    setUpdating(orderId);
    try {
      await fetchJson(`/api/driver/orders/${orderId}/out-for-delivery`, {
        method: 'PUT'
      });
      await loadData();
    } catch (error) {
      console.error('Failed to mark out for delivery', error);
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'driver') {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Unauthorized</h2>
          <p className="text-sm text-muted-foreground mb-4">Driver access required</p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-500';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-500';
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-secondary/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Driver Portal</h1>
          <p className="text-muted-foreground">Welcome back, {user.firstName || 'Driver'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Truck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Deliveries</p>
                <p className="text-3xl font-bold">{stats?.activeDeliveries || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold">{stats?.completedToday || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Package className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-3xl font-bold">{stats?.totalDeliveries || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Deliveries ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active deliveries</p>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Card key={order._id} className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Delivery Address:</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress?.address}, {order.shippingAddress?.city}
                              <br />
                              {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{order.shippingAddress?.phone}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{order.user?.email}</p>
                        </div>

                        <div>
                          <p className="font-medium mb-2">Items ({order.items?.length || 0}):</p>
                          <div className="space-y-1">
                            {order.items?.map((item: any, idx: number) => (
                              <p key={idx} className="text-sm text-muted-foreground">
                                {item.quantity}x {item.product?.name || item.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      {order.status === 'confirmed' && (
                        <Button
                          onClick={() => updateStatus(order._id, 'processing')}
                          disabled={updating === order._id}
                          className="w-full"
                        >
                          Start Processing
                        </Button>
                      )}
                      
                      {order.status === 'processing' && (
                        <>
                          <Button
                            onClick={() => markOutForDelivery(order._id)}
                            disabled={updating === order._id}
                            className="w-full"
                          >
                            Out for Delivery
                          </Button>
                        </>
                      )}
                      
                      {order.status === 'shipped' && (
                        <Button
                          onClick={() => updateStatus(order._id, 'delivered')}
                          disabled={updating === order._id}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Mark Delivered
                        </Button>
                      )}

                      <Link href={`/driver/orders/${order._id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No completed deliveries</p>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Delivered: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
