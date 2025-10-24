"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; image?: string; category?: string }>>([]);

  async function loadProducts() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/api/products?limit=24`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const list = Array.isArray(data?.products) ? data.products : [];
      const mapped = list.map((p: any) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.thumbnail || (Array.isArray(p.images) ? p.images[0] : undefined),
      }));
      setProducts(mapped);
    } catch (e) {
      console.error('Failed to load products', e);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  // Actual categories from your database
  const categories = ["all", "hats", "shirts", "hoodies", "pants"];

  // Filter products by category, search, and price
  const filteredProducts = products
    .filter((p) => {
      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      
      // Search filter
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Price filter
      if (priceRange === "under-300" && p.price >= 300) return false;
      if (priceRange === "300-500" && (p.price < 300 || p.price > 500)) return false;
      if (priceRange === "500-800" && (p.price < 500 || p.price > 800)) return false;
      if (priceRange === "over-800" && p.price <= 800) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort products
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0; // featured (default order)
    });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="mb-12 animate-fade-up">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">
            Shop All Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover our complete collection of premium items
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-fade-up [animation-delay:100ms]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6 animate-fade-up [animation-delay:150ms]">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`capitalize ${
                  selectedCategory === category
                    ? "bg-black text-white hover:bg-black/90"
                    : "hover:bg-accent/10 hover:text-accent hover:border-accent"
                } transition-all duration-300`}
              >
                {category === "all" ? "All Products" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Price & Sort Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 animate-fade-up [animation-delay:200ms]">
          <div className="flex gap-3 items-center">
            <div>
              <label className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider block">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-300">Under R300</SelectItem>
                  <SelectItem value="300-500">R300 - R500</SelectItem>
                  <SelectItem value="500-800">R500 - R800</SelectItem>
                  <SelectItem value="over-800">Over R800</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group animate-flip-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 transform hover:rotate-y-6 hover:scale-105">
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <Link href={`/product/${product.id}`} className="absolute top-4 right-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      Quick View
                    </Button>
                  </Link>
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-foreground transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold">R{product.price}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
