"use client";
import Link from 'next/link';
import { Sparkles, ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const addToCart = (item: { id: string; name: string; price: string; image: string }) => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('bf_cart') : null;
      const cart = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(cart) ? [...cart, item] : [item];
      localStorage.setItem('bf_cart', JSON.stringify(next));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bf_cart_updated'));
      }
    } catch {}
  };

  const toggleWishlist = (item: { id: string; name: string; price: string; image: string }) => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('bf_wishlist') : null;
      const list = raw ? JSON.parse(raw) : [];
      const exists = Array.isArray(list) && list.find((x: any) => x?.id === item.id);
      const next = exists ? list.filter((x: any) => x?.id !== item.id) : [...(Array.isArray(list) ? list : []), item];
      localStorage.setItem('bf_wishlist', JSON.stringify(next));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bf_wishlist_updated'));
      }
    } catch {}
  };
  const products = [
    // Hats & Caps (R150 inferred for caps without explicit price)
    {
      id: 'cap-black',
      name: 'Black Cap',
      price: 'R150',
      image: '/BlackCap.jpeg',
      category: 'Hats',
      description: 'Distressed trucker style cap in black.'
    },
    {
      id: 'cap-blue',
      name: 'Blue Cap',
      price: 'R150',
      image: '/BlueCap.jpeg',
      category: 'Hats',
      description: 'Distressed trucker style cap in blue.'
    },
    {
      id: 'cap-red',
      name: 'Red Cap',
      price: 'R150',
      image: '/RedCap.jpeg',
      category: 'Hats',
      description: 'Distressed trucker style cap in red.'
    },
    {
      id: 'hat-distressed-1',
      name: 'Distressed Trucker Hat',
      price: 'R150',
      image: '/DISTRESSED TRUCKER HATS-R150 .png',
      category: 'Hats',
      description: 'Vintage-wash distressed trucker hat.'
    },
    {
      id: 'hat-distressed-2',
      name: 'Distressed Trucker Hat (Style 2)',
      price: 'R150',
      image: '/2ndDISTRESSED TRUCKER HATS-R150 .png',
      category: 'Hats',
      description: 'Second style of distressed trucker hat.'
    },
    {
      id: 'hat-distressed-3',
      name: 'Distressed Trucker Hat (Style 3)',
      price: 'R150',
      image: '/3rdDISTRESSED TRUCKER HATS-R150 .png',
      category: 'Hats',
      description: 'Third style of distressed trucker hat.'
    },

    // Hoodies (R650)
    {
      id: 'hoodie-black-650',
      name: 'Black Hoodie',
      price: 'R650',
      image: '/BlackHoodie650.jpeg',
      category: 'Hoodies',
      description: 'Midweight black hoodie.'
    },
    {
      id: 'hoodie-black-650-2',
      name: 'Black Hoodie (Style 2)',
      price: 'R650',
      image: '/2ndBlackHoodie650.jpeg',
      category: 'Hoodies',
      description: 'Alternate style black hoodie.'
    },

    // Shirts & Tees (R400)
    {
      id: 'shirt-black-400',
      name: 'Black Shirt',
      price: 'R400',
      image: '/BlackShirt400.jpeg',
      category: 'Shirts',
      description: 'Classic black t-shirt.'
    },
    {
      id: 'shirt-black-400-2',
      name: 'Black Shirt (Style 2)',
      price: 'R400',
      image: '/2ndBlACKsHIRT400.jpeg',
      category: 'Shirts',
      description: 'Second style black t-shirt.'
    },
    {
      id: 'shirt-white-400',
      name: 'White Shirt',
      price: 'R400',
      image: '/WhiteShirt 400.png',
      category: 'Shirts',
      description: 'Classic white t-shirt.'
    },
    {
      id: 'shirt-white-400-2',
      name: 'White Shirt (Style 2)',
      price: 'R400',
      image: '/2ndWhiteShirt400.png',
      category: 'Shirts',
      description: 'Second style white t-shirt.'
    },
    {
      id: 'shirt-skull-400',
      name: 'Skull Fire T-Shirt',
      price: 'R400',
      image: '/SKULL FIRE TSHIRT400.jpeg',
      category: 'Shirts',
      description: 'Skull fire graphic tee.'
    }
  ];

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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article
                key={p.id}
                className="group rounded border bg-white p-4 transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-up"
              >
                <Link
                  href={`/checkout?name=${encodeURIComponent(p.name)}&price=${encodeURIComponent(p.price)}&image=${encodeURIComponent(p.image)}&id=${encodeURIComponent(p.id)}`}
                  className="block"
                >
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
                      <p className="text-sm text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm font-semibold">{p.price}</span>
                  </div>
                  {p.description && <p className="mt-2 text-sm">{p.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-block rounded bg-black px-3 py-2 text-white transition-colors duration-300 hover:bg-zinc-800">Go to Checkout</span>
                    <div className="flex items-center gap-2">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist({ id: p.id, name: p.name, price: p.price, image: p.image });
                        }}
                        title="Add to wishlist"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
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


