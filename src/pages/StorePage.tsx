import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store, FileText, ArrowLeft } from "lucide-react";
import { getThemeLayout, type ThemeId } from "@/components/storefront/themes";
import MinimalPageLayout from "@/components/storefront/themes/layouts/MinimalPageLayout";
import BoldPageLayout from "@/components/storefront/themes/layouts/BoldPageLayout";
import ElegantPageLayout from "@/components/storefront/themes/layouts/ElegantPageLayout";
import ModernPageLayout from "@/components/storefront/themes/layouts/ModernPageLayout";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useStoreBranding } from "@/hooks/useStoreBranding";

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

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
}

export default function StorePage() {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { themeSettings } = useThemeSettings(store?.id ?? null);

  useStoreBranding({
    storeName: store?.name ?? null,
    storeDescription: store?.description,
    logoUrl: store?.logo_url,
    faviconUrl: themeSettings?.favicon_url,
    pageTitle: page?.meta_title || page?.title,
    pageDescription: page?.meta_description,
  });

  useEffect(() => {
    if (slug && pageSlug) {
      fetchData();
    }
  }, [slug, pageSlug]);

  const fetchData = async () => {
    try {
      // Fetch store
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

      // Fetch page
      const { data: pageData, error: pageError } = await supabase
        .from("pages")
        .select("*")
        .eq("store_id", storeData.id)
        .eq("slug", pageSlug)
        .eq("status", "published")
        .maybeSingle();

      if (pageError) throw pageError;

      if (!pageData) {
        setNotFound(true);
        return;
      }

      setPage(pageData);
    } catch (error) {
      console.error("Error fetching page:", error);
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

  if (notFound || !store || !page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate(`/store/${slug}`)}
          className="mt-4 flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </button>
      </div>
    );
  }

  // Get the layout type for the theme
  const layout = getThemeLayout(store.theme as ThemeId);
  const layoutProps = { store, page };

  switch (layout) {
    case "bold":
      return <BoldPageLayout {...layoutProps} />;
    case "elegant":
      return <ElegantPageLayout {...layoutProps} />;
    case "modern":
      return <ModernPageLayout {...layoutProps} />;
    case "minimal":
    default:
      return <MinimalPageLayout {...layoutProps} />;
  }
}
