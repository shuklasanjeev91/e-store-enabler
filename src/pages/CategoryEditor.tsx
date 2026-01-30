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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
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
  { id: "seo", label: "SEO" },
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
  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState("active");

  // Collapsible states
  const [bannerOpen, setBannerOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(false);

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
                        <CardContent className="pt-0">
                          {bannerUrl ? (
                            <div className="relative h-32 w-full max-w-md overflow-hidden rounded-lg border">
                              <img
                                src={bannerUrl}
                                alt="Banner"
                                className="h-full w-full object-cover"
                              />
                              <button
                                onClick={() => setBannerUrl("")}
                                className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <MediaPickerTrigger
                              value={bannerUrl}
                              onChange={setBannerUrl}
                              placeholder="Upload banner image"
                              className="flex h-32 w-full max-w-md items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 text-muted-foreground hover:border-muted-foreground/50"
                            />
                          )}
                          <p className="mt-2 text-sm text-muted-foreground">
                            Recommended size: 1200 x 300 px
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  {/* Content */}
                  <Card ref={(el) => (sectionRefs.current["content"] = el)}>
                    <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div>
                            <h2 className="text-lg font-semibold text-left">Content</h2>
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
                            <Textarea
                              placeholder="Write category description..."
                              rows={6}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
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
                            <h2 className="text-lg font-semibold text-left">SEO</h2>
                            <p className="text-sm text-muted-foreground text-left">
                              Optimize your category with meta tags to boost its visibility on search engines.
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
