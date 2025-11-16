// Top imports of HomePage component
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
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
        const res: any = await fetchJson('/api/products/featured');
        const list = Array.isArray(res?.products) ? res.products : [];
        const mapped: Product[] = list.map((p: any) => ({
          id: p._id,
          name: p.name,
          price: p.price || 0,
          image: p.thumbnail || (Array.isArray(p.images) ? p.images[0] : ''),
          category: p.category,
          additional_images: p.images || [],
        }));
        
        // If more than 3 products, randomly select 3
        let finalProducts = mapped;
        if (mapped.length > 3) {
          const shuffled = [...mapped].sort(() => Math.random() - 0.5);
          finalProducts = shuffled.slice(0, 3);
        }
        
        if (active) setProducts(finalProducts);
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
        {/* Hero Section */}
        <section className="relative px-4 pt-6 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:min-h-[780px] lg:pt-0 lg:px-[50px]">
          {/* Bouncing words overlay – standalone in this file */}
          <BouncingWordsOverlay
            phrases={[
              "BabyFictions",
              "Wear Your Energy",
              "New Collection",
              "XXII",
              "BYFXNS",
              "Limited Stock",
            ]}
            className="font-[family-name:var(--font-accent)] uppercase tracking-[3px] text-[10px] sm:text-[12px] lg:text-[14px] text-black/20"
            speedMin={70}
            speedMax={120}
            density={6}
          />

          {/* Hero Text */}
          <div className="mb-8 sm:mb-12 lg:absolute lg:top-[40px] lg:left-[50px] lg:mb-0 lg:z-10">
            <h1 className="font-[family-name:var(--font-headers)] text-[32px] leading-[28px] sm:text-[40px] sm:leading-[36px] lg:text-[48px] lg:leading-[40px] tracking-[2px] uppercase mb-8 sm:mb-10 lg:mb-[50px]">
              <span className="block">New</span>
              <span className="block">Collection</span>
            </h1>
            <p className="font-[family-name:var(--font-accent)] text-sm sm:text-base tracking-[2px] uppercase mb-6 lg:mb-8">
              <span className="block">Wear Your</span>
              <span className="block">Energy</span>
            </p>
            
            {/* About Us Button */}
            <Link
              href="/about"
              className="inline-flex items-center gap-3 border-2 border-black px-6 py-3 font-[family-name:var(--font-nav)] text-sm uppercase tracking-[1px] hover:bg-black hover:text-white transition-all duration-300"
            >
              <span>About Us</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Gallery - Mobile: Stack, Desktop: Side by Side */}
          <div className="flex flex-col gap-4 sm:gap-5 mb-8 lg:absolute lg:top-[40px] lg:right-[50px] lg:flex-row lg:mb-0 lg:z-10">
            <div className="w-full h-[280px] sm:h-[350px] lg:w-[366px] lg:h-[376px] border border-[#d7d7d7] overflow-hidden">
              <img
                src={heroImages[currentImageIndex]}
                alt="Product"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="hidden sm:block w-full h-[350px] lg:w-[366px] lg:h-[376px] border border-[#d7d7d7] overflow-hidden">
              <img
                src={heroImages[(currentImageIndex + 1) % heroImages.length]}
                alt="Product"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Gallery Navigation */}
          <div className="flex gap-4 sm:gap-5 justify-center mb-8 lg:absolute lg:top-[445px] lg:left-1/2 lg:-translate-x-1/2 lg:mb-0 lg:z-10">
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
        <section className="mt-6 px-4 sm:mt-8 sm:px-6 lg:mt-[32px] lg:px-[50px]">
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

          {/* Approach Gallery - Mobile: 2 cols, Tablet: 2 cols, Desktop: 5 cols staggered */}
          <div className="max-w-[1340px] mx-auto grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
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

            {/* View More Button - next to Item 4 on desktop */}
            <Link
              href="/gallery"
              className="col-span-2 lg:col-span-1 border-2 border-[#d7d7d7] h-[60px] sm:h-[80px] lg:h-[389px] lg:w-[120px] lg:mt-[103px] overflow-hidden bg-[#f5f5f5] hover:bg-[#d9d9d9] transition-colors flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="flex flex-row lg:flex-col items-center gap-4">
                <h3 className="font-[family-name:var(--font-logo)] text-[20px] sm:text-[24px] lg:text-[32px] font-normal uppercase tracking-[2px] group-hover:scale-105 transition-transform lg:[writing-mode:vertical-rl] lg:rotate-180">
                  View More
                </h3>
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 opacity-70 lg:block" />
              </div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

// Inline bouncing words overlay (standalone in this file)
function BouncingWordsOverlay({
  phrases,
  className = "font-[family-name:var(--font-nav)] uppercase tracking-[3px] text-xs sm:text-sm text-black/25",
  speedMin = 60,
  speedMax = 120,
  density,
}: {
  phrases: string[];
  className?: string;
  speedMin?: number;
  speedMax?: number;
  density?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLSpanElement[]>([]);
  const animRef = useRef<number>();
  const lastTsRef = useRef<number>(0);
  const boundsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const itemsRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; w: number; h: number }>
  >([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const texts = density && density > 0 ? phrases.slice(0, density) : phrases;

    const rect = container.getBoundingClientRect();
    boundsRef.current = { w: rect.width, h: rect.height };

    itemsRef.current = texts.map((_, i) => {
      const el = itemRefs.current[i];
      const box = el.getBoundingClientRect();
      const w = box.width;
      const h = box.height;

      const speed = Math.random() * (speedMax - speedMin) + speedMin;
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const x = Math.random() * Math.max(1, boundsRef.current.w - w);
      const y = Math.random() * Math.max(1, boundsRef.current.h - h);

      return { x, y, vx, vy, w, h };
    });

    const step = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;

      const { w: bw, h: bh } = boundsRef.current;

      itemsRef.current.forEach((it, i) => {
        let x = it.x + it.vx * dt;
        let y = it.y + it.vy * dt;

        if (x <= 0) {
          x = 0;
          it.vx = Math.abs(it.vx);
        } else if (x + it.w >= bw) {
          x = bw - it.w;
          it.vx = -Math.abs(it.vx);
        }

        if (y <= 0) {
          y = 0;
          it.vy = Math.abs(it.vy);
        } else if (y + it.h >= bh) {
          y = bh - it.h;
          it.vy = -Math.abs(it.vy);
        }

        it.x = x;
        it.y = y;
        const el = itemRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      });

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    const onResize = () => {
      const r = container.getBoundingClientRect();
      boundsRef.current = { w: r.width, h: r.height };
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [phrases, density, speedMin, speedMax]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {(density && density > 0 ? phrases.slice(0, density) : phrases).map((text, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el) itemRefs.current[i] = el;
          }}
          className={`absolute will-change-transform ${className}`}
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}