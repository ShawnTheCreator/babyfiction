"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchJson, getAuthToken } from "@/lib/api";

type WishItem = { id: string; name: string; price?: string; image?: string };

type BackendItem = { _id: string; product: { _id: string; name: string; price?: number; images?: string[]; thumbnail?: string } };

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
        price: typeof it.product?.price === 'number' ? `R${it.product.price.toFixed(2)}` : undefined,
        image: it.product?.thumbnail || (Array.isArray(it.product?.images) ? it.product.images[0] : undefined),
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
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center animate-fade-in text-muted-foreground">Loading wishlist…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-8 animate-fade-up">
          <Heart className="h-6 w-6" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Your Wishlist</h1>
        </div>

        {error && <div className="mb-6 text-sm text-red-600">{error}</div>}

        {!authed ? (
          <div className="text-center animate-fade-in">
            <p className="text-muted-foreground mb-6">Please login to view your wishlist.</p>
            <Link href="/auth/login" className="inline-block">
              <Button>Login</Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center animate-fade-in">
            <p className="text-muted-foreground mb-6">No liked products yet.</p>
            <Link href="/products" className="inline-block">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it, index) => (
              <Card key={it.id} className="p-4 animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                <Link href={`/product/${it.id}`} className="block">
                  <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{it.name}</h3>
                      {it.price && <p className="text-sm text-muted-foreground">{it.price}</p>}
                    </div>
                  </div>
                </Link>
                <div className="mt-4 flex items-center justify-end">
                  <Button variant="ghost" size="icon" title="Remove from wishlist" onClick={() => removeItem(it.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
