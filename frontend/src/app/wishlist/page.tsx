"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { fetchJson, getAuthToken } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";

type WishItem = { 
  id: string; 
  name: string; 
  price?: number; 
  image?: string;
  category?: string;
  size?: string;
  color?: string;
};

type BackendItem = { 
  _id: string; 
  product: { 
    _id: string; 
    name: string; 
    price?: number; 
    images?: string[]; 
    thumbnail?: string;
    category?: string;
  } 
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean>(false);

  async function loadWishlist() {
    setError(null);
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setAuthed(false);
        setItems([]);
        return;
      }
      setAuthed(true);
      const res: any = await fetchJson('/api/wishlist');
      const list: BackendItem[] = Array.isArray(res?.wishlist?.items) ? res.wishlist.items : [];
      const mapped: WishItem[] = list.map((it) => ({
        id: it.product?._id || it._id,
        name: it.product?.name || 'Product',
        price: it.product?.price,
        image: it.product?.thumbnail || (Array.isArray(it.product?.images) ? it.product.images[0] : undefined),
        category: it.product?.category || 'Cotton T Shirt',
        size: 'L',
        color: '#1b1b1d',
      }));
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadWishlist(); }, []);

  const removeItem = async (productId: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await fetchJson(`/api/wishlist/items/${productId}`, { method: 'DELETE' });
      await loadWishlist();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const addToCart = async (itemId: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      // First check if product is in stock
      const productRes: any = await fetchJson(`/api/products/${item.id}`);
      const product = productRes?.product || productRes?.data || productRes;
      
      // Check stock availability
      const isInStock = product?.stock > 0 || product?.inStock !== false;
      
      if (!isInStock) {
        alert('Sorry, this item is currently out of stock.');
        return;
      }

      // Add to cart with correct parameter name
      await fetchJson('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product: item.id, quantity: 1 })
      });
      
      // Remove from wishlist after successful add to cart
      await fetchJson(`/api/wishlist/items/${item.id}`, { method: 'DELETE' });
      
      // Update both cart and wishlist
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bf_cart_updated'));
        window.dispatchEvent(new Event('bf_wishlist_updated'));
      }
      
      // Reload wishlist to reflect changes
      await loadWishlist();
      
      alert('Item moved to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px] flex items-center justify-center">
        <div className="text-center text-sm text-gray-600">Loading favourites…</div>
      </div>
    );
  }

  return (
    <RequireAuth redirectTo="/auth/login">
      <div className="min-h-screen bg-white pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px]">
        <div className="max-w-[1200px] mx-auto">
          {/* Header with Tabs */}
          <div className="mb-12 relative">
            <div className="flex gap-8 border-b border-gray-200">
              <Link 
                href="/cart"
                className="pb-4 text-sm font-[family-name:var(--font-nav)] uppercase tracking-[2px] text-gray-400 hover:text-black transition-colors"
              >
                Shopping bag
              </Link>
              <button 
                className="pb-4 text-sm font-[family-name:var(--font-nav)] uppercase tracking-[2px] text-black border-b-2 border-black"
              >
                favourites
              </button>
            </div>
            
            {/* Heart Icon - positioned absolutely to the right */}
            <div className="absolute right-0 top-0">
              <Heart className="w-6 h-6 text-black" />
            </div>
          </div>

          {error && <div className="mb-6 text-sm text-red-600">{error}</div>}

          {!authed ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">Please login to view your favourites.</p>
              <Link 
                href="/auth/login" 
                className="inline-block bg-black text-white px-8 py-3 hover:opacity-80 transition-opacity"
              >
                Login
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-[family-name:var(--font-nav)] mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to your wishlist to save them for later.</p>
              <Link 
                href="/catalog" 
                className="inline-block bg-black text-white px-8 py-3 hover:opacity-80 transition-opacity font-[family-name:var(--font-body)]"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border border-gray-200 p-4 relative">
                  {/* Product Image - Clickable */}
                  <Link href={`/product/${item.id}`} className="w-32 h-40 sm:w-40 sm:h-48 bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                      src={item.image || '/assets/images/products/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/products/placeholder.jpg';
                      }}
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-[family-name:var(--font-nav)] text-xs text-gray-500 mb-1 uppercase">
                        {item.category}
                      </div>
                      <Link href={`/product/${item.id}`} className="block hover:text-gray-600 transition-colors">
                        <h3 className="font-[family-name:var(--font-nav)] text-base font-normal mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="font-[family-name:var(--font-nav)] text-sm mb-3">
                        {item.size}
                      </div>
                      <div 
                        className="w-5 h-5 border border-gray-300 mb-4" 
                        style={{ backgroundColor: item.color }}
                      />
                      <button
                        onClick={() => addToCart(item.id)}
                        className="bg-black text-white px-5 py-2.5 text-sm font-[family-name:var(--font-body)] font-medium hover:opacity-80 transition-opacity"
                        title="Move to cart"
                      >
                        Move to Cart
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Price and Remove */}
                  <div className="flex flex-col justify-between items-end">
                    {item.price && (
                      <div className="font-[family-name:var(--font-nav)] text-base">
                        R {item.price}
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 hover:opacity-70 transition-opacity"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-full h-full fill-black text-black" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
