import { ShoppingBag, Search, Menu, X, Heart, User, ChevronRight, ArrowRight, Star, ChevronLeft, ChevronDown, MapPin, Sparkles, Leaf, Zap, BookOpen, Baby, Gem, Home, Palette, Dumbbell, PawPrint, Car, HeartPulse, TreePine, Plane } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useStorefront } from "@/contexts/StorefrontContext";
import ProductCard from "@/components/storefront/ProductCard";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import ProductFilters, { FilterState, ProductFiltersSidebar } from "@/components/storefront/ProductFilters";
import BannerCarousel from "@/components/storefront/BannerCarousel";
import StorefrontSearch from "@/components/storefront/StorefrontSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryThemeConfig } from "./config/themeConfig";
import { useThemeSettings, getBackgroundStyles, getFontFamilyCSS } from "@/hooks/useThemeSettings";
import { useStoreBranding } from "@/hooks/useStoreBranding";
import { useSectionContent } from "@/hooks/useSectionContent";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  status: string;
  category_id?: string | null;
}

interface Store {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  currency: string;
  slug: string;
}

interface BaseStorefrontThemeProps {
  store: Store;
  products: Product[];
  config: CategoryThemeConfig;
}

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  fashion: <Sparkles className="h-4 w-4" />,
  grocery: <Leaf className="h-4 w-4" />,
  electronics: <Zap className="h-4 w-4" />,
  books: <BookOpen className="h-4 w-4" />,
  kids: <Baby className="h-4 w-4" />,
  ayurvedic: <Leaf className="h-4 w-4" />,
  jewelry: <Gem className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  beauty: <Sparkles className="h-4 w-4" />,
  sports: <Dumbbell className="h-4 w-4" />,
  pets: <PawPrint className="h-4 w-4" />,
  automotive: <Car className="h-4 w-4" />,
  health: <HeartPulse className="h-4 w-4" />,
  art: <Palette className="h-4 w-4" />,
  garden: <TreePine className="h-4 w-4" />,
  travel: <Plane className="h-4 w-4" />,
};

// Category-specific labels
const categoryLabels: Record<string, { shopAll: string; featured: string; collection: string; cta: string }> = {
  fashion: { shopAll: "Shop the Look", featured: "Editor's Picks", collection: "Lookbook", cta: "Explore Collection" },
  grocery: { shopAll: "Shop Fresh", featured: "Today's Deals", collection: "Weekly Specials", cta: "Add to Cart" },
  electronics: { shopAll: "Browse Tech", featured: "Top Rated", collection: "Tech Picks", cta: "Buy Now" },
  books: { shopAll: "Browse Library", featured: "Staff Picks", collection: "Reading Lists", cta: "Read More" },
  kids: { shopAll: "Explore Fun", featured: "Favorites", collection: "Age Groups", cta: "Shop Now" },
  ayurvedic: { shopAll: "Discover Wellness", featured: "Bestsellers", collection: "By Concern", cta: "Shop Natural" },
  jewelry: { shopAll: "View Collection", featured: "Signature Pieces", collection: "By Occasion", cta: "Discover" },
  home: { shopAll: "Shop Home", featured: "Trending Now", collection: "Room Ideas", cta: "Shop Room" },
  beauty: { shopAll: "Shop Beauty", featured: "Beauty Picks", collection: "Routines", cta: "Add to Bag" },
  sports: { shopAll: "Shop Gear", featured: "Performance Picks", collection: "By Sport", cta: "Get Yours" },
  pets: { shopAll: "Shop for Pets", featured: "Pet Favorites", collection: "By Pet Type", cta: "Shop Now" },
  automotive: { shopAll: "Shop Parts", featured: "Best Sellers", collection: "By Vehicle", cta: "Buy Now" },
  health: { shopAll: "Shop Health", featured: "Doctor's Choice", collection: "By Goal", cta: "Order Now" },
  art: { shopAll: "Browse Art", featured: "Curated", collection: "By Style", cta: "View Details" },
  garden: { shopAll: "Shop Garden", featured: "Seasonal Picks", collection: "By Season", cta: "Add to Garden" },
  travel: { shopAll: "Shop Travel", featured: "Must-Haves", collection: "By Destination", cta: "Pack It" },
};

export default function BaseStorefrontTheme({ store, products, config }: BaseStorefrontThemeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [mobileExpandedSubCat, setMobileExpandedSubCat] = useState<string | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredL1, setHoveredL1] = useState<string | null>(null);
  const {
    setStoreId,
    setCurrency,
    cartCount,
    wishlistItems,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAuthOpen,
    customer,
    categories,
    pages,
    headerMenuItems,
    footerMenuItems,
  } = useStorefront();

  const { themeSettings, banners } = useThemeSettings(store.id);
  const { sectionContent } = useSectionContent(store.id);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100000],
    sortBy: "newest",
    searchQuery: "",
  });

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const cat = config.category;
  const defaultLabels = categoryLabels[cat] || categoryLabels.fashion;
  const labels = {
    shopAll: sectionContent.labels.shop_all || defaultLabels.shopAll,
    featured: sectionContent.labels.featured || defaultLabels.featured,
    collection: sectionContent.labels.collection || defaultLabels.collection,
    cta: sectionContent.labels.cta || defaultLabels.cta,
  };
  const catIcon = categoryIcons[cat];

  useEffect(() => {
    setStoreId(store.id);
    setCurrency(store.currency);
  }, [store.id, store.currency]);

  useStoreBranding({
    storeName: store.name,
    storeDescription: store.description,
    logoUrl: store.logo_url,
    faviconUrl: themeSettings?.favicon_url,
  });

  // Apply custom CSS
  useEffect(() => {
    if (themeSettings?.custom_css) {
      const styleId = "storefront-custom-css";
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = themeSettings.custom_css;
      return () => { styleEl?.remove(); };
    }
  }, [themeSettings?.custom_css]);

  const filteredProducts = products
    .filter((product) => {
      if (filters.categories.length > 0 && !filters.categories.includes(product.category_id || "")) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      if (filters.searchQuery && !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const maxPrice = Math.max(...products.map((p) => p.price), 10000);

  // Merge theme settings with config
  const backgroundMode = themeSettings?.background_mode || "light";
  const bgStyles = getBackgroundStyles(backgroundMode);

  const effectiveColors = themeSettings ? {
    background: bgStyles.background,
    foreground: bgStyles.foreground,
    foregroundMuted: bgStyles.foregroundMuted,
    border: bgStyles.border,
    backgroundSecondary: bgStyles.backgroundSecondary,
    backgroundTertiary: config.colors.backgroundTertiary,
    foregroundSubtle: config.colors.foregroundSubtle,
    primary: themeSettings.primary_color || config.colors.primary,
    primaryForeground: config.colors.primaryForeground,
    accent: themeSettings.accent_color || config.colors.accent,
    accentForeground: config.colors.accentForeground,
  } : config.colors;

  const effectiveFontFamily = themeSettings?.font_family
    ? getFontFamilyCSS(themeSettings.font_family)
    : config.typography.fontFamily;

  const showStoreName = themeSettings?.show_store_name ?? true;
  const showFeaturedProduct = themeSettings?.show_featured_product ?? config.features.includes("featured-product");
  const showBrandStory = themeSettings?.show_brand_story ?? config.features.includes("brand-story");
  const showTestimonials = themeSettings?.show_testimonials ?? config.features.includes("testimonials");

  const isDark = effectiveColors.background.startsWith("#0") || effectiveColors.background.startsWith("#1") || backgroundMode === "dark" || backgroundMode === "dim";

  const borderRadiusClass = {
    none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg",
    xl: "rounded-xl", "2xl": "rounded-2xl", full: "rounded-full",
  }[config.style.borderRadius];

  const featuredProduct = products[0];

  // Get category images for collection showcase
  const categoriesWithProducts = categories.map(cat => ({
    ...cat,
    productCount: products.filter(p => p.category_id === cat.id).length,
    coverImage: cat.image_url || products.find(p => p.category_id === cat.id)?.images?.[0],
  })).filter(cat => cat.productCount > 0);

  // Build 3-level category hierarchy
  const level1Categories = categories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);
  const hasCategoryTree = level1Categories.length > 0;

  const heroHasImage = !!sectionContent.hero.background_image;

  const DEFAULT_SECTION_ORDER = ['hero', 'collections', 'featured_product', 'brand_story', 'products', 'testimonials', 'newsletter'];
  const sectionOrder = themeSettings?.section_order || DEFAULT_SECTION_ORDER;

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // =========================================
  // Category-specific product grid columns
  // =========================================
  const getProductGridCols = () => {
    switch (config.style.productCardStyle) {
      case "magazine": return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
      case "overlay": return "grid-cols-2 lg:grid-cols-3";
      case "detailed": return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  // =========================================
  // Category-specific hero rendering
  // =========================================
  const renderHero = () => {
    const heroStyle = config.style.heroStyle;

    // Split hero (fashion luxe, grocery organic, etc.)
    if (heroStyle === "split" || heroHasImage) {
      return (
        <section key="hero" className="relative">
          <div className="grid md:grid-cols-2">
            <div className="relative overflow-hidden" style={{ minHeight: '500px' }}>
              {heroHasImage ? (
                <img src={sectionContent.hero.background_image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : featuredProduct?.images?.[0] ? (
                <img src={featuredProduct.images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: config.colors.gradient || effectiveColors.primary }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-8 md:p-12">
                {catIcon && (
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
                    {catIcon}
                  </div>
                )}
                <h2
                  className="text-3xl text-white md:text-5xl lg:text-6xl"
                  style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, lineHeight: 1.1, textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined }}
                >
                  {sectionContent.hero.heading || store.name}
                </h2>
                {(sectionContent.hero.subheading || store.description) && (
                  <p className="mt-3 max-w-md text-lg text-white/70 md:text-xl">
                    {sectionContent.hero.subheading || store.description}
                  </p>
                )}
                <div className="mt-6">
                  <button
                    className={`group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold transition-all ${borderRadiusClass}`}
                    style={{ backgroundColor: "white", color: "black" }}
                  >
                    {sectionContent.hero.cta_text || labels.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden" style={{ minHeight: '500px', backgroundColor: effectiveColors.backgroundSecondary }}>
              {products[1]?.images?.[0] ? (
                <>
                  <img src={products[1].images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <h3 className="text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: config.typography.headingFamily }}>
                      {sectionContent.hero.cta_secondary_text || labels.featured}
                    </h3>
                    <button
                      className={`mt-6 border-2 border-white px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black ${borderRadiusClass}`}
                    >
                      {labels.shopAll}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-12 text-center" style={{ color: effectiveColors.foreground }}>
                  <h3 className="text-3xl md:text-4xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}>
                    {labels.featured}
                  </h3>
                  <p className="mt-3 text-sm" style={{ color: effectiveColors.foregroundMuted }}>Discover our latest collection</p>
                  <button className={`mt-6 px-8 py-3 text-sm font-semibold transition-all ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}>
                    {labels.shopAll}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    // Image background hero (bold, overlay themes)
    if (heroStyle === "image-bg") {
      const bgImage = sectionContent.hero.background_image || featuredProduct?.images?.[0];
      return (
        <section key="hero" className="relative overflow-hidden" style={{ minHeight: '600px' }}>
          {bgImage ? (
            <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover scale-105" />
          ) : (
            <div className="absolute inset-0" style={{ background: config.colors.gradient || `linear-gradient(135deg, ${effectiveColors.primary}, ${effectiveColors.accent})` }} />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative flex min-h-[600px] flex-col items-center justify-center px-4 text-center">
            {catIcon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white"
              >
                {catIcon}
              </motion.div>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl text-4xl text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, letterSpacing: config.typography.letterSpacing, textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined }}
            >
              {sectionContent.hero.heading || store.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-xl text-lg text-white/75 md:text-xl"
            >
              {sectionContent.hero.subheading || store.description || "Explore our curated collection"}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <button className={`group inline-flex items-center gap-2 px-10 py-4 text-sm font-bold transition-all ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}>
                {sectionContent.hero.cta_text || labels.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button className={`inline-flex items-center gap-2 border-2 border-white px-10 py-4 text-sm font-bold text-white transition-all hover:bg-white hover:text-black ${borderRadiusClass}`}>
                {labels.shopAll}
              </button>
            </motion.div>
          </div>
        </section>
      );
    }

    // Carousel hero
    if (heroStyle === "carousel" && banners.length > 0) {
      return (
        <section key="hero">
          <BannerCarousel banners={banners} />
          <div className="py-10 text-center" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
            <h1
              className="text-3xl md:text-5xl"
              style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined }}
            >
              {sectionContent.hero.heading || store.name}
            </h1>
            {(sectionContent.hero.subheading || store.description) && (
              <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: effectiveColors.foregroundMuted }}>
                {sectionContent.hero.subheading || store.description}
              </p>
            )}
          </div>
        </section>
      );
    }

    // Default minimal hero
    return (
      <section key="hero" className="py-20 md:py-32" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          {catIcon && (
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${effectiveColors.primary}15`, color: effectiveColors.primary }}>
              {catIcon}
            </div>
          )}
          {config.features.includes("lookbook") && (
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: effectiveColors.primary }}>New Collection</p>
          )}
          <h1
            className="mx-auto max-w-4xl text-4xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, letterSpacing: config.typography.letterSpacing, lineHeight: 1.05, textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined }}
          >
            {sectionContent.hero.heading || store.name}
          </h1>
          {(sectionContent.hero.subheading || store.description) && (
            <p className="mx-auto mt-6 max-w-xl text-base md:text-lg leading-relaxed" style={{ color: effectiveColors.foregroundMuted }}>
              {sectionContent.hero.subheading || store.description}
            </p>
          )}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button className={`group inline-flex items-center gap-2 px-10 py-4 text-sm font-semibold transition-all ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}>
              {sectionContent.hero.cta_text || labels.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button className={`inline-flex items-center gap-2 px-10 py-4 text-sm font-semibold transition-all ${borderRadiusClass}`} style={{ border: `2px solid ${effectiveColors.foreground}`, color: effectiveColors.foreground }}>
              {labels.shopAll}
            </button>
          </div>
        </div>
      </section>
    );
  };

  // =========================================
  // Category-specific collection rendering
  // =========================================
  const renderCollections = () => {
    if (categoriesWithProducts.length === 0) return null;

    // Card-style collections for home, art, garden
    if (["home", "art", "garden", "jewelry"].includes(cat)) {
      return (
        <section key="collections" className="py-14 md:py-20" style={{ backgroundColor: effectiveColors.background }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: effectiveColors.primary }}>{labels.collection}</p>
              <h2 className="mt-3 text-2xl md:text-4xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}>
                Browse by Category
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoriesWithProducts.slice(0, 6).map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`group relative overflow-hidden ${borderRadiusClass}`}
                  style={{ aspectRatio: '16/10' }}
                  onClick={() => setFilters({ ...filters, categories: [c.id] })}
                >
                  {c.coverImage ? (
                    <img src={c.coverImage} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full" style={{ backgroundColor: effectiveColors.backgroundSecondary }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity group-hover:from-black/70" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: config.typography.headingFamily }}>{c.name}</h3>
                    <p className="mt-1 text-xs text-white/60">{c.productCount} items</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Tag-pill collections for electronics, automotive, sports
    if (["electronics", "automotive", "sports", "health"].includes(cat)) {
      return (
        <section key="collections" className="py-10 md:py-14" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all ${borderRadiusClass}`}
                style={{
                  backgroundColor: filters.categories.length === 0 ? effectiveColors.primary : "transparent",
                  color: filters.categories.length === 0 ? effectiveColors.primaryForeground : effectiveColors.foreground,
                  border: `2px solid ${filters.categories.length === 0 ? effectiveColors.primary : effectiveColors.border}`,
                }}
                onClick={() => setFilters({ ...filters, categories: [] })}
              >
                {catIcon}
                All {config.category.charAt(0).toUpperCase() + config.category.slice(1)}
              </button>
              {categoriesWithProducts.map((c) => (
                <button
                  key={c.id}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${borderRadiusClass}`}
                  style={{
                    backgroundColor: filters.categories.includes(c.id) ? effectiveColors.primary : "transparent",
                    color: filters.categories.includes(c.id) ? effectiveColors.primaryForeground : effectiveColors.foreground,
                    border: `2px solid ${filters.categories.includes(c.id) ? effectiveColors.primary : effectiveColors.border}`,
                  }}
                  onClick={() => setFilters({ ...filters, categories: filters.categories.includes(c.id) ? [] : [c.id] })}
                >
                  {c.name}
                  <span className="text-xs opacity-60">({c.productCount})</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Default: Circular bubbles (fashion, grocery, beauty, kids, etc.)
    return (
      <section key="collections" className="py-10 md:py-14" style={{ backgroundColor: effectiveColors.background }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {categoriesWithProducts.length > 6 && (
              <>
                <button onClick={() => scrollCategories('left')} className="absolute -left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110" style={{ border: `1px solid ${effectiveColors.border}` }}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => scrollCategories('right')} className="absolute -right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110" style={{ border: `1px solid ${effectiveColors.border}` }}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            <div
              ref={categoryScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide py-4 md:justify-center md:gap-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categoriesWithProducts.map((c) => (
                <button
                  key={c.id}
                  className="group flex flex-shrink-0 flex-col items-center gap-3"
                  onClick={() => setFilters({ ...filters, categories: [c.id] })}
                >
                  <div
                    className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-offset-2 transition-all group-hover:ring-4 md:h-24 md:w-24"
                    style={{ boxShadow: `0 0 0 2px ${effectiveColors.primary}` }}
                  >
                    {c.coverImage ? (
                      <img src={c.coverImage} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ backgroundColor: effectiveColors.backgroundSecondary, color: effectiveColors.foregroundMuted }}>
                        {c.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium md:text-sm" style={{ color: effectiveColors.foreground }}>
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Section renderers mapped by key
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return renderHero();

      case 'collections':
        return renderCollections();

      case 'featured_product':
        if (!showFeaturedProduct || !featuredProduct) return null;
        return (
          <section key="featured_product" className="py-16" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  {catIcon && <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: effectiveColors.primary }}>{catIcon} {labels.featured}</div>}
                  <h2 className="text-2xl md:text-3xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}>{sectionContent.featured_product.title || labels.featured}</h2>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.primary }}>
                  View all <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className={`grid gap-4 md:gap-6 ${getProductGridCols()}`}>
                {products.slice(0, config.style.productCardStyle === "magazine" ? 3 : 4).map((product) => (
                  <ProductCard key={product.id} product={product} storeSlug={store.slug} variant={isDark ? "bold" : "minimal"} primaryColor={effectiveColors.primary} accentColor={effectiveColors.accent} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'brand_story':
        if (!showBrandStory) return null;
        return (
          <section key="brand_story" className="py-16 md:py-24" style={{ backgroundColor: effectiveColors.background }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 md:grid-cols-2">
                {sectionContent.brand_story.image_url ? (
                  <div className={`aspect-[4/5] overflow-hidden ${borderRadiusClass}`}>
                    <img src={sectionContent.brand_story.image_url} alt="" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                ) : (
                  <div className={`aspect-[4/5] ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.backgroundSecondary }} />
                )}
                <div className="md:pl-8">
                  {catIcon && <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: effectiveColors.primary }}>{catIcon} Our Story</div>}
                  <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, lineHeight: 1.1 }}>
                    {sectionContent.brand_story.title || "Crafted with passion"}
                  </h2>
                  <p className="mt-6 text-base leading-relaxed md:text-lg" style={{ color: effectiveColors.foregroundMuted }}>
                    {sectionContent.brand_story.content || store.description || "We are passionate about bringing you the best products with exceptional quality and service."}
                  </p>
                  <button
                    className={`mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold transition-all hover:opacity-90 ${borderRadiusClass}`}
                    style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      case 'products':
        return (
          <section key="products" className="py-16 md:py-20" id="products" style={{ backgroundColor: effectiveColors.background }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}>
                    {filters.categories.length > 0 ? categories.find(c => c.id === filters.categories[0])?.name || "Products" : "All Products"}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: effectiveColors.foregroundMuted }}>{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</p>
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                      style={{
                        backgroundColor: filters.categories.length === 0 ? effectiveColors.foreground : "transparent",
                        color: filters.categories.length === 0 ? effectiveColors.background : effectiveColors.foregroundMuted,
                        border: `1.5px solid ${filters.categories.length === 0 ? effectiveColors.foreground : effectiveColors.border}`,
                        borderRadius: '9999px',
                      }}
                      onClick={() => setFilters({ ...filters, categories: [] })}
                    >
                      All
                    </button>
                    {categories.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        className="px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                        style={{
                          backgroundColor: filters.categories.includes(c.id) ? effectiveColors.foreground : "transparent",
                          color: filters.categories.includes(c.id) ? effectiveColors.background : effectiveColors.foregroundMuted,
                          border: `1.5px solid ${filters.categories.includes(c.id) ? effectiveColors.foreground : effectiveColors.border}`,
                          borderRadius: '9999px',
                        }}
                        onClick={() => setFilters({
                          ...filters,
                          categories: filters.categories.includes(c.id) ? filters.categories.filter((x) => x !== c.id) : [c.id],
                        })}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-8">
                <ProductFiltersSidebar filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} />
                <div className="flex-1">
                  <ProductFilters filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} productCount={filteredProducts.length} />
                  {filteredProducts.length === 0 ? (
                    <div className="py-20 text-center">
                      <ShoppingBag className="mx-auto h-12 w-12" style={{ color: effectiveColors.foregroundSubtle }} />
                      <p className="mt-4" style={{ color: effectiveColors.foregroundMuted }}>No products found</p>
                      <button className="mt-4 px-6 py-2 rounded-full" style={{ border: `1px solid ${effectiveColors.border}`, color: effectiveColors.foreground }} onClick={() => setFilters({ categories: [], priceRange: [0, maxPrice], sortBy: "newest", searchQuery: "" })}>Clear Filters</button>
                    </div>
                  ) : (
                    <div className={`mt-6 grid gap-x-4 gap-y-8 ${getProductGridCols()}`}>
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} storeSlug={store.slug} variant={isDark ? "bold" : "minimal"} primaryColor={effectiveColors.primary} accentColor={effectiveColors.accent} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        if (!showTestimonials) return null;
        return (
          <section key="testimonials" className="py-16 md:py-24" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-14 text-center">
                <p className="inline-block rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: `${effectiveColors.primary}15`, color: effectiveColors.primary }}>Testimonials</p>
                <h2 className="mt-5 text-2xl md:text-4xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}>{sectionContent.testimonials.title || "What Our Customers Say"}</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {(sectionContent.testimonials.items || [
                  { name: "Sarah M.", text: "Amazing quality products! Fast shipping and excellent customer service.", rating: 5 },
                  { name: "John D.", text: "I've been a loyal customer for years. The quality never disappoints.", rating: 5 },
                  { name: "Emily R.", text: "Best online shopping experience I've ever had. Highly recommend!", rating: 5 },
                ]).filter(t => t.name && t.text).map((testimonial, i) => (
                  <div key={i} className={`p-8 transition-all hover:shadow-lg ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.background, border: `1px solid ${effectiveColors.border}` }}>
                    <div className="mb-4 flex gap-0.5">{[...Array(testimonial.rating || 5)].map((_, s) => (<Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />))}</div>
                    <p className="text-sm leading-relaxed md:text-base" style={{ color: effectiveColors.foregroundMuted }}>"{testimonial.text}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: `${effectiveColors.primary}20`, color: effectiveColors.primary }}>
                        {testimonial.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold">{testimonial.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'newsletter':
        return (
          <section key="newsletter" className="py-20 md:py-28" style={{ backgroundColor: effectiveColors.primary }}>
            <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
              {catIcon && <div className="mb-4 inline-flex items-center justify-center text-white/50">{catIcon}</div>}
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: `${effectiveColors.primaryForeground}99` }}>Stay in the loop</p>
              <h2 className="mt-4 text-2xl md:text-4xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, color: effectiveColors.primaryForeground }}>{sectionContent.newsletter.title || "Join Our Community"}</h2>
              <p className="mt-4 text-sm leading-relaxed opacity-70" style={{ color: effectiveColors.primaryForeground }}>{sectionContent.newsletter.subtitle || "Subscribe to our newsletter for the latest updates and exclusive offers."}</p>
              <div className={`mx-auto mt-10 flex max-w-md gap-0 overflow-hidden shadow-lg ${borderRadiusClass}`} style={{ border: `2px solid ${effectiveColors.primaryForeground}20` }}>
                <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent px-6 py-4 text-sm focus:outline-none" style={{ color: effectiveColors.primaryForeground, caretColor: effectiveColors.primaryForeground }} />
                <button className={`px-8 py-4 text-sm font-semibold transition-all hover:opacity-90 ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.primaryForeground, color: effectiveColors.primary }}>{sectionContent.newsletter.button_text || "Subscribe"}</button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: effectiveColors.background,
        color: effectiveColors.foreground,
        fontFamily: effectiveFontFamily,
      }}
    >
      {/* Announcement Bar - category-aware */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2.5 text-xs font-medium tracking-wide sm:px-6">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70" />
            {sectionContent.hero.cta_secondary_text || "Free shipping on orders over $50"}
          </span>
        </div>
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: `${effectiveColors.background}ee`,
          borderBottom: `1px solid ${effectiveColors.border}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="rounded-lg p-2 transition-colors hover:bg-black/5 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Center: Logo */}
          <Link
            to={`/store/${store.slug}`}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 transition-all hover:opacity-80"
            style={{
              fontFamily: config.typography.headingFamily,
              fontWeight: config.typography.headingWeight,
              letterSpacing: config.typography.letterSpacing || '0.05em',
              textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined,
            }}
          >
            {store.logo_url && <img src={store.logo_url} alt={store.name} className="h-9 object-contain" />}
            {showStoreName && <span className="text-xl tracking-wider">{store.name}</span>}
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-2.5 transition-colors hover:bg-black/5" onClick={() => setSearchOpen(true)}>
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button className="relative rounded-lg p-2.5 transition-colors hover:bg-black/5" onClick={() => setIsAuthOpen(true)}>
              <User className="h-[18px] w-[18px]" />
            </button>
            <button className="relative rounded-lg p-2.5 transition-colors hover:bg-black/5" onClick={() => setIsWishlistOpen(true)}>
              <Heart className="h-[18px] w-[18px]" />
              {wishlistItems.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: effectiveColors.accent || effectiveColors.primary }}>
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button className="relative rounded-lg p-2.5 transition-colors hover:bg-black/5" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: effectiveColors.accent || effectiveColors.primary }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom tier: Navigation with Category Mega Menu */}
        <nav className="hidden border-t md:block" style={{ borderColor: effectiveColors.border }}>
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 py-0 sm:px-6 lg:px-8">
            <Link to={`/store/${store.slug}`} className="px-4 py-3 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
              Home
            </Link>

            {/* Auto-generated Category Mega Menu */}
            {hasCategoryTree && (
              <div
                className="relative"
                onMouseEnter={() => { if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current); setActiveMegaMenu('categories'); if (level1Categories[0]) setHoveredL1(level1Categories[0].id); }}
                onMouseLeave={() => { megaMenuTimeoutRef.current = setTimeout(() => { setActiveMegaMenu(null); setHoveredL1(null); }, 200); }}
              >
                <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
                  {labels.shopAll} <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMegaMenu === 'categories' ? 'rotate-180' : ''}`} />
                </button>

                {activeMegaMenu === 'categories' && (
                  <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200" style={{ width: 'max(700px, 50vw)', maxWidth: '900px' }}>
                    <div className={`mt-0.5 border shadow-2xl ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.background, borderColor: effectiveColors.border }}>
                      <div className="flex" style={{ minHeight: '340px' }}>
                        {/* Level 1 - Left column */}
                        <div className="w-56 flex-shrink-0 border-r py-4" style={{ borderColor: effectiveColors.border }}>
                          <p className="mb-2 px-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: effectiveColors.foregroundMuted }}>Categories</p>
                          {level1Categories.map((l1) => {
                            const l1Children = getChildren(l1.id);
                            return (
                              <button
                                key={l1.id}
                                className={`flex w-full items-center justify-between px-5 py-2.5 text-left text-sm font-medium transition-all`}
                                style={{
                                  backgroundColor: hoveredL1 === l1.id ? `${effectiveColors.primary}10` : 'transparent',
                                  color: hoveredL1 === l1.id ? effectiveColors.primary : effectiveColors.foreground,
                                  borderRight: hoveredL1 === l1.id ? `2px solid ${effectiveColors.primary}` : '2px solid transparent',
                                }}
                                onMouseEnter={() => setHoveredL1(l1.id)}
                                onClick={() => { setFilters({ ...filters, categories: [l1.id] }); setActiveMegaMenu(null); }}
                              >
                                <span className="flex items-center gap-2.5">
                                  {l1.image_url && <img src={l1.image_url} alt="" className="h-7 w-7 rounded-full object-cover" />}
                                  {l1.name}
                                </span>
                                {l1Children.length > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-40" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Level 2 & 3 - Right panel */}
                        <div className="flex-1 overflow-y-auto p-6">
                          {hoveredL1 && (() => {
                            const l2Cats = getChildren(hoveredL1);
                            const parentCat = level1Categories.find(c => c.id === hoveredL1);
                            if (l2Cats.length === 0) {
                              return (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                  {parentCat?.image_url && <img src={parentCat.image_url} alt="" className={`mb-4 h-32 w-32 object-cover ${borderRadiusClass}`} />}
                                  <p className="text-lg font-semibold" style={{ fontFamily: config.typography.headingFamily }}>{parentCat?.name}</p>
                                  <button
                                    className={`mt-4 px-6 py-2 text-sm font-semibold transition-all hover:opacity-90 ${borderRadiusClass}`}
                                    style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}
                                    onClick={() => { setFilters({ ...filters, categories: [hoveredL1] }); setActiveMegaMenu(null); }}
                                  >
                                    {labels.cta}
                                  </button>
                                </div>
                              );
                            }
                            return (
                              <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-3">
                                {l2Cats.map((l2) => {
                                  const l3Cats = getChildren(l2.id);
                                  return (
                                    <div key={l2.id}>
                                      <button
                                        className="mb-2 flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-70"
                                        style={{ color: effectiveColors.primary }}
                                        onClick={() => { setFilters({ ...filters, categories: [l2.id] }); setActiveMegaMenu(null); }}
                                      >
                                        {l2.image_url && <img src={l2.image_url} alt="" className="h-6 w-6 rounded-full object-cover" />}
                                        {l2.name}
                                      </button>
                                      {l3Cats.length > 0 && (
                                        <ul className="space-y-1.5">
                                          {l3Cats.map((l3) => (
                                            <li key={l3.id}>
                                              <button
                                                className="text-sm transition-colors hover:opacity-70"
                                                style={{ color: effectiveColors.foregroundMuted }}
                                                onClick={() => { setFilters({ ...filters, categories: [l3.id] }); setActiveMegaMenu(null); }}
                                              >
                                                {l3.name}
                                              </button>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Bottom bar */}
                      <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: effectiveColors.border }}>
                        <span className="text-xs" style={{ color: effectiveColors.foregroundMuted }}>
                          {categories.length} categories available
                        </span>
                        <button
                          className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-70"
                          style={{ color: effectiveColors.primary }}
                          onClick={() => { setFilters({ ...filters, categories: [] }); setActiveMegaMenu(null); }}
                        >
                          View All Products <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Store admin header menu items */}
            {headerMenuItems.map((item) => (
              <Link key={item.id} to={item.url} className="px-4 py-3 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {customer && (
          <div className="py-1.5 text-center text-xs" style={{ backgroundColor: effectiveColors.backgroundSecondary, color: effectiveColors.foregroundMuted }}>
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto shadow-2xl" style={{ backgroundColor: effectiveColors.background }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${effectiveColors.border}` }}>
              <div className="flex items-center gap-3">
                {store.logo_url && <img src={store.logo_url} alt="" className="h-7 object-contain" />}
                <span className="text-base font-semibold" style={{ fontFamily: config.typography.headingFamily }}>{store.name}</span>
              </div>
              <button className="rounded-lg p-1.5 transition-colors hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-3 py-3">
              <Link to={`/store/${store.slug}`} className="rounded-xl px-4 py-3.5 text-sm font-medium transition-colors hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>

              {/* Mobile 3-level category accordion */}
              {level1Categories.length > 0 && (
                <>
                  <div className="mt-2 px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: effectiveColors.foregroundMuted }}>Categories</p>
                  </div>
                  {level1Categories.map((l1) => {
                    const l2Cats = getChildren(l1.id);
                    const isExpanded = mobileExpandedCat === l1.id;
                    return (
                      <div key={l1.id}>
                        <button
                          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-black/5"
                          onClick={() => {
                            if (l2Cats.length > 0) {
                              setMobileExpandedCat(isExpanded ? null : l1.id);
                              setMobileExpandedSubCat(null);
                            } else {
                              setFilters({ ...filters, categories: [l1.id] });
                              setMobileMenuOpen(false);
                            }
                          }}
                        >
                          <span className="flex items-center gap-2.5">
                            {l1.image_url && <img src={l1.image_url} alt="" className="h-7 w-7 rounded-full object-cover" />}
                            {l1.name}
                          </span>
                          {l2Cats.length > 0 && <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: effectiveColors.foregroundMuted }} />}
                        </button>
                        {isExpanded && l2Cats.map((l2) => {
                          const l3Cats = getChildren(l2.id);
                          const isSubExpanded = mobileExpandedSubCat === l2.id;
                          return (
                            <div key={l2.id} className="pl-6">
                              <button
                                className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-black/5"
                                style={{ color: effectiveColors.primary, fontWeight: 600 }}
                                onClick={() => {
                                  if (l3Cats.length > 0) {
                                    setMobileExpandedSubCat(isSubExpanded ? null : l2.id);
                                  } else {
                                    setFilters({ ...filters, categories: [l2.id] });
                                    setMobileMenuOpen(false);
                                  }
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  {l2.image_url && <img src={l2.image_url} alt="" className="h-5 w-5 rounded-full object-cover" />}
                                  {l2.name}
                                </span>
                                {l3Cats.length > 0 && <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />}
                              </button>
                              {isSubExpanded && l3Cats.map((l3) => (
                                <button
                                  key={l3.id}
                                  className="w-full rounded-lg px-8 py-2 text-left text-sm transition-colors hover:bg-black/5"
                                  style={{ color: effectiveColors.foregroundMuted }}
                                  onClick={() => { setFilters({ ...filters, categories: [l3.id] }); setMobileMenuOpen(false); }}
                                >
                                  {l3.name}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Store admin header menu items */}
              {headerMenuItems.length > 0 && (
                <div className="mt-2 border-t pt-2" style={{ borderColor: effectiveColors.border }}>
                  {headerMenuItems.map((item) => (
                    <Link key={item.id} to={item.url} className="rounded-xl px-4 py-3.5 text-sm font-medium transition-colors hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Banner Carousel - only for non-carousel hero or if no hero carousel already */}
      {banners.length > 0 && config.style.heroStyle !== "carousel" && <BannerCarousel banners={banners} />}

      {/* Dynamic Section Rendering */}
      {sectionOrder.map((sectionId) => renderSection(sectionId))}

      {/* Footer */}
      <footer className="relative overflow-hidden" style={{ backgroundColor: isDark ? effectiveColors.backgroundSecondary : "#0a0a0a", color: "#ffffff" }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${effectiveColors.primary}60, transparent)` }} />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3">
                {store.logo_url && <img src={store.logo_url} alt={store.name} className="h-9 object-contain brightness-0 invert" />}
                <h4 className="text-xl font-semibold tracking-wider" style={{ fontFamily: config.typography.headingFamily }}>
                  {store.name}
                </h4>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
                {sectionContent.footer.tagline || store.description || "Curated collections for the modern lifestyle. Quality meets design."}
              </p>
              <div className={`mt-8 flex max-w-sm overflow-hidden ${borderRadiusClass}`} style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                <input type="email" placeholder="Your email address" className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
                <button className={`px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}>
                  Subscribe
                </button>
              </div>
            </div>
            {headerMenuItems.length > 0 && (
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Quick Links</h4>
                <ul className="mt-5 space-y-3.5 text-sm text-white/60">
                  <li><Link to={`/store/${store.slug}`} className="hover:text-white transition-colors">Home</Link></li>
                  {headerMenuItems.slice(0, 5).map((item) => (
                    <li key={item.id}><Link to={item.url} className="hover:text-white transition-colors">{item.name}</Link></li>
                  ))}
                </ul>
              </div>
            )}
            {footerMenuItems.length > 0 && (
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Company</h4>
                <ul className="mt-5 space-y-3.5 text-sm text-white/60">
                  {footerMenuItems.slice(0, 6).map((item) => (
                    <li key={item.id}><Link to={item.url} className="hover:text-white transition-colors">{item.name}</Link></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Get in Touch</h4>
              <ul className="mt-5 space-y-3.5 text-sm text-white/60">
                <li className="hover:text-white transition-colors cursor-pointer">{sectionContent.footer.contact_email || `support@${store.slug}.com`}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{sectionContent.footer.contact_phone || "+91 9876543210"}</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQs</li>
                <li className="hover:text-white transition-colors cursor-pointer">Shipping & Returns</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-xs text-white/30">
              {sectionContent.footer.copyright_text || `© ${new Date().getFullYear()} ${store.name}. All rights reserved.`}
            </p>
            <div className="flex gap-8 text-xs text-white/30">
              <span className="cursor-pointer hover:text-white/60 transition-colors">Privacy Policy</span>
              <span className="cursor-pointer hover:text-white/60 transition-colors">Terms of Service</span>
              <span className="cursor-pointer hover:text-white/60 transition-colors">Refund Policy</span>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
      <StorefrontSearch products={products} storeSlug={store.slug} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
