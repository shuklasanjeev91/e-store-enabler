import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store } from "lucide-react";
import MinimalTheme from "@/components/storefront/themes/MinimalTheme";
import BoldTheme from "@/components/storefront/themes/BoldTheme";
import ElegantTheme from "@/components/storefront/themes/ElegantTheme";
import ModernTheme from "@/components/storefront/themes/ModernTheme";
import { getThemeLayout, type ThemeId } from "@/components/storefront/themes";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  currency: string;
  status: string;
  theme: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  status: string;
}

export default function Storefront() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchStore();
    }
  }, [slug]);

  const fetchStore = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        setNotFound(true);
        return;
      }

      setStore(storeData);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeData.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!productsError && productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Store className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Store Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The store you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Get the layout type for the theme
  const layout = getThemeLayout(store.theme as ThemeId);
  const themeProps = { store, products };

  switch (layout) {
    case "bold":
      return <BoldTheme {...themeProps} />;
    case "elegant":
      return <ElegantTheme {...themeProps} />;
    case "modern":
      return <ModernTheme {...themeProps} />;
    case "minimal":
    default:
      return <MinimalTheme {...themeProps} />;
  }
}
