import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  HelpCircle,
  Bell,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  inventory_quantity: number;
  track_inventory: boolean;
  status: string;
  images: string[] | null;
  has_variants: boolean;
}

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  inventory_quantity: number;
  is_active: boolean;
  image_url: string | null;
}

export default function Inventory() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"product" | "variant">("product");
  const [editQuantity, setEditQuantity] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStoreAndProducts();
    }
  }, [user]);

  const fetchStoreAndProducts = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug")
        .eq("user_id", user!.id)
        .single();

      if (storeError || !storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, sku, inventory_quantity, track_inventory, status, images, has_variants")
        .eq("store_id", storeData.id)
        .order("name");

      if (!productsError && productsData) {
        setProducts(productsData);

        // Fetch variants for products that have variants
        const productsWithVariants = productsData.filter(p => p.has_variants);
        if (productsWithVariants.length > 0) {
          const { data: variantsData } = await supabase
            .from("product_variants")
            .select("id, product_id, name, sku, inventory_quantity, is_active, image_url")
            .in("product_id", productsWithVariants.map(p => p.id))
            .order("sort_order");

          if (variantsData) {
            setVariants(variantsData);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateInventory = async (id: string, newQuantity: number, type: "product" | "variant") => {
    try {
      const table = type === "product" ? "products" : "product_variants";
      const { error } = await supabase
        .from(table)
        .update({ inventory_quantity: newQuantity })
        .eq("id", id);

      if (error) throw error;

      if (type === "product") {
        setProducts(
          products.map((p) =>
            p.id === id ? { ...p, inventory_quantity: newQuantity } : p
          )
        );
      } else {
        setVariants(
          variants.map((v) =>
            v.id === id ? { ...v, inventory_quantity: newQuantity } : v
          )
        );
      }
      setEditingId(null);
      toast({ title: "Inventory updated" });
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({ title: "Failed to update inventory", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: "Out of stock", variant: "destructive" as const, icon: AlertTriangle };
    if (quantity <= 10) return { label: "Low stock", variant: "secondary" as const, icon: AlertTriangle };
    return { label: "In stock", variant: "default" as const, icon: CheckCircle };
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56">
        <div className="min-h-screen pt-14 lg:pt-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Inventory</h1>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                How it works
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-2xl bg-primary/10">
                  <Package className="h-16 w-16 text-primary" />
                </div>

                <h2 className="mb-2 text-xl font-semibold">No products to manage</h2>
                <p className="mb-6 max-w-md text-center text-muted-foreground">
                  Add products first to start managing your inventory.
                </p>

                <Button onClick={() => navigate("/dashboard/products/new")}>
                  Add new product
                </Button>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by product name or SKU..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Inventory Stats */}
                <div className="mb-6 grid gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total Variants</p>
                    <p className="text-2xl font-bold">{variants.length}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {products.filter((p) => !p.has_variants && p.inventory_quantity > 0 && p.inventory_quantity <= 10).length +
                       variants.filter((v) => v.inventory_quantity > 0 && v.inventory_quantity <= 10).length}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold text-destructive">
                      {products.filter((p) => !p.has_variants && p.inventory_quantity <= 0).length +
                       variants.filter((v) => v.inventory_quantity <= 0).length}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const productVariants = variants.filter(v => v.product_id === product.id);
                        const hasVariants = product.has_variants && productVariants.length > 0;
                        const totalQuantity = hasVariants 
                          ? productVariants.reduce((sum, v) => sum + v.inventory_quantity, 0)
                          : product.inventory_quantity;
                        const stockStatus = getStockStatus(totalQuantity);

                        return (
                          <>
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 overflow-hidden rounded-lg border bg-muted">
                                    {product.images?.[0] ? (
                                      <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    {hasVariants && (
                                      <p className="text-xs text-muted-foreground">
                                        {productVariants.length} variants
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {hasVariants ? "-" : (product.sku || "-")}
                              </TableCell>
                              <TableCell>
                                {hasVariants ? (
                                  <span className="font-medium">{totalQuantity}</span>
                                ) : editingId === product.id && editingType === "product" ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      className="h-8 w-20"
                                      value={editQuantity}
                                      onChange={(e) => setEditQuantity(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          updateInventory(product.id, parseInt(editQuantity) || 0, "product");
                                        }
                                        if (e.key === "Escape") {
                                          setEditingId(null);
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => updateInventory(product.id, parseInt(editQuantity) || 0, "product")}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    className="font-medium hover:text-primary"
                                    onClick={() => {
                                      setEditingId(product.id);
                                      setEditingType("product");
                                      setEditQuantity(product.inventory_quantity.toString());
                                    }}
                                  >
                                    {product.inventory_quantity}
                                  </button>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={stockStatus.variant} className="gap-1">
                                  <stockStatus.icon className="h-3 w-3" />
                                  {stockStatus.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            {/* Variant rows */}
                            {hasVariants && productVariants.map((variant) => {
                              const variantStatus = getStockStatus(variant.inventory_quantity);
                              return (
                                <TableRow key={variant.id} className="bg-muted/30">
                                  <TableCell>
                                    <div className="flex items-center gap-3 pl-8">
                                      <div className="h-8 w-8 overflow-hidden rounded border bg-muted">
                                        {variant.image_url ? (
                                          <img
                                            src={variant.image_url}
                                            alt={variant.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-3 w-3 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">{variant.name}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {variant.sku || "-"}
                                  </TableCell>
                                  <TableCell>
                                    {editingId === variant.id && editingType === "variant" ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          className="h-7 w-16 text-sm"
                                          value={editQuantity}
                                          onChange={(e) => setEditQuantity(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              updateInventory(variant.id, parseInt(editQuantity) || 0, "variant");
                                            }
                                            if (e.key === "Escape") {
                                              setEditingId(null);
                                            }
                                          }}
                                          autoFocus
                                        />
                                        <Button
                                          size="sm"
                                          className="h-7"
                                          onClick={() => updateInventory(variant.id, parseInt(editQuantity) || 0, "variant")}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    ) : (
                                      <button
                                        className="text-sm font-medium hover:text-primary"
                                        onClick={() => {
                                          setEditingId(variant.id);
                                          setEditingType("variant");
                                          setEditQuantity(variant.inventory_quantity.toString());
                                        }}
                                      >
                                        {variant.inventory_quantity}
                                      </button>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={variantStatus.variant} className="gap-1 text-xs">
                                      <variantStatus.icon className="h-3 w-3" />
                                      {variantStatus.label}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
