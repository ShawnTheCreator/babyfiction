"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchJson } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit modal state
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Delete modal state
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProducts = async () => {
    try {
      const res: any = await fetchJson('/api/products?limit=100&fields=name,price,category,stock,isActive,isFeatured,thumbnail');
      const list = res?.products || res?.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadProducts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleEditClick = (product: any) => {
    setEditProduct({
      _id: product._id,
      name: product.name || '',
      price: product.price || 0,
      category: product.category || 'hats',
      stock: product.stock?.quantity || 0,
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
    });
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editProduct) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await fetchJson(`/api/products/${editProduct._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editProduct.name,
          price: parseFloat(editProduct.price),
          category: editProduct.category,
          stock: { quantity: parseInt(editProduct.stock) },
          isActive: editProduct.isActive,
          isFeatured: editProduct.isFeatured,
        }),
      });
      await loadProducts();
      setEditProduct(null);
    } catch (error: any) {
      setEditError(error?.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (product: any) => {
    setDeleteProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await fetchJson(`/api/products/${deleteProduct._id}`, {
        method: 'DELETE',
      });
      await loadProducts();
      setDeleteProduct(null);
    } catch (error) {
      console.error('Failed to delete product', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Unauthorized</h2>
          <p className="text-sm text-muted-foreground mb-4">Admin access required</p>
          <Link href="/admin">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-secondary/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">Product Management</h1>
            <p className="text-muted-foreground">Manage your store's product catalog</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/admin/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No products found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded overflow-hidden bg-secondary">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>R{product.price?.toFixed(2)}</TableCell>
                    <TableCell>{product.stock?.quantity || 0}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.isFeatured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                          Featured
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(product)}
                          title="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Make changes to the product details</DialogDescription>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (ZAR)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editProduct.category}
                  onValueChange={(value) => setEditProduct({ ...editProduct, category: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hats">Hats</SelectItem>
                    <SelectItem value="shirts">Shirts</SelectItem>
                    <SelectItem value="hoodies">Hoodies</SelectItem>
                    <SelectItem value="pants">Pants</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProduct.isActive}
                    onChange={(e) => setEditProduct({ ...editProduct, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProduct.isFeatured}
                    onChange={(e) => setEditProduct({ ...editProduct, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
              {editError && (
                <div className="text-sm text-red-500">{editError}</div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProduct(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
