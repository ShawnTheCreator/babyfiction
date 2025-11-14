"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";
import { setAuthToken, getAuthToken, fetchJson } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, 
  Heart, 
  History, 
  Settings, 
  User, 
  LogOut, 
  ArrowRight, 
  Check, 
  X, 
  Loader2,
  AlertCircle,
  ShoppingBag,
  Star,
  MapPin,
  Phone,
  Mail,
  Lock,
  Bell,
  ShieldCheck,
  Plus
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

// Type definitions
type Order = {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    product: {
      _id: string;
      name: string;
      thumbnail: string;
      price: number;
    };
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

type WishlistItem = {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    thumbnail: string;
    isOnSale?: boolean;
    originalPrice?: number;
    countInStock: number;
  };
  addedAt: string;
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

// Main Account Page
export default function AccountPage() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <AccountDashboard />
    </RequireAuth>
  );
}

function AccountDashboard() {
  const { user } = useCurrentUser();
  
  const logout = () => {
    setAuthToken(null);
    window.location.href = '/';
  };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState({
    profile: true,
    orders: true,
    wishlist: true,
  });
  const [error, setError] = useState({
    profile: "",
    orders: "",
    wishlist: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use shared helper (adds Authorization with bf_token and base URL)
        const [profileData, ordersData, wishlistData]: any = await Promise.all([
          fetchJson('/api/auth/me'),
          fetchJson('/api/orders'),
          fetchJson('/api/wishlist'),
        ]);

        // Profile
        setProfile(profileData?.data || profileData?.user || profileData);

        // Orders
        setOrders(
          Array.isArray(ordersData?.data) ? ordersData.data :
          Array.isArray(ordersData?.orders) ? ordersData.orders :
          Array.isArray(ordersData) ? ordersData : []
        );

        // Wishlist
        setWishlist(
          Array.isArray(wishlistData?.items) ? wishlistData.items :
          Array.isArray(wishlistData) ? wishlistData :
          wishlistData?.wishlist?.items || []
        );
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(prev => ({
          ...prev,
          profile: 'Failed to load profile',
          orders: 'Failed to load orders',
          wishlist: 'Failed to load wishlist'
        }));
      } finally {
        setLoading({
          profile: false,
          orders: false,
          wishlist: false
        });
      }
    };

    fetchUserData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Move item to cart from wishlist
  const moveToCart = async (productId: string) => {
    try {
      // Add to cart
      await fetchJson('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      // Remove from wishlist
      await fetchJson(`/api/wishlist/${productId}`, { method: 'DELETE' });

      // Update local wishlist state and redirect to cart
      setWishlist(prev => prev.filter(item => item.product._id !== productId));
      router.push('/cart');
    } catch (err: any) {
      console.error('Error moving to cart:', err);
      alert(err.message || 'Failed to move item to cart');
    }
  };

  // Handle order status badge
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Loading skeleton for profile
  const ProfileSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );

  // Loading skeleton for orders
  const OrdersSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );

  // Loading skeleton for wishlist
  const WishlistSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );

  // Error state component
  const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
          {onRetry && (
            <div className="mt-2">
              <button
                type="button"
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                onClick={onRetry}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings, view orders, and track your wishlist.
        </p>
      </div>

      <Tabs 
        defaultValue="overview" 
        className="space-y-8"
        onValueChange={(value) => setActiveTab(value)}
      >
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <TabsList className="-mb-px flex space-x-8" aria-label="Account navigation">
            <TabsTrigger 
              value="overview" 
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              My Orders
              {orders.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {orders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="wishlist" 
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wishlist' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
              {wishlist.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {wishlist.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome back, {profile?.name || 'Guest'}</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <Check className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Completed</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {orders.filter(o => o.status === 'delivered').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Wishlist</p>
                      <p className="text-2xl font-semibold text-gray-900">{wishlist.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                      <Star className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveTab('orders')}
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading.orders ? (
                <OrdersSkeleton />
              ) : error.orders ? (
                <ErrorState 
                  message={error.orders} 
                  onRetry={() => {
                    setLoading(prev => ({ ...prev, orders: true }));
                    fetchJson('/api/orders')
                      .then((data) => {
                        setOrders(
                          Array.isArray((data as any)?.data) ? (data as any).data :
                          Array.isArray((data as any)?.orders) ? (data as any).orders :
                          Array.isArray(data) ? data : []
                        );
                        setError(prev => ({ ...prev, orders: '' }));
                      })
                      .catch(() => setError(prev => ({ ...prev, orders: 'Failed to load orders' })))
                      .finally(() => setLoading(prev => ({ ...prev, orders: false })));
                  }}
                />
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by placing your first order.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => router.push('/catalog')}>
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              #{order.orderNumber || order._id.slice(-6)}
                            </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getOrderStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.total?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => router.push(`/orders/${order._id}`)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wishlist Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Wishlist</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveTab('wishlist')}
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading.wishlist ? (
                <WishlistSkeleton />
              ) : error.wishlist ? (
                <ErrorState 
                  message={error.wishlist} 
                  onRetry={() => {
                    setLoading(prev => ({ ...prev, wishlist: true }));
                    fetchJson('/api/wishlist')
                      .then((data) => {
                        setWishlist(
                          Array.isArray((data as any)?.items) ? (data as any).items :
                          Array.isArray(data) ? data :
(data as any)?.wishlist?.items || []
                        );
                        setError(prev => ({ ...prev, wishlist: '' }));
                      })
                      .catch(() => setError(prev => ({ ...prev, wishlist: 'Failed to load wishlist' })))
                      .finally(() => setLoading(prev => ({ ...prev, wishlist: false })));
                  }}
                />
              ) : wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Save items you love for easy access later.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => router.push('/catalog')}>
                      Start Shopping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.slice(0, 3).map((item) => (
                    <div key={item._id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                        <img
                          src={item.product.thumbnail || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                            onClick={(e) => {
                              e.preventDefault();
                              // Remove from wishlist
                              fetchJson(`/api/wishlist/${item.product._id}`, { method: 'DELETE' })
                                .then(() => {
                                  setWishlist(prev => prev.filter(i => i._id !== item._id));
                                })
                                .catch(console.error);
                            }}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10">
                          {item.product.name}
                        </h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            ${item.product.price?.toFixed(2) || '0.00'}
                            {item.product.isOnSale && item.product.originalPrice && (
                              <span className="ml-2 text-xs text-gray-500 line-through">
                                ${item.product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </p>
                          {item.product.countInStock > 0 ? (
                            <Button 
                              size="sm" 
                              className="text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                moveToCart(item.product._id);
                              }}
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="text-xs" disabled>
                              Out of Stock
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>
                View and track your order history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.orders ? (
                <OrdersSkeleton />
              ) : error.orders ? (
                <ErrorState 
                  message={error.orders} 
                  onRetry={() => {
                    setLoading(prev => ({ ...prev, orders: true }));
                    fetchJson('/api/orders')
                      .then((data) => {
                        setOrders(
                          Array.isArray((data as any)?.data) ? (data as any).data :
                          Array.isArray((data as any)?.orders) ? (data as any).orders :
                          Array.isArray(data) ? data : []
                        );
                        setError(prev => ({ ...prev, orders: '' }));
                      })
                      .catch(() => setError(prev => ({ ...prev, orders: 'Failed to load orders' })))
                      .finally(() => setLoading(prev => ({ ...prev, orders: false })));
                  }}
                />
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't placed any orders yet.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => router.push('/catalog')}>
                      Start Shopping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Order #{order.orderNumber || order._id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-4">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-start">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={item.product?.thumbnail || '/placeholder-product.jpg'}
                                  alt={item.product?.name || 'Product'}
                                  className="h-full w-full object-cover object-center"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                  }}
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {item.product?.name || 'Product'}
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">
                                  ${(item.product?.price * item.quantity)?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {order.items.length > 3 && (
                            <div className="text-sm text-blue-600">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between">
                          <div className="text-sm">
                            <p className="text-gray-500">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              Total: ${order.total?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div className="mt-4 sm:mt-0 space-x-3">
                            <Button 
                              variant="outline" 
                              onClick={() => router.push(`/orders/${order._id}`)}
                            >
                              View Order
                            </Button>
                            {order.status === 'delivered' && (
                              <Button variant="outline">
                                Buy Again
                              </Button>
                            )}
                            {order.status === 'pending' && (
                              <Button variant="destructive">
                                Cancel Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>
                    {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={wishlist.length === 0}
                    onClick={() => {
                      // Move all to cart
                      const movePromises = wishlist
                        .filter(item => item.product.countInStock > 0)
                        .map(item => 
                          fetchJson('/api/cart', {
                            method: 'POST',
                            body: JSON.stringify({ 
                              productId: item.product._id, 
                              quantity: 1 
                            })
                          }).then(() => item.product._id)
                        );
                      
                      Promise.all(movePromises)
                        .then(movedIds => {
                          // Remove moved items from wishlist
                          setWishlist(prev => 
                            prev.filter(item => !movedIds.includes(item.product._id))
                          );
                          // Redirect to cart
                          router.push('/cart');
                        })
                        .catch(console.error);
                    }}
                  >
                    Move All to Cart
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading.wishlist ? (
                <WishlistSkeleton />
              ) : error.wishlist ? (
                <ErrorState 
                  message={error.wishlist} 
                  onRetry={() => {
                    setLoading(prev => ({ ...prev, wishlist: true }));
                    fetchJson('/api/wishlist')
                      .then((data) => {
                        setWishlist(
                          Array.isArray((data as any)?.items) ? (data as any).items :
                          Array.isArray(data) ? data :
                          (data as any)?.wishlist?.items || []
                        );
                        setError(prev => ({ ...prev, wishlist: '' }));
                      })
                      .catch(() => setError(prev => ({ ...prev, wishlist: 'Failed to load wishlist' })))
                      .finally(() => setLoading(prev => ({ ...prev, wishlist: false })));
                  }}
                />
              ) : wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Save items you love for easy access later.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => router.push('/catalog')}>
                      Start Shopping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlist.map((item) => (
                    <div key={item._id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                        <img
                          src={item.product.thumbnail || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                            onClick={(e) => {
                              e.preventDefault();
                              // Remove from wishlist
                              fetchJson(`/api/wishlist/${item.product._id}`, { method: 'DELETE' })
                                .then(() => {
                                  setWishlist(prev => prev.filter(i => i._id !== item._id));
                                })
                                .catch(console.error);
                            }}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                        {item.product.isOnSale && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Sale
                            </span>
                          </div>
                        )}
                        {item.product.countInStock === 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10">
                          {item.product.name}
                        </h3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            ${item.product.price?.toFixed(2) || '0.00'}
                            {item.product.isOnSale && item.product.originalPrice && (
                              <span className="ml-2 text-xs text-gray-500 line-through">
                                ${item.product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </p>
                          {item.product.countInStock > 0 ? (
                            <Button 
                              size="sm" 
                              className="text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                moveToCart(item.product._id);
                              }}
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="text-xs" disabled>
                              Out of Stock
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your profile information and manage your account settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.profile ? (
                <ProfileSkeleton />
              ) : error.profile ? (
                <ErrorState 
                  message={error.profile} 
                  onRetry={() => {
                    setLoading(prev => ({ ...prev, profile: true }));
                    fetchJson('/api/auth/me')
                      .then((data) => {
                        setProfile((data as any)?.data || (data as any)?.user || data);
                        setError(prev => ({ ...prev, profile: '' }));
                      })
                      .catch(() => setError(prev => ({ ...prev, profile: 'Failed to load profile' })))
                      .finally(() => setLoading(prev => ({ ...prev, profile: false })));
                  }}
                />
              ) : (
                <form className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      <div className="relative group">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={profile?.avatar} alt={profile?.name} />
                          <AvatarFallback>
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label className="cursor-pointer p-2 rounded-full bg-white text-gray-800">
                            <input type="file" className="hidden" accept="image/*" />
                            <span className="sr-only">Upload new photo</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 w-full space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={profile?.name || ''} 
                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profile?.email || ''} 
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={profile?.phone || ''} 
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="pt-2">
                        <Button type="button">Save Changes</Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Book</CardTitle>
              <CardDescription>
                Manage your shipping addresses for faster checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile?.address ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Default Address</h3>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>{profile.name}</p>
                      <p>{profile.address.street}</p>
                      <p>{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                      <p>{profile.address.country}</p>
                      <p className="mt-2 text-gray-500">Phone: {profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No saved addresses</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add an address for faster checkout.
                    </p>
                    <div className="mt-6">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Address
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Login & Security</CardTitle>
                  <CardDescription>
                    Update your password and secure your account.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how we communicate with you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Order updates, promotions, and more</p>
                    </div>
                  </div>
                  <Switch 
                    checked={profile?.preferences?.emailNotifications !== false}
                    onCheckedChange={(checked) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev?.preferences, emailNotifications: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Order and delivery updates</p>
                    </div>
                  </div>
                  <Switch 
                    checked={profile?.preferences?.smsNotifications === true}
                    onCheckedChange={(checked) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev?.preferences, smsNotifications: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Newsletter</p>
                      <p className="text-sm text-gray-500">Product updates, offers, and more</p>
                    </div>
                  </div>
                  <Switch 
                    checked={profile?.preferences?.newsletter !== false}
                    onCheckedChange={(checked) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev?.preferences, newsletter: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
              <CardDescription>
                These actions are irreversible. Proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-red-800">Delete Account</h3>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all associated data.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="mt-3 sm:mt-0"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          // Handle account deletion
                          fetchJson('/api/users/me', {
                            method: 'DELETE'
                          })
                            .then(() => {
                              setAuthToken(null);
                              window.location.href = '/';
                            })
                            .catch(console.error);
                        }
                      }}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium">Logout</h3>
                      <p className="text-sm text-gray-500">
                        Sign out of your account on this device.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-3 sm:mt-0"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}