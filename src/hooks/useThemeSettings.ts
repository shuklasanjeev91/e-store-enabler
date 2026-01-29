import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeSettings {
  id: string;
  store_id: string;
  background_mode: "light" | "dim" | "dark";
  font_family: string;
  favicon_url: string | null;
  show_store_name: boolean;
  show_featured_product: boolean;
  show_image_overlay: boolean;
  show_testimonials: boolean;
  show_brand_story: boolean;
  show_sticky_buy_button: boolean;
  show_add_to_bag_button: boolean;
  custom_css: string | null;
  primary_color: string | null;
  accent_color: string | null;
}

export interface Banner {
  id: string;
  store_id: string;
  image_url: string;
  link_url: string | null;
  device_type: "desktop" | "mobile";
  sort_order: number;
  is_active: boolean;
}

interface UseThemeSettingsReturn {
  themeSettings: ThemeSettings | null;
  banners: Banner[];
  isLoading: boolean;
}

export function useThemeSettings(storeId: string | null): UseThemeSettingsReturn {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      fetchThemeSettings();
      fetchBanners();
    }
  }, [storeId]);

  const fetchThemeSettings = async () => {
    if (!storeId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("store_theme_settings")
      .select("*")
      .eq("store_id", storeId)
      .maybeSingle();

    if (data) {
      setThemeSettings(data as ThemeSettings);
    }
    setIsLoading(false);
  };

  const fetchBanners = async () => {
    if (!storeId) return;

    const { data, error } = await supabase
      .from("store_banners")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("sort_order");

    if (data) {
      setBanners(data as Banner[]);
    }
  };

  return { themeSettings, banners, isLoading };
}

// Utility to get background colors based on mode
export function getBackgroundStyles(mode: "light" | "dim" | "dark") {
  switch (mode) {
    case "dark":
      return {
        background: "#0a0a0a",
        backgroundSecondary: "#141414",
        foreground: "#fafafa",
        foregroundMuted: "#a1a1aa",
        border: "#27272a",
      };
    case "dim":
      return {
        background: "#1a1a2e",
        backgroundSecondary: "#16213e",
        foreground: "#e4e4e7",
        foregroundMuted: "#9ca3af",
        border: "#374151",
      };
    case "light":
    default:
      return {
        background: "#ffffff",
        backgroundSecondary: "#f9fafb",
        foreground: "#111827",
        foregroundMuted: "#6b7280",
        border: "#e5e7eb",
      };
  }
}

// Font family CSS value mapping
export function getFontFamilyCSS(fontFamily: string): string {
  const fontMap: Record<string, string> = {
    "Inter": "'Inter', sans-serif",
    "Roboto": "'Roboto', sans-serif",
    "Poppins": "'Poppins', sans-serif",
    "Playfair Display": "'Playfair Display', serif",
    "Montserrat": "'Montserrat', sans-serif",
    "Open Sans": "'Open Sans', sans-serif",
    "Lato": "'Lato', sans-serif",
    "Nunito": "'Nunito', sans-serif",
    "Raleway": "'Raleway', sans-serif",
    "Source Sans Pro": "'Source Sans Pro', sans-serif",
    "Space Grotesk": "'Space Grotesk', sans-serif",
    "DM Sans": "'DM Sans', sans-serif",
  };
  return fontMap[fontFamily] || fontFamily;
}
