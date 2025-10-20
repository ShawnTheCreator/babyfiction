"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchJson, getAuthToken } from "@/lib/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCart() {
    setError(null);
    setLoading(true);
    try {
      const token = getAuthToken();
      if (token) {
        const res: any = await fetchJson('/api/cart');
        const items = Array.isArray(res?.cart?.items) ? res.cart.items : [];
        const mapped = items.map((it: any) => ({
          _id: it._id,
          productId: it.product?._id || it.product,
          name: it.product?.name || 'Product',
          price: it.product?.price || 0,
          quantity: it.quantity,
          size: it.size,
          image: it.product?.thumbnail || (Array.isArray(it.product?.images) ? it.product.images[0] : ''),
        }));
        setCartItems(mapped);
      } else {
        // Fallback to localStorage demo cart
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem('bf_cart') : null;
          const list = raw ? JSON.parse(raw) : [];
          const mapped = (Array.isArray(list) ? list : []).map((p) => ({
            _id: String(p.id),
            productId: p.id,
            name: p.name,
            price: Number(String(p.price).replace(/[^0-9]/g, '')) || 0,
            quantity: 1,
            size: 'M',
            image: p.image,
          }));
          setCartItems(mapped);
        } catch {
          setCartItems([]);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadCart(); }, []);

  const updateQuantity = async (id: string, delta: number) => {
    const token = getAuthToken();
    if (!token) {
      setCartItems(cartItems.map((item) => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
      return;
    }
    const item = cartItems.find((x) => x._id === id);
    if (!item) return;
    const nextQty = Math.max(1, Math.min(10, item.quantity + delta));
    await fetchJson(`/api/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity: nextQty }) });
    await loadCart();
  };

  const removeItem = async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      setCartItems(cartItems.filter((item) => item._id !== id));
      return;
    }
    await fetchJson(`/api/cart/items/${id}`, { method: 'DELETE' });
    await loadCart();
  };

  const clearCart = async () => {
    const token = getAuthToken();
    if (!token) {
      setCartItems([]);
      try { localStorage.setItem('bf_cart', JSON.stringify([])); if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated')); } catch {}
      return;
    }
    await fetchJson('/api/cart', { method: 'DELETE' });
    await loadCart();
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const shipping = 320;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center animate-fade-in text-muted-foreground">Loading cart…</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Start shopping to add items to your cart
          </p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 animate-fade-up">
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <Card
                key={item._id}
                className="p-6 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Size: {item.size}</p>
                      <p className="text-xl font-bold">R{Number(item.price).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item._id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item._id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item._id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <div>
              <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-32 animate-fade-up [animation-delay:200ms]">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">R{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">R{shipping}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">R{total.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full mb-4">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 p-4 bg-foreground/5 rounded-lg">
                <p className="text-sm text-center">
                  Free shipping on orders over <span className="font-semibold">R8,000</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
