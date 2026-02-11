import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  Plus,
  X,
  Image as ImageIcon,
  Upload,
  Trash2,
  Palette,
  Type,
  Layout,
  ImagePlus,
  ToggleLeft,
  MessageSquareQuote,
  FileText,
  Code,
  Megaphone,
  PanelTop,
  Mail,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSectionContent, type TestimonialItem } from "@/hooks/useSectionContent";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  logo_url: string | null;
  theme: string;
  og_image_url: string | null;
}

interface ThemeSettings {
  id?: string;
  store_id: string;
  background_mode: "light" | "dim" | "dark";
  show_store_name: boolean;
  favicon_url: string | null;
  show_featured_product: boolean;
  show_image_overlay: boolean;
  show_testimonials: boolean;
  show_brand_story: boolean;
  font_family: string;
  show_add_to_bag_button: boolean;
  custom_css: string | null;
  show_sticky_buy_button: boolean;
  primary_color: string | null;
  accent_color: string | null;
}

interface Banner {
  id: string;
  store_id: string;
  device_type: "mobile" | "desktop";
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Nunito", label: "Nunito" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
];

const defaultSettings: Omit<ThemeSettings, "store_id"> = {
  background_mode: "light",
  show_store_name: true,
  favicon_url: null,
  show_featured_product: false,
  show_image_overlay: false,
  show_testimonials: false,
  show_brand_story: false,
  font_family: "Inter",
  show_add_to_bag_button: true,
  custom_css: null,
  show_sticky_buy_button: false,
  primary_color: null,
  accent_color: null,
};

const COLOR_PRESETS = [
  { name: "Teal", primary: "#0891b2", accent: "#ea580c" },
  { name: "Violet", primary: "#7c3aed", accent: "#f97316" },
  { name: "Rose", primary: "#e11d48", accent: "#0ea5e9" },
  { name: "Emerald", primary: "#059669", accent: "#f59e0b" },
  { name: "Blue", primary: "#2563eb", accent: "#ec4899" },
  { name: "Amber", primary: "#d97706", accent: "#6366f1" },
  { name: "Indigo", primary: "#4f46e5", accent: "#10b981" },
  { name: "Slate", primary: "#475569", accent: "#f43f5e" },
];

export default function CustomizeTheme() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("background");
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [mobileBanners, setMobileBanners] = useState<Banner[]>([]);
  const [desktopBanners, setDesktopBanners] = useState<Banner[]>([]);
  const [bannerTab, setBannerTab] = useState<"active" | "previously">("active");

  const { sectionContent, updateSection, saveAllSections } = useSectionContent(store?.id ?? null);

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
      await fetchSettings(storeData.id);
      await fetchBanners(storeData.id);
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setIsLoadingStore(false);
    }
  };

  const fetchSettings = async (storeId: string) => {
    const { data, error } = await supabase
      .from("store_theme_settings")
      .select("*")
      .eq("store_id", storeId)
      .maybeSingle();

    if (data) {
      setSettings(data as ThemeSettings);
    } else {
      // Create default settings
      setSettings({ ...defaultSettings, store_id: storeId });
    }
  };

  const fetchBanners = async (storeId: string) => {
    const { data, error } = await supabase
      .from("store_banners")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("sort_order");

    if (data) {
      const banners = data as unknown as Banner[];
      setMobileBanners(banners.filter((b) => b.device_type === "mobile"));
      setDesktopBanners(banners.filter((b) => b.device_type === "desktop"));
    }
  };

  const updateSettings = (updates: Partial<ThemeSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  const handleSave = async () => {
    if (!settings || !store) return;

    setIsSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from("store_theme_settings")
          .update({
            background_mode: settings.background_mode,
            show_store_name: settings.show_store_name,
            favicon_url: settings.favicon_url,
            show_featured_product: settings.show_featured_product,
            show_image_overlay: settings.show_image_overlay,
            show_testimonials: settings.show_testimonials,
            show_brand_story: settings.show_brand_story,
            font_family: settings.font_family,
            show_add_to_bag_button: settings.show_add_to_bag_button,
            custom_css: settings.custom_css,
            show_sticky_buy_button: settings.show_sticky_buy_button,
            primary_color: settings.primary_color,
            accent_color: settings.accent_color,
          })
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("store_theme_settings")
          .insert({
            store_id: store.id,
            background_mode: settings.background_mode,
            show_store_name: settings.show_store_name,
            favicon_url: settings.favicon_url,
            show_featured_product: settings.show_featured_product,
            show_image_overlay: settings.show_image_overlay,
            show_testimonials: settings.show_testimonials,
            show_brand_story: settings.show_brand_story,
            font_family: settings.font_family,
            show_add_to_bag_button: settings.show_add_to_bag_button,
            custom_css: settings.custom_css,
            show_sticky_buy_button: settings.show_sticky_buy_button,
            primary_color: settings.primary_color,
            accent_color: settings.accent_color,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setSettings(data as ThemeSettings);
      }

      // Also save section content
      await saveAllSections();

      toast({
        title: "Settings saved!",
        description: "Your theme customizations have been applied.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${store.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("page-images")
        .getPublicUrl(fileName);

      await supabase
        .from("stores")
        .update({ logo_url: urlData.publicUrl })
        .eq("id", store.id);

      setStore({ ...store, logo_url: urlData.publicUrl });
      toast({ title: "Logo updated!" });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${store.id}/favicon.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("page-images")
        .getPublicUrl(fileName);

      updateSettings({ favicon_url: urlData.publicUrl });
      toast({ title: "Favicon uploaded! Click Update to save." });
    } catch (error) {
      console.error("Error uploading favicon:", error);
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${store.id}/og-image.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("page-images")
        .getPublicUrl(fileName);

      await supabase
        .from("stores")
        .update({ og_image_url: urlData.publicUrl })
        .eq("id", store.id);

      setStore({ ...store, og_image_url: urlData.publicUrl });
      toast({ title: "Social share image updated!" });
    } catch (error) {
      console.error("Error uploading OG image:", error);
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const handleRemoveOgImage = async () => {
    if (!store) return;
    try {
      await supabase
        .from("stores")
        .update({ og_image_url: null })
        .eq("id", store.id);

      setStore({ ...store, og_image_url: null });
      toast({ title: "Social share image removed" });
    } catch (error) {
      console.error("Error removing OG image:", error);
    }
  };

  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    deviceType: "mobile" | "desktop"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${store.id}/banners/${deviceType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("page-images")
        .getPublicUrl(fileName);

      const { data: bannerData, error: insertError } = await supabase
        .from("store_banners")
        .insert({
          store_id: store.id,
          device_type: deviceType,
          image_url: urlData.publicUrl,
          sort_order: deviceType === "mobile" ? mobileBanners.length : desktopBanners.length,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (bannerData) {
        if (deviceType === "mobile") {
          setMobileBanners([...mobileBanners, bannerData as Banner]);
        } else {
          setDesktopBanners([...desktopBanners, bannerData as Banner]);
        }
      }

      toast({ title: "Banner added!" });
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const removeBanner = async (bannerId: string, deviceType: "mobile" | "desktop") => {
    try {
      await supabase.from("store_banners").delete().eq("id", bannerId);

      if (deviceType === "mobile") {
        setMobileBanners(mobileBanners.filter((b) => b.id !== bannerId));
      } else {
        setDesktopBanners(desktopBanners.filter((b) => b.id !== bannerId));
      }

      toast({ title: "Banner removed" });
    } catch (error) {
      console.error("Error removing banner:", error);
    }
  };

  if (isLoading || isLoadingStore) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store || !settings) return null;

  const sections = [
    { id: "background", label: "Background", icon: Palette, group: "Design" },
    { id: "colors", label: "Colors", icon: Palette, group: "Design" },
    { id: "fonts", label: "Typography", icon: Type, group: "Design" },
    { id: "header", label: "Header & Branding", icon: PanelTop, group: "Layout" },
    { id: "banners", label: "Banners", icon: ImagePlus, group: "Layout" },
    { id: "sections", label: "Section Visibility", icon: ToggleLeft, group: "Layout" },
    { id: "hero-content", label: "Hero Section", icon: Layout, group: "Content" },
    { id: "brand-story-content", label: "Brand Story", icon: FileText, group: "Content" },
    { id: "testimonials-content", label: "Testimonials", icon: MessageSquareQuote, group: "Content" },
    { id: "newsletter-content", label: "Newsletter", icon: Mail, group: "Content" },
    { id: "footer-content", label: "Footer", icon: Megaphone, group: "Content" },
    { id: "advanced", label: "Advanced", icon: Code, group: "Advanced" },
  ];

  const sectionGroups = ["Design", "Layout", "Content", "Advanced"];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar storeName={store.name} storeSlug={store.slug} />

      <main className="lg:pl-56 pt-14 lg:pt-0">
        {/* Page Header */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/appearance">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Customize Theme</h1>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <span className="hidden sm:inline">How it works</span>
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`/store/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  Preview
                </Button>
              </a>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar Navigation - Shopify-style grouped */}
            <Card className="h-fit sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Theme Editor
                </CardTitle>
                <CardDescription className="text-xs">
                  {store.theme.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <nav className="flex flex-col">
                  {sectionGroups.map((group) => (
                    <div key={group}>
                      <div className="px-6 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        {group}
                      </div>
                      {sections.filter(s => s.group === group).map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                              "flex w-full items-center gap-3 px-6 py-2.5 text-sm transition-colors",
                              activeSection === section.id
                                ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {section.label}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Content Panel */}
            <Card>
              <CardContent className="p-6">
                {/* Background Section */}
                {activeSection === "background" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Choose your background mode</h2>
                      <p className="text-sm text-muted-foreground">
                        Select background color for your website.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {(["light", "dim", "dark"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateSettings({ background_mode: mode })}
                          className={cn(
                            "relative overflow-hidden rounded-lg border-2 p-1 transition-all",
                            settings.background_mode === mode
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-muted-foreground/50"
                          )}
                        >
                          <div
                            className={cn(
                              "aspect-[4/3] rounded overflow-hidden",
                              mode === "light" && "bg-white",
                              mode === "dim" && "bg-zinc-200",
                              mode === "dark" && "bg-zinc-900"
                            )}
                          >
                            <div className="p-3">
                              <div
                                className={cn(
                                  "h-2 w-8 rounded",
                                  mode === "dark" ? "bg-zinc-700" : "bg-zinc-300"
                                )}
                              />
                              <div className="mt-2 grid grid-cols-4 gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "aspect-square rounded-sm",
                                      mode === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border-2",
                                settings.background_mode === mode
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/30"
                              )}
                            >
                              {settings.background_mode === mode && (
                                <div className="h-full w-full flex items-center justify-center">
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium capitalize">{mode}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors Section */}
                {activeSection === "colors" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Color palette</h2>
                      <p className="text-sm text-muted-foreground">
                        Customize your store's primary and accent colors to match your brand identity.
                      </p>
                    </div>

                    {/* Color Presets */}
                    <div className="space-y-3">
                      <Label>Quick presets</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => updateSettings({ 
                              primary_color: preset.primary, 
                              accent_color: preset.accent 
                            })}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary/50",
                              settings.primary_color === preset.primary && settings.accent_color === preset.accent
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border"
                            )}
                          >
                            <div className="flex gap-1">
                              <div 
                                className="h-6 w-6 rounded-full border"
                                style={{ backgroundColor: preset.primary }}
                              />
                              <div 
                                className="h-6 w-6 rounded-full border"
                                style={{ backgroundColor: preset.accent }}
                              />
                            </div>
                            <span className="text-xs font-medium">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Color */}
                    <div className="space-y-3">
                      <Label>Primary color</Label>
                      <p className="text-xs text-muted-foreground">
                        Used for buttons, links, and interactive elements.
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            value={settings.primary_color || "#0891b2"}
                            onChange={(e) => updateSettings({ primary_color: e.target.value })}
                            className="h-12 w-12 cursor-pointer rounded-lg border-2 border-border"
                          />
                        </div>
                        <Input
                          value={settings.primary_color || "#0891b2"}
                          onChange={(e) => updateSettings({ primary_color: e.target.value })}
                          placeholder="#0891b2"
                          className="w-32 font-mono uppercase"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateSettings({ primary_color: null })}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-3">
                      <Label>Accent color</Label>
                      <p className="text-xs text-muted-foreground">
                        Used for highlights, badges, and notifications.
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            value={settings.accent_color || "#ea580c"}
                            onChange={(e) => updateSettings({ accent_color: e.target.value })}
                            className="h-12 w-12 cursor-pointer rounded-lg border-2 border-border"
                          />
                        </div>
                        <Input
                          value={settings.accent_color || "#ea580c"}
                          onChange={(e) => updateSettings({ accent_color: e.target.value })}
                          placeholder="#ea580c"
                          className="w-32 font-mono uppercase"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateSettings({ accent_color: null })}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-3">
                      <Label>Preview</Label>
                      <div className="rounded-lg border p-6">
                        <div className="flex flex-wrap gap-4">
                          <button
                            className="rounded-lg px-6 py-2.5 font-medium text-white transition-all"
                            style={{ backgroundColor: settings.primary_color || "#0891b2" }}
                          >
                            Primary Button
                          </button>
                          <button
                            className="rounded-lg border-2 px-6 py-2.5 font-medium transition-all"
                            style={{ 
                              borderColor: settings.primary_color || "#0891b2",
                              color: settings.primary_color || "#0891b2"
                            }}
                          >
                            Outline Button
                          </button>
                          <span
                            className="rounded-full px-3 py-1 text-sm font-medium text-white"
                            style={{ backgroundColor: settings.accent_color || "#ea580c" }}
                          >
                            Sale Badge
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <a
                            href="#"
                            className="text-sm font-medium underline-offset-4 hover:underline"
                            style={{ color: settings.primary_color || "#0891b2" }}
                          >
                            Shop now →
                          </a>
                          <span
                            className="text-sm"
                            style={{ color: settings.accent_color || "#ea580c" }}
                          >
                            ★ 4.9 rating
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header & Favicon Section */}
                {activeSection === "header" && (
                  <div className="space-y-8">
                    {/* Store Logo */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Store logo</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                          {store.logo_url ? (
                            <img
                              src={store.logo_url}
                              alt="Store logo"
                              className="h-full w-full object-contain rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <label htmlFor="logo-upload">
                            <Button variant="outline" asChild>
                              <span>
                                <Upload className="mr-2 h-4 w-4" />
                                Update image
                              </span>
                            </Button>
                          </label>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Show Store Name */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h3 className="font-medium">Show store name</h3>
                        <p className="text-sm text-muted-foreground">
                          Show store name alongside the store logo in the navigation bar
                        </p>
                      </div>
                      <Switch
                        checked={settings.show_store_name}
                        onCheckedChange={(checked) =>
                          updateSettings({ show_store_name: checked })
                        }
                      />
                    </div>

                    {/* Favicon */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Favicon</h3>
                        <p className="text-sm text-muted-foreground">
                          Favicon should be a square and at least 48px × 48px. It appears in browser tabs and bookmarks.
                        </p>
                      </div>
                      <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="rounded-lg border bg-muted p-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="flex gap-1">
                              <span className="h-3 w-3 rounded-full bg-red-500" />
                              <span className="h-3 w-3 rounded-full bg-yellow-500" />
                              <span className="h-3 w-3 rounded-full bg-green-500" />
                            </span>
                            {settings.favicon_url ? (
                              <img src={settings.favicon_url} alt="Favicon" className="h-4 w-4 object-contain" />
                            ) : store.logo_url ? (
                              <img src={store.logo_url} alt="Favicon" className="h-4 w-4 object-contain" />
                            ) : null}
                            <span className="text-muted-foreground">
                              {store.name} - Online Store
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed bg-muted overflow-hidden">
                          {settings.favicon_url ? (
                            <img src={settings.favicon_url} alt="Favicon" className="h-full w-full object-contain" />
                          ) : store.logo_url ? (
                            <img src={store.logo_url} alt="Favicon fallback" className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-lg font-bold text-primary">{store.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label htmlFor="favicon-upload">
                            <Button variant="outline" asChild>
                              <span>
                                <Upload className="mr-2 h-4 w-4" />
                                {settings.favicon_url ? "Change favicon" : "Upload favicon"}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="favicon-upload"
                            type="file"
                            accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
                            className="hidden"
                            onChange={handleFaviconUpload}
                          />
                          {settings.favicon_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSettings({ favicon_url: null })}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                      {!settings.favicon_url && store.logo_url && (
                        <p className="text-xs text-muted-foreground">
                          Currently using your store logo as favicon. Upload a custom favicon for best results.
                        </p>
                      )}
                    </div>

                    {/* OG Social Share Image */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Social share image (OG Image)</h3>
                        <p className="text-sm text-muted-foreground">
                          This image appears when your store link is shared on social media (Facebook, Twitter, WhatsApp, etc.). Recommended size: 1200×630px.
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex h-[105px] w-[200px] items-center justify-center rounded-lg border-2 border-dashed bg-muted overflow-hidden shrink-0">
                          {store.og_image_url ? (
                            <img src={store.og_image_url} alt="OG Image" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                              <ImageIcon className="h-6 w-6" />
                              <span className="text-xs">1200 × 630</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="og-image-upload">
                            <Button variant="outline" asChild>
                              <span>
                                <Upload className="mr-2 h-4 w-4" />
                                {store.og_image_url ? "Change image" : "Upload image"}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="og-image-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleOgImageUpload}
                          />
                          {store.og_image_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-fit"
                              onClick={handleRemoveOgImage}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banners Section */}
                {activeSection === "banners" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Promotional banners</h2>
                      <p className="text-sm text-muted-foreground">
                        Grab your store visitor's attention by promotional banners displayed
                        on top of your homepage.
                      </p>
                    </div>

                    <Tabs value={bannerTab} onValueChange={(v) => setBannerTab(v as "active" | "previously")}>
                      <TabsList>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="previously">Previously used</TabsTrigger>
                      </TabsList>

                      <TabsContent value="active" className="mt-6 space-y-6">
                        {/* Mobile Banners */}
                        <div className="space-y-3">
                          <h3 className="font-medium">For Mobile ({mobileBanners.length}/6)</h3>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {mobileBanners.map((banner) => (
                              <div
                                key={banner.id}
                                className="group relative aspect-[9/16] overflow-hidden rounded-lg border bg-muted"
                              >
                                <img
                                  src={banner.image_url}
                                  alt="Banner"
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  onClick={() => removeBanner(banner.id, "mobile")}
                                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {mobileBanners.length < 6 && (
                              <label className="flex aspect-[9/16] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary hover:bg-primary/5">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                                <span className="mt-2 text-sm text-muted-foreground">
                                  Add mobile banner
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleBannerUpload(e, "mobile")}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Desktop Banners */}
                        <div className="space-y-3">
                          <h3 className="font-medium">For Desktop ({desktopBanners.length}/6)</h3>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {desktopBanners.map((banner) => (
                              <div
                                key={banner.id}
                                className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
                              >
                                <img
                                  src={banner.image_url}
                                  alt="Banner"
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  onClick={() => removeBanner(banner.id, "desktop")}
                                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {desktopBanners.length < 6 && (
                              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary hover:bg-primary/5">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                                <span className="mt-2 text-sm text-muted-foreground">
                                  Add desktop banner
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleBannerUpload(e, "desktop")}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="previously">
                        <div className="py-8 text-center text-muted-foreground">
                          No previously used banners
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Sections */}
                {activeSection === "sections" && (
                  <div className="space-y-4">
                    <SettingToggle
                      title="Featured product"
                      description="Make your best product standout with this section."
                      checked={settings.show_featured_product}
                      onCheckedChange={(checked) =>
                        updateSettings({ show_featured_product: checked })
                      }
                    />
                    <SettingToggle
                      title="Image with overlay"
                      description="Upload photos of your business, products, or offerings for customers to see."
                      checked={settings.show_image_overlay}
                      onCheckedChange={(checked) =>
                        updateSettings({ show_image_overlay: checked })
                      }
                    />
                    <SettingToggle
                      title="Customer testimonials"
                      description="Build trust among new buyers with testimonials from your existing customers."
                      checked={settings.show_testimonials}
                      onCheckedChange={(checked) =>
                        updateSettings({ show_testimonials: checked })
                      }
                    />
                    <SettingToggle
                      title="Brand story"
                      description="Use this section to share information about your brand, products, categories, etc with your customers."
                      checked={settings.show_brand_story}
                      onCheckedChange={(checked) =>
                        updateSettings({ show_brand_story: checked })
                      }
                    />
                  </div>
                )}

                {/* Hero Content Section */}
                {activeSection === "hero-content" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Hero Section</h2>
                      <p className="text-sm text-muted-foreground">
                        Customize the main heading, subheading, and call-to-action buttons on your storefront homepage.
                      </p>
                    </div>

                    {/* Hero Background Image Upload */}
                    <div className="space-y-3">
                      <Label>Hero background image</Label>
                      <p className="text-xs text-muted-foreground">
                        Upload a full-width hero image (recommended 1920×800px). This creates a Shopify-style full-bleed hero section.
                      </p>
                      <div className="relative aspect-[21/9] overflow-hidden rounded-lg border-2 border-dashed bg-muted">
                        {sectionContent.hero.background_image ? (
                          <>
                            <img src={sectionContent.hero.background_image} alt="Hero" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <div className="flex gap-2">
                                <label htmlFor="hero-bg-upload">
                                  <Button variant="secondary" size="sm" asChild>
                                    <span><Upload className="mr-2 h-3 w-3" />Change</span>
                                  </Button>
                                </label>
                                <Button variant="destructive" size="sm" onClick={() => updateSection("hero", { background_image: "" })}>
                                  <Trash2 className="mr-2 h-3 w-3" />Remove
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <label htmlFor="hero-bg-upload" className="flex h-full cursor-pointer flex-col items-center justify-center gap-2">
                            <ImagePlus className="h-10 w-10 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Click to upload hero image</span>
                            <span className="text-xs text-muted-foreground/60">1920×800px recommended</span>
                          </label>
                        )}
                        <input
                          id="hero-bg-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !store) return;
                            try {
                              const fileExt = file.name.split(".").pop();
                              const fileName = `${store.id}/hero-bg.${fileExt}`;
                              await supabase.storage.from("page-images").upload(fileName, file, { upsert: true });
                              const { data: urlData } = supabase.storage.from("page-images").getPublicUrl(fileName);
                              updateSection("hero", { background_image: urlData.publicUrl });
                              toast({ title: "Hero image uploaded! Click Update to save." });
                            } catch (error) {
                              toast({ title: "Upload failed", variant: "destructive" });
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Heading</Label>
                        <Input
                          placeholder={store.name}
                          value={sectionContent.hero.heading || ""}
                          onChange={(e) => updateSection("hero", { heading: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Leave empty to use your store name</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Subheading</Label>
                        <Textarea
                          placeholder={store.description || "Describe your store..."}
                          value={sectionContent.hero.subheading || ""}
                          onChange={(e) => updateSection("hero", { subheading: e.target.value })}
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground">Leave empty to use your store description</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Primary button text</Label>
                          <Input
                            placeholder="Shop Now"
                            value={sectionContent.hero.cta_text || ""}
                            onChange={(e) => updateSection("hero", { cta_text: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Announcement bar text</Label>
                          <Input
                            placeholder="Free shipping on orders over $50"
                            value={sectionContent.hero.cta_secondary_text || ""}
                            onChange={(e) => updateSection("hero", { cta_secondary_text: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">Shows as a top announcement bar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}



                {/* Brand Story Content Section */}
                {activeSection === "brand-story-content" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Brand Story</h2>
                      <p className="text-sm text-muted-foreground">
                        Share your brand's story with customers. Enable the "Brand story" toggle in the Sections panel to display this.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section title</Label>
                        <Input
                          placeholder="Our Story"
                          value={sectionContent.brand_story.title || ""}
                          onChange={(e) => updateSection("brand_story", { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Story content</Label>
                        <Textarea
                          placeholder="We are passionate about bringing you the best products..."
                          value={sectionContent.brand_story.content || ""}
                          onChange={(e) => updateSection("brand_story", { content: e.target.value })}
                          className="min-h-[150px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Testimonials Content Section */}
                {activeSection === "testimonials-content" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Customer Testimonials</h2>
                      <p className="text-sm text-muted-foreground">
                        Add real customer testimonials to build trust. Enable the "Customer testimonials" toggle in Sections to display these.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Section title</Label>
                      <Input
                        placeholder="What Our Customers Say"
                        value={sectionContent.testimonials.title || ""}
                        onChange={(e) => updateSection("testimonials", { title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4">
                      {(sectionContent.testimonials.items || []).map((item, index) => (
                        <div key={index} className="rounded-lg border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Testimonial {index + 1}</span>
                            {(sectionContent.testimonials.items || []).length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const items = [...(sectionContent.testimonials.items || [])];
                                  items.splice(index, 1);
                                  updateSection("testimonials", { items });
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Customer name</Label>
                            <Input
                              placeholder="Jane Doe"
                              value={item.name}
                              onChange={(e) => {
                                const items = [...(sectionContent.testimonials.items || [])];
                                items[index] = { ...items[index], name: e.target.value };
                                updateSection("testimonials", { items });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Review text</Label>
                            <Textarea
                              placeholder="This store has the best products..."
                              value={item.text}
                              onChange={(e) => {
                                const items = [...(sectionContent.testimonials.items || [])];
                                items[index] = { ...items[index], text: e.target.value };
                                updateSection("testimonials", { items });
                              }}
                              className="min-h-[60px]"
                            />
                          </div>
                        </div>
                      ))}
                      {(sectionContent.testimonials.items || []).length < 6 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const items = [...(sectionContent.testimonials.items || [])];
                            items.push({ name: "", text: "", rating: 5 });
                            updateSection("testimonials", { items });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Testimonial
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Content Section */}
                {activeSection === "footer-content" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Footer Content</h2>
                      <p className="text-sm text-muted-foreground">
                        Customize contact information and text displayed in your store's footer.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Store tagline</Label>
                        <Input
                          placeholder="Your favorite online store"
                          value={sectionContent.footer.tagline || ""}
                          onChange={(e) => updateSection("footer", { tagline: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Leave empty to use your store description</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Contact email</Label>
                          <Input
                            placeholder={`support@${store.slug}.com`}
                            value={sectionContent.footer.contact_email || ""}
                            onChange={(e) => updateSection("footer", { contact_email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact phone</Label>
                          <Input
                            placeholder="+91 9876543210"
                            value={sectionContent.footer.contact_phone || ""}
                            onChange={(e) => updateSection("footer", { contact_phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Copyright text</Label>
                        <Input
                          placeholder={`© ${new Date().getFullYear()} ${store.name}. All rights reserved.`}
                          value={sectionContent.footer.copyright_text || ""}
                          onChange={(e) => updateSection("footer", { copyright_text: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Leave empty for the default copyright notice</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Newsletter Content Section */}
                {activeSection === "newsletter-content" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Newsletter Section</h2>
                      <p className="text-sm text-muted-foreground">
                        Customize the newsletter signup section that appears before the footer.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="Stay Updated"
                          value={sectionContent.newsletter.title || ""}
                          onChange={(e) => updateSection("newsletter", { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea
                          placeholder="Subscribe to our newsletter for the latest updates and offers."
                          value={sectionContent.newsletter.subtitle || ""}
                          onChange={(e) => updateSection("newsletter", { subtitle: e.target.value })}
                          className="min-h-[60px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button text</Label>
                        <Input
                          placeholder="Subscribe"
                          value={sectionContent.newsletter.button_text || ""}
                          onChange={(e) => updateSection("newsletter", { button_text: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "fonts" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold">Store font</h2>
                      <p className="text-sm text-muted-foreground">
                        Choose from 1000+ font families to enhance the visual style of your
                        store.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Font family</Label>
                      <Select
                        value={settings.font_family}
                        onValueChange={(value) => updateSettings({ font_family: value })}
                      >
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: font.value }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-lg border p-6">
                      <p style={{ fontFamily: settings.font_family }} className="text-2xl">
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p
                        style={{ fontFamily: settings.font_family }}
                        className="mt-2 text-muted-foreground"
                      >
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                      </p>
                    </div>
                  </div>
                )}

                {/* Advanced Section */}
                {activeSection === "advanced" && (
                  <div className="space-y-4">
                    <SettingToggle
                      title="Add to bag button"
                      description="Show add button on homepage & category page products for seamless checkouts."
                      checked={settings.show_add_to_bag_button}
                      onCheckedChange={(checked) =>
                        updateSettings({ show_add_to_bag_button: checked })
                      }
                    />

                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Custom CSS</h3>
                          <p className="text-sm text-muted-foreground">
                            Add custom CSS to your ecommerce store.
                          </p>
                        </div>
                        <a
                          href="https://developer.mozilla.org/en-US/docs/Web/CSS"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          How it works
                        </a>
                      </div>
                      <Textarea
                        placeholder="/* Add your custom CSS here */"
                        value={settings.custom_css || ""}
                        onChange={(e) => updateSettings({ custom_css: e.target.value })}
                        className="font-mono text-sm min-h-[120px]"
                      />
                    </div>

                    <SettingToggle
                      title='Sticky "Buy now" button (Mobile only)'
                      description="Boost conversion & make checkout faster with a sticky buy now button on the product page."
                      checked={settings.show_sticky_buy_button}
                      onCheckedChange={(checked) =>
                        updateSettings({ show_sticky_buy_button: checked })
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="pr-4">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
