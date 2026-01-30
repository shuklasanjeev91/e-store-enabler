import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, HelpCircle, Plus } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
}

export default function Blog() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
      // Blog posts table doesn't exist yet, so we'll show empty state
      setPosts([]);
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
              <Button className="gap-2">
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
                  {/* Document decoration dots */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                  
                  {/* Document content */}
                  <div className="bg-white/20 rounded-lg p-4 w-28">
                    {/* Large A letter */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">A</span>
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-white/50 rounded w-full" />
                        <div className="h-1.5 bg-white/50 rounded w-3/4" />
                      </div>
                    </div>
                    {/* Text lines */}
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
              <Button className="gap-2">
                Add blog post
              </Button>
              <button className="mt-4 text-sm text-primary hover:underline">
                Learn more about blogs
              </button>
            </div>
          ) : (
            <div className="rounded-xl border bg-background">
              {/* Blog posts table would go here */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
