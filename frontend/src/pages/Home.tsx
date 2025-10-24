"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Home = () => {
  const [hatProducts, setHatProducts] = useState<any[]>([]);
  const [shirtProducts, setShirtProducts] = useState<any[]>([]);
  const [hoodieProducts, setHoodieProducts] = useState<any[]>([]);
  const [pantProducts, setPantProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${base}/api/products?limit=100`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const products = data?.products || [];

        // Filter products by category
        setHatProducts(products.filter((p: any) => p.category === 'hats').slice(0, 3));
        setShirtProducts(products.filter((p: any) => p.category === 'shirts').slice(0, 3));
        setHoodieProducts(products.filter((p: any) => p.category === 'hoodies').slice(0, 3));
        setPantProducts(products.filter((p: any) => p.category === 'pants').slice(0, 3));
      } catch (e) {
        console.error('Failed to load products', e);
      }
    }
    loadProducts();
  }, []);

  const categories = [
    {
      title: "Hats",
      subtitle: "Complete your look",
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
      link: "/catalog?category=hats",
    },
    {
      title: "Shirts",
      subtitle: "Essential wardrobe",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      link: "/catalog?category=shirts",
    },
    {
      title: "Hoodies",
      subtitle: "Stay cozy",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
      link: "/catalog?category=hoodies",
    },
    {
      title: "Pants",
      subtitle: "Perfect fit",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
      link: "/catalog?category=pants",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80')",
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
            <span className="text-primary">
              Style Statement
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-up [animation-delay:200ms]">
            Discover premium fashion pieces that blend contemporary design with timeless elegance
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up [animation-delay:400ms]">
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground group px-8 py-6 text-base"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/catalog">
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

      {/* Categories */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground">Explore our collection</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((collection, index) => (
            <Link
              key={collection.title}
              href={collection.link}
              className="group relative h-[400px] rounded-2xl overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${collection.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white/70 text-sm uppercase tracking-wider mb-2">
                  {collection.subtitle}
                </p>
                <h3 className="text-white text-3xl font-bold mb-4">{collection.title}</h3>
                <Button
                  variant="secondary"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
                >
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hats Section */}
      {hatProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                Hats
              </h2>
              <p className="text-muted-foreground">Complete your look</p>
            </div>
            <Link href="/catalog?category=hats">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hatProducts.map((product: any, index: number) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group animate-flip-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold">R{product.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shirts Section */}
      {shirtProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                Shirts
              </h2>
              <p className="text-muted-foreground">Essential wardrobe staples</p>
            </div>
            <Link href="/catalog?category=shirts">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shirtProducts.map((product: any, index: number) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group animate-flip-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold">R{product.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Hoodies Section */}
      {hoodieProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                Hoodies
              </h2>
              <p className="text-muted-foreground">Stay cozy and stylish</p>
            </div>
            <Link href="/catalog?category=hoodies">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hoodieProducts.map((product: any, index: number) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group animate-flip-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold">R{product.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pants Section */}
      {pantProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                Pants
              </h2>
              <p className="text-muted-foreground">Perfect fit for every occasion</p>
            </div>
            <Link href="/catalog?category=pants">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pantProducts.map((product: any, index: number) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group animate-flip-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold">R{product.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="relative rounded-3xl overflow-hidden h-[400px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Join Our Community
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Get exclusive access to new drops, special offers, and style inspiration
            </p>
            <div className="flex gap-4 justify-center">
              <input
                type="email"
                 placeholder="Enter your email"
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white min-w-[300px]"
              />
              <Button className="rounded-full bg-white hover:bg-white/90 text-black px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
