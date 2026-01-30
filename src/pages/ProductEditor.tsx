import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MediaPickerTrigger } from "@/components/MediaPicker";
import { VariantManager, VariantOption, ProductVariant } from "@/components/product/VariantManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  HelpCircle,
  Video,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  currency: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const QUICK_NAV_SECTIONS = [
  { id: "product-info", label: "Product Information" },
  { id: "product-media", label: "Product Media" },
  { id: "inventory", label: "Inventory" },
  { id: "shipping-tax", label: "Shipping & Tax" },
  { id: "variants", label: "Variants" },
  { id: "seo", label: "SEO" },
];

export default function ProductEditor() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const isEditing = productId && productId !== "new";

  const [store, setStore] = useState<StoreData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("product-info");

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [hsnCode, setHsnCode] = useState("");
  const [gstPercent, setGstPercent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [status, setStatus] = useState("active");

  // Collapsible states
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  // Variants
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);

  // Section refs for scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, productId]);

  const fetchData = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug, currency")
        .eq("user_id", user!.id)
        .single();

      if (storeError || !storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("store_id", storeData.id)
        .order("name");

      setCategories(categoriesData || []);

      // Fetch product if editing
      if (isEditing) {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .eq("store_id", storeData.id)
          .single();

        if (productError || !productData) {
          toast({ title: "Product not found", variant: "destructive" });
          navigate("/dashboard/products");
          return;
        }

        setName(productData.name);
        setCategoryId(productData.category_id);
        setPrice(productData.price.toString());
        setCompareAtPrice(productData.compare_at_price?.toString() || "");
        setDescription(productData.description || "");
        setImages(productData.images || []);
        setQuantity(productData.inventory_quantity.toString());
        setSku(productData.sku || "");
        setStatus(productData.status);
        setHasVariants(productData.has_variants || false);

        // Fetch variants if product has variants
        if (productData.has_variants) {
          const { data: variantsData } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", productId)
            .order("sort_order");

          if (variantsData && variantsData.length > 0) {
            // Reconstruct variant options from variants
            const optionsMap = new Map<string, Set<string>>();
            
            variantsData.forEach((v) => {
              if (v.option1_name && v.option1_value) {
                if (!optionsMap.has(v.option1_name)) {
                  optionsMap.set(v.option1_name, new Set());
                }
                optionsMap.get(v.option1_name)!.add(v.option1_value);
              }
              if (v.option2_name && v.option2_value) {
                if (!optionsMap.has(v.option2_name)) {
                  optionsMap.set(v.option2_name, new Set());
                }
                optionsMap.get(v.option2_name)!.add(v.option2_value);
              }
              if (v.option3_name && v.option3_value) {
                if (!optionsMap.has(v.option3_name)) {
                  optionsMap.set(v.option3_name, new Set());
                }
                optionsMap.get(v.option3_name)!.add(v.option3_value);
              }
            });

            const reconstructedOptions: VariantOption[] = [];
            optionsMap.forEach((values, name) => {
              reconstructedOptions.push({ name, values: Array.from(values) });
            });
            setVariantOptions(reconstructedOptions);

            // Map database variants to local state
            const mappedVariants: ProductVariant[] = variantsData.map((v) => ({
              id: v.id,
              name: v.name,
              sku: v.sku || "",
              price: v.price,
              compareAtPrice: v.compare_at_price,
              inventoryQuantity: v.inventory_quantity,
              imageUrl: v.image_url || "",
              isActive: v.is_active,
              option1Name: v.option1_name,
              option1Value: v.option1_value,
              option2Name: v.option2_name,
              option2Value: v.option2_value,
              option3Name: v.option3_name,
              option3Value: v.option3_value,
              sortOrder: v.sort_order,
            }));
            setProductVariants(mappedVariants);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const addImage = (url: string) => {
    if (url && !images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleOptionsChange = (options: VariantOption[]) => {
    setVariantOptions(options);
    setHasVariants(options.length > 0);
  };

  const handleVariantsChange = (variants: ProductVariant[]) => {
    setProductVariants(variants);
  };

  const handleSave = async () => {
    if (!store) return;
    if (!name.trim()) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      toast({ title: "Valid price is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        store_id: store.id,
        name: name.trim(),
        category_id: categoryId,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        description: description.trim() || null,
        images: images.length > 0 ? images : null,
        inventory_quantity: hasVariants ? 0 : (quantity ? parseInt(quantity) : 0),
        sku: hasVariants ? null : (sku.trim() || null),
        status,
        has_variants: hasVariants,
      };

      let savedProductId = productId;

      if (isEditing) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);

        if (error) throw error;
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(productData)
          .select("id")
          .single();

        if (error) throw error;
        savedProductId = newProduct.id;
      }

      // Save variants if product has variants
      if (hasVariants && savedProductId && productVariants.length > 0) {
        // Delete existing variants if editing
        if (isEditing) {
          await supabase
            .from("product_variants")
            .delete()
            .eq("product_id", savedProductId);
        }

        // Insert new variants
        const variantsToInsert = productVariants.map((v, index) => ({
          product_id: savedProductId,
          name: v.name,
          sku: v.sku || null,
          price: v.price,
          compare_at_price: v.compareAtPrice,
          inventory_quantity: v.inventoryQuantity,
          image_url: v.imageUrl || null,
          is_active: v.isActive,
          option1_name: v.option1Name,
          option1_value: v.option1Value,
          option2_name: v.option2Name,
          option2_value: v.option2Value,
          option3_name: v.option3Name,
          option3_value: v.option3Value,
          sort_order: index,
        }));

        const { error: variantError } = await supabase
          .from("product_variants")
          .insert(variantsToInsert);

        if (variantError) throw variantError;
      }

      toast({ title: isEditing ? "Product updated successfully" : "Product created successfully" });

      navigate("/dashboard/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ title: "Failed to save product", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/products")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                {isEditing ? "Edit product" : "Add new product"}
              </h1>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                How it works
              </Button>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save changes" : "Add product"}
            </Button>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                {/* Quick Navigation */}
                <div className="hidden lg:block">
                  <div className="sticky top-24">
                    <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                      Quick navigation
                    </h3>
                    <nav className="space-y-1">
                      {QUICK_NAV_SECTIONS.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={cn(
                            "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            activeSection === section.id
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {section.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-6">
                  {/* Product Information */}
                  <Card ref={(el) => (sectionRefs.current["product-info"] = el)}>
                    <CardHeader className="pb-4">
                      <h2 className="text-lg font-semibold">Product Information</h2>
                      <p className="text-sm text-muted-foreground">
                        Easily input essential details like name, price, and more to showcase your product.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Product Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter product name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Product Category <span className="text-destructive">*</span>
                        </Label>
                        <Select value={categoryId || ""} onValueChange={setCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Enter category name" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {categories.length === 0 && (
                          <Button
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={() => navigate("/dashboard/categories/new")}
                          >
                            + Create a new category
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="price">
                            Price <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {store.currency === "INR" ? "₹" : "$"}
                            </span>
                            <Input
                              id="price"
                              type="number"
                              placeholder="Enter price"
                              className="pl-8"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compare-price">Discounted Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {store.currency === "INR" ? "₹" : "$"}
                            </span>
                            <Input
                              id="compare-price"
                              type="number"
                              placeholder="Enter discounted price"
                              className="pl-8"
                              value={compareAtPrice}
                              onChange={(e) => setCompareAtPrice(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Product Description</Label>
                        <p className="text-sm text-muted-foreground">
                          Get high quality product descriptions within seconds!{" "}
                          <a href="#" className="text-primary hover:underline">
                            Get description.
                          </a>
                        </p>
                        <Textarea
                          id="description"
                          placeholder="Write product description..."
                          rows={6}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Media */}
                  <Card ref={(el) => (sectionRefs.current["product-media"] = el)}>
                    <CardHeader className="pb-4">
                      <h2 className="text-lg font-semibold">Product Media</h2>
                      <p className="text-sm text-muted-foreground">
                        Upload captivating images and videos to make your product stand out.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="group relative h-28 w-28 overflow-hidden rounded-lg border"
                          >
                            <img
                              src={img}
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <MediaPickerTrigger
                          value=""
                          onChange={addImage}
                          placeholder="Upload images"
                        />
                        <div className="flex items-center text-sm text-muted-foreground">
                          Or
                        </div>
                        <div className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 text-muted-foreground">
                          <Video className="h-8 w-8" />
                          <span className="text-xs">Add video</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Recommended size (1000px*1248px)
                      </p>
                    </CardContent>
                  </Card>

                  {/* Inventory */}
                  <Card ref={(el) => (sectionRefs.current["inventory"] = el)}>
                    <Collapsible open={inventoryOpen} onOpenChange={setInventoryOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div>
                            <h2 className="text-lg font-semibold text-left">Inventory</h2>
                            <p className="text-sm text-muted-foreground text-left">
                              Manage your stock levels seamlessly to keep up with customer demand.
                            </p>
                          </div>
                          {inventoryOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                placeholder="Eg. 10"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sku">SKU ID</Label>
                              <Input
                                id="sku"
                                placeholder="Eg. 1000000001"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Set up your warehouse first to add product quantity.{" "}
                            <a href="#" className="text-primary hover:underline">
                              Set up
                            </a>
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  {/* Shipping & Tax */}
                  <Card ref={(el) => (sectionRefs.current["shipping-tax"] = el)}>
                    <Collapsible open={shippingOpen} onOpenChange={setShippingOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div>
                            <h2 className="text-lg font-semibold text-left">Shipping & Tax</h2>
                            <p className="text-sm text-muted-foreground text-left">
                              Configure shipping options and tax rules to streamline your sales process.
                            </p>
                          </div>
                          {shippingOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          <div className="space-y-2">
                            <Label htmlFor="weight">Shipment Weight</Label>
                            <div className="flex gap-2">
                              <Input
                                id="weight"
                                type="number"
                                placeholder="Eg. 1.2"
                                className="flex-1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                              />
                              <Select value={weightUnit} onValueChange={setWeightUnit}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="g">g</SelectItem>
                                  <SelectItem value="lb">lb</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Product weight will be used to calculate delivery charge.{" "}
                              <a href="#" className="text-primary hover:underline">
                                Set up
                              </a>
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="hsn">HSN Code</Label>
                            <Input
                              id="hsn"
                              placeholder="Enter the HSN code"
                              value={hsnCode}
                              onChange={(e) => setHsnCode(e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Not sure about the code?{" "}
                              <a href="#" className="text-primary hover:underline">
                                Search here
                              </a>
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gst">GST</Label>
                            <div className="relative">
                              <Input
                                id="gst"
                                type="number"
                                placeholder="Enter the GST percentage"
                                value={gstPercent}
                                onChange={(e) => setGstPercent(e.target.value)}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                %
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Setup GST in store settings to enter GST percentage.{" "}
                              <a href="#" className="text-primary hover:underline">
                                Set up GST
                              </a>
                            </p>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  {/* Variants */}
                  <Card ref={(el) => (sectionRefs.current["variants"] = el)}>
                    <Collapsible open={variantsOpen} onOpenChange={setVariantsOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div>
                            <h2 className="text-lg font-semibold text-left">Variants</h2>
                            <p className="text-sm text-muted-foreground text-left">
                              Customize variants for size, color, and more with individual pricing and inventory.
                            </p>
                          </div>
                          {variantsOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <VariantManager
                            variants={productVariants}
                            options={variantOptions}
                            currency={store.currency}
                            onOptionsChange={handleOptionsChange}
                            onVariantsChange={handleVariantsChange}
                          />
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  {/* SEO */}
                  <Card ref={(el) => (sectionRefs.current["seo"] = el)}>
                    <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div>
                            <h2 className="text-lg font-semibold text-left">SEO</h2>
                            <p className="text-sm text-muted-foreground text-left">
                              Optimize your product with meta tags to boost its visibility on search engines.
                            </p>
                          </div>
                          {seoOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          <div className="space-y-2">
                            <Label htmlFor="meta-title">Title Tag</Label>
                            <Input
                              id="meta-title"
                              placeholder="Enter title tag"
                              value={metaTitle}
                              onChange={(e) => setMetaTitle(e.target.value)}
                            />
                            <a href="#" className="text-sm text-primary hover:underline">
                              Generate Title
                            </a>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="meta-desc">Meta Description Tag</Label>
                            <Textarea
                              id="meta-desc"
                              placeholder="Enter description"
                              rows={3}
                              value={metaDescription}
                              onChange={(e) => setMetaDescription(e.target.value)}
                            />
                            <a href="#" className="text-sm text-primary hover:underline">
                              Generate Meta Description
                            </a>
                          </div>

                          <div className="space-y-2">
                            <Label>Social sharing image preview</Label>
                            <div className="flex gap-4">
                              <MediaPickerTrigger
                                value={ogImageUrl}
                                onChange={setOgImageUrl}
                                placeholder="+ Add image"
                                className="flex h-32 w-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 text-sm text-muted-foreground hover:border-muted-foreground/50"
                              />
                              <div className="flex-1 rounded-lg border bg-muted/50 p-4">
                                <p className="font-medium text-muted-foreground">
                                  {metaTitle || "Product Page Title"}
                                </p>
                                <p className="text-sm text-primary">
                                  {store ? `https://${store.slug}.shopdu.com/products/` : ""}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {metaDescription || "Meta Description"}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              (Recommended size : 1200 x 628 px)
                            </p>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
