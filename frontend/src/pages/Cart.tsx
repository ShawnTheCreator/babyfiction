"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X, RefreshCw } from "lucide-react";
import { fetchJson, getAuthToken } from "@/lib/api";

type CartItem = {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  category?: string;
};

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCart() {
    setError(null);
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setCartItems([]);
        return;
      }
      const res: any = await fetchJson('/api/cart');
      const items = Array.isArray(res?.cart?.items) ? res.cart.items : [];
      const mapped: CartItem[] = items.map((it: any) => ({
        _id: it._id,
        productId: it.product?._id || it.product,
        name: it.product?.name || 'Product',
        price: it.product?.price || 0,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        image: it.product?.thumbnail || (Array.isArray(it.product?.images) ? it.product.images[0] : ''),
        category: it.product?.category || 'Cotton T Shirt',
      }));
      setCartItems(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadCart(); }, []);

  const updateQuantity = async (id: string, delta: number) => {
    const token = getAuthToken();
    if (!token) return;
    const item = cartItems.find((x) => x._id === id);
    if (!item) return;
    const nextQty = Math.max(1, Math.min(10, item.quantity + delta));
    try {
      await fetchJson(`/api/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity: nextQty }) });
      await loadCart();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await fetchJson(`/api/cart/items/${id}`, { method: 'DELETE' });
      await loadCart();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const moveToWishlist = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    const item = cartItems.find((x) => x._id === id);
    if (!item) return;

    try {
      // Add to wishlist
      await fetchJson('/api/wishlist/items', {
        method: 'POST',
        body: JSON.stringify({ product: item.productId })
      });

      // Remove from cart
      await fetchJson(`/api/cart/items/${id}`, { method: 'DELETE' });

      // Update both cart and wishlist
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bf_cart_updated'));
        window.dispatchEvent(new Event('bf_wishlist_updated'));
      }

      // Reload cart to reflect changes
      await loadCart();
      
      alert('Item moved to wishlist!');
    } catch (err) {
      console.error('Failed to move to wishlist:', err);
      alert('Failed to move item to wishlist. Please try again.');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const shipping = 80;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen pt-[140px] pb-12 px-4 sm:px-6 lg:px-[50px] flex items-center justify-center">
        <div className="text-center text-sm text-gray-600">Loading cart…</div>
      </div>
    );
  }

  const token = getAuthToken();
  if (!token) {
    return (
      <div className="min-h-screen pt-[140px] pb-12 px-4 sm:px-6 lg:px-[50px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2>
          <Link 
            href="/auth/login"
            className="inline-block bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-[140px] pb-12 px-4 sm:px-6 lg:px-[50px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link 
            href="/catalog"
            className="inline-block bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[140px] pb-12 px-4 sm:px-6 lg:px-[50px]">
      <div className="max-w-[1340px] mx-auto">
        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="flex gap-8 border-b border-gray-200">
            <button 
              className="pb-4 text-sm font-[family-name:var(--font-nav)] uppercase tracking-wider text-black border-b-2 border-black"
            >
              Shopping Bag
            </button>
            <Link 
              href="/wishlist"
              className="pb-4 text-sm font-[family-name:var(--font-nav)] uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
            >
              Favourites
            </Link>
          </div>
        </div>

        {error && <div className="mb-6 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Mobile First */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="relative">
                {/* Remove Button - Top Right */}
                <button
                  onClick={() => removeItem(item._id)}
                  className="absolute top-0 right-0 z-10 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  aria-label="Remove item"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>

                <div className="flex gap-4">
                  {/* Product Image - Clickable */}
                  <Link href={`/product/${item.productId}`} className="w-32 h-40 sm:w-40 sm:h-48 bg-gray-100 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                      src={item.image || '/assets/images/products/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <p className="font-[family-name:var(--font-nav)] text-xs text-gray-500 mb-1">
                        {item.category}
                      </p>
                      <Link href={`/product/${item.productId}`} className="block hover:text-gray-600 transition-colors">
                        <h3 className="font-[family-name:var(--font-nav)] text-sm font-medium mb-2 capitalize">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="font-[family-name:var(--font-nav)] text-base font-medium mb-4">
                        R{item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Size and Color Selector - Right Side */}
                    <div className="flex items-end justify-end gap-3">
                      {/* Size Selector */}
                      <div className="flex flex-col items-center gap-2">
                        <button className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center text-xs font-medium hover:border-black transition-colors">
                          {item.size || 'L'}
                        </button>
                        <button 
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black"
                          aria-label="Change size"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Color Selector */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border border-gray-300 rounded overflow-hidden">
                          <div className="w-full h-full bg-black" />
                        </div>
                        <button 
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black"
                          aria-label="Change color"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-col border border-gray-300 rounded overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-10 h-5 flex items-center justify-center hover:bg-gray-100 transition-colors text-xs font-medium"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <div className="w-10 h-10 border-t border-b border-gray-300 flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-10 h-5 flex items-center justify-center hover:bg-gray-100 transition-colors text-xs font-medium"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wishlist Icon - Bottom Left of Image */}
                <button 
                  onClick={() => moveToWishlist(item._id)}
                  className="absolute bottom-2 left-2 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  aria-label="Move to wishlist"
                  title="Move to wishlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 lg:sticky lg:top-32">
              <h2 className="text-lg font-[family-name:var(--font-headers)] uppercase tracking-wide mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">R {shipping}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-[family-name:var(--font-headers)] text-base uppercase tracking-wide">
                      Total <span className="text-xs text-gray-500 normal-case">(Tax incl.)</span>
                    </span>
                    <span className="font-[family-name:var(--font-headers)] text-lg">
                      R {total.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-600">
                    I agree to the Terms and Conditions
                  </span>
                </label>
              </div>

              {/* Continue Button */}
              <Link 
                href="/checkout"
                className="w-full block bg-black text-white text-center py-3 px-6 rounded text-sm font-[family-name:var(--font-nav)] uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
