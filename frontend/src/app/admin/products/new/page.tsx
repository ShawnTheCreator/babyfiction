"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchJson, fetchForm, getAuthToken } from "@/lib/api";

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
    brand: "",
    images: "",
    thumbnail: "",
    stockQuantity: "0",
    isFeatured: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const imagesList = form.images.split(',').map((s) => s.trim()).filter(Boolean);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      const allowedCategories = ['clothing','shoes','accessories','bags','jewelry','watches','hats','pants','shirts','hoodies'];
      const selectedCat = (form.category || '').toLowerCase();
      if (!allowedCategories.includes(selectedCat)) {
        setError('Category must be one of: ' + allowedCategories.join(', '));
        setSubmitting(false);
        return;
      }
      const imagesArr = form.images.split(',').map((s) => s.trim()).filter(Boolean);
      if (imagesArr.length === 0) {
        setError('At least one image URL is required. Upload images to auto-fill or paste URLs.');
        setSubmitting(false);
        return;
      }
      // Map UI-only categories to backend-supported enum if needed
      const uiToBackendMap: Record<string, string> = {
        hats: 'clothing',
        pants: 'clothing',
        shirts: 'clothing',
        hoodies: 'clothing',
      };
      const backendCategory = uiToBackendMap[selectedCat] || selectedCat;
      const subcategory = uiToBackendMap[selectedCat] ? selectedCat : undefined;
      const payload: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        sku: (form.sku || '').toUpperCase(),
        category: backendCategory,
        brand: form.brand,
        images: imagesArr,
        thumbnail: form.thumbnail || imagesArr[0],
        ...(subcategory ? { subcategory } : {}),
        // include both to satisfy validator and schema
        countInStock: Math.max(0, Number(form.stockQuantity) || 0),
        stock: {
          quantity: Math.max(0, Number(form.stockQuantity) || 0),
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
    <main className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Add Product</h1>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" value={form.name} onChange={onChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" value={form.description} onChange={onChange} required rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price (R)</label>
                <Input name="price" value={form.price} onChange={onChange} type="number" step="0.01" required />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input name="sku" value={form.sku} onChange={onChange} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
                  required
                >
                  <option value="clothing">clothing</option>
                  <option value="shoes">shoes</option>
                  <option value="accessories">accessories</option>
                  <option value="bags">bags</option>
                  <option value="jewelry">jewelry</option>
                  <option value="watches">watches</option>
                  <option value="hats">hats</option>
                  <option value="pants">pants</option>
                  <option value="shirts">shirts</option>
                  <option value="hoodies">hoodies</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Brand</label>
                <Input name="brand" value={form.brand} onChange={onChange} required />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Images</label>
              <Input name="images" value={form.images} onChange={onChange} placeholder="https://.../a.jpg, https://.../b.jpg" />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onImagesDrop}
                className={`mt-1 rounded-md border-2 border-dashed ${dragOver ? 'border-foreground bg-foreground/5' : 'border-border'} p-6 text-center`}
              >
                <div className="text-sm text-muted-foreground mb-3">Drag & drop images here or select files</div>
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <input type="file" accept="image/*" multiple onChange={onFilesChange}
                    className="block w-full sm:w-auto text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80" />
                  <Button type="button" onClick={uploadSelected} disabled={!files.length || uploading}>
                    {uploading ? 'Uploading…' : `Upload ${files.length ? `(${files.length})` : ''}`}
                  </Button>
                </div>
              </div>
              {uploadError && <div className="text-sm text-red-600">{uploadError}</div>}
              {(files.length > 0 || imagesList.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                  {files.map((f, i) => (
                    <div key={`f-${i}`} className="relative rounded-md overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt={f.name} className="h-28 w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs px-2 py-1 truncate">{f.name}</div>
                    </div>
                  ))}
                  {imagesList.map((url, i) => (
                    <div key={`u-${i}`} className={`relative rounded-md overflow-hidden border ${form.thumbnail === url ? 'ring-2 ring-primary' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`image-${i}`} className="h-28 w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-white truncate">{url}</span>
                        <Button type="button" size="sm" variant="secondary" onClick={() => setForm((p) => ({ ...p, thumbnail: url }))}>
                          Set thumbnail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail</label>
              <Input name="thumbnail" value={form.thumbnail} onChange={onChange} placeholder="Defaults to first image" />
              <div
                onDragOver={(e) => { e.preventDefault(); setThumbDragOver(true); }}
                onDragLeave={() => setThumbDragOver(false)}
                onDrop={onThumbDrop}
                className={`mt-1 rounded-md border-2 border-dashed ${thumbDragOver ? 'border-foreground bg-foreground/5' : 'border-border'} p-6 text-center`}
              >
                <div className="text-sm text-muted-foreground mb-3">Drag & drop a thumbnail image here or select a file</div>
                <input type="file" accept="image/*" onChange={onThumbFileChange}
                  className="block w-full sm:w-auto text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80" />
                {form.thumbnail && (
                  <div className="mt-4 mx-auto max-w-xs rounded-md overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.thumbnail} alt="thumbnail" className="w-full h-40 object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input name="stockQuantity" value={form.stockQuantity} onChange={onChange} type="number" required />
              </div>
              <div className="flex items-end gap-2">
                <input id="isFeatured" name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={onChange} />
                <label htmlFor="isFeatured" className="text-sm">Featured product</label>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Creating…' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
