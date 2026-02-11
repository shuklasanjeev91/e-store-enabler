import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MediaPickerTrigger } from "@/components/MediaPicker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FolderTree,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface CategoryOption {
  id: string;
  name: string;
  parent_id: string | null;
  level: number;
}

const QUICK_NAV_SECTIONS = [
  { id: "information", label: "Information" },
  { id: "parent", label: "Parent Category" },
  { id: "banner", label: "Banner" },
  { id: "content", label: "Content" },
  { id: "seo", label: "ShopDu SEO" },
];

export default function CategoryEditor() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const isEditing = categoryId && categoryId !== "new";
  const preselectedParentId = searchParams.get("parent");

  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("information");

  // All categories for parent selector
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(preselectedParentId || null);
  const [imageUrl, setImageUrl] = useState("");
  const [desktopBannerUrl, setDesktopBannerUrl] = useState("");
  const [mobileBannerUrl, setMobileBannerUrl] = useState("");
  const [bannerDevice, setBannerDevice] = useState<"desktop" | "mobile">("desktop");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [status, setStatus] = useState("active");

  // Collapsible states
  const [bannerOpen, setBannerOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(true);
  const [parentOpen, setParentOpen] = useState(true);

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
  }, [user, categoryId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
    }
  }, [name, isEditing]);

  const fetchData = async () => {
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

      // Fetch all categories for parent selector
      const { data: catsData } = await supabase
        .from("categories")
        .select("id, name, parent_id, sort_order")
        .eq("store_id", storeData.id)
        .order("sort_order", { ascending: true });

      if (catsData) {
        // Calculate levels
        const withLevels: CategoryOption[] = catsData.map((c) => {
          let level = 0;
          let current = c;
          while (current.parent_id) {
            level++;
            const parent = catsData.find((p) => p.id === current.parent_id);
            if (!parent) break;
            current = parent;
          }
          return { id: c.id, name: c.name, parent_id: c.parent_id, level };
        });
        setAllCategories(withLevels);
      }

      // Fetch category if editing
      if (isEditing) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("id", categoryId)
          .eq("store_id", storeData.id)
          .single();

        if (categoryError || !categoryData) {
          toast({ title: "Category not found", variant: "destructive" });
          navigate("/dashboard/categories");
          return;
        }

        setName(categoryData.name);
        setSlug(categoryData.slug);
        setParentId(categoryData.parent_id || null);
        setImageUrl(categoryData.image_url || "");
        setDescription(categoryData.description || "");
        setStatus(categoryData.status);
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

  const handleGenerateTitle = () => {
    if (name) {
      setMetaTitle(`${name} - Shop the Best ${name} Collection`);
    }
  };

  const handleGenerateMetaDescription = () => {
    if (name) {
      setMetaDescription(`Explore our exclusive ${name} collection. Find the best products at great prices. Shop now and enjoy fast delivery!`);
    }
  };

  // Get valid parent options (only L1 and L2 categories, excluding self and descendants)
  const getParentOptions = (): CategoryOption[] => {
    // Can only parent under L1 (level 0) or L2 (level 1) = max depth 2
    const validParents = allCategories.filter((c) => {
      if (c.level >= 2) return false; // Can't nest under L3
      if (isEditing && c.id === categoryId) return false; // Can't be own parent
      // Can't be a descendant of self
      if (isEditing) {
        let current: CategoryOption | undefined = c;
        while (current?.parent_id) {
          if (current.parent_id === categoryId) return false;
          current = allCategories.find((p) => p.id === current!.parent_id);
        }
      }
      return true;
    });
    return validParents;
  };

  // Build breadcrumb path for a category
  const getCategoryPath = (catId: string): string => {
    const parts: string[] = [];
    let current = allCategories.find((c) => c.id === catId);
    while (current) {
      parts.unshift(current.name);
      current = current.parent_id
        ? allCategories.find((c) => c.id === current!.parent_id)
        : undefined;
    }
    return parts.join(" → ");
  };

  // Determine the level of this category
  const getCurrentLevel = (): number => {
    if (!parentId) return 0;
    const parent = allCategories.find((c) => c.id === parentId);
    return parent ? parent.level + 1 : 0;
  };

  const handleSave = async () => {
    if (!store) return;
    if (!name.trim()) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    if (!slug.trim()) {
      toast({ title: "Category slug is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const categoryData = {
        store_id: store.id,
        name: name.trim(),
        slug: slug.trim(),
        parent_id: parentId || null,
        image_url: imageUrl || null,
        description: description.trim() || null,
        status,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", categoryId);

        if (error) throw error;
        toast({ title: "Category updated successfully" });
      } else {
        const { error } = await supabase.from("categories").insert(categoryData);

        if (error) throw error;
        toast({ title: "Category created successfully" });
      }

      navigate("/dashboard/categories");
    } catch (error: any) {
      console.error("Error saving category:", error);
      if (error.code === "23505") {
        toast({ title: "A category with this slug already exists", variant: "destructive" });
      } else {
        toast({ title: "Failed to save category", variant: "destructive" });
      }
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

  const currentBannerUrl = bannerDevice === "desktop" ? desktopBannerUrl : mobileBannerUrl;
  const setCurrentBannerUrl = bannerDevice === "desktop" ? setDesktopBannerUrl : setMobileBannerUrl;
  const parentOptions = getParentOptions();
  const currentLevel = getCurrentLevel();

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0: return "Level 1 — Main Category";
      case 1: return "Level 2 — Subcategory";
      case 2: return "Level 3 — Item Category";
      default: return `Level ${level + 1}`;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-primary/10 text-primary border-primary/20";
      case 1: return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 2: return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

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
                onClick={() => navigate("/dashboard/categories")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                {isEditing ? "Edit category" : "Add new category"}
              </h1>
              <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${getLevelColor(currentLevel)}`}>
                {getLevelLabel(currentLevel)}
              </span>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save changes" : "Add category"}
            </Button>
          </header>

          {/* Content */}
          <div className="p-6">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                {/* Quick Navigation */}
                <div className="hidden lg:block">
                  <div className="sticky top-24">
                    <h3 className="mb-4 text-sm font-medium">
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
                              ? "font-medium text-primary"
                              : "text-muted-foreground hover:text-foreground"
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
                  {/* Information */}
                  <Card ref={(el) => (sectionRefs.current["information"] = el)}>
                    <CardHeader className="pb-4">
                      <h2 className="text-lg font-semibold">Information</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category Image</Label>
                        {imageUrl ? (
                          <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
                            <img
                              src={imageUrl}
                              alt="Category"
                              className="h-full w-full object-cover"
                            />
                            <button
                              onClick={() => setImageUrl("")}
                              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <MediaPickerTrigger
                            value={imageUrl}
                            onChange={setImageUrl}
                            placeholder="Upload image"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Category Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter category name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input
                          id="slug"
                          placeholder="category-slug"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          {store && `https://${store.slug}.shopdu.com/category/${slug}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parent Category */}
                  <Card ref={(el) => (sectionRefs.current["parent"] = el)}>
                    <Collapsible open={parentOpen} onOpenChange={setParentOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h2 className="text-lg font-semibold text-left">Parent Category</h2>
                              <p className="text-sm text-muted-foreground text-left">
                                Place this category inside another to build your hierarchy.
                              </p>
                            </div>
                          </div>
                          {parentOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          <div className="space-y-2">
                            <Label>Parent Category</Label>
                            <Select
                              value={parentId || "__none__"}
                              onValueChange={(val) => setParentId(val === "__none__" ? null : val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="None (Top-level category)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  <span className="flex items-center gap-2">
                                    <span className="text-muted-foreground">—</span>
                                    None (Top-level L1 category)
                                  </span>
                                </SelectItem>
                                {parentOptions.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    <span className="flex items-center gap-2">
                                      {cat.level > 0 && (
                                        <span className="text-muted-foreground">
                                          {"└".padStart(cat.level * 2, " ")}
                                        </span>
                                      )}
                                      {cat.name}
                                      <span className="text-xs text-muted-foreground">
                                        (L{cat.level + 1})
                                      </span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Hierarchy preview */}
                          {parentId && (
                            <div className="rounded-lg border bg-muted/30 p-4">
                              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Hierarchy Preview</p>
                              <div className="flex items-center gap-1.5 text-sm">
                                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                  {(() => {
                                    // Build full path
                                    const parts: string[] = [];
                                    let current = allCategories.find((c) => c.id === parentId);
                                    while (current) {
                                      parts.unshift(current.name);
                                      current = current.parent_id
                                        ? allCategories.find((c) => c.id === current!.parent_id)
                                        : undefined;
                                    }
                                    return parts.join(" → ");
                                  })()}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${getLevelColor(currentLevel)}`}>
                                  {name || "New Category"}
                                </span>
                              </div>
                            </div>
                          )}

                          {!parentId && (
                            <p className="text-xs text-muted-foreground">
                              This will be a top-level (L1) category visible in the storefront mega menu header.
                            </p>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  {/* Banner */}
                  <Card ref={(el) => (sectionRefs.current["banner"] = el)}>
                    <Collapsible open={bannerOpen} onOpenChange={setBannerOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div>
                            <h2 className="text-lg font-semibold text-left">Banner</h2>
                            <p className="text-sm text-muted-foreground text-left">
                              Add a category banner at the top of product listing.
                            </p>
                          </div>
                          {bannerOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={bannerDevice === "desktop" ? "default" : "outline"}
                              onClick={() => setBannerDevice("desktop")}
                              className="px-6"
                            >
                              For Desktop
                            </Button>
                            <Button
                              type="button"
                              variant={bannerDevice === "mobile" ? "default" : "outline"}
                              onClick={() => setBannerDevice("mobile")}
                              className="px-6"
                            >
                              For Mobile
                            </Button>
                          </div>

                          {currentBannerUrl ? (
                            <div className="relative h-32 w-full overflow-hidden rounded-lg border">
                              <img
                                src={currentBannerUrl}
                                alt={`${bannerDevice} Banner`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                onClick={() => setCurrentBannerUrl("")}
                                className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <MediaPickerTrigger
                              value={currentBannerUrl}
                              onChange={setCurrentBannerUrl}
                              placeholder={`Add category banner (${bannerDevice === "desktop" ? "1296px*236px" : "375px*200px"})`}
                              className="h-32 w-full"
                            />
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  {/* Content */}
                  <Card ref={(el) => (sectionRefs.current["content"] = el)}>
                    <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-left">Content</h2>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {contentOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          <div className="space-y-2">
                            <Label>Category Heading and Description</Label>
                            <RichTextEditor
                              content={description}
                              onChange={setDescription}
                              placeholder="Write category description..."
                              storeId={store.id}
                            />
                          </div>
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
                            <h2 className="text-lg font-semibold text-left">ShopDu SEO</h2>
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
                        <CardContent className="space-y-6 pt-0">
                          <div className="space-y-2">
                            <Label htmlFor="meta-title">Title Tag</Label>
                            <Input
                              id="meta-title"
                              placeholder="Enter title tag"
                              value={metaTitle}
                              onChange={(e) => setMetaTitle(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={handleGenerateTitle}
                              className="text-sm text-primary hover:underline"
                            >
                              Generate Title
                            </button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="meta-desc">Meta Description Tag</Label>
                            <Input
                              id="meta-desc"
                              placeholder="Enter description"
                              value={metaDescription}
                              onChange={(e) => setMetaDescription(e.target.value)}
                              className="h-20"
                            />
                            <button
                              type="button"
                              onClick={handleGenerateMetaDescription}
                              className="text-sm text-primary hover:underline"
                            >
                              Generate Meta Description
                            </button>
                          </div>

                          <div className="space-y-3">
                            <Label>Social sharing image preview</Label>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <MediaPickerTrigger
                                value={ogImageUrl}
                                onChange={setOgImageUrl}
                                placeholder="+ Add image (1200 x 628 px)"
                                className="aspect-video"
                              />

                              <div className="rounded-lg border bg-card p-4 space-y-2">
                                <h4 className="font-semibold text-lg">
                                  {metaTitle || name || "Category Page Title"}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {store && `https://${store.slug}.shopdu.com/categories/${slug || ""}/`}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {metaDescription || "Meta Description"}
                                </p>
                              </div>
                            </div>
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
