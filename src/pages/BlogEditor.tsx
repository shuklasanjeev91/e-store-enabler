import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MediaPicker } from "@/components/MediaPicker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogEditor() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams();
  const isNew = postId === "new";

  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [authorName, setAuthorName] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // UI state
  const [autoSlug, setAutoSlug] = useState(true);
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showOgMediaPicker, setShowOgMediaPicker] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<"featured" | "og">("featured");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, postId]);

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, autoSlug]);

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

      if (!isNew && postId) {
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", postId)
          .eq("store_id", storeData.id)
          .maybeSingle();

        if (postError) throw postError;

        if (!postData) {
          toast({ title: "Blog post not found", variant: "destructive" });
          navigate("/dashboard/appearance/blog");
          return;
        }

        setTitle(postData.title);
        setSlug(postData.slug);
        setContent(postData.content || "");
        setFeaturedImageUrl(postData.featured_image_url || "");
        setStatus(postData.status as "draft" | "published");
        setAuthorName(postData.author_name || "");
        setMetaTitle(postData.meta_title || "");
        setMetaDescription(postData.meta_description || "");
        setTags(postData.tags || []);
        setAutoSlug(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!store) return;

    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (!slug.trim()) {
      toast({ title: "Slug is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const finalStatus = publishNow ? "published" : status;
      const publishedAt = finalStatus === "published" ? new Date().toISOString() : null;

      const postData = {
        store_id: store.id,
        title: title.trim(),
        slug: slug.trim(),
        excerpt: null,
        content: content || null,
        featured_image_url: featuredImageUrl.trim() || null,
        status: finalStatus,
        author_name: authorName.trim() || null,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        tags,
        published_at: publishedAt,
      };

      if (isNew) {
        const { error } = await supabase.from("blog_posts").insert(postData);
        if (error) throw error;
        toast({ title: "Blog post created!" });
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", postId);
        if (error) throw error;
        toast({ title: "Blog post updated!" });
      }

      navigate("/dashboard/appearance/blog");
    } catch (error: any) {
      console.error("Error saving post:", error);
      if (error.code === "23505") {
        toast({
          title: "Slug already exists",
          description: "Please use a different slug.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Failed to save post", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const tag = tagsInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagsInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const getBlogUrl = () => {
    if (!store) return "";
    return `${window.location.origin}/store/${store.slug}/blog/${slug || ""}`;
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) return null;

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
                onClick={() => navigate("/dashboard/appearance/blog")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-medium">
                {isNew ? "Add blog post" : "Edit blog post"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save as draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish blog
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
              {/* Main Content */}
              <div className="space-y-6">
                {/* Blog Post Card */}
                <Card className="shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-base font-medium">Blog post</h2>
                    
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a title to your blog"
                        className="h-11"
                      />
                    </div>

                    {/* Blog Link */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Blog link:</Label>
                      <div className="flex items-center gap-2">
                        {isSlugEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground truncate">
                              {window.location.origin}/store/{store.slug}/blog/
                            </span>
                            <Input
                              value={slug}
                              onChange={(e) => {
                                setSlug(e.target.value);
                                setAutoSlug(false);
                              }}
                              className="flex-1 h-9"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsSlugEditing(false)}
                            >
                              Done
                            </Button>
                          </div>
                        ) : (
                          <>
                            <a
                              href={getBlogUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                            >
                              {getBlogUrl()}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsSlugEditing(true)}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Content <span className="text-destructive">*</span>
                      </Label>
                      <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your blog post content here..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Card */}
                <Card className="shadow-sm">
                  <Collapsible open={isSeoOpen} onOpenChange={setIsSeoOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full p-6 text-left">
                        <div>
                          <h2 className="text-base font-medium">SEO</h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Optimize your product with meta tags to boost its visibility on search engines.
                          </p>
                        </div>
                        {isSeoOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="px-6 pb-6 pt-0 space-y-6">
                        {/* Title Tag */}
                        <div className="space-y-2">
                          <Label htmlFor="metaTitle" className="text-sm">Title Tag</Label>
                          <Input
                            id="metaTitle"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder="Enter title tag"
                            className="h-11"
                            maxLength={60}
                          />
                          <button className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Generate Title
                          </button>
                        </div>

                        {/* Meta Description */}
                        <div className="space-y-2">
                          <Label htmlFor="metaDescription" className="text-sm">Meta Description Tag</Label>
                          <Textarea
                            id="metaDescription"
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder="Enter description"
                            rows={3}
                            maxLength={160}
                          />
                          <button className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Generate Meta Description
                          </button>
                        </div>

                        {/* Social Sharing Preview */}
                        <div className="space-y-3">
                          <Label className="text-sm">Social sharing image preview</Label>
                          <div className="flex gap-4">
                            {/* OG Image Upload */}
                            <button
                              type="button"
                              onClick={() => setShowOgMediaPicker(true)}
                              className="w-40 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                              {ogImageUrl ? (
                                <img src={ogImageUrl} alt="OG" className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <>
                                  <Plus className="h-5 w-5" />
                                  <span className="text-xs">Add image</span>
                                  <span className="text-xs text-muted-foreground">(Recommended size : 1200 x 628 px)</span>
                                </>
                              )}
                            </button>
                            
                            {/* Preview Card */}
                            <div className="flex-1 border rounded-lg p-4 bg-muted/30">
                              <p className="font-medium text-muted-foreground">
                                {title || "Blog Title"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {getBlogUrl()}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-base font-medium">Blog information</h2>
                    
                    {/* Featured Image */}
                    <div className="space-y-2">
                      <Label className="text-sm">Featured Image</Label>
                      {featuredImageUrl ? (
                        <div className="relative group">
                          <img
                            src={featuredImageUrl}
                            alt="Featured"
                            className="w-full aspect-video object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => setFeaturedImageUrl("")}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowMediaPicker(true)}
                          className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus className="h-6 w-6" />
                          <span className="text-sm font-medium">Add Image</span>
                          <span className="text-xs">Recommended size (918px*483px)</span>
                        </button>
                      )}
                    </div>

                    {/* Author Name */}
                    <div className="space-y-2">
                      <Label htmlFor="authorName" className="text-sm">Author Name</Label>
                      <Input
                        id="authorName"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Add author name"
                        className="h-11"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label className="text-sm">Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="Add tag"
                          className="h-10"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button variant="outline" onClick={addTag} size="sm">
                          Add
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="gap-1 pr-1"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background p-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            Save as draft
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            Publish blog
          </Button>
        </div>
      </main>

      {/* Media Picker for Featured Image */}
      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={(url) => {
          setFeaturedImageUrl(url);
          setShowMediaPicker(false);
        }}
        accept="images"
      />

      {/* Media Picker for OG Image */}
      <MediaPicker
        open={showOgMediaPicker}
        onOpenChange={setShowOgMediaPicker}
        onSelect={(url) => {
          setOgImageUrl(url);
          setShowOgMediaPicker(false);
        }}
        accept="images"
      />
    </div>
  );
}
