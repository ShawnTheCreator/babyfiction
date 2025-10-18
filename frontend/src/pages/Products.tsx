"use client";
import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; image?: string; category?: string }>>([]);

  async function loadProducts() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/products`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products', e);
    }
  }

  if (products.length === 0) {
    // fire and forget to fetch products on first render
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadProducts();
  }

  const categories = ["all", "Footwear", "Outerwear", "Accessories", "Bags"];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 animate-fade-up [animation-delay:100ms]">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent/10 hover:text-accent hover:border-accent"
                } transition-all duration-300`}
              >
                {category === "all" ? "All Products" : category}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <Select defaultValue="featured">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
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
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Quick View
                  </Button>
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-foreground transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold">{product.price}</p>
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
