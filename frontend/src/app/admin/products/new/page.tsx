"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchJson, getAuthToken } from "@/lib/api";

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      const imagesArr = form.images.split(',').map((s) => s.trim()).filter(Boolean);
      const payload: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        sku: form.sku,
        category: form.category,
        brand: form.brand,
        images: imagesArr,
        thumbnail: form.thumbnail || imagesArr[0],
        stock: { quantity: Number(form.stockQuantity), lowStockThreshold: 5, trackQuantity: true },
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
                <Input name="category" value={form.category} onChange={onChange} placeholder="clothing" required />
              </div>
              <div>
                <label className="text-sm font-medium">Brand</label>
                <Input name="brand" value={form.brand} onChange={onChange} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Images (comma-separated URLs)</label>
              <Input name="images" value={form.images} onChange={onChange} placeholder="https://.../a.jpg, https://.../b.jpg" required />
            </div>
            <div>
              <label className="text-sm font-medium">Thumbnail (URL)</label>
              <Input name="thumbnail" value={form.thumbnail} onChange={onChange} placeholder="Defaults to first image" />
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
