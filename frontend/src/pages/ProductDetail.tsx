"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Minus, Plus, Heart, Share2, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchJson, getAuthToken } from "@/lib/api";

const ProductDetail = () => {
  const params = useParams();
  const id = (params?.id as string) || undefined;
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState(0);

  type Product = {
    id: string;
    name: string;
    price: number;
    description?: string;
    rating?: number;
    reviews?: number;
    images: string[];
    thumbnail?: string;
    category?: string;
    features?: string[];
    sizes?: string[];
  };

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Array<{ id: string; name: string; price: string; image: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) return;
      try {
        // Load product by id
        const res: any = await fetchJson(`/api/products/${id}`);
        const p = res?.product || res?.data || res;
        if (p && active) {
          const mapped: Product = {
            id: p._id,
            name: p.name,
            price: p.price,
            description: p.description,
            rating: p?.rating?.average ?? 0,
            reviews: p?.rating?.count ?? 0,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.thumbnail ? [p.thumbnail] : []),
            thumbnail: p.thumbnail,
            category: p.category,
            features: Array.isArray(p.features) ? p.features : [],
            sizes: Array.isArray(p?.variants?.size) ? p.variants.size : ["XS","S","M","L","XL"],
          };
          setProduct(mapped);

          // Load related by same category
          if (p.category) {
            const rel: any = await fetchJson(`/api/products?category=${encodeURIComponent(p.category)}&limit=6`);
            const list = Array.isArray(rel?.products) ? rel.products : [];
            const mappedRel = list
              .filter((x: any) => x?._id !== p._id)
              .map((x: any) => ({
                id: x._id,
                name: x.name,
                price: typeof x.price === 'number' ? `R${x.price.toFixed(2)}` : String(x.price ?? ''),
                image: x.thumbnail || (Array.isArray(x.images) ? x.images[0] : ''),
              }));
            if (active) setRelatedProducts(mappedRel);
          }
        }
      } catch {
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const token = getAuthToken();
    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
      return;
    }
    try {
      await fetchJson('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product: product.id, quantity, size: selectedSize })
      });
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
      toast({ title: 'Added to cart', description: `${quantity}× ${product.name} (Size ${selectedSize})` });
    } catch {
      toast({ title: 'Could not add to cart', description: 'Please try again.' });
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    const token = getAuthToken();
    if (token) {
      try {
        // Try remove first
        await fetchJson(`/api/wishlist/items/${product.id}`, { method: 'DELETE' });
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
        return;
      } catch {}
      try {
        await fetchJson('/api/wishlist/items', { method: 'POST', body: JSON.stringify({ product: product.id }) });
      } catch {}
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
    } else {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('bf_wishlist') : null;
        const list = raw ? JSON.parse(raw) : [];
        const exists = Array.isArray(list) && list.find((x: any) => String(x?.id) === String(product.id));
        const item = {
          id: product.id,
          name: product.name,
          price: `R${product.price?.toFixed?.(2) ?? product.price}`,
          image: product.thumbnail || product.images?.[0] || ''
        };
        const next = exists ? list.filter((x: any) => String(x?.id) !== String(product.id)) : [...(Array.isArray(list) ? list : []), item];
        localStorage.setItem('bf_wishlist', JSON.stringify(next));
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6">Loading…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Back Button */}
        <Link
          href="/catalog"
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
                        i < Math.floor(product.rating || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {(product.rating ?? 0).toFixed(1)} ({product.reviews ?? 0} reviews)
                </span>
              </div>
              <p className="text-4xl font-bold mb-6">{`R${product.price?.toFixed?.(2) ?? product.price}`}</p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Size Selector */}
            <div>
              <label className="block text-sm font-semibold mb-3">Select Size</label>
              <div className="flex gap-2">
                {(product.sizes || ["XS","S","M","L","XL"]).map((size) => (
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
              <Button variant="outline" size="lg" onClick={toggleWishlist} title="Toggle wishlist">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                try {
                  const url = typeof window !== 'undefined' ? window.location.href : '';
                  if (url) navigator.clipboard?.writeText(url);
                  toast({ title: 'Link copied', description: 'Product link copied to clipboard.' });
                } catch {}
              }}>
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
