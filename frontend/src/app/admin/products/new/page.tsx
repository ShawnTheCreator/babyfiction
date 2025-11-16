"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchJson, fetchForm, getAuthToken } from "@/lib/api";

interface SizeStock {
  size: string;
  stock: number;
  sku: string;
}

interface ColorVariant {
  colorName: string;
  colorCode: string;
  sku: string;
  price: number;
  discountPercentage?: number;
  images: string[];
  thumbnail: string;
  sizes: SizeStock[];
  isAvailable: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category: "clothing",
    subcategory: "",
    brand: "",
    images: "",
    thumbnail: "",
    isFeatured: false,
  });

  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [currentColor, setCurrentColor] = useState({
    colorName: "",
    colorCode: "#000000",
    sku: "",
    price: "",
    discountPercentage: "",
    images: "",
    thumbnail: "",
    sizes: [] as SizeStock[],
    isAvailable: true,
  });

  const availableSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "One Size"];
  const [selectedSizes, setSelectedSizes] = useState<{[key: string]: {stock: number, selected: boolean}}>({});

  const categorySubcategories: Record<string, string[]> = {
    clothing: ["Hoodies", "T-shirts"],
    hats: ["Beanie", "Cap", "Flat Cap", "Bucket Hat"],
    accessories: ["Bags", "Jewellery", "Watches", "Sunglasses"],
  };

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const [variantFiles, setVariantFiles] = useState<File[]>([]);
  const [variantUploading, setVariantUploading] = useState(false);
  const imagesList = form.images.split(',').map((s) => s.trim()).filter(Boolean);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSizeSelection = (size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [size]: {
        stock: prev[size]?.stock || 0,
        selected: !prev[size]?.selected
      }
    }));
  };

  const updateSizeStock = (size: string, stock: number) => {
    setSelectedSizes(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        stock: Math.max(0, stock)
      }
    }));
  };

  const addColorVariant = () => {
    if (!currentColor.colorName || !currentColor.colorCode) {
      setError("Color name and code are required");
      return;
    }

    const sizes = Object.entries(selectedSizes)
      .filter(([_, data]) => data.selected)
      .map(([size, data]) => ({
        size,
        stock: data.stock,
        sku: `${currentColor.sku}-${size.replace(/\s+/g, '')}`
      }));

    if (sizes.length === 0) {
      setError("Please select at least one size for this color variant");
      return;
    }

    const images = currentColor.images.split(',').map(s => s.trim()).filter(Boolean);
    if (images.length === 0) {
      setError("Please add at least one image for this color variant");
      return;
    }

    const variant: ColorVariant = {
      colorName: currentColor.colorName,
      colorCode: currentColor.colorCode,
      sku: currentColor.sku,
      price: Number(currentColor.price) || Number(form.price),
      discountPercentage: currentColor.discountPercentage ? Number(currentColor.discountPercentage) : undefined,
      images,
      thumbnail: currentColor.thumbnail || images[0],
      sizes,
      isAvailable: currentColor.isAvailable,
    };

    setColorVariants(prev => [...prev, variant]);
    
    // Reset current color form
    setCurrentColor({
      colorName: "",
      colorCode: "#000000",
      sku: "",
      price: "",
      discountPercentage: "",
      images: "",
      thumbnail: "",
      sizes: [],
      isAvailable: true,
    });
    setSelectedSizes({});
    setError(null);
  };

  const removeColorVariant = (index: number) => {
    setColorVariants(prev => prev.filter((_, i) => i !== index));
  };

  const onVariantFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setVariantFiles(list);
  };

  const removeVariantFile = (index: number) => {
    setVariantFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadVariantImages = async () => {
    if (!variantFiles.length) return;
    setVariantUploading(true);
    setUploadError(null);
    try {
      const urls: string[] = [];
      for (const f of variantFiles) {
        const formData = new FormData();
        formData.append('file', f);
        const res: any = await fetchForm('/api/media/upload', formData);
        if (res?.url) urls.push(res.url);
      }
      setVariantFiles([]);
      if (urls.length) {
        const existingUrls = currentColor.images.split(',').map(s => s.trim()).filter(Boolean);
        const allUrls = [...existingUrls, ...urls];
        setCurrentColor(prev => ({
          ...prev,
          images: allUrls.join(', '),
          thumbnail: prev.thumbnail || urls[0] || '',
        }));
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setVariantUploading(false);
    }
  };

  const onVariantImagesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    const dropped = dt?.files ? Array.from(dt.files).filter(f => f.type.startsWith('image/')) : [];
    if (dropped.length) {
      setVariantFiles(dropped);
    }
  };

  const onThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!f) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res: any = await fetchForm('/api/media/upload', fd);
      if (res?.url) setForm((prev) => ({ ...prev, thumbnail: res.url, images: prev.images ? `${prev.images}, ${res.url}` : res.url }));
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const pickImagesRef = (typeof window !== 'undefined') ? (document?.createElement ? (document.createElement('input') as HTMLInputElement) : null) : null;
  if (pickImagesRef && !pickImagesRef.onchange) {
    pickImagesRef.type = 'file';
    pickImagesRef.accept = 'image/*';
    pickImagesRef.multiple = true;
    pickImagesRef.onchange = (e: any) => onFilesChange(e as React.ChangeEvent<HTMLInputElement>);
  }

  const onImagesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dt = e.dataTransfer;
    const dropped = dt?.files ? Array.from(dt.files).filter(f => f.type.startsWith('image/')) : [];
    if (dropped.length) {
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  const onThumbDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbDragOver(false);
    const dt = e.dataTransfer;
    const file = dt?.files && dt.files[0] && dt.files[0].type.startsWith('image/') ? dt.files[0] : null;
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res: any = await fetchForm('/api/media/upload', fd);
      if (res?.url) setForm((prev) => ({ ...prev, thumbnail: res.url, images: prev.images ? `${prev.images}, ${res.url}` : res.url }));
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  };

  const uploadSelected = async () => {
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const formData = new FormData();
        formData.append('file', f);
        const res: any = await fetchForm('/api/media/upload', formData);
        if (res?.url) urls.push(res.url);
      }
      setFiles([]);
      if (urls.length) {
        setForm((prev) => {
          const prevList = prev.images.split(',').map((s) => s.trim()).filter(Boolean);
          const nextList = [...prevList, ...urls];
          return {
            ...prev,
            images: nextList.join(', '),
            thumbnail: prev.thumbnail || nextList[0] || '',
          };
        });
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      if (colorVariants.length === 0) {
        setError('Please add at least one color variant with sizes');
        setSubmitting(false);
        return;
      }
      
      // Calculate total stock from all color variants
      const totalStock = colorVariants.reduce((sum, variant) => 
        sum + variant.sizes.reduce((sizeSum, size) => sizeSum + size.stock, 0), 0
      );
      
      const payload: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        sku: (form.sku || '').toUpperCase(),
        category: form.category,
        subcategory: form.subcategory,
        brand: form.brand,
        colorVariants: colorVariants,
        images: colorVariants[0]?.images || [],
        thumbnail: colorVariants[0]?.thumbnail || '',
        countInStock: totalStock,
        stock: {
          quantity: totalStock,
          lowStockThreshold: 5,
          trackQuantity: true,
        },
        isFeatured: !!form.isFeatured,
      };
      
      const res: any = await fetchJson('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      const id = res?.product?._id || res?.product?.id || res?.id;
      router.push(id ? `/product/${id}` : '/products');
    } catch (e: any) {
      setError(e?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Add New Product</h1>
              {colorVariants.length > 0 && (
                <p className="text-sm text-gray-500">
                  {colorVariants.length} variant{colorVariants.length !== 1 ? 's' : ''} • 
                  {' '}{colorVariants.reduce((sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0), 0)} total stock
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" disabled={submitting || colorVariants.length === 0} className="bg-green-500 hover:bg-green-600">
              {submitting ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </div>

        <form id="product-form" onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information Card */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">General Information</h2>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Name Product</label>
                  <Input 
                    name="name" 
                    value={form.name} 
                    onChange={onChange} 
                    placeholder="Puffer Jacket With Pocket Detail"
                    required 
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description Product</label>
                  <Textarea 
                    name="description" 
                    value={form.description} 
                    onChange={onChange} 
                    placeholder="Cropped puffer jacket made of technical fabric. High neck and long sleeves. Flap pocket at the chest and in-seam side pockets at the hip. Inside pocket detail. Hem with elastic interior. Zip-up front."
                    required 
                    rows={5}
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Brand</label>
                  <Input 
                    name="brand" 
                    value={form.brand} 
                    onChange={onChange} 
                    placeholder="Babyfiction"
                    required 
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </Card>

            {/* Pricing Card */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Base Pricing</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Base Price (R)</label>
                  <Input 
                    name="price" 
                    value={form.price} 
                    onChange={onChange} 
                    type="number" 
                    step="0.01"
                    placeholder="755"
                    required 
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Base SKU</label>
                  <Input 
                    name="sku" 
                    value={form.sku} 
                    onChange={onChange} 
                    placeholder="BF-JACKET-001"
                    required 
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </Card>

            {/* Color Variants Management */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Color Variants</h2>
              
              {/* Current Color Form */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Color Name</label>
                    <Input 
                      value={currentColor.colorName}
                      onChange={(e) => setCurrentColor(prev => ({ ...prev, colorName: e.target.value }))}
                      placeholder="Beige"
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Color Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={currentColor.colorCode}
                        onChange={(e) => setCurrentColor(prev => ({ ...prev, colorCode: e.target.value }))}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input 
                        value={currentColor.colorCode}
                        onChange={(e) => setCurrentColor(prev => ({ ...prev, colorCode: e.target.value }))}
                        placeholder="#D4C5B9"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Variant SKU</label>
                    <Input 
                      value={currentColor.sku}
                      onChange={(e) => setCurrentColor(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="BF-JACKET-BEIGE"
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Price Override (optional)</label>
                    <Input 
                      value={currentColor.price}
                      onChange={(e) => setCurrentColor(prev => ({ ...prev, price: e.target.value }))}
                      type="number"
                      step="0.01"
                      placeholder={`Default: R${form.price || '0'}`}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Discount % (optional)</label>
                  <Input 
                    value={currentColor.discountPercentage}
                    onChange={(e) => setCurrentColor(prev => ({ ...prev, discountPercentage: e.target.value }))}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    className="bg-white"
                  />
                </div>

                {/* Variant Image Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Variant Images</label>
                  
                  <div
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDragLeave={() => {}}
                    onDrop={onVariantImagesDrop}
                    className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center bg-white"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={onVariantFilesChange}
                        className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-foreground hover:file:bg-gray-200" 
                      />
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={uploadVariantImages} 
                        disabled={!variantFiles.length || variantUploading}
                        className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
                      >
                        {variantUploading ? 'Uploading...' : variantFiles.length ? `Upload (${variantFiles.length})` : 'Upload'}
                      </Button>
                    </div>
                  </div>

                  {/* Preview selected files */}
                  {variantFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {variantFiles.map((f, i) => (
                        <div key={`vf-${i}`} className="relative rounded-md overflow-hidden border aspect-square">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeVariantFile(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Textarea 
                    value={currentColor.images}
                    onChange={(e) => setCurrentColor(prev => ({ ...prev, images: e.target.value }))}
                    placeholder="Uploaded image URLs will appear here (comma-separated)"
                    rows={2}
                    className="bg-white text-xs"
                  />
                  
                  {/* Show current variant images */}
                  {currentColor.images && (
                    <div className="grid grid-cols-4 gap-2">
                      {currentColor.images.split(',').map((url, i) => {
                        const trimmedUrl = url.trim();
                        if (!trimmedUrl) return null;
                        return (
                          <div key={`ci-${i}`} className="relative rounded-md overflow-hidden border aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={trimmedUrl} alt={`Variant ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const urls = currentColor.images.split(',').map(s => s.trim()).filter(Boolean);
                                urls.splice(i, 1);
                                setCurrentColor(prev => ({ ...prev, images: urls.join(', ') }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Size Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Available Sizes & Stock</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availableSizes.map(size => (
                      <div key={size} className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={selectedSizes[size]?.selected || false}
                            onChange={() => toggleSizeSelection(size)}
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          <span className="text-sm font-medium">{size}</span>
                        </label>
                        {selectedSizes[size]?.selected && (
                          <Input 
                            type="number"
                            min="0"
                            value={selectedSizes[size]?.stock || 0}
                            onChange={(e) => updateSizeStock(size, Number(e.target.value))}
                            placeholder="Stock"
                            className="bg-white text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={addColorVariant}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Add Color Variant
                </Button>
              </div>

              {/* Display Added Variants */}
              {colorVariants.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Added Variants ({colorVariants.length})</h3>
                  {colorVariants.map((variant, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: variant.colorCode }}
                          />
                          <div>
                            <p className="font-medium text-sm">{variant.colorName}</p>
                            <p className="text-xs text-gray-500">{variant.sku}</p>
                          </div>
                        </div>
                        <Button 
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeColorVariant(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Price: R{variant.price} {variant.discountPercentage && `(-${variant.discountPercentage}%)`}</p>
                        <p>Sizes: {variant.sizes.map(s => `${s.size}(${s.stock})`).join(', ')}</p>
                        <p>Total Stock: {variant.sizes.reduce((sum, s) => sum + s.stock, 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Image Upload & Category */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Image Card - For Reference Images */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Quick Image Upload</h2>
              <p className="text-xs text-gray-500 mb-4">Upload images here to get URLs for color variants</p>
              
              <div
                onDragOver={(e) => { e.preventDefault(); setThumbDragOver(true); }}
                onDragLeave={() => setThumbDragOver(false)}
                onDrop={onThumbDrop}
                className={`relative rounded-lg border-2 border-dashed ${thumbDragOver ? 'border-green-500 bg-green-50' : 'border-gray-300'} p-8 text-center bg-gray-50 min-h-[300px] flex flex-col items-center justify-center`}
              >
                {form.thumbnail ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.thumbnail} alt="Product" className="w-full h-full object-contain rounded-lg" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setForm((p) => ({ ...p, thumbnail: '' }))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Drop your image here, or browse</p>
                    <p className="text-xs text-gray-400 mb-4">PNG, JPG, JPEG</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onThumbFileChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload">
                      <Button type="button" variant="outline" className="cursor-pointer" onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('thumbnail-upload')?.click();
                      }}>
                        Browse
                      </Button>
                    </label>
                  </>
                )}
              </div>

              {/* Additional Images */}
              {imagesList.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-600 mb-2">Uploaded Images (click to copy URL)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {imagesList.map((url, i) => (
                      <div 
                        key={`img-${i}`}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer hover:border-green-500 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          alert('URL copied to clipboard!');
                        }}
                        title="Click to copy URL"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] px-1 py-0.5 truncate">
                          {url.split('/').pop()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Upload Section */}
              <div className="mt-4 pt-4 border-t">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onImagesDrop}
                  className={`rounded-lg border-2 border-dashed ${dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300'} p-4 text-center`}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={onFilesChange}
                    className="hidden"
                    id="multiple-upload"
                  />
                  <label htmlFor="multiple-upload" className="cursor-pointer">
                    <p className="text-xs text-gray-600 mb-2">Add more images</p>
                    <Button type="button" size="sm" variant="outline" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('multiple-upload')?.click();
                    }}>
                      Select Files
                    </Button>
                  </label>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-600">{files.length} file(s) selected</p>
                      <Button type="button" size="sm" onClick={uploadSelected} disabled={uploading} className="bg-green-500 hover:bg-green-600">
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {uploadError && <div className="text-xs text-red-600 mt-2">{uploadError}</div>}
              </div>
            </Card>

            {/* Category Card */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Category</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setForm((p) => ({ 
                        ...p, 
                        category: newCategory,
                        subcategory: "" // Reset subcategory when category changes
                      }));
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-sm"
                    required
                  >
                    <option value="clothing">Clothing</option>
                    <option value="hats">Hats</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Subcategory</label>
                  <select
                    name="subcategory"
                    value={form.subcategory}
                    onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-sm"
                    required
                  >
                    <option value="">Select subcategory</option>
                    {categorySubcategories[form.category]?.map((sub) => (
                      <option key={sub} value={sub.toLowerCase()}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    id="isFeatured" 
                    name="isFeatured" 
                    type="checkbox" 
                    checked={form.isFeatured} 
                    onChange={onChange}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <label htmlFor="isFeatured" className="text-sm text-gray-700">Featured Product</label>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </main>
  );
}
