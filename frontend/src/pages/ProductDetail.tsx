"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Minus, Plus, Heart, Share2, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const params = useParams();
  const id = (params?.id as string) || undefined;
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: id || "1",
    name: "Premium Designer Sneakers",
    price: "R4,799",
    rating: 4.8,
    reviews: 127,
    description:
      "Crafted with premium materials and attention to detail, these sneakers combine comfort with contemporary style. Perfect for both casual wear and active lifestyles.",
    features: [
      "Premium leather and suede construction",
      "Cushioned insole for all-day comfort",
      "Durable rubber outsole",
      "Breathable mesh lining",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    ],
  };

  const relatedProducts = [
    {
      id: 2,
      name: "Designer Jacket",
      price: "R9,599",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    },
    {
      id: 3,
      name: "Classic Watch",
      price: "R7,199",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    },
    {
      id: 4,
      name: "Luxury Bag",
      price: "R12,799",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    },
  ];

  const handleAddToCart = () => {
    toast({
      title: "Added to cart!",
      description: `${quantity}x ${product.name} - Size ${selectedSize}`,
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-muted-foreground hover:text-accent transition-colors mb-8 animate-fade-in"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div className="space-y-4 animate-fade-up">
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-accent"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 animate-fade-up [animation-delay:200ms]">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <p className="text-4xl font-bold mb-6">{product.price}</p>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Size Selector */}
            <div>
              <label className="block text-sm font-semibold mb-3">Select Size</label>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className="w-16"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Product Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl font-bold tracking-tighter mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
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
    </div>
  );
};

export default ProductDetail;
