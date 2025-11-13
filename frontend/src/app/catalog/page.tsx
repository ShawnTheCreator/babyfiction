"use client";
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, ChevronLeft, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { fetchJson, getAuthToken } from '@/lib/api';
import { useCurrentUser } from '@/lib/auth';

type Product = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  category?: string;
  subcategory?: string;
  stock?: {
    quantity: number;
  };
  variants?: {
    size?: string[];
    color?: string[];
  };
  tags?: string[];
};

function CatalogContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('');
  const [availability, setAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('new');
  
  // Expandable filter sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    size: true,
    availability: true,
    category: true,
    colors: true,
    priceRange: true,
  });

  const { user } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const params = new URLSearchParams({ limit: '100', fields: 'name,price,thumbnail,category,subcategory,stock,variants,tags,description' });
        if (category) params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);
        const res = await fetchJson(`/api/products?${params.toString()}`);
        const list: Product[] = (res as any)?.data || (res as any)?.products || res || [];
        if (active) {
          const productArray = Array.isArray(list) ? list : [];
          setProducts(productArray);
          setFilteredProducts(productArray);
        }

        // Load wishlist if authenticated
        const token = getAuthToken();
        if (token) {
          try {
            const wishRes = await fetchJson('/api/wishlist');
            const items = (wishRes as any)?.wishlist?.items || [];
            const ids = new Set<string>(items.map((it: {product?: {_id?: string} | string}) => {
              const prod = it?.product;
              if (typeof prod === 'string') return prod;
              return prod?._id || '';
            }).filter((id): id is string => typeof id === 'string' && id.length > 0));
            if (active) setWishlistIds(ids);
          } catch (err) {
            console.error('Failed to load wishlist:', err);
          }
        }
      } catch (e) {
        console.error('Failed to load products:', e);
        if (active) setError('Failed to load products');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [category, subcategory]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => 
        p.variants?.size?.some(size => selectedSizes.includes(size))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.variants?.color?.some(color => selectedColors.includes(color))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        selectedCategories.includes(p.subcategory || p.category || '')
      );
    }

    // Price range filter
    if (priceRange) {
      filtered = filtered.filter(p => {
        const price = p.price || 0;
        if (priceRange === 'under200') return price < 200;
        if (priceRange === '200-500') return price >= 200 && price <= 500;
        if (priceRange === '500-1000') return price >= 500 && price <= 1000;
        if (priceRange === 'over1000') return price > 1000;
        return true;
      });
    }

    // Availability filter
    if (availability === 'inStock') {
      filtered = filtered.filter(p => (p.stock?.quantity || 0) > 0);
    } else if (availability === 'outOfStock') {
      filtered = filtered.filter(p => (p.stock?.quantity || 0) === 0);
    }

    // Sorting
    if (sortBy === 'priceLow') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'priceHigh') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedSizes, selectedColors, selectedCategories, priceRange, availability, sortBy]);

  const toggleWishlist = async (productId: string) => {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    const isInWishlist = wishlistIds.has(productId);
    try {
      if (isInWishlist) {
        await fetchJson(`/api/wishlist/items/${productId}`, { method: 'DELETE' });
        setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
      } else {
        await fetchJson('/api/wishlist/items', { method: 'POST', body: JSON.stringify({ product: productId }) });
        setWishlistIds(prev => new Set(prev).add(productId));
      }
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('bf_wishlist_updated'));
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const toggleFilterSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setPriceRange('');
    setAvailability('all');
    setSortBy('new');
    
    // Clear URL parameters (category, subcategory, search)
    router.push('/catalog');
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Extract unique values for filters
  const allSizes = Array.from(new Set(products.flatMap(p => p.variants?.size || [])));
  const allColors = Array.from(new Set(products.flatMap(p => p.variants?.color || [])));
  const allCategories = Array.from(new Set(products.map(p => p.subcategory || p.category).filter(Boolean) as string[]));

  // Check if any filters are active
  const hasActiveFilters = 
    selectedSizes.length > 0 || 
    selectedColors.length > 0 || 
    selectedCategories.length > 0 || 
    priceRange !== '' || 
    availability !== 'all' ||
    category !== '' ||
    subcategory !== '' ||
    searchQuery !== '';

  const FilterSection = () => (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-headers)' }}>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-black rounded-full">
                !
              </span>
            )}
          </h2>
          <button
            onClick={clearFilters}
            className={`text-sm transition-colors ${
              hasActiveFilters 
                ? 'text-red-600 hover:text-red-800 font-semibold' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            disabled={!hasActiveFilters}
          >
            Clear All
          </button>
        </div>

        {/* Size Filter */}
        <div className="mb-6 border-b pb-4">
          <button
            onClick={() => toggleFilterSection('size')}
            className="flex items-center justify-between w-full text-left font-medium mb-3"
          >
            <span>Size</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.size && (
            <div className="space-y-2">
              {allSizes.map(size => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{size}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div className="mb-6 border-b pb-4">
          <button
            onClick={() => toggleFilterSection('availability')}
            className="flex items-center justify-between w-full text-left font-medium mb-3"
          >
            <span>Availability</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.availability ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.availability && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === 'all'}
                  onChange={() => setAvailability('all')}
                  className="w-4 h-4"
                />
                <span className="text-sm">All ({products.length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === 'inStock'}
                  onChange={() => setAvailability('inStock')}
                  className="w-4 h-4"
                />
                <span className="text-sm">In Stock ({products.filter(p => (p.stock?.quantity || 0) > 0).length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === 'outOfStock'}
                  onChange={() => setAvailability('outOfStock')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Out of Stock ({products.filter(p => (p.stock?.quantity || 0) === 0).length})</span>
              </label>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6 border-b pb-4">
          <button
            onClick={() => toggleFilterSection('category')}
            className="flex items-center justify-between w-full text-left font-medium mb-3"
          >
            <span>Category</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.category && (
            <div className="space-y-2">
              {allCategories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm capitalize">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Colors Filter */}
        <div className="mb-6 border-b pb-4">
          <button
            onClick={() => toggleFilterSection('colors')}
            className="flex items-center justify-between w-full text-left font-medium mb-3"
          >
            <span>Colors</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.colors && (
            <div className="space-y-2">
              {allColors.map(color => (
                <label key={color} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleColor(color)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm capitalize">{color}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="mb-6 border-b pb-4">
          <button
            onClick={() => toggleFilterSection('priceRange')}
            className="flex items-center justify-between w-full text-left font-medium mb-3"
          >
            <span>Price Range</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.priceRange ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.priceRange && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === ''}
                  onChange={() => setPriceRange('')}
                  className="w-4 h-4"
                />
                <span className="text-sm">All Prices</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === 'under200'}
                  onChange={() => setPriceRange('under200')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Under R200</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === '200-500'}
                  onChange={() => setPriceRange('200-500')}
                  className="w-4 h-4"
                />
                <span className="text-sm">R200 - R500</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === '500-1000'}
                  onChange={() => setPriceRange('500-1000')}
                  className="w-4 h-4"
                />
                <span className="text-sm">R500 - R1000</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === 'over1000'}
                  onChange={() => setPriceRange('over1000')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Over R1000</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Mobile First */}
      <div className="border-b bg-white sticky top-16 z-20">
        <div className="px-4 sm:px-6 lg:px-[50px] py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">
              {subcategory ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1).replace(/-/g, ' ') : 
               category ? category.charAt(0).toUpperCase() + category.slice(1) : 
               'Products'}
            </span>
          </div>

          {/* Title and Filter Button */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-headers)' }}>
              {subcategory ? subcategory.replace(/-/g, ' ') : 
               category ? category : 
               'Products'}
            </h1>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition-colors relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Sort and Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
            
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              >
                <option value="new">New</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(category || subcategory) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                  Category: {subcategory || category}
                  <button
                    onClick={clearFilters}
                    className="hover:text-gray-300"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                  Search: "{searchQuery}"
                  <button
                    onClick={clearFilters}
                    className="hover:text-gray-300"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSizes.map(size => (
                <span key={size} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                  Size: {size}
                  <button
                    onClick={() => toggleSize(size)}
                    className="hover:text-gray-600"
                    aria-label={`Remove ${size} size filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedColors.map(color => (
                <span key={color} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                  Color: {color}
                  <button
                    onClick={() => toggleColor(color)}
                    className="hover:text-gray-600"
                    aria-label={`Remove ${color} color filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                  {cat}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="hover:text-gray-600"
                    aria-label={`Remove ${cat} category filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {priceRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                  Price: {priceRange === 'under200' ? 'Under R200' : 
                          priceRange === '200-500' ? 'R200-R500' :
                          priceRange === '500-1000' ? 'R500-R1000' :
                          'Over R1000'}
                  <button
                    onClick={() => setPriceRange('')}
                    className="hover:text-gray-600"
                    aria-label="Remove price filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {availability !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                  {availability === 'inStock' ? 'In Stock' : 'Out of Stock'}
                  <button
                    onClick={() => setAvailability('all')}
                    className="hover:text-gray-600"
                    aria-label="Remove availability filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Sidebar Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-headers)' }}>Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSection />
              
              {/* Apply Button */}
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-[50px] py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSection />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading products...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No products found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="text-black underline hover:no-underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product._id);
                      }}
                      className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlistIds.has(product._id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Product Image */}
                    <div className="aspect-square w-full bg-gray-100 overflow-hidden">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-sm">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {product.subcategory || product.category || 'Product'}
                        </span>
                      </div>
                      <h3 className="font-medium text-lg mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {product.name}
                      </h3>
                      {product.price && (
                        <p className="text-lg font-semibold">
                          R{product.price.toFixed(2)}
                        </p>
                      )}
                      
                      {/* Stock Status */}
                      {product.stock && (
                        <div className="mt-2">
                          {product.stock.quantity > 0 ? (
                            <span className="text-xs text-green-600 font-medium">
                              In Stock ({product.stock.quantity})
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Loading catalog...</div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}