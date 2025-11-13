"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, Heart, ShoppingBag, User } from 'lucide-react';
import { fetchJson, getAuthToken } from '@/lib/api';

type Product = { 
  id: string; 
  name: string; 
  price: number; 
  image: string; 
  category?: string; 
  additional_images?: string[];
  description?: string;
  colors?: string[];
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const heroImages = [
    '/assets/images/products/Product1.jpg',
    '/assets/images/products/Product2.jpg'
  ];

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res: any = await fetchJson('/api/products/featured?limit=3');
        const list = Array.isArray(res?.products) ? res.products : [];
        const mapped: Product[] = list.map((p: any) => ({
          id: p._id,
          name: p.name,
          price: p.price || 0,
          image: p.thumbnail || (Array.isArray(p.images) ? p.images[0] : ''),
          category: p.category,
          additional_images: p.images || [],
        }));
        if (active) setProducts(mapped);
      } catch {
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to catalog page with search query
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <>
      <main className="relative bg-white">
        {/* Search Bar - Mobile First */}
        <div className="px-4 pt-4 sm:px-6 lg:absolute lg:top-[137px] lg:left-[50px] lg:z-10 lg:px-0 lg:pt-0">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-md lg:w-[367px] h-[50px]">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              className="w-full h-full bg-[#d9d9d9] border-none rounded-[2px] px-4 pr-[50px] sm:px-5 font-[family-name:var(--font-accent)] text-xs text-black/66 tracking-[2px] uppercase placeholder:text-black/66 outline-none"
            />
            <button
              type="submit"
              className="absolute right-[15px] top-1/2 -translate-y-1/2 text-black/66 hover:text-black transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Hero Section - Mobile First */}
        <section className="relative px-4 pt-8 pb-12 sm:px-6 sm:pt-12 sm:pb-16 lg:min-h-[800px] lg:pt-[200px] lg:px-[50px]">
          {/* Hero Text */}
          <div className="mb-8 sm:mb-12 lg:absolute lg:top-[222px] lg:left-[50px] lg:mb-0">
            <h1 className="font-[family-name:var(--font-headers)] text-[32px] leading-[28px] sm:text-[40px] sm:leading-[36px] lg:text-[48px] lg:leading-[40px] tracking-[2px] uppercase mb-8 sm:mb-10 lg:mb-[60px]">
              <span className="block">New</span>
              <span className="block">Collection</span>
            </h1>
            <p className="font-[family-name:var(--font-accent)] text-sm sm:text-base tracking-[2px] uppercase">
              <span className="block">Wear Your</span>
              <span className="block">Energy</span>
            </p>
          </div>

          {/* Product Gallery - Mobile: Stack, Desktop: Side by Side */}
          <div className="flex flex-col gap-4 sm:gap-5 mb-8 lg:absolute lg:top-[257px] lg:right-[50px] lg:flex-row lg:mb-0">
            <div className="w-full h-[280px] sm:h-[350px] lg:w-[366px] lg:h-[376px] border border-[#d7d7d7] overflow-hidden">
              <img
                src={heroImages[currentImageIndex]}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block w-full h-[350px] lg:w-[366px] lg:h-[376px] border border-[#d7d7d7] overflow-hidden">
              <img
                src={heroImages[(currentImageIndex + 1) % heroImages.length]}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Gallery Navigation */}
          <div className="flex gap-4 sm:gap-5 justify-center mb-8 lg:absolute lg:top-[656px] lg:left-1/2 lg:-translate-x-1/2 lg:mb-0">
            <button
              onClick={prevImage}
              className="w-10 h-10 border border-black/40 bg-transparent flex items-center justify-center hover:opacity-70 transition-opacity opacity-66"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="w-10 h-10 border border-black/40 bg-transparent flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Shop Button */}
          <Link
            href="/catalog"
            className="bg-[#d9d9d9] w-full sm:w-[265px] h-10 flex items-center justify-between px-5 font-[family-name:var(--font-nav)] text-sm sm:text-base text-black hover:opacity-80 transition-opacity lg:absolute lg:bottom-[40px] lg:left-[50px]"
          >
            <span>Go To Shop</span>
            <div className="w-[47.5px] h-3 flex items-center justify-center rotate-180 scale-y-[-1]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </section>

        {/* Categories Masonry Section - Mobile First */}
        <section className="mt-12 px-4 sm:mt-16 sm:px-6 lg:mt-[100px] lg:px-[50px]">
          <div className="max-w-[1340px] mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {/* Caps - small */}
            <Link
              href="/catalog?subcategory=hats"
              className="relative h-[200px] sm:h-[230px] overflow-hidden cursor-pointer group rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]"
              data-category="hats"
            >
              <img
                src="/assets/images/banners/caps.jpg"
                alt="Caps"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,87,34,0.8)] via-[rgba(255,152,0,0.5)] to-[rgba(255,87,34,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white transform translate-y-5 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-[family-name:var(--font-logo)] text-[24px] sm:text-[28px] lg:text-[32px] font-normal uppercase tracking-[2px] mb-2.5">
                    Caps
                  </h3>
                  <span className="font-[family-name:var(--font-nav)] text-xs sm:text-sm font-light uppercase tracking-wider opacity-90">
                    Load More
                  </span>
                </div>
              </div>
            </Link>

            {/* T-Shirts - tall */}
            <Link
              href="/catalog?subcategory=t-shirts"
              className="relative h-[300px] sm:h-[400px] lg:row-span-2 lg:h-[616px] overflow-hidden cursor-pointer group rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]"
              data-category="t-shirts"
            >
              <img
                src="/assets/images/banners/tshirts.jpg"
                alt="T-Shirts"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(63,81,181,0.8)] via-[rgba(33,150,243,0.5)] to-[rgba(63,81,181,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white transform translate-y-5 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-[family-name:var(--font-logo)] text-[24px] sm:text-[28px] lg:text-[32px] font-normal uppercase tracking-[2px] mb-2.5">
                    Graphic T's
                  </h3>
                  <span className="font-[family-name:var(--font-nav)] text-xs sm:text-sm font-light uppercase tracking-wider opacity-90">
                    Load More
                  </span>
                </div>
              </div>
            </Link>

            {/* Hoodies - wide and tall */}
            <Link
              href="/catalog?subcategory=hoodies"
              className="relative h-[300px] sm:col-span-2 sm:h-[400px] lg:row-span-2 lg:h-[616px] overflow-hidden cursor-pointer group rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]"
              data-category="hoodies"
            >
              <img
                src="/assets/images/banners/hoodies.jpg"
                alt="Hoodies"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(76,175,80,0.8)] via-[rgba(139,195,74,0.5)] to-[rgba(76,175,80,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white transform translate-y-5 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-[family-name:var(--font-logo)] text-[24px] sm:text-[28px] lg:text-[32px] font-normal uppercase tracking-[2px] mb-2.5">
                    Hoodies
                  </h3>
                  <span className="font-[family-name:var(--font-nav)] text-xs sm:text-sm font-light uppercase tracking-wider opacity-90">
                    Load More
                  </span>
                </div>
              </div>
            </Link>

            {/* Accessories - disabled (Coming Soon) */}
            <div
              className="relative h-[180px] sm:col-span-2 sm:h-[200px] lg:col-span-4 overflow-hidden cursor-not-allowed rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] opacity-70"
              data-category="accessories"
              onClick={(e) => e.preventDefault()}
            >
              <img
                src="/assets/images/banners/accessories.jpg"
                alt="Accessories"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 opacity-100 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="font-[family-name:var(--font-logo)] text-[24px] sm:text-[28px] lg:text-[32px] font-normal uppercase tracking-[2px] mb-2.5">
                    Accessories
                  </h3>
                  <span className="font-[family-name:var(--font-accent)] text-sm sm:text-base text-[#ffeb3b] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-pulse">
                    Coming Soon!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Collections Section - Mobile First */}
        <section className="mt-12 px-4 sm:mt-16 sm:px-6 lg:mt-[100px] lg:px-[50px]">
          <div className="mb-6 sm:mb-8">
            <h2 className="font-[family-name:var(--font-headers)] text-[32px] leading-[28px] sm:text-[40px] sm:leading-[36px] lg:text-[48px] lg:leading-[40px] tracking-[2px] uppercase mb-6 sm:mb-8">
              <span className="block">XXII</span>
              <span className="block">Collections</span>
              <span className="block">25-26</span>
            </h2>
            <div className="h-px bg-black mb-6 sm:mb-8" />
            <p className="font-[family-name:var(--font-body)] font-medium text-sm sm:text-base uppercase tracking-[2px]">
              (All)
            </p>
          </div>

          {/* Products Grid - Mobile First */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 lg:mb-12">
            {loading && <div className="col-span-full p-6 text-sm text-center">Loading products...</div>}
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group relative"
              >
                <div className="border border-[#d7d7d7] h-[280px] sm:h-[320px] lg:h-[376px] overflow-hidden mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                 
                </div>
                <div>
                  <p className="font-[family-name:var(--font-nav)] text-xs text-black/66 mb-1">
                    {product.category || 'Cotton T Shirt'}
                  </p>
                  <h3 className="font-[family-name:var(--font-nav)] text-sm capitalize mb-2">
                    {product.name}
                  </h3>
                  {product.additional_images && product.additional_images.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-white border-[0.5px] border-neutral-400" />
                      <span className="font-[family-name:var(--font-body)] text-[10px] text-black/66">
                        +{product.additional_images.length}
                      </span>
                    </div>
                  )}
                  <p className="font-[family-name:var(--font-nav)] text-base">
                    R{product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* More Button */}
          <Link href="/catalog" className="flex flex-col items-center gap-4 mb-8 cursor-pointer hover:opacity-70 transition-opacity">
            <div className="flex flex-col items-center">
              <p className="font-[family-name:var(--font-body)] text-sm sm:text-base text-[#8a8a8a] mb-2">
                More
              </p>
              <ChevronDown className="w-4 h-4 text-[#8a8a8a]" />
            </div>
            <div className="w-[180px] sm:w-[244px] h-px bg-[#8a8a8a]" />
          </Link>
        </section>

        {/* Fashion Approach Section - Mobile First */}
        <section className="mt-12 px-4 pb-12 sm:mt-16 sm:px-6 sm:pb-16 lg:mt-[100px] lg:px-[50px] lg:pb-[100px]">
          <h2 className="font-[family-name:var(--font-accent)] text-[28px] leading-[24px] sm:text-[36px] sm:leading-[32px] lg:text-[48px] lg:leading-[40px] tracking-[2px] uppercase text-center mb-6 sm:mb-8">
            Our Approach to fashion design
          </h2>
          <p className="font-[family-name:var(--font-body)] text-sm sm:text-base text-center max-w-[685px] mx-auto mb-8 sm:mb-10 lg:mb-12 tracking-[1px] sm:tracking-[2px] px-2">
            Step into our gallery — a showcase of bold expression and everyday luxury. Here, streetwear meets artistry, blending clean design with raw attitude. Each piece tells its own story — crafted for movement, confidence, and authenticity. Discover the looks that define the streets and inspire the culture.
          </p>

          {/* Approach Gallery - Mobile: 2 cols, Tablet: 2 cols, Desktop: 4 cols staggered */}
          <div className="max-w-[1340px] mx-auto grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {/* Item 1 */}
            <div className="border border-[#d7d7d7] h-[180px] sm:h-[250px] lg:h-[389px] overflow-hidden">
              <img
                src="/assets/images/gallery/FashionDesign1.jpg"
                alt="Fashion Design 1"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Item 2 - offset top on desktop */}
            <div className="border border-[#d7d7d7] h-[180px] sm:h-[250px] lg:h-[419px] lg:mt-[73px] overflow-hidden">
              <img
                src="/assets/images/gallery/FashionDesign3.jpg"
                alt="Fashion Design 2"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Item 3 */}
            <div className="border border-[#d7d7d7] h-[180px] sm:h-[250px] lg:h-[419px] overflow-hidden">
              <img
                src="/assets/images/gallery/FashionDesign2.jpg"
                alt="Fashion Design 3"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Item 4 - offset down more on desktop */}
            <div className="border border-[#d7d7d7] h-[180px] sm:h-[250px] lg:h-[389px] lg:mt-[103px] overflow-hidden">
              <img
                src="/assets/images/gallery/FashionDesign4.jpg"
                alt="Fashion Design 4"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
