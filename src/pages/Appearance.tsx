import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Check,
  ExternalLink,
  Shirt,
  ShoppingBasket,
  Smartphone,
  BookOpen,
  Baby,
  Leaf,
  Gem,
  Sofa,
  Sparkles,
  Dumbbell,
  PawPrint,
  Car,
  HeartPulse,
  Palette,
  Flower,
  Plane,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  THEMES,
  THEME_CATEGORIES,
  getThemesByCategory,
  type ThemeId,
  type CategoryId,
} from "@/components/storefront/themes";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  status: string;
  currency: string;
  theme: string;
}

const categoryIcons: Record<CategoryId, React.ElementType> = {
  fashion: Shirt,
  grocery: ShoppingBasket,
  electronics: Smartphone,
  books: BookOpen,
  kids: Baby,
  ayurvedic: Leaf,
  jewelry: Gem,
  home: Sofa,
  beauty: Sparkles,
  sports: Dumbbell,
  pets: PawPrint,
  automotive: Car,
  health: HeartPulse,
  art: Palette,
  garden: Flower,
  travel: Plane,
};

export default function Appearance() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [applyingTheme, setApplyingTheme] = useState<ThemeId | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("fashion");

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
      const themeName = THEMES.find((t) => t.id === themeId)?.name;
      toast({
        title: "Theme applied!",
        description: `Your store now uses the ${themeName} theme.`,
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Themes</h1>
            <p className="mt-1 text-muted-foreground">
              Choose a theme for your storefront by category.
            </p>
          </div>

          {/* Category Tabs */}
          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as CategoryId)}
            className="w-full"
          >
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="mb-6 inline-flex h-auto gap-2 bg-transparent p-0">
                {THEME_CATEGORIES.map((category) => {
                  const Icon = categoryIcons[category.id];
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">{category.name.split(" ")[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {THEME_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {getThemesByCategory(category.id).map((theme) => {
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
                            src={theme.preview}
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
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold">{theme.name}</h3>
                            <p className="truncate text-xs text-muted-foreground">
                              {theme.description}
                            </p>
                          </div>

                          {isActive ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="ml-2 shrink-0"
                              onClick={() => navigate("/dashboard/appearance/customize")}
                            >
                              Customize
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => applyTheme(theme.id)}
                              disabled={isApplying}
                              className="ml-2 shrink-0"
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
