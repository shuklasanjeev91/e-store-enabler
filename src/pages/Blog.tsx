import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  HelpCircle, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Blog() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      // Fetch blog posts
      const { data: postsData, error: postsError } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, status, featured_image_url, published_at, created_at, updated_at")
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
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

  const handleDeletePost = async () => {
    if (!deletePostId) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", deletePostId);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== deletePostId));
      toast({ title: "Blog post deleted" });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletePostId(null);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    const publishedAt = newStatus === "published" ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          status: newStatus,
          published_at: publishedAt,
        })
        .eq("id", post.id);

      if (error) throw error;

      setPosts(
        posts.map((p) =>
          p.id === post.id ? { ...p, status: newStatus, published_at: publishedAt } : p
        )
      );
      toast({
        title: newStatus === "published" ? "Post published" : "Post unpublished",
      });
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Failed to update post",
        variant: "destructive",
      });
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
              <h1 className="text-xl font-semibold">Blog</h1>
              <Button variant="outline" size="sm" className="gap-1.5">
                <HelpCircle className="h-4 w-4" />
                How it works
              </Button>
            </div>
            {posts.length > 0 && (
              <Button 
                className="gap-2"
                onClick={() => navigate("/dashboard/appearance/blog/new")}
              >
                <Plus className="h-4 w-4" />
                Add blog post
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              {/* Blog Illustration */}
              <div className="mb-8 relative">
                <div className="w-40 h-32 rounded-xl bg-primary flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-3 left-3 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-4 w-28">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">A</span>
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-white/50 rounded w-full" />
                        <div className="h-1.5 bg-white/50 rounded w-3/4" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-white/30 rounded" />
                      <div className="h-1.5 bg-white/30 rounded w-5/6" />
                      <div className="h-1.5 bg-white/30 rounded" />
                      <div className="h-1.5 bg-white/30 rounded w-4/6" />
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="mb-2 text-xl font-semibold text-center">
                Create blog posts to attract more visitors
              </h2>
              <p className="mb-6 max-w-md text-center text-muted-foreground">
                Engage your visitors by sharing your expertise and stories
                about your brand.
              </p>
              <Button 
                className="gap-2"
                onClick={() => navigate("/dashboard/appearance/blog/new")}
              >
                Add blog post
              </Button>
              <button className="mt-4 text-sm text-primary hover:underline">
                Learn more about blogs
              </button>
            </div>
          ) : (
            <div className="rounded-xl border bg-background overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 px-6 py-3 text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Title</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Posts List */}
              <div className="divide-y">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground truncate">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge
                        variant={post.status === "published" ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(post)}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {post.published_at
                        ? format(new Date(post.published_at), "MMM d, yyyy")
                        : format(new Date(post.created_at), "MMM d, yyyy")}
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/dashboard/appearance/blog/${post.id}`)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {post.status === "published" && (
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  `/store/${store.slug}/blog/${post.slug}`,
                                  "_blank"
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletePostId(post.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog
              post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
