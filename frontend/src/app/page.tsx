"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchJson, getAuthToken } from '@/lib/api';

type UiProduct = { id: string; name: string; price: string; image: string; category?: string; description?: string };

export default function HomePage() {
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const addToCart = async (item: { id: string; name: string; price: string; image: string }) => {
    const token = getAuthToken();
    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
      return;
    }
    try {
      await fetchJson('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product: item.id, quantity: 1 })
      });
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
    } catch {}
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res: any = await fetchJson('/api/products/featured?limit=9');
        const list = Array.isArray(res?.products) ? res.products : [];
        const mapped: UiProduct[] = list.map((p: any) => ({
          id: p._id,
          name: p.name,
          price: typeof p.price === 'number' ? `R${p.price.toFixed(2)}` : String(p.price ?? ''),
          image: p.thumbnail || (Array.isArray(p.images) ? p.images[0] : ''),
          category: p.category,
          description: p.description,
        }));
        if (active) setProducts(mapped);
      } catch {
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <main className="animate-fade-in">
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-2 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">New Collection Available</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 animate-fade-up">
              Redefine Your
              <br />
              <span className="text-primary">Style Statement</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-up [animation-delay:200ms]">
              Discover premium fashion pieces that blend contemporary design with timeless elegance
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up [animation-delay:400ms]">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground group px-8 py-6 text-base"
                >
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/products?filter=new">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 px-8 py-6 text-base hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                >
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="products" className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="mb-4 text-xl font-semibold">Featured Products</h2>
          {loading && <div className="p-6 text-sm">Loading products...</div>}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article
                key={p.id}
                className="group rounded border bg-white p-4 transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-up"
              >
                <Link href={`/product/${encodeURIComponent(p.id)}`} className="block">
                  <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{p.name}</h3>
                      {p.category && <p className="text-sm text-muted-foreground">{p.category}</p>}
                    </div>
                    <span className="text-sm font-semibold">{p.price}</span>
                  </div>
                  {p.description && <p className="mt-2 text-sm">{p.description}</p>}
                  <div className="mt-4 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ id: p.id, name: p.name, price: p.price, image: p.image });
                      }}
                      className="gap-2"
                      title="Add to cart"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}


