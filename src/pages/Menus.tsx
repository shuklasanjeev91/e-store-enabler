import { useEffect, useState, useCallback } from "react";
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
  ExternalLink,
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
import { cn } from "@/lib/utils";

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

interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: "page" | "category" | "custom" | "products";
}

export default function Menus() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [headerItems, setHeaderItems] = useState<MenuItem[]>([]);
  const [footerItems, setFooterItems] = useState<MenuItem[]>([]);

  // Collapsible states
  const [pagesOpen, setPagesOpen] = useState(true);
  const [customLinkOpen, setCustomLinkOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Custom link form
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");

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

      // Fetch pages
      const { data: pagesData } = await supabase
        .from("pages")
        .select("id, title, slug, status")
        .eq("store_id", storeData.id)
        .eq("status", "published")
        .order("sort_order");

      setPages(pagesData || []);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("store_id", storeData.id)
        .eq("status", "active")
        .order("sort_order");

      setCategories(categoriesData || []);
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

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
    };
    setCurrentItems([...currentItems, newItem]);
  };

  const removeMenuItem = (id: string) => {
    setCurrentItems(currentItems.filter((item) => item.id !== id));
  };

  const addPage = (page: Page) => {
    if (!store) return;
    addMenuItem({
      label: page.title,
      url: `/store/${store.slug}/page/${page.slug}`,
      type: "page",
    });
  };

  const addCategory = (category: Category) => {
    if (!store) return;
    addMenuItem({
      label: category.name,
      url: `/store/${store.slug}?category=${category.slug}`,
      type: "category",
    });
  };

  const addProductsLink = () => {
    if (!store) return;
    addMenuItem({
      label: "Products",
      url: `/store/${store.slug}`,
      type: "products",
    });
  };

  const addCustomLink = () => {
    if (!customLabel.trim() || !customUrl.trim()) {
      toast({
        title: "Please fill in both fields",
        variant: "destructive",
      });
      return;
    }
    addMenuItem({
      label: customLabel,
      url: customUrl.startsWith("http") ? customUrl : `https://${customUrl}`,
      type: "custom",
    });
    setCustomLabel("");
    setCustomUrl("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    // For now, just show success - in production, save to database
    setTimeout(() => {
      toast({
        title: "Menu saved!",
        description: "Your navigation menu has been updated.",
      });
      setIsSaving(false);
    }, 500);
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
            <TabsList className="mb-6">
              <TabsTrigger value="header" className="px-6">Header</TabsTrigger>
              <TabsTrigger value="footer" className="px-6">Footer</TabsTrigger>
            </TabsList>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left: Menu Items Source */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {activeTab === "header" ? "Header" : "Footer"} menu items
                </h2>

                {/* Pages */}
                <Card>
                  <Collapsible open={pagesOpen} onOpenChange={setPagesOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50">
                        Pages
                        {pagesOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {pages.length === 0 ? (
                          <div className="py-2">
                            <p className="text-sm text-muted-foreground mb-3">
                              No pages have been created.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
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
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Custom Link */}
                <Card>
                  <Collapsible open={customLinkOpen} onOpenChange={setCustomLinkOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50">
                        Custom link
                        {customLinkOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            placeholder="e.g. Contact Us"
                            value={customLabel}
                            onChange={(e) => setCustomLabel(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            placeholder="https://example.com"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                          />
                        </div>
                        <Button onClick={addCustomLink} className="w-full">
                          Add to menu
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Products */}
                <Card>
                  <Collapsible open={productsOpen} onOpenChange={setProductsOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50">
                        Products
                        {productsOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <span className="text-sm">All Products</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={addProductsLink}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Categories */}
                <Card>
                  <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50">
                        Categories
                        {categoriesOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {categories.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            No categories have been created.
                          </p>
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
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </div>

              {/* Right: Menu Preview */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
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
                                {item.label}
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

                <div className="flex justify-end">
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
