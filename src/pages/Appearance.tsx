import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, HelpCircle, Bell, Menu as MenuIcon } from "lucide-react";
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
        .eq("user_id", user!.id)
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
        {/* Page Header */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Themes</h1>
              <Button variant="outline" size="sm" className="gap-1.5">
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="p-6 lg:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              const isApplying = applyingTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-background transition-all",
                    isActive
                      ? "ring-2 ring-primary"
                      : "hover:shadow-lg"
                  )}
                >
                  {/* Preview Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={theme.preview}
                      alt={`${theme.name} theme preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Theme Info & Action */}
                  <div className="flex items-center justify-between p-4">
                    <h3 className="font-medium">{theme.name}</h3>

                    {isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/dashboard/appearance/customize")}
                        className="gap-1.5"
                      >
                        Customize
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => applyTheme(theme.id)}
                        disabled={isApplying}
                        className="gap-1.5 bg-primary hover:bg-primary/90"
                      >
                        {isApplying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Apply
                          </>
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
