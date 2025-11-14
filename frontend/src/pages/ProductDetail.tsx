"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchJson, getAuthToken } from "@/lib/api";

const ProductDetail = () => {
  const params = useParams();
  const id = (params?.id as string) || undefined;
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  type Product = {
    id: string;
    name: string;
    price: number;
    description?: string;
    images: string[];
    thumbnail?: string;
    category?: string;
    features?: string[];
    sizes?: string[];
    colors?: Array<{ name: string; code: string }>;
  };

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Array<{ id: string; name: string; price: string; image: string; category?: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Default colors if product doesn't have any
  const defaultColors = [
    { name: "Grey", code: "#d9d9d9" },
    { name: "Dark Grey", code: "#696969" },
    { name: "Black", code: "#1e1e1e" },
    { name: "Mint", code: "#a6d6ca" },
    { name: "White", code: "#ffffff" },
    { name: "Lavender", code: "#b9c1e8" }
  ];

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
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.thumbnail ? [p.thumbnail] : []),
            thumbnail: p.thumbnail,
            category: p.category,
            features: Array.isArray(p.features) ? p.features : ["Relaxed-fit shirt", "Camp collar and short sleeves", "Button-up front"],
            sizes: Array.isArray(p?.variants?.size) ? p.variants.size : ["XS","S","M","L","XL","2X"],
            colors: Array.isArray(p?.variants?.color) ? p.variants.color : defaultColors,
          };
          setProduct(mapped);

          // Load related by same category
          if (p.category) {
            const rel: any = await fetchJson(`/api/products?category=${encodeURIComponent(p.category)}&limit=4`);
            const list = Array.isArray(rel?.products) ? rel.products : [];
            const mappedRel = list
              .filter((x: any) => x?._id !== p._id)
              .slice(0, 4)
              .map((x: any) => ({
                id: x._id,
                name: x.name,
                price: typeof x.price === 'number' ? `R${x.price.toFixed(2)}` : String(x.price ?? ''),
                image: x.thumbnail || (Array.isArray(x.images) ? x.images[0] : ''),
                category: x.category || 'Cotton T Shirt',
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
        body: JSON.stringify({ product: product.id, quantity: 1, size: selectedSize })
      });
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_cart_updated'));
      toast({ title: 'Added to cart', description: `${product.name} (Size ${selectedSize})` });
    } catch {
      toast({ title: 'Could not add to cart', description: 'Please try again.' });
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    const token = getAuthToken();
    if (token) {
      try {
        if (isWishlisted) {
          await fetchJson(`/api/wishlist/items/${product.id}`, { method: 'DELETE' });
          setIsWishlisted(false);
        } else {
          await fetchJson('/api/wishlist/items', { method: 'POST', body: JSON.stringify({ product: product.id }) });
          setIsWishlisted(true);
        }
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
      } catch {}
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px] flex items-center justify-center">
        <div className="text-center text-sm text-gray-600">Loading product…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px]">
        <div className="max-w-[1340px] mx-auto">Product not found.</div>
      </div>
    );
  }

  const productColors = product.colors || defaultColors;

  return (
    <div className="min-h-screen bg-white pt-[200px] pb-12 px-4 sm:px-6 lg:px-[50px]">
      <div className="max-w-[1400px] mx-auto">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-[60px] mb-20">
          {/* Left: Product Images */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px] gap-5">
              {/* Main Image */}
              <div className="order-2 lg:order-1 w-full max-w-[600px] border border-[#d9d9d9] rounded bg-gray-50">
                <img
                  src={product.images[selectedImage] || '/assets/images/products/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/products/placeholder.jpg';
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="order-1 lg:order-2 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-[62px] h-[75px] border border-[#d9d9d9] rounded overflow-hidden transition-all ${
                      selectedImage === index ? 'opacity-100 border-black' : 'opacity-44 hover:opacity-70'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-[200px] self-start">
            <div className="relative max-w-[400px]">
              {/* Wishlist Button */}
              <button
                onClick={toggleWishlist}
                className="absolute top-0 right-0 w-[34px] h-[34px] text-xl hover:scale-110 transition-transform"
                aria-label="Add to wishlist"
              >
                <Heart className={`w-full h-full ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-black'}`} />
              </button>

              {/* Product Title */}
              <h1 className="font-[family-name:var(--font-headers)] text-[28px] font-bold mt-10 mb-4 uppercase tracking-wide">
                {product.name}
              </h1>

              {/* Product Price */}
              <p className="font-[family-name:var(--font-body)] text-2xl font-semibold mb-1">
                R {product.price}
              </p>
              <p className="font-[family-name:var(--font-body)] text-xs text-gray-600 mb-5">
                MRP incl. of all taxes
              </p>

              {/* Product Description */}
              {product.description && (
                <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-gray-700 mb-8">
                  {product.description}
                </p>
              )}

              {/* Color Selection */}
              <div className="mb-6">
                <label className="font-[family-name:var(--font-nav)] text-sm font-semibold uppercase tracking-wider block mb-3">
                  Color
                </label>
                <div className="flex gap-3 flex-wrap">
                  {productColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-[35px] h-[36px] rounded border-2 transition-all ${
                        selectedColor === index ? 'border-black scale-105' : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="font-[family-name:var(--font-nav)] text-sm font-semibold uppercase tracking-wider block mb-3">
                  Size
                </label>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-[45px] h-[36px] border rounded font-[family-name:var(--font-body)] text-[13px] font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-400 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Guide Link */}
              <p className="font-[family-name:var(--font-body)] text-[11px] text-gray-600 mb-8 underline cursor-pointer hover:text-black">
                FIND YOUR SIZE | MEASUREMENT GUIDE
              </p>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full max-w-[229px] h-[40px] bg-[#d9d9d9] font-[family-name:var(--font-nav)] text-base font-semibold tracking-wide hover:bg-gray-400 transition-colors rounded"
              >
                ADD
              </button>

              {/* Accordion Sections */}
              <div className="mt-8 border-t border-gray-200">
                {/* Features & Care */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('features')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-medium">
                      <Heart className="w-4 h-4" />
                      FEATURES & CARE
                    </span>
                    {expandedSection === 'features' ? (
                      <Plus className="w-5 h-5 rotate-45 transition-transform" />
                    ) : (
                      <Plus className="w-5 h-5 transition-transform" />
                    )}
                  </button>
                  {expandedSection === 'features' && (
                    <div className="pb-4 font-[family-name:var(--font-body)] text-sm text-gray-600 space-y-2">
                      {product.features?.map((feature, index) => (
                        <p key={index}>• {feature}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Size & Fit */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('size')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      </svg>
                      SIZE & FIT
                    </span>
                    {expandedSection === 'size' ? (
                      <Plus className="w-5 h-5 rotate-45 transition-transform" />
                    ) : (
                      <Plus className="w-5 h-5 transition-transform" />
                    )}
                  </button>
                  {expandedSection === 'size' && (
                    <div className="pb-4 font-[family-name:var(--font-body)] text-sm text-gray-600">
                      <p>Model is wearing size M</p>
                      <p>Fits true to size</p>
                      <p>Relaxed fit for comfort</p>
                    </div>
                  )}
                </div>

                {/* Shipping & Pickup */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('shipping')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                      </svg>
                      SHIPPING & PICKUP
                    </span>
                    {expandedSection === 'shipping' ? (
                      <Plus className="w-5 h-5 rotate-45 transition-transform" />
                    ) : (
                      <Plus className="w-5 h-5 transition-transform" />
                    )}
                  </button>
                  {expandedSection === 'shipping' && (
                    <div className="pb-4 font-[family-name:var(--font-body)] text-sm text-gray-600 space-y-2">
                      <p className="font-semibold">DELIVERY TAKES 2-5 BUSINESS DAYS.</p>
                      <p className="text-red-500">× Pickup currently unavailable at Co.Space Entrepreneur Village | Unit C1</p>
                    </div>
                  )}
                </div>

                {/* Payments & Installments */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('payments')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 10h20"/>
                      </svg>
                      PAYMENTS & INSTALLMENTS
                    </span>
                    {expandedSection === 'payments' ? (
                      <Plus className="w-5 h-5 rotate-45 transition-transform" />
                    ) : (
                      <Plus className="w-5 h-5 transition-transform" />
                    )}
                  </button>
                  {expandedSection === 'payments' && (
                    <div className="pb-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <img src="/assets/images/icons/capitec-pay.svg" alt="Capitec Pay" className="h-10" onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x40?text=Capitec';
                        }} />
                        <img src="/assets/images/icons/apple-pay.svg" alt="Apple Pay" className="h-10" onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x40?text=Apple+Pay';
                        }} />
                        <img src="/assets/images/icons/google-pay.svg" alt="Google Pay" className="h-10" onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x40?text=Google+Pay';
                        }} />
                      </div>
                      <p className="font-[family-name:var(--font-body)] text-sm text-gray-600 font-semibold">
                        BUY NOW PAY LATER
                      </p>
                    </div>
                  )}
                </div>

                {/* Returns */}
                <div>
                  <button
                    onClick={() => toggleSection('returns')}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                      </svg>
                      RETURNS
                    </span>
                    {expandedSection === 'returns' ? (
                      <Plus className="w-5 h-5 rotate-45 transition-transform" />
                    ) : (
                      <Plus className="w-5 h-5 transition-transform" />
                    )}
                  </button>
                  {expandedSection === 'returns' && (
                    <div className="pb-4 font-[family-name:var(--font-body)] text-sm text-gray-600">
                      <p>30-day return policy</p>
                      <p>Items must be unworn and in original condition</p>
                      <p>Free returns within South Africa</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-[family-name:var(--font-headers)] text-3xl font-bold mb-8 uppercase tracking-wide">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  href={`/product/${relProduct.id}`}
                  className="group"
                >
                  <div className="border border-[#d7d7d7] overflow-hidden mb-4 transition-transform hover:-translate-y-1">
                    <div className="aspect-[3/4] bg-gray-100">
                      <img
                        src={relProduct.image || '/assets/images/products/placeholder.jpg'}
                        alt={relProduct.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/products/placeholder.jpg';
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-nav)] text-xs text-gray-500 mb-1 capitalize">
                      {relProduct.category}
                    </p>
                    <h3 className="font-[family-name:var(--font-nav)] text-sm font-normal mb-2 capitalize group-hover:text-gray-600 transition-colors">
                      {relProduct.name}
                    </h3>
                    <p className="font-[family-name:var(--font-nav)] text-base font-normal">
                      {relProduct.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
