import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  url: string;
  link_type: "page" | "category" | "product" | "custom";
  reference_id?: string | null;
  sort_order: number;
}

interface DbMenuItem {
  id: string;
  store_id: string;
  location: string;
  link_type: string;
  name: string;
  url: string;
  reference_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function Menus() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [headerItems, setHeaderItems] = useState<MenuItem[]>([]);
  const [footerItems, setFooterItems] = useState<MenuItem[]>([]);

  // Collapsible states
  const [pagesOpen, setPagesOpen] = useState(false);
  const [customLinkOpen, setCustomLinkOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Custom link form
  const [customUrl, setCustomUrl] = useState("");
  const [customName, setCustomName] = useState("");

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

  const fetchData = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug")
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

      // Fetch pages, categories, products, and menu items in parallel
      const [pagesRes, categoriesRes, productsRes, menusRes] = await Promise.all([
        supabase
          .from("pages")
          .select("id, title, slug, status")
          .eq("store_id", storeData.id)
          .eq("status", "published")
          .order("sort_order"),
        supabase
          .from("categories")
          .select("id, name, slug")
          .eq("store_id", storeData.id)
          .eq("status", "active")
          .order("sort_order"),
        supabase
          .from("products")
          .select("id, name")
          .eq("store_id", storeData.id)
          .eq("status", "published")
          .limit(20),
        supabase
          .from("store_menus")
          .select("*")
          .eq("store_id", storeData.id)
          .eq("is_active", true)
          .order("sort_order"),
      ]);

      setPages(pagesRes.data || []);
      setCategories(categoriesRes.data || []);
      setProducts(productsRes.data || []);

      // Parse menu items
      if (menusRes.data) {
        const dbMenus = menusRes.data as DbMenuItem[];
        const headerMenus = dbMenus
          .filter((m) => m.location === "header")
          .map((m) => ({
            id: m.id,
            name: m.name,
            url: m.url,
            link_type: m.link_type as MenuItem["link_type"],
            reference_id: m.reference_id,
            sort_order: m.sort_order,
          }));
        const footerMenus = dbMenus
          .filter((m) => m.location === "footer")
          .map((m) => ({
            id: m.id,
            name: m.name,
            url: m.url,
            link_type: m.link_type as MenuItem["link_type"],
            reference_id: m.reference_id,
            sort_order: m.sort_order,
          }));
        setHeaderItems(headerMenus);
        setFooterItems(footerMenus);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const currentItems = activeTab === "header" ? headerItems : footerItems;
  const setCurrentItems = activeTab === "header" ? setHeaderItems : setFooterItems;

  const addMenuItem = (item: Omit<MenuItem, "id" | "sort_order">) => {
    const newItem: MenuItem = {
      ...item,
      id: `new-${Date.now()}`,
      sort_order: currentItems.length,
    };
    setCurrentItems([...currentItems, newItem]);
  };

  const removeMenuItem = (id: string) => {
    setCurrentItems(currentItems.filter((item) => item.id !== id));
  };

  const addPage = (page: Page) => {
    if (!store) return;
    // Check if already added
    if (currentItems.some((i) => i.link_type === "page" && i.reference_id === page.id)) {
      toast({ title: "Page already added", variant: "destructive" });
      return;
    }
    addMenuItem({
      name: page.title,
      url: `/store/${store.slug}/page/${page.slug}`,
      link_type: "page",
      reference_id: page.id,
    });
  };

  const addCategory = (category: Category) => {
    if (!store) return;
    if (currentItems.some((i) => i.link_type === "category" && i.reference_id === category.id)) {
      toast({ title: "Category already added", variant: "destructive" });
      return;
    }
    addMenuItem({
      name: category.name,
      url: `/store/${store.slug}?category=${category.slug}`,
      link_type: "category",
      reference_id: category.id,
    });
  };

  const addProduct = (product: Product) => {
    if (!store) return;
    if (currentItems.some((i) => i.link_type === "product" && i.reference_id === product.id)) {
      toast({ title: "Product already added", variant: "destructive" });
      return;
    }
    addMenuItem({
      name: product.name,
      url: `/store/${store.slug}/product/${product.id}`,
      link_type: "product",
      reference_id: product.id,
    });
  };

  const addCustomLink = () => {
    if (!customUrl.trim() || !customName.trim()) {
      toast({
        title: "Please fill in both fields",
        variant: "destructive",
      });
      return;
    }
    addMenuItem({
      name: customName,
      url: customUrl.startsWith("http") ? customUrl : `https://${customUrl}`,
      link_type: "custom",
      reference_id: null,
    });
    setCustomUrl("");
    setCustomName("");
  };

  const handleSave = async () => {
    if (!store) return;
    setIsSaving(true);

    try {
      // Delete existing menu items for this store and location
      const location = activeTab;
      await supabase
        .from("store_menus")
        .delete()
        .eq("store_id", store.id)
        .eq("location", location);

      // Insert new menu items
      if (currentItems.length > 0) {
        const menuData = currentItems.map((item, index) => ({
          store_id: store.id,
          location,
          link_type: item.link_type,
          name: item.name,
          url: item.url,
          reference_id: item.reference_id || null,
          sort_order: index,
          is_active: true,
        }));

        const { error } = await supabase.from("store_menus").insert(menuData);
        if (error) throw error;
      }

      toast({
        title: "Menu saved!",
        description: `Your ${location} menu has been updated.`,
      });

      // Refetch to get proper IDs
      await fetchData();
    } catch (error) {
      console.error("Error saving menu:", error);
      toast({
        title: "Failed to save menu",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56 pt-14 lg:pt-0">
        {/* Page Header */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Menus</h1>
              <Button variant="outline" size="sm" className="gap-1.5">
                <HelpCircle className="h-4 w-4" />
                How it works
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {/* Header/Footer Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "header" | "footer")}>
            <TabsList className="mb-6 bg-transparent p-0 gap-2">
              <TabsTrigger 
                value="header" 
                className="rounded-lg border bg-background px-6 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                Header
              </TabsTrigger>
              <TabsTrigger 
                value="footer" 
                className="rounded-lg border bg-background px-6 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                Footer
              </TabsTrigger>
            </TabsList>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left: Menu Items Source */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  {activeTab === "header" ? "Header" : "Footer"} menu items
                </h2>

                <Card className="divide-y">
                  {/* Pages */}
                  <Collapsible open={pagesOpen} onOpenChange={setPagesOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between px-4 py-3 text-left font-medium hover:bg-muted/50 transition-colors">
                        Pages
                        {pagesOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        {pages.length === 0 ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">No pages have been created.</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary border-primary hover:bg-primary/5"
                              onClick={() => navigate("/dashboard/appearance/pages/new")}
                            >
                              Create a new page
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {pages.map((page) => (
                              <div
                                key={page.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <span className="text-sm">{page.title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addPage(page)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Custom Link */}
                  <Collapsible open={customLinkOpen} onOpenChange={setCustomLinkOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between px-4 py-3 text-left font-medium hover:bg-muted/50 transition-colors">
                        Custom link
                        {customLinkOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">
                            Link <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="Enter link"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">
                            Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="Enter name"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={addCustomLink}
                          className="text-primary border-primary hover:bg-primary/5"
                        >
                          Add to Menu
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Products */}
                  <Collapsible open={productsOpen} onOpenChange={setProductsOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between px-4 py-3 text-left font-medium hover:bg-muted/50 transition-colors">
                        Products
                        {productsOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        {products.length === 0 ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">No products have been created.</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary border-primary hover:bg-primary/5"
                              onClick={() => navigate("/dashboard/products")}
                            >
                              Create a new product
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <span className="text-sm">{product.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addProduct(product)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Categories */}
                  <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between px-4 py-3 text-left font-medium hover:bg-muted/50 transition-colors">
                        Categories
                        {categoriesOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        {categories.length === 0 ? (
                          <div className="flex flex-col gap-3 text-sm">
                            <span className="text-muted-foreground">No categories have been created.</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary border-primary hover:bg-primary/5 w-fit"
                              onClick={() => navigate("/dashboard/categories")}
                            >
                              Create a new category
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <div
                                key={category.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <span className="text-sm">{category.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addCategory(category)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </div>

              {/* Right: Menu Preview */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  {activeTab === "header" ? "Header" : "Footer"} menu
                </h2>

                <Card className="min-h-[300px]">
                  <CardContent className="p-6">
                    {currentItems.length === 0 ? (
                      <div className="flex h-full min-h-[250px] items-center justify-center text-center">
                        <p className="text-muted-foreground">
                          Start adding menu elements from {activeTab} items
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.url}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => removeMenuItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save menu
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
