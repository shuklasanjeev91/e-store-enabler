import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, ExternalLink } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeId } from "@/components/storefront/themes";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  status: string;
  currency: string;
  theme: string;
}

const themePreviewImages: Record<ThemeId, string> = {
  minimal: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
  bold: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
  elegant: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  modern: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop",
};

export default function Appearance() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [applyingTheme, setApplyingTheme] = useState<ThemeId | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStore();
    }
  }, [user]);

  const fetchStore = async () => {
    try {
      const { data: storeData, error } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setIsLoadingStore(false);
    }
  };

  const applyTheme = async (themeId: ThemeId) => {
    if (!store) return;
    
    setApplyingTheme(themeId);
    try {
      const { error } = await supabase
        .from("stores")
        .update({ theme: themeId })
        .eq("id", store.id);

      if (error) throw error;

      setStore({ ...store, theme: themeId });
      toast({
        title: "Theme applied!",
        description: `Your store now uses the ${THEMES.find(t => t.id === themeId)?.name} theme.`,
      });
    } catch (error) {
      console.error("Error applying theme:", error);
      toast({
        title: "Failed to apply theme",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplyingTheme(null);
    }
  };

  if (isLoading || isLoadingStore) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return null;
  }

  const currentTheme = store.theme as ThemeId;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Themes</h1>
            <p className="mt-1 text-muted-foreground">
              Choose a theme for your storefront. You can change this anytime.
            </p>
          </div>

          {/* Theme Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              const isApplying = applyingTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 bg-background transition-all",
                    isActive
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                      <Check className="h-3 w-3" />
                      Active
                    </div>
                  )}

                  {/* Preview Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={themePreviewImages[theme.id]}
                      alt={`${theme.name} theme preview`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Preview overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <a
                        href={`/store/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-transform hover:scale-105"
                      >
                        Preview store
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Theme Info & Action */}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{theme.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>
                    
                    {isActive ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                      >
                        Customize
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => applyTheme(theme.id)}
                        disabled={isApplying}
                        className="shrink-0"
                      >
                        {isApplying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
