import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ChevronDown, ChevronUp, X, Image as ImageIcon, Upload } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const pageSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().trim().min(1, "Slug is required").max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content: z.string().optional(),
  meta_title: z.string().max(60, "Meta title should be under 60 characters").optional(),
  meta_description: z.string().max(160, "Meta description should be under 160 characters").optional(),
  meta_keywords: z.string().max(500, "Keywords should be under 500 characters").optional(),
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
  const ogImageInputRef = useRef<HTMLInputElement>(null);
  const ogImageDropRef = useRef<HTMLDivElement>(null);

  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingOgImage, setIsDraggingOgImage] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keywordInput, setKeywordInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image_url: "",
  });

  // Parse keywords into array for display
  const keywords = formData.meta_keywords ? formData.meta_keywords.split(",").map(k => k.trim()).filter(Boolean) : [];

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
          meta_keywords: pageData.meta_keywords || "",
          og_image_url: pageData.og_image_url || "",
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
      .replace(/^-|-$/g, "")
      .substring(0, 100);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const newSlug = generateSlug(title);
    
    setFormData((prev) => ({
      ...prev,
      title,
      slug: newSlug,
      meta_title: !prev.meta_title || prev.meta_title === prev.title ? title : prev.meta_title,
    }));
    setErrors((prev) => ({ ...prev, title: "", slug: "" }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug }));
    setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const handleOgImageUpload = useCallback(async (file: File) => {
    if (!store) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${store.id}/og-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(filePath, file);

      if (uploadError) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setFormData((prev) => ({ ...prev, og_image_url: base64 }));
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("page-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, og_image_url: publicUrl }));
      toast({
        title: "Image uploaded",
        description: "Social sharing image has been uploaded.",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  }, [store]);

  // OG Image drag handlers
  const handleOgDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOgImage(true);
  }, []);

  const handleOgDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (ogImageDropRef.current && !ogImageDropRef.current.contains(e.relatedTarget as Node)) {
      setIsDraggingOgImage(false);
    }
  }, []);

  const handleOgDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleOgDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOgImage(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));
    
    if (imageFile) {
      handleOgImageUpload(imageFile);
    }
  }, [handleOgImageUpload]);

  const handleOgImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleOgImageUpload(file);
    }
    if (ogImageInputRef.current) {
      ogImageInputRef.current.value = "";
    }
  };

  const removeOgImage = () => {
    setFormData((prev) => ({ ...prev, og_image_url: "" }));
  };

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    
    const newKeywords = [...keywords, keywordInput.trim()];
    setFormData((prev) => ({ ...prev, meta_keywords: newKeywords.join(", ") }));
    setKeywordInput("");
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, meta_keywords: newKeywords.join(", ") }));
  };

  const handleKeywordInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
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
        meta_title: formData.meta_title || formData.title.trim(),
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords || null,
        og_image_url: formData.og_image_url || null,
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
              <h2 className="mb-4 font-semibold">Page Details</h2>
              
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

                <div>
                  <Label htmlFor="slug">Page URL</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      /store/{store.slug}/page/
                    </span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      className={`flex-1 ${errors.slug ? "border-destructive" : ""}`}
                      placeholder="page-slug"
                    />
                  </div>
                  {errors.slug && (
                    <p className="mt-1 text-sm text-destructive">{errors.slug}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="rounded-xl border bg-background p-6">
              <h2 className="mb-4 font-semibold">Page Content</h2>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                placeholder="Start writing your page content..."
                storeId={store.id}
              />
            </div>

            {/* SEO Section */}
            <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
              <div className="rounded-xl border bg-background">
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors rounded-xl">
                    <div>
                      <h2 className="font-semibold">SEO Settings</h2>
                      <p className="text-sm text-muted-foreground">
                        Optimize your page for search engines and social sharing
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
                    <div className="space-y-6">
                      {/* Title Tag */}
                      <div>
                        <Label htmlFor="meta_title">Title Tag</Label>
                        <Input
                          id="meta_title"
                          placeholder={formData.title || "Enter title tag"}
                          value={formData.meta_title}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                          }
                          maxLength={60}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Defaults to page title if empty
                          </p>
                          <p className={`text-xs ${formData.meta_title.length > 55 ? "text-amber-500" : "text-muted-foreground"}`}>
                            {formData.meta_title.length}/60
                          </p>
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea
                          id="meta_description"
                          placeholder="Enter a brief description of this page"
                          value={formData.meta_description}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, meta_description: e.target.value }))
                          }
                          maxLength={160}
                          rows={3}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Recommended: 120-160 characters
                          </p>
                          <p className={`text-xs ${formData.meta_description.length > 150 ? "text-amber-500" : "text-muted-foreground"}`}>
                            {formData.meta_description.length}/160
                          </p>
                        </div>
                      </div>

                      {/* Meta Keywords */}
                      <div>
                        <Label htmlFor="meta_keywords">Keywords</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Add relevant keywords for search engines (press Enter or comma to add)
                        </p>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              id="meta_keywords"
                              placeholder="Type a keyword and press Enter"
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              onKeyDown={handleKeywordInputKeyDown}
                            />
                            <Button type="button" variant="outline" onClick={addKeyword}>
                              Add
                            </Button>
                          </div>
                          {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {keywords.map((keyword, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="gap-1 pl-3 pr-1.5 py-1"
                                >
                                  {keyword}
                                  <button
                                    type="button"
                                    onClick={() => removeKeyword(index)}
                                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* OG Image Upload with Drag & Drop */}
                      <div>
                        <Label>Social Sharing Image</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          This image appears when your page is shared on social media
                        </p>
                        
                        {formData.og_image_url ? (
                          <div className="relative group max-w-md">
                            <img
                              src={formData.og_image_url}
                              alt="Social sharing preview"
                              className="w-full h-auto rounded-lg border object-cover aspect-[1200/630]"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={removeOgImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            ref={ogImageDropRef}
                            onClick={() => ogImageInputRef.current?.click()}
                            onDragEnter={handleOgDragEnter}
                            onDragLeave={handleOgDragLeave}
                            onDragOver={handleOgDragOver}
                            onDrop={handleOgDrop}
                            className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors max-w-md ${
                              isDraggingOgImage 
                                ? "border-primary bg-primary/5" 
                                : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30"
                            }`}
                          >
                            {isUploadingImage ? (
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDraggingOgImage ? "bg-primary/10" : "bg-muted"}`}>
                                  {isDraggingOgImage ? (
                                    <Upload className="h-6 w-6 text-primary" />
                                  ) : (
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium">
                                    {isDraggingOgImage ? "Drop image here" : "Click or drag image to upload"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Recommended: 1200 x 630 pixels
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        <input
                          ref={ogImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleOgImageSelect}
                          className="hidden"
                        />
                      </div>

                      {/* Social Preview */}
                      <div>
                        <Label>Preview</Label>
                        <div className="mt-2 rounded-lg border bg-muted/30 p-4">
                          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                            How it may appear on social media
                          </p>
                          <div className="rounded-lg border bg-background overflow-hidden max-w-md">
                            {formData.og_image_url ? (
                              <img
                                src={formData.og_image_url}
                                alt="Preview"
                                className="w-full h-40 object-cover"
                              />
                            ) : (
                              <div className="w-full h-40 bg-muted flex items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                              </div>
                            )}
                            <div className="p-3">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                {store.slug}.lovable.app
                              </p>
                              <p className="font-medium text-sm mt-1 line-clamp-1">
                                {formData.meta_title || formData.title || "Page Title"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {formData.meta_description || "Add a meta description to show here"}
                              </p>
                            </div>
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
