import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

const QUICK_NAV_SECTIONS = [
  { id: "information", label: "Information" },
  { id: "banner", label: "Banner" },
  { id: "content", label: "Content" },
  { id: "seo", label: "Shopdu SEO" },
];

export default function CategoryEditor() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const isEditing = categoryId && categoryId !== "new";

  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("information");

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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
                          {/* Device Toggle */}
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

                          {/* Banner Upload Area */}
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
                            <h2 className="text-lg font-semibold text-left">Shopdu SEO</h2>
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

                          {/* Social Sharing Image Preview */}
                          <div className="space-y-3">
                            <Label>Social sharing image preview</Label>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {/* Image Upload */}
                              <MediaPickerTrigger
                                value={ogImageUrl}
                                onChange={setOgImageUrl}
                                placeholder="+ Add image (1200 x 628 px)"
                                className="aspect-video"
                              />

                              {/* Preview Card */}
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
