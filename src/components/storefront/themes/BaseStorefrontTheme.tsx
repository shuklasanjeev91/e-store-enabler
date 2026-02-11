import { ShoppingBag, Search, Menu, X, Heart, User, ChevronRight, ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
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
    coverImage: products.find(p => p.category_id === cat.id)?.images?.[0],
  })).filter(cat => cat.productCount > 0);

  const heroHasImage = !!sectionContent.hero.background_image;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: effectiveColors.background,
        color: effectiveColors.foreground,
        fontFamily: effectiveFontFamily,
      }}
    >
      {/* Announcement Bar */}
      {sectionContent.hero.cta_secondary_text && (
        <div
          className="py-2 text-center text-xs font-medium tracking-wide sm:text-sm"
          style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}
        >
          {sectionContent.hero.cta_secondary_text}
        </div>
      )}

      {/* Header - Shopify-style clean header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: `${effectiveColors.background}ee`,
          borderBottom: `1px solid ${effectiveColors.border}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            {/* Mobile menu toggle */}
            <button
              className="p-2 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link
              to={`/store/${store.slug}`}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
              style={{
                fontFamily: config.typography.headingFamily,
                fontWeight: config.typography.headingWeight,
                letterSpacing: config.typography.letterSpacing,
                textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined,
              }}
            >
              {store.logo_url && (
                <img src={store.logo_url} alt={store.name} className="h-8 object-contain" />
              )}
              {showStoreName && <span className="text-lg">{store.name}</span>}
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link to={`/store/${store.slug}`} className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
              Shop All
            </Link>
            {headerMenuItems.length > 0 ? (
              headerMenuItems.slice(0, 5).map((item) => (
                <Link key={item.id} to={item.url} className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: effectiveColors.foreground }}>
                  {item.name}
                </Link>
              ))
            ) : (
              <>
                {categories.slice(0, 4).map((cat) => (
                  <button key={cat.id} className="text-sm font-medium transition-colors hover:opacity-70" onClick={() => setFilters({ ...filters, categories: [cat.id] })}>
                    {cat.name}
                  </button>
                ))}
                {pages.slice(0, 2).map((page) => (
                  <Link key={page.id} to={`/store/${store.slug}/page/${page.slug}`} className="text-sm font-medium transition-colors hover:opacity-70">
                    {page.title}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            <button className="p-2.5 transition-opacity hover:opacity-60" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </button>
            <button className="relative p-2.5 transition-opacity hover:opacity-60" onClick={() => setIsAuthOpen(true)}>
              <User className="h-5 w-5" />
            </button>
            <button className="relative p-2.5 transition-opacity hover:opacity-60" onClick={() => setIsWishlistOpen(true)}>
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: effectiveColors.primary }}>
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button className="relative p-2.5 transition-opacity hover:opacity-60" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: effectiveColors.primary }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Welcome bar */}
        {customer && (
          <div className="py-1.5 text-center text-xs" style={{ backgroundColor: effectiveColors.backgroundSecondary, color: effectiveColors.foregroundMuted }}>
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16 md:hidden" style={{ backgroundColor: effectiveColors.background }}>
          <nav className="flex flex-col gap-1 p-4">
            <Link to={`/store/${store.slug}`} className="rounded-lg px-4 py-3 text-base font-medium hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
            {headerMenuItems.length > 0 ? (
              headerMenuItems.map((item) => (
                <Link key={item.id} to={item.url} className="rounded-lg px-4 py-3 text-base font-medium hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </Link>
              ))
            ) : (
              <>
                {categories.map((cat) => (
                  <button key={cat.id} className="rounded-lg px-4 py-3 text-left text-base font-medium hover:bg-black/5" onClick={() => { setFilters({ ...filters, categories: [cat.id] }); setMobileMenuOpen(false); }}>
                    {cat.name}
                  </button>
                ))}
                {pages.map((page) => (
                  <Link key={page.id} to={`/store/${store.slug}/page/${page.slug}`} className="rounded-lg px-4 py-3 text-base font-medium hover:bg-black/5" onClick={() => setMobileMenuOpen(false)}>
                    {page.title}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
      )}

      {/* Banner Carousel */}
      {banners.length > 0 && <BannerCarousel banners={banners} />}

      {/* Hero Section - Full-bleed Shopify-style */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: heroHasImage ? undefined : effectiveColors.backgroundSecondary,
          minHeight: heroHasImage ? "70vh" : undefined,
        }}
      >
        {/* Background Image */}
        {heroHasImage && (
          <>
            <img
              src={sectionContent.hero.background_image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}

        <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${heroHasImage ? "flex min-h-[70vh] items-center py-20" : "py-16 md:py-24"}`}>
          <div className={heroHasImage ? "max-w-xl" : "text-center"}>
            {/* Overline text */}
            {config.features.includes("lookbook") && (
              <p
                className={`mb-4 text-sm font-semibold uppercase tracking-widest ${heroHasImage ? "text-white/80" : ""}`}
                style={heroHasImage ? {} : { color: effectiveColors.primary }}
              >
                New Collection
              </p>
            )}

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] ${heroHasImage ? "text-white" : ""}`}
              style={{
                fontFamily: config.typography.headingFamily,
                fontWeight: config.typography.headingWeight,
                letterSpacing: config.typography.letterSpacing,
                textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined,
              }}
            >
              {sectionContent.hero.heading || store.name}
            </h1>

            {(sectionContent.hero.subheading || store.description) && (
              <p className={`mt-6 max-w-lg text-base md:text-lg leading-relaxed ${heroHasImage ? "text-white/80" : ""} ${!heroHasImage ? "mx-auto" : ""}`}
                style={heroHasImage ? {} : { color: effectiveColors.foregroundMuted }}
              >
                {sectionContent.hero.subheading || store.description}
              </p>
            )}

            <div className={`mt-8 flex items-center gap-4 ${!heroHasImage ? "justify-center" : ""}`}>
              <button
                className={`group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold transition-all hover:gap-3 ${borderRadiusClass}`}
                style={{
                  backgroundColor: heroHasImage ? "#ffffff" : effectiveColors.primary,
                  color: heroHasImage ? "#000000" : effectiveColors.primaryForeground,
                }}
              >
                {sectionContent.hero.cta_text || "Shop Now"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Showcase - Shopify-style visual category blocks */}
      {categoriesWithProducts.length > 0 && (
        <section className="py-16 md:py-20" style={{ backgroundColor: effectiveColors.background }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2
                  className="text-2xl md:text-3xl"
                  style={{
                    fontFamily: config.typography.headingFamily,
                    fontWeight: config.typography.headingWeight,
                  }}
                >
                  Shop by Category
                </h2>
                <p className="mt-2 text-sm" style={{ color: effectiveColors.foregroundMuted }}>
                  Browse our curated collections
                </p>
              </div>
            </div>

            <div className={`grid gap-4 ${
              categoriesWithProducts.length === 1 ? "grid-cols-1" :
              categoriesWithProducts.length === 2 ? "grid-cols-1 md:grid-cols-2" :
              categoriesWithProducts.length === 3 ? "grid-cols-1 md:grid-cols-3" :
              "grid-cols-2 md:grid-cols-4"
            }`}>
              {categoriesWithProducts.slice(0, 8).map((cat, idx) => (
                <button
                  key={cat.id}
                  className={`group relative overflow-hidden ${borderRadiusClass} ${
                    idx === 0 && categoriesWithProducts.length > 2 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                  style={{ aspectRatio: idx === 0 && categoriesWithProducts.length > 2 ? "1/1" : "4/5" }}
                  onClick={() => setFilters({ ...filters, categories: [cat.id] })}
                >
                  {cat.coverImage ? (
                    <img
                      src={cat.coverImage}
                      alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: effectiveColors.backgroundSecondary }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg font-semibold text-white md:text-xl">
                      {cat.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-white/70">
                      {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Product Section */}
      {showFeaturedProduct && featuredProduct && (
        <section className="py-16" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2
              className="mb-8 text-center text-2xl"
              style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}
            >
              {sectionContent.featured_product.title || "Featured Product"}
            </h2>
            <div className="mx-auto max-w-sm">
              <ProductCard product={featuredProduct} storeSlug={store.slug} variant={isDark ? "bold" : "minimal"} primaryColor={effectiveColors.primary} accentColor={effectiveColors.accent} />
            </div>
          </div>
        </section>
      )}

      {/* Brand Story Section - Shopify-style split layout */}
      {showBrandStory && (
        <section className="py-16 md:py-20" style={{ backgroundColor: effectiveColors.background }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {sectionContent.brand_story.image_url ? (
                <div className={`aspect-[4/3] overflow-hidden ${borderRadiusClass}`}>
                  <img src={sectionContent.brand_story.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className={`aspect-[4/3] ${borderRadiusClass}`} style={{ backgroundColor: effectiveColors.backgroundSecondary }} />
              )}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: effectiveColors.primary }}>
                  Our Story
                </p>
                <h2
                  className="mt-3 text-3xl md:text-4xl"
                  style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}
                >
                  {sectionContent.brand_story.title || "Our Story"}
                </h2>
                <p className="mt-6 text-base leading-relaxed" style={{ color: effectiveColors.foregroundMuted }}>
                  {sectionContent.brand_story.content || store.description || "We are passionate about bringing you the best products with exceptional quality and service."}
                </p>
                <button
                  className={`mt-8 inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-semibold transition-colors`}
                  style={{ borderColor: effectiveColors.primary, color: effectiveColors.primary }}
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-16 md:py-20" id="products" style={{ backgroundColor: effectiveColors.background }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2
                className="text-2xl md:text-3xl"
                style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}
              >
                {filters.categories.length > 0
                  ? categories.find(c => c.id === filters.categories[0])?.name || "Products"
                  : "All Products"}
              </h2>
              <p className="mt-1 text-sm" style={{ color: effectiveColors.foregroundMuted }}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Category pills inline */}
            {categories.length > 0 && (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  className={`px-4 py-1.5 text-sm font-medium transition-all ${borderRadiusClass}`}
                  style={{
                    backgroundColor: filters.categories.length === 0 ? effectiveColors.primary : "transparent",
                    color: filters.categories.length === 0 ? effectiveColors.primaryForeground : effectiveColors.foregroundMuted,
                  }}
                  onClick={() => setFilters({ ...filters, categories: [] })}
                >
                  All
                </button>
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-4 py-1.5 text-sm font-medium transition-all ${borderRadiusClass}`}
                    style={{
                      backgroundColor: filters.categories.includes(cat.id) ? effectiveColors.primary : "transparent",
                      color: filters.categories.includes(cat.id) ? effectiveColors.primaryForeground : effectiveColors.foregroundMuted,
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
                  <button
                    className={`mt-4 px-6 py-2 ${borderRadiusClass}`}
                    style={{ border: `1px solid ${effectiveColors.border}`, color: effectiveColors.foreground }}
                    onClick={() => setFilters({ categories: [], priceRange: [0, maxPrice], sortBy: "newest", searchQuery: "" })}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-x-5 gap-y-10 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeSlug={store.slug}
                      variant={isDark ? "bold" : "minimal"}
                      primaryColor={effectiveColors.primary}
                      accentColor={effectiveColors.accent}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Shopify-style */}
      {showTestimonials && (
        <section className="py-16 md:py-20" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2
                className="text-2xl md:text-3xl"
                style={{ fontFamily: config.typography.headingFamily, fontWeight: config.typography.headingWeight }}
              >
                {sectionContent.testimonials.title || "What Our Customers Say"}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {(sectionContent.testimonials.items || [
                { name: "Sarah M.", text: "Amazing quality products! Fast shipping and excellent customer service.", rating: 5 },
                { name: "John D.", text: "I've been a loyal customer for years. The quality never disappoints.", rating: 5 },
                { name: "Emily R.", text: "Best online shopping experience I've ever had. Highly recommend!", rating: 5 },
              ]).filter(t => t.name && t.text).map((testimonial, i) => (
                <div
                  key={i}
                  className={`${borderRadiusClass} p-6 md:p-8`}
                  style={{ backgroundColor: effectiveColors.background, border: `1px solid ${effectiveColors.border}` }}
                >
                  {/* Stars */}
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating || 5)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed md:text-base" style={{ color: effectiveColors.foregroundMuted }}>
                    "{testimonial.text}"
                  </p>
                  <p className="mt-4 text-sm font-semibold">— {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: effectiveColors.primary }}>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2
            className="text-2xl md:text-3xl"
            style={{
              fontFamily: config.typography.headingFamily,
              fontWeight: config.typography.headingWeight,
              color: effectiveColors.primaryForeground,
            }}
          >
            {sectionContent.newsletter.title || "Stay Updated"}
          </h2>
          <p className="mt-3 text-sm opacity-80" style={{ color: effectiveColors.primaryForeground }}>
            {sectionContent.newsletter.subtitle || "Subscribe to our newsletter for the latest updates and offers."}
          </p>
          <div className="mx-auto mt-8 flex max-w-md gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className={`flex-1 px-4 py-3 text-sm ${borderRadiusClass} border-0 focus:outline-none focus:ring-2`}
              style={{
                backgroundColor: `${effectiveColors.primaryForeground}15`,
                color: effectiveColors.primaryForeground,
                caretColor: effectiveColors.primaryForeground,
              }}
            />
            <button
              className={`px-6 py-3 text-sm font-semibold ${borderRadiusClass} transition-opacity hover:opacity-90`}
              style={{
                backgroundColor: effectiveColors.primaryForeground,
                color: effectiveColors.primary,
              }}
            >
              {sectionContent.newsletter.button_text || "Subscribe"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Shopify-style multi-column */}
      <footer style={{ backgroundColor: isDark ? effectiveColors.backgroundSecondary : "#111111", color: "#ffffff" }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                {store.logo_url && <img src={store.logo_url} alt={store.name} className="h-8 object-contain brightness-0 invert" />}
                <h4 className="text-lg font-semibold" style={{ fontFamily: config.typography.headingFamily }}>
                  {store.name}
                </h4>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {sectionContent.footer.tagline || store.description || "Your favorite online store"}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40">Shop</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li><Link to={`/store/${store.slug}`} className="hover:text-white transition-colors">All Products</Link></li>
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <button onClick={() => setFilters({ ...filters, categories: [cat.id] })} className="hover:text-white transition-colors">{cat.name}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40">Company</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
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
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40">Contact</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>{sectionContent.footer.contact_email || `support@${store.slug}.com`}</li>
                <li>{sectionContent.footer.contact_phone || "+91 9876543210"}</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-xs text-white/40">
              {sectionContent.footer.copyright_text || `© ${new Date().getFullYear()} ${store.name}. All rights reserved.`}
            </p>
            <div className="flex gap-6 text-xs text-white/40">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Refund Policy</span>
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
