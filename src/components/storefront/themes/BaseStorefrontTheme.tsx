import { ShoppingBag, Search, Menu, X, Heart, User, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStorefront } from "@/contexts/StorefrontContext";
import ProductCard from "@/components/storefront/ProductCard";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import ProductFilters, { FilterState, ProductFiltersSidebar } from "@/components/storefront/ProductFilters";
import BannerCarousel from "@/components/storefront/BannerCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryThemeConfig } from "./config/themeConfig";
import { useThemeSettings, getBackgroundStyles, getFontFamilyCSS } from "@/hooks/useThemeSettings";

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

  // Apply favicon
  useEffect(() => {
    if (themeSettings?.favicon_url) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = themeSettings.favicon_url;
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = themeSettings.favicon_url;
        document.head.appendChild(newLink);
      }
    }
  }, [themeSettings?.favicon_url]);

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
      
      return () => {
        styleEl?.remove();
      };
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

  // Merge theme settings with config - settings override config when set
  const backgroundMode = themeSettings?.background_mode || "light";
  const bgStyles = getBackgroundStyles(backgroundMode);
  
  // Use database settings if available, otherwise fall back to config
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
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  }[config.style.borderRadius];

  // Featured product
  const featuredProduct = products[0];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: effectiveColors.background,
        color: effectiveColors.foreground,
        fontFamily: effectiveFontFamily,
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ 
          backgroundColor: `${effectiveColors.background}e6`,
          borderBottom: `1px solid ${effectiveColors.border}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              to={`/store/${store.slug}`}
              className="flex items-center gap-3 text-xl transition-opacity hover:opacity-80"
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
              {showStoreName && <span>{store.name}</span>}
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link to={`/store/${store.slug}`} className="text-sm transition-opacity hover:opacity-70" style={{ color: effectiveColors.foregroundMuted }}>
                Shop
              </Link>
              {headerMenuItems.length > 0 ? (
                // Use dynamic header menu items
                headerMenuItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    to={item.url}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: effectiveColors.foregroundMuted }}
                  >
                    {item.name}
                  </Link>
                ))
              ) : (
                // Fallback to categories + pages
                <>
                  {categories.slice(0, 4).map((cat) => (
                    <button
                      key={cat.id}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: effectiveColors.foregroundMuted }}
                      onClick={() => setFilters({ ...filters, categories: [cat.id] })}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {pages.slice(0, 2).map((page) => (
                    <Link
                      key={page.id}
                      to={`/store/${store.slug}/page/${page.slug}`}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: effectiveColors.foregroundMuted }}
                    >
                      {page.title}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className={`p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: effectiveColors.foregroundMuted }}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className={`relative p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: effectiveColors.foregroundMuted }}
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span 
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: effectiveColors.accent, color: effectiveColors.accentForeground }}
                >
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button
              className={`relative p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: effectiveColors.foregroundMuted }}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span 
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: effectiveColors.primary, color: effectiveColors.primaryForeground }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className={`p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: effectiveColors.foregroundMuted }}
              onClick={() => setIsAuthOpen(true)}
            >
              <User className="h-5 w-5" />
            </button>
            <button
              className={`p-2.5 ${borderRadiusClass} md:hidden`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {customer && (
          <div 
            className="py-2 text-center text-sm"
            style={{ 
              backgroundColor: effectiveColors.backgroundSecondary,
              borderTop: `1px solid ${effectiveColors.border}`,
              color: effectiveColors.foregroundMuted,
            }}
          >
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 pt-16 md:hidden"
          style={{ backgroundColor: effectiveColors.background }}
        >
          <nav className="flex flex-col items-center gap-6 p-8">
            <Link to={`/store/${store.slug}`} className="text-lg" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            {headerMenuItems.length > 0 ? (
              // Use dynamic header menu items
              headerMenuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.url}
                  className="text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))
            ) : (
              // Fallback to categories + pages
              <>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="text-lg"
                    onClick={() => {
                      setFilters({ ...filters, categories: [cat.id] });
                      setMobileMenuOpen(false);
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    to={`/store/${store.slug}/page/${page.slug}`}
                    className="text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
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

      {/* Hero */}
      <section 
        className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"
        style={{ backgroundColor: effectiveColors.backgroundSecondary }}
      >
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl"
          style={{ 
            fontFamily: config.typography.headingFamily,
            fontWeight: config.typography.headingWeight,
            letterSpacing: config.typography.letterSpacing,
            textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined,
          }}
        >
          {store.name}
        </h1>
        {store.description && (
          <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: effectiveColors.foregroundMuted }}>
            {store.description}
          </p>
        )}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            className={`px-8 py-3 ${borderRadiusClass} font-semibold transition-all hover:scale-105`}
            style={{ 
              backgroundColor: effectiveColors.primary,
              color: effectiveColors.primaryForeground,
            }}
          >
            Shop Now
          </button>
          {config.features.includes("lookbook") && (
            <button
              className={`px-8 py-3 ${borderRadiusClass} font-semibold transition-all`}
              style={{ 
                backgroundColor: "transparent",
                color: effectiveColors.primary,
                border: `2px solid ${effectiveColors.primary}`,
              }}
            >
              View Lookbook
            </button>
          )}
        </div>
      </section>

      {/* Featured Product Section */}
      {showFeaturedProduct && featuredProduct && (
        <section className="py-16" style={{ backgroundColor: effectiveColors.backgroundSecondary }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-2xl font-light tracking-tight">Featured Product</h2>
            <div className="mx-auto max-w-md">
              <ProductCard
                product={featuredProduct}
                storeSlug={store.slug}
                variant={isDark ? "bold" : "minimal"}
              />
            </div>
          </div>
        </section>
      )}

      {/* Brand Story Section */}
      {showBrandStory && (
        <section className="py-16" style={{ backgroundColor: effectiveColors.background }}>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-light tracking-tight">Our Story</h2>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: effectiveColors.foregroundMuted }}>
              {store.description || "We are passionate about bringing you the best products with exceptional quality and service."}
            </p>
          </div>
        </section>
      )}

      {/* Category Pills */}
      {categories.length > 0 && (
        <section 
          className="border-y"
          style={{ 
            backgroundColor: effectiveColors.backgroundTertiary,
            borderColor: effectiveColors.border,
          }}
        >
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex gap-3">
              <button
                className={`px-4 py-2 text-sm font-medium transition-all ${borderRadiusClass}`}
                style={{
                  backgroundColor: filters.categories.length === 0 ? effectiveColors.primary : "transparent",
                  color: filters.categories.length === 0 ? effectiveColors.primaryForeground : effectiveColors.foregroundMuted,
                  border: `1px solid ${filters.categories.length === 0 ? effectiveColors.primary : effectiveColors.border}`,
                }}
                onClick={() => setFilters({ ...filters, categories: [] })}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 text-sm font-medium transition-all ${borderRadiusClass}`}
                  style={{
                    backgroundColor: filters.categories.includes(cat.id) ? effectiveColors.primary : "transparent",
                    color: filters.categories.includes(cat.id) ? effectiveColors.primaryForeground : effectiveColors.foregroundMuted,
                    border: `1px solid ${filters.categories.includes(cat.id) ? effectiveColors.primary : effectiveColors.border}`,
                  }}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      categories: filters.categories.includes(cat.id)
                        ? filters.categories.filter((c) => c !== cat.id)
                        : [...filters.categories, cat.id],
                    })
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <ProductFiltersSidebar filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} />
          <div className="flex-1">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              maxPrice={maxPrice}
              productCount={filteredProducts.length}
            />
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="mx-auto h-12 w-12" style={{ color: effectiveColors.foregroundSubtle }} />
                <p className="mt-4" style={{ color: effectiveColors.foregroundMuted }}>No products found</p>
                <button
                  className={`mt-4 px-6 py-2 ${borderRadiusClass}`}
                  style={{ 
                    border: `1px solid ${effectiveColors.border}`,
                    color: effectiveColors.foreground,
                  }}
                  onClick={() => setFilters({ categories: [], priceRange: [0, maxPrice], sortBy: "newest", searchQuery: "" })}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeSlug={store.slug}
                    variant={isDark ? "bold" : "minimal"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {showTestimonials && (
        <section 
          className="py-16"
          style={{ 
            backgroundColor: effectiveColors.backgroundSecondary,
            borderTop: `1px solid ${effectiveColors.border}`,
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-2xl font-light tracking-tight">What Our Customers Say</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { name: "Sarah M.", text: "Amazing quality products! Fast shipping and excellent customer service." },
                { name: "John D.", text: "I've been a loyal customer for years. The quality never disappoints." },
                { name: "Emily R.", text: "Best online shopping experience I've ever had. Highly recommend!" },
              ].map((testimonial, i) => (
                <div 
                  key={i} 
                  className="rounded-lg p-6"
                  style={{ backgroundColor: effectiveColors.background, border: `1px solid ${effectiveColors.border}` }}
                >
                  <p className="mb-4 italic" style={{ color: effectiveColors.foregroundMuted }}>"{testimonial.text}"</p>
                  <p className="font-medium">— {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer 
        className="border-t"
        style={{ 
          backgroundColor: effectiveColors.backgroundSecondary,
          borderColor: effectiveColors.border,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 
                className="font-semibold"
                style={{ fontFamily: config.typography.headingFamily }}
              >
                {store.name}
              </h4>
              <p className="mt-2 text-sm" style={{ color: effectiveColors.foregroundMuted }}>
                {store.description || "Your favorite online store"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Shop</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: effectiveColors.foregroundMuted }}>
                <li><Link to={`/store/${store.slug}`}>All Products</Link></li>
                {categories.slice(0, 3).map((cat) => (
                  <li key={cat.id}>
                    <button onClick={() => setFilters({ ...filters, categories: [cat.id] })}>{cat.name}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Links</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: effectiveColors.foregroundMuted }}>
                {footerMenuItems.length > 0 ? (
                  // Use dynamic footer menu items
                  footerMenuItems.slice(0, 6).map((item) => (
                    <li key={item.id}>
                      <Link to={item.url}>{item.name}</Link>
                    </li>
                  ))
                ) : (
                  // Fallback to pages
                  pages.slice(0, 4).map((page) => (
                    <li key={page.id}>
                      <Link to={`/store/${store.slug}/page/${page.slug}`}>{page.title}</Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Contact</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: effectiveColors.foregroundMuted }}>
                <li>support@{store.slug}.com</li>
                <li>+91 9876543210</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center" style={{ borderColor: effectiveColors.border }}>
            <p className="text-sm" style={{ color: effectiveColors.foregroundMuted }}>
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
    </div>
  );
}
