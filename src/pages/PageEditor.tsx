import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const pageSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().trim().min(1, "Slug is required").max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content: z.string().optional(),
  meta_title: z.string().max(60, "Meta title should be under 60 characters").optional(),
  meta_description: z.string().max(160, "Meta description should be under 160 characters").optional(),
});

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

export default function PageEditor() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { pageId } = useParams();
  const isEditing = pageId && pageId !== "new";

  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, pageId]);

  const fetchData = async () => {
    try {
      // Fetch store
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);

      // Fetch page if editing
      if (isEditing) {
        const { data: pageData, error: pageError } = await supabase
          .from("pages")
          .select("*")
          .eq("id", pageId)
          .eq("store_id", storeData.id)
          .maybeSingle();

        if (pageError) throw pageError;

        if (!pageData) {
          toast({
            title: "Page not found",
            description: "The page you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate("/dashboard/appearance/pages");
          return;
        }

        setFormData({
          title: pageData.title || "",
          slug: pageData.slug || "",
          content: pageData.content || "",
          meta_title: pageData.meta_title || "",
          meta_description: pageData.meta_description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Failed to load data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
    setErrors((prev) => ({ ...prev, title: "" }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug }));
    setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const validateForm = () => {
    try {
      pageSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!store) return;

    if (!validateForm()) {
      toast({
        title: "Validation error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const pageData = {
        store_id: store.id,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        status,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("pages")
          .update(pageData)
          .eq("id", pageId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pages")
          .insert(pageData);

        if (error) {
          if (error.code === "23505") {
            setErrors({ slug: "This slug is already in use. Please choose a different one." });
            throw new Error("Duplicate slug");
          }
          throw error;
        }
      }

      toast({
        title: status === "published" ? "Page published!" : "Page saved as draft",
        description: isEditing ? "Your changes have been saved." : "Your new page has been created.",
      });

      navigate("/dashboard/appearance/pages");
    } catch (error: any) {
      console.error("Error saving page:", error);
      if (error.message !== "Duplicate slug") {
        toast({
          title: "Failed to save page",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
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
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background">
          <div className="flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/appearance/pages")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                {isEditing ? "Edit page" : "Add new page"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save as draft"}
              </Button>
              <Button
                onClick={() => handleSave("published")}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish page"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Page Title & Slug */}
            <div className="rounded-xl border bg-background p-6">
              <h2 className="mb-4 font-semibold">Add new page</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">
                    Page Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter page title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Page link:</span>
                  <span className="text-sm text-primary">
                    /store/{store.slug}/page/
                  </span>
                  <Input
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className={`w-48 ${errors.slug ? "border-destructive" : ""}`}
                    placeholder="page-slug"
                  />
                </div>
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
              </div>
            </div>

            {/* Page Content */}
            <div className="rounded-xl border bg-background p-6">
              <h2 className="mb-4 font-semibold">Page content</h2>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                placeholder="Start writing your page content..."
              />
            </div>

            {/* SEO Section */}
            <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
              <div className="rounded-xl border bg-background">
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between p-6 text-left">
                    <div>
                      <h2 className="font-semibold">SEO Settings</h2>
                      <p className="text-sm text-muted-foreground">
                        Optimize your page with meta tags to boost its visibility on search engines.
                      </p>
                    </div>
                    {seoOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t px-6 pb-6 pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="meta_title">Title Tag</Label>
                        <Input
                          id="meta_title"
                          placeholder="Enter title tag"
                          value={formData.meta_title}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                          }
                          maxLength={60}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formData.meta_title.length}/60 characters
                        </p>
                        {errors.meta_title && (
                          <p className="mt-1 text-sm text-destructive">{errors.meta_title}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="meta_description">Meta Description Tag</Label>
                        <Textarea
                          id="meta_description"
                          placeholder="Enter description"
                          value={formData.meta_description}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_description: e.target.value }))
                          }
                          maxLength={160}
                          rows={3}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formData.meta_description.length}/160 characters
                        </p>
                        {errors.meta_description && (
                          <p className="mt-1 text-sm text-destructive">{errors.meta_description}</p>
                        )}
                      </div>

                      {/* Social Preview */}
                      <div>
                        <Label>Social sharing preview</Label>
                        <div className="mt-2 flex gap-4 rounded-lg border p-4">
                          <div className="flex h-24 w-40 items-center justify-center rounded border-2 border-dashed border-muted-foreground/30">
                            <span className="text-xs text-muted-foreground">
                              (1200 x 628 px)
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-muted-foreground">
                              {formData.meta_title || formData.title || "Page Title"}
                            </p>
                            <p className="text-sm text-primary">
                              /store/{store.slug}/page/{formData.slug || "..."}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formData.meta_description || "Meta Description"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </div>
      </main>
    </div>
  );
}
