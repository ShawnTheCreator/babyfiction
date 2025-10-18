"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Home = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Sneakers",
      price: "R4,799",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      category: "Footwear",
    },
    {
      id: 2,
      name: "Designer Jacket",
      price: "R9,599",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
      category: "Outerwear",
    },
    {
      id: 3,
      name: "Classic Watch",
      price: "R7,199",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      category: "Accessories",
    },
    {
      id: 4,
      name: "Luxury Bag",
      price: "R12,799",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      category: "Bags",
    },
  ];

  const collections = [
    {
      title: "New Arrivals",
      subtitle: "Fresh drops every week",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
      link: "/products?filter=new",
    },
    {
      title: "Best Sellers",
      subtitle: "Customer favorites",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      link: "/products?filter=bestsellers",
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

      {/* Collections */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          {collections.map((collection, index) => (
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

      {/* Featured Products */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground">Handpicked essentials for your wardrobe</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group animate-flip-in perspective-1000"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 transform hover:rotate-y-6 hover:scale-105">
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-lg mb-2 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold">{product.price}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

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
