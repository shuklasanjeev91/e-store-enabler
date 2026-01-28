import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, GlobeLock } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SetupWizard from "@/components/dashboard/SetupWizard";
import { formatCurrency } from "@/lib/currency";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  status: string;
  currency: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        navigate("/onboarding");
        return;
      }

      setStore(storeData);

      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("store_id", storeData.id);

      if (!countError && count !== null) {
        setProductCount(count);
      }
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setIsLoadingStore(false);
    }
  };

  const toggleStoreStatus = async () => {
    if (!store) return;
    
    setIsUpdatingStatus(true);
    const newStatus = store.status === "published" ? "draft" : "published";
    
    try {
      const { error } = await supabase
        .from("stores")
        .update({ status: newStatus })
        .eq("id", store.id);

      if (error) throw error;

      setStore({ ...store, status: newStatus });
      
      toast({
        title: newStatus === "published" ? "Store Published!" : "Store Unpublished",
        description: newStatus === "published" 
          ? "Your store is now live and visible to everyone."
          : "Your store is now hidden from public view.",
      });
    } catch (error) {
      console.error("Error updating store status:", error);
      toast({
        title: "Failed to update status",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
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

  const isPublished = store.status === "published";

  const setupSteps = [
    {
      id: "store-ready",
      title: "Your e-commerce store is ready!",
      description: "Congratulations! Your e-commerce store is now live.",
      completed: true,
      link: {
        label: "Visit store",
        href: `/store/${store.slug}`,
      },
    },
    {
      id: "add-product",
      title: "Add your first product",
      description: "Start adding products to your online store now!",
      completed: productCount > 0,
      action: {
        label: "Add product",
        onClick: () => navigate("/dashboard/products/new"),
      },
    },
    {
      id: "setup-payments",
      title: "Set up payments",
      description: "Configure your payment methods to start accepting orders.",
      completed: false,
      action: {
        label: "Set up payments",
        onClick: () => navigate("/dashboard/settings/payments"),
      },
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      {/* Main content */}
      <main className="lg:pl-56 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Store Status Toggle */}
          <div className="mb-6 flex items-center justify-between rounded-xl border bg-background p-4">
            <div className="flex items-center gap-3">
              {isPublished ? (
                <Globe className="h-5 w-5 text-emerald-500" />
              ) : (
                <GlobeLock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {isPublished ? "Store is Live" : "Store is Hidden"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPublished
                    ? "Your store is visible to everyone"
                    : "Only you can see your store"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isPublished ? "text-emerald-500" : "text-muted-foreground"}`}>
                {isPublished ? "Published" : "Draft"}
              </span>
              <Switch
                checked={isPublished}
                onCheckedChange={toggleStoreStatus}
                disabled={isUpdatingStatus}
              />
            </div>
          </div>

          <SetupWizard steps={setupSteps} storeName={store.name} />

          {/* Quick stats - using store currency */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-background p-6">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(0, store.currency)}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-6">
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="mt-2 text-2xl font-bold">0</p>
            </div>
            <div className="rounded-xl border bg-background p-6">
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="mt-2 text-2xl font-bold">{productCount}</p>
            </div>
            <div className="rounded-xl border bg-background p-6">
              <p className="text-sm text-muted-foreground">Customers</p>
              <p className="mt-2 text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
