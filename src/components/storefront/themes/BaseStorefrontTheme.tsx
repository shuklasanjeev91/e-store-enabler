import { ShoppingBag, Search, Menu, X, Heart, User, ChevronRight, ArrowRight, Star, ChevronLeft, MapPin, ChevronDown } from "lucide-react";
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

export default function BaseStorefrontTheme({ store, products, config }: BaseStorefrontThemeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Section renderers mapped by key
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <section key="hero" className="relative">
            {/* Xclusive-style: if hero has image, do a split layout or full-bleed */}
            {heroHasImage ? (
              <div className="grid md:grid-cols-2">
                {/* Left side - Shop the look with text overlay */}
                <div className="relative overflow-hidden" style={{ minHeight: '500px' }}>
                  <img src={sectionContent.hero.background_image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end p-8 md:p-12">
                    <h2
                      className="text-3xl text-white md:text-5xl lg:text-6xl"
                      style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, lineHeight: 1.1 }}
                    >
                      {sectionContent.hero.heading || "Shop the look"}
                    </h2>
                    {sectionContent.hero.subheading && (
                      <p className="mt-3 text-lg text-white/70 md:text-xl italic">
                        {sectionContent.hero.subheading}
                      </p>
                    )}
                    <div className="mt-6">
                      <button
                        className="group inline-flex items-center gap-2 bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
                        style={{ borderRadius: config.style.borderRadius === 'full' ? '9999px' : undefined }}
                      >
                        {sectionContent.hero.cta_text || "Shop Now"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                    {/* Shopify-style quick-add bag icon */}
                    <button
                      className="absolute bottom-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
                      onClick={() => setIsCartOpen(true)}
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Right side - secondary promo or featured product */}
                <div className="relative overflow-hidden" style={{ minHeight: '500px', backgroundColor: effectiveColors.backgroundSecondary }}>
                  {featuredProduct?.images?.[0] ? (
                    <>
                      <img src={featuredProduct.images[0]} alt={featuredProduct.name} className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <h3 className="text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: config.typography.headingFamily }}>
                          {sectionContent.hero.cta_secondary_text || "Sale"}
                        </h3>
                        <p className="mt-1 text-lg text-white/80 italic">New arrivals</p>
                        <button
                          className="mt-6 border-2 border-white px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black"
                          style={{ borderRadius: config.style.borderRadius === 'full' ? '9999px' : undefined }}
                        >
                          shop now
                        </button>
                      </div>
                      <button
                        className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
                        onClick={() => setIsCartOpen(true)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                      <h3 className="text-3xl md:text-4xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}>
                        {sectionContent.hero.cta_secondary_text || "New Arrivals"}
                      </h3>
                      <p className="mt-3 text-sm" style={{ color: effectiveColors.foregroundMuted }}>Discover our latest collection</p>
                      <button
                        className={`mt-6 px-8 py-3 text-sm font-semibold transition-all ${borderRadiusClass}`}
                        style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}
                      >
                        Shop Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Fallback: clean minimal hero without image */
              <div className="py-20 md:py-32" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
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
                      {sectionContent.hero.cta_text || "Shop Now"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button className={`inline-flex items-center gap-2 px-10 py-4 text-sm font-semibold transition-all ${borderRadiusClass}`} style={{ border: `2px solid ${effectiveColors.foreground}`, color: effectiveColors.foreground }}>
                      View All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );

      case 'collections':
        if (categoriesWithProducts.length === 0) return null;
        return (
          <section key="collections" className="py-10 md:py-14" style={{ backgroundColor: effectiveColors.background }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Xclusive-style circular category bubbles */}
              <div className="relative">
                {/* Scroll arrows */}
                {categoriesWithProducts.length > 6 && (
                  <>
                    <button
                      onClick={() => scrollCategories('left')}
                      className="absolute -left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110"
                      style={{ border: `1px solid ${effectiveColors.border}` }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => scrollCategories('right')}
                      className="absolute -right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110"
                      style={{ border: `1px solid ${effectiveColors.border}` }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                <div
                  ref={categoryScrollRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide py-4 md:justify-center md:gap-10"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {categoriesWithProducts.map((cat) => (
                    <button
                      key={cat.id}
                      className="group flex flex-shrink-0 flex-col items-center gap-3"
                      onClick={() => setFilters({ ...filters, categories: [cat.id] })}
                    >
                      {/* Circular image with ring border - Xclusive style */}
                      <div
                        className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-offset-2 transition-all group-hover:ring-4 md:h-24 md:w-24"
                        style={{
                          outlineColor: effectiveColors.primary,
                          borderColor: effectiveColors.primary,
                          boxShadow: `0 0 0 2px ${effectiveColors.primary}`,
                        }}
                      >
                        {cat.coverImage ? (
                          <img src={cat.coverImage} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ backgroundColor: effectiveColors.backgroundSecondary, color: effectiveColors.foregroundMuted }}>
                            {cat.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium md:text-sm" style={{ color: effectiveColors.foreground }}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'featured_product':
        if (!showFeaturedProduct || !featuredProduct) return null;
        return (
          <section key="featured_product" className="py-16" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex items-end justify-between">
                <h2 className="text-2xl md:text-3xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}>{sectionContent.featured_product.title || "Featured"}</h2>
                <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.primary }}>
                  View all <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {products.slice(0, 4).map((product) => (
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
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: effectiveColors.primary }}>Our Story</p>
                  <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, lineHeight: 1.1 }}>
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
                {/* Xclusive-style pill tabs */}
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
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        className="px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                        style={{
                          backgroundColor: filters.categories.includes(cat.id) ? effectiveColors.foreground : "transparent",
                          color: filters.categories.includes(cat.id) ? effectiveColors.background : effectiveColors.foregroundMuted,
                          border: `1.5px solid ${filters.categories.includes(cat.id) ? effectiveColors.foreground : effectiveColors.border}`,
                          borderRadius: '9999px',
                        }}
                        onClick={() => setFilters({
                          ...filters,
                          categories: filters.categories.includes(cat.id)
                            ? filters.categories.filter((c) => c !== cat.id)
                            : [cat.id],
                        })}
                      >
                        {cat.name}
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
                    <div className="mt-6 grid gap-x-4 gap-y-8 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  <div key={i} className="rounded-2xl p-8 transition-all hover:shadow-lg" style={{ backgroundColor: effectiveColors.background, border: `1px solid ${effectiveColors.border}` }}>
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
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: `${effectiveColors.primaryForeground}99` }}>Stay in the loop</p>
              <h2 className="mt-4 text-2xl md:text-4xl" style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight, color: effectiveColors.primaryForeground }}>{sectionContent.newsletter.title || "Join Our Community"}</h2>
              <p className="mt-4 text-sm leading-relaxed opacity-70" style={{ color: effectiveColors.primaryForeground }}>{sectionContent.newsletter.subtitle || "Subscribe to our newsletter for the latest updates and exclusive offers."}</p>
              <div className="mx-auto mt-10 flex max-w-md gap-0 overflow-hidden rounded-full shadow-lg" style={{ border: `2px solid ${effectiveColors.primaryForeground}20` }}>
                <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent px-6 py-4 text-sm focus:outline-none" style={{ color: effectiveColors.primaryForeground, caretColor: effectiveColors.primaryForeground }} />
                <button className="rounded-full px-8 py-4 text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: effectiveColors.primaryForeground, color: effectiveColors.primary }}>{sectionContent.newsletter.button_text || "Subscribe"}</button>
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
      {/* Modern Announcement Bar */}
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

      {/* Header - Modern two-tier */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: `${effectiveColors.background}ee`,
          borderBottom: `1px solid ${effectiveColors.border}`,
        }}
      >
        {/* Top tier: Logo centered, search + icons right */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 transition-colors hover:bg-black/5 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Center: Logo + Store name */}
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
            {store.logo_url && (
              <img src={store.logo_url} alt={store.name} className="h-9 object-contain" />
            )}
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

        {/* Bottom tier: Navigation with Mega Menu */}
        <nav
          className="hidden border-t md:block"
          style={{ borderColor: effectiveColors.border }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 py-0 sm:px-6 lg:px-8">
            <Link to={`/store/${store.slug}`} className="px-4 py-3 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
              Home
            </Link>

            {/* Categories with mega menu */}
            {categories.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => {
                  if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
                  setActiveMegaMenu('shop');
                }}
                onMouseLeave={() => {
                  megaMenuTimeoutRef.current = setTimeout(() => setActiveMegaMenu(null), 200);
                }}
              >
                <button
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: effectiveColors.foreground }}
                >
                  Shop <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMegaMenu === 'shop' ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Menu Dropdown */}
                {activeMegaMenu === 'shop' && (
                  <div
                    className="absolute left-1/2 top-full z-50 w-[700px] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="mt-0.5 rounded-xl border p-6 shadow-2xl" style={{ backgroundColor: effectiveColors.background, borderColor: effectiveColors.border }}>
                      <div className="grid grid-cols-12 gap-6">
                        {/* Categories list */}
                        <div className="col-span-4">
                          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: effectiveColors.foregroundMuted }}>Categories</p>
                          <div className="space-y-0.5">
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:translate-x-0.5"
                                style={{ color: effectiveColors.foreground }}
                                onMouseEnter={() => setActiveMegaMenu('shop')}
                                onClick={() => {
                                  setFilters({ ...filters, categories: [cat.id] });
                                  setActiveMegaMenu(null);
                                }}
                              >
                                {cat.image_url && (
                                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
                                    <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                                  </div>
                                )}
                                <span className="flex-1 font-medium">{cat.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: effectiveColors.primary }} />
                              </button>
                            ))}
                          </div>
                          <button
                            className="mt-3 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-70"
                            style={{ color: effectiveColors.primary }}
                            onClick={() => {
                              setFilters({ ...filters, categories: [] });
                              setActiveMegaMenu(null);
                            }}
                          >
                            View All Products <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Featured category images */}
                        <div className="col-span-8">
                          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: effectiveColors.foregroundMuted }}>Featured</p>
                          <div className="grid grid-cols-2 gap-3">
                            {categoriesWithProducts.slice(0, 4).map((cat) => (
                              <button
                                key={cat.id}
                                className="group relative overflow-hidden rounded-lg"
                                style={{ aspectRatio: '4/3' }}
                                onClick={() => {
                                  setFilters({ ...filters, categories: [cat.id] });
                                  setActiveMegaMenu(null);
                                }}
                              >
                                {cat.coverImage ? (
                                  <img
                                    src={cat.coverImage}
                                    alt={cat.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold" style={{ backgroundColor: effectiveColors.backgroundSecondary, color: effectiveColors.foregroundMuted }}>
                                    {cat.name.charAt(0)}
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-3">
                                  <span className="text-sm font-semibold text-white">{cat.name}</span>
                                  <p className="text-[10px] text-white/70">{cat.productCount} product{cat.productCount !== 1 ? 's' : ''}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collections Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
                setActiveMegaMenu('collections');
              }}
              onMouseLeave={() => {
                megaMenuTimeoutRef.current = setTimeout(() => setActiveMegaMenu(null), 200);
              }}
            >
              <button
                className="flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: effectiveColors.foreground }}
              >
                Collections <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMegaMenu === 'collections' ? 'rotate-180' : ''}`} />
              </button>

              {activeMegaMenu === 'collections' && (
                <div className="absolute left-1/2 top-full z-50 w-[820px] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mt-0.5 rounded-xl border p-6 shadow-2xl" style={{ backgroundColor: effectiveColors.background, borderColor: effectiveColors.border }}>
                    {/* Seasonal / curated collections */}
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: effectiveColors.foregroundMuted }}>Curated Collections</p>
                      <button
                        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-70"
                        style={{ color: effectiveColors.primary }}
                        onClick={() => setActiveMegaMenu(null)}
                      >
                        View All <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Large banner cards grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* New Arrivals */}
                      <button
                        className="group relative overflow-hidden rounded-xl"
                        style={{ aspectRatio: '3/4' }}
                        onClick={() => {
                          setFilters({ ...filters, sortBy: 'newest', categories: [] });
                          setActiveMegaMenu(null);
                        }}
                      >
                        {products[0]?.images?.[0] ? (
                          <img src={products[0].images[0]} alt="New Arrivals" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full" style={{ backgroundColor: effectiveColors.accent }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <span className="mb-1 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90" style={{ backgroundColor: effectiveColors.primary }}>New</span>
                          <h3 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: config.typography.headingFamily }}>New Arrivals</h3>
                          <p className="mt-1 text-xs text-white/70">Fresh picks just for you</p>
                        </div>
                      </button>

                      {/* Best Sellers */}
                      <button
                        className="group relative overflow-hidden rounded-xl"
                        style={{ aspectRatio: '3/4' }}
                        onClick={() => {
                          setFilters({ ...filters, categories: [] });
                          setActiveMegaMenu(null);
                        }}
                      >
                        {products[1]?.images?.[0] ? (
                          <img src={products[1].images[0]} alt="Best Sellers" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full" style={{ backgroundColor: effectiveColors.primary }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <span className="mb-1 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90" style={{ backgroundColor: '#e74c3c' }}>Trending</span>
                          <h3 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: config.typography.headingFamily }}>Best Sellers</h3>
                          <p className="mt-1 text-xs text-white/70">Most loved by customers</p>
                        </div>
                      </button>

                      {/* Sale / Seasonal */}
                      <button
                        className="group relative overflow-hidden rounded-xl"
                        style={{ aspectRatio: '3/4' }}
                        onClick={() => {
                          setFilters({ ...filters, sortBy: 'price-asc', categories: [] });
                          setActiveMegaMenu(null);
                        }}
                      >
                        {products[2]?.images?.[0] ? (
                          <img src={products[2].images[0]} alt="Sale" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full" style={{ backgroundColor: effectiveColors.backgroundSecondary }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <span className="mb-1 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90" style={{ backgroundColor: '#f39c12' }}>Sale</span>
                          <h3 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: config.typography.headingFamily }}>Seasonal Sale</h3>
                          <p className="mt-1 text-xs text-white/70">Up to 50% off select items</p>
                        </div>
                      </button>
                    </div>

                    {/* Bottom row: quick category links */}
                    {categoriesWithProducts.length > 0 && (
                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: effectiveColors.border }}>
                        <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: effectiveColors.foregroundMuted }}>Quick Links:</span>
                        {categoriesWithProducts.slice(0, 6).map((cat) => (
                          <button
                            key={cat.id}
                            className="rounded-full px-4 py-1.5 text-xs font-medium transition-all hover:scale-105"
                            style={{ border: `1px solid ${effectiveColors.border}`, color: effectiveColors.foreground }}
                            onClick={() => {
                              setFilters({ ...filters, categories: [cat.id] });
                              setActiveMegaMenu(null);
                            }}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Regular nav items */}
            {headerMenuItems.length > 0 ? (
              headerMenuItems.slice(0, 5).map((item) => (
                <Link key={item.id} to={item.url} className="px-4 py-3 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
                  {item.name}
                </Link>
              ))
            ) : (
              <>
                {pages.slice(0, 3).map((page) => (
                  <Link key={page.id} to={`/store/${store.slug}/page/${page.slug}`} className="px-4 py-3 text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
                    {page.title}
                  </Link>
                ))}
              </>
            )}
          </div>
        </nav>

        {/* Welcome bar */}
        {customer && (
          <div className="py-1.5 text-center text-xs" style={{ backgroundColor: effectiveColors.backgroundSecondary, color: effectiveColors.foregroundMuted }}>
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Mobile Menu - Modern slide-over */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto shadow-2xl"
            style={{ backgroundColor: effectiveColors.background }}
          >
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
              <Link
                to={`/store/${store.slug}`}
                className="rounded-xl px-4 py-3.5 text-sm font-medium transition-colors hover:bg-black/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <button
                className="rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
                onClick={() => { setFilters({ ...filters, categories: [] }); setMobileMenuOpen(false); }}
              >
                Shop All
              </button>
              {headerMenuItems.length > 0 ? (
                headerMenuItems.map((item) => (
                  <Link key={item.id} to={item.url} className="rounded-xl px-4 py-3.5 text-sm font-medium transition-colors hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>
                    {item.name}
                  </Link>
                ))
              ) : (
                <>
                  {categories.length > 0 && (
                    <div className="mt-2 px-4 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: effectiveColors.foregroundMuted }}>Categories</p>
                    </div>
                  )}
                  {categories.map((cat) => (
                    <button key={cat.id} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-black/5" onClick={() => { setFilters({ ...filters, categories: [cat.id] }); setMobileMenuOpen(false); }}>
                      {cat.image_url && <img src={cat.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
                      {cat.name}
                    </button>
                  ))}
                  {pages.length > 0 && (
                    <div className="mt-2 px-4 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: effectiveColors.foregroundMuted }}>Pages</p>
                    </div>
                  )}
                  {pages.map((page) => (
                    <Link key={page.id} to={`/store/${store.slug}/page/${page.slug}`} className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>
                      {page.title}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Banner Carousel */}
      {banners.length > 0 && <BannerCarousel banners={banners} />}

      {/* Dynamic Section Rendering based on saved order */}
      {sectionOrder.map((sectionId) => renderSection(sectionId))}

      <footer className="relative overflow-hidden" style={{ backgroundColor: isDark ? effectiveColors.backgroundSecondary : "#0a0a0a", color: "#ffffff" }}>
        {/* Subtle gradient accent at top */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${effectiveColors.primary}60, transparent)` }} />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            {/* Brand column */}
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
              {/* Newsletter in footer */}
              <div className="mt-8 flex max-w-sm overflow-hidden rounded-full" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                <input type="email" placeholder="Your email address" className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
                <button className="rounded-full px-6 py-3 text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}>
                  Subscribe
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Shop</h4>
              <ul className="mt-5 space-y-3.5 text-sm text-white/60">
                <li><Link to={`/store/${store.slug}`} className="hover:text-white transition-colors">All Products</Link></li>
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <button onClick={() => setFilters({ ...filters, categories: [cat.id] })} className="hover:text-white transition-colors">{cat.name}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Company</h4>
              <ul className="mt-5 space-y-3.5 text-sm text-white/60">
                {footerMenuItems.length > 0 ? (
                  footerMenuItems.slice(0, 6).map((item) => (
                    <li key={item.id}><Link to={item.url} className="hover:text-white transition-colors">{item.name}</Link></li>
                  ))
                ) : (
                  pages.slice(0, 4).map((page) => (
                    <li key={page.id}><Link to={`/store/${store.slug}/page/${page.slug}`} className="hover:text-white transition-colors">{page.title}</Link></li>
                  ))
                )}
              </ul>
            </div>
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
