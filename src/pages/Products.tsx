import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MediaPicker } from "@/components/MediaPicker";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  currency: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  status: string;
  inventory_quantity: number;
  track_inventory: boolean;
  sku: string | null;
  category_id: string | null;
  created_at: string;
}

export default function Products() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editor state
  const isEditing = searchParams.get("edit") !== null;
  const editingProductId = searchParams.get("edit");
  const isNew = editingProductId === "new";

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    images: [] as string[],
    status: "draft",
    inventoryQuantity: "0",
    trackInventory: true,
    sku: "",
    categoryId: "",
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (editingProductId && editingProductId !== "new" && products.length > 0) {
      const product = products.find((p) => p.id === editingProductId);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description || "",
          price: product.price.toString(),
          compareAtPrice: product.compare_at_price?.toString() || "",
          images: product.images || [],
          status: product.status,
          inventoryQuantity: product.inventory_quantity.toString(),
          trackInventory: product.track_inventory,
          sku: product.sku || "",
          categoryId: product.category_id || "",
        });
      }
    } else if (isNew) {
      setFormData({
        name: "",
        description: "",
        price: "",
        compareAtPrice: "",
        images: [],
        status: "draft",
        inventoryQuantity: "0",
        trackInventory: true,
        sku: "",
        categoryId: "",
      });
    }
  }, [editingProductId, products, isNew]);

  const fetchData = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug, currency")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);

      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("store_id", storeData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name")
          .eq("store_id", storeData.id)
          .eq("status", "active")
          .order("name"),
      ]);

      if (productsRes.error) throw productsRes.error;
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!store) return;

    if (!formData.name.trim()) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast({ title: "Valid price is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        store_id: store.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : null,
        images: formData.images,
        status: formData.status,
        inventory_quantity: parseInt(formData.inventoryQuantity) || 0,
        track_inventory: formData.trackInventory,
        sku: formData.sku.trim() || null,
        category_id: formData.categoryId || null,
      };

      if (isNew) {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast({ title: "Product created!" });
      } else {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProductId);
        if (error) throw error;
        toast({ title: "Product updated!" });
      }

      await fetchData();
      setSearchParams({});
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({ title: "Failed to save product", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      toast({ title: "Product deleted" });
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Failed to delete product", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    const newStatus = product.status === "published" ? "draft" : "published";

    try {
      const { error } = await supabase
        .from("products")
        .update({ status: newStatus })
        .eq("id", product.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      toast({
        title: newStatus === "published" ? "Product published" : "Product unpublished",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  };

  const addImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setShowMediaPicker(false);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) return null;

  // Product Editor View
  if (isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

        <main className="lg:pl-56 pt-14 lg:pt-0">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchParams({})}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-medium">
                  {isNew ? "Add product" : "Edit product"}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSearchParams({})}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isNew ? "Create product" : "Save changes"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
                {/* Main Content */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Product name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Enter product name"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe your product"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Images */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <Label>Product images</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border"
                          >
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2" variant="secondary">
                                Main
                              </Badge>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => setShowMediaPicker(true)}
                          className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus className="h-6 w-6" />
                          <span className="text-sm font-medium">Add Image</span>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        First image will be used as the main product image
                      </p>
                    </CardContent>
                  </Card>

                  {/* Pricing */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-6">
                      <h3 className="font-medium">Pricing</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="price">
                            Price ({store.currency}) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, price: e.target.value }))
                            }
                            placeholder="0.00"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compareAtPrice">
                            Compare at price ({store.currency})
                          </Label>
                          <Input
                            id="compareAtPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.compareAtPrice}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                compareAtPrice: e.target.value,
                              }))
                            }
                            placeholder="0.00"
                            className="h-11"
                          />
                          <p className="text-xs text-muted-foreground">
                            Original price to show a discount
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Inventory */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-6">
                      <h3 className="font-medium">Inventory</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, sku: e.target.value }))
                            }
                            placeholder="Enter SKU"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inventoryQuantity">Quantity</Label>
                          <Input
                            id="inventoryQuantity"
                            type="number"
                            min="0"
                            value={formData.inventoryQuantity}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                inventoryQuantity: e.target.value,
                              }))
                            }
                            placeholder="0"
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={formData.trackInventory}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, trackInventory: checked }))
                          }
                        />
                        <Label>Track inventory</Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Status */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Category */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <Label>Category</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: value === "none" ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Media Picker */}
        <MediaPicker
          open={showMediaPicker}
          onOpenChange={setShowMediaPicker}
          onSelect={addImage}
          accept="images"
        />
      </div>
    );
  }

  // Products List View
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56 pt-14 lg:pt-0">
        {/* Header */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-lg font-medium">Products</h1>
            <Button onClick={() => setSearchParams({ edit: "new" })}>
              <Plus className="h-4 w-4 mr-2" />
              Add product
            </Button>
          </div>
        </div>

        <div className="p-6">
          {products.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 mb-6 bg-muted rounded-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No products yet</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Start adding products to your store to display them to customers.
              </p>
              <Button onClick={() => setSearchParams({ edit: "new" })}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first product
              </Button>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Products Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16"></TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {product.status === "published" ? "Active" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.track_inventory ? (
                            <span
                              className={
                                product.inventory_quantity === 0
                                  ? "text-destructive"
                                  : ""
                              }
                            >
                              {product.inventory_quantity} in stock
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Not tracked
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(product.price, store.currency)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setSearchParams({ edit: product.id })
                                }
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleProductStatus(product)}
                              >
                                {product.status === "published" ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setProductToDelete(product);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{productToDelete?.name}"? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
