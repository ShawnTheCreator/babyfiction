"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { fetchJson, getAuthToken } from '@/lib/api';
import { useCurrentUser } from '@/lib/auth';

type Product = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  thumbnail?: string;
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const { user } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const params = new URLSearchParams({ limit: '24', fields: 'name,price,thumbnail,category' });
        if (category) params.set('category', category);
        const res: any = await fetchJson(`/api/products?${params.toString()}`);
        const list: Product[] = res?.data || res?.products || res || [];
        if (active) setProducts(Array.isArray(list) ? list : []);

        // Load wishlist if authenticated
        const token = getAuthToken();
        if (token) {
          try {
            const wishRes: any = await fetchJson('/api/wishlist');
            const items = wishRes?.wishlist?.items || [];
            const ids = new Set<string>(items.map((it: any) => it?.product?._id || it?.product).filter((id: any): id is string => typeof id === 'string'));
            if (active) setWishlistIds(ids);
          } catch {}
        }
      } catch (e: any) {
        if (active) setError('Failed to load products');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [category]);

  const toggleWishlist = async (productId: string) => {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    const isInWishlist = wishlistIds.has(productId);
    try {
      if (isInWishlist) {
        await fetchJson(`/api/wishlist/items/${productId}`, { method: 'DELETE' });
        setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
      } else {
        await fetchJson('/api/wishlist/items', { method: 'POST', body: JSON.stringify({ product: productId }) });
        setWishlistIds(prev => new Set(prev).add(productId));
      }
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
    } catch {}
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}</h1>
        <div className="flex gap-3">
          <Link className="rounded border px-3 py-2" href="/">Back to Home</Link>
          {!user ? (
            <Link className="rounded bg-black px-3 py-2 text-white" href="/auth/login">Login</Link>
          ) : (
            <span className="rounded bg-emerald-600 px-3 py-2 text-white">Hello, {user.name || 'you'}</span>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Guests can freely browse Babyfiction products. To checkout, comment, or rate items, please login or create an account.
      </p>

      {loading && <div className="p-6 text-sm">Loading products...</div>}
      {error && <div className="p-6 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <article key={p._id} className="rounded border bg-white p-4 relative">
            <button
              onClick={() => toggleWishlist(p._id)}
              className="absolute top-6 right-6 z-10 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-colors"
              title={wishlistIds.has(p._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`h-5 w-5 ${wishlistIds.has(p._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
            <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded bg-gray-100">
              {p.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <h3 className="text-lg font-medium">{p.name}</h3>
            {typeof p.price === 'number' && (
              <p className="mt-1 text-sm text-muted-foreground">R{p.price?.toFixed(2)}</p>
            )}
            {p.description && (
              <p className="mt-2 text-sm">{p.description}</p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button
                className={`rounded px-3 py-2 ${user ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}
                title={user ? 'Add to cart' : 'Login required to add to cart'}
                onClick={async (e) => {
                  e.preventDefault();
                  const token = getAuthToken();
                  if (!token) { router.push('/auth/login'); return; }
                  try {
                    await fetchJson('/api/cart/items', { method: 'POST', body: JSON.stringify({ product: p._id, quantity: 1 }) });
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
                  } catch {}
                }}
              >
                Add to Cart
              </button>
              <button
                className={`rounded px-3 py-2 ${user ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}
                title={user ? 'Rate product' : 'Login required to rate'}
                onClick={(e) => { e.preventDefault(); router.push(user ? `/product/${encodeURIComponent(p._id)}` : '/auth/login'); }}
              >
                Rate
              </button>
              <button
                className={`rounded px-3 py-2 ${user ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}
                title={user ? 'Comment on product' : 'Login required to comment'}
                onClick={(e) => { e.preventDefault(); router.push(user ? `/product/${encodeURIComponent(p._id)}` : '/auth/login'); }}
              >
                Comment
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold">Checkout</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You must be logged in to proceed to checkout.
        </p>
        <div className="mt-3">
          <Link
            href={user ? '/cart' : '/auth/login'}
            className={`rounded px-4 py-2 ${user ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            {user ? 'Go to Cart' : 'Login to checkout'}
          </Link>
        </div>
      </div>
    </main>
  );
}