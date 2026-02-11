import { ShoppingBag, Search, Menu, X, Heart, User } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStorefront } from "@/contexts/StorefrontContext";
import ProductCard from "@/components/storefront/ProductCard";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import ProductFilters, {
  FilterState,
  ProductFiltersSidebar,
} from "@/components/storefront/ProductFilters";
import BannerCarousel from "@/components/storefront/BannerCarousel";
import StorefrontSearch from "@/components/storefront/StorefrontSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThemeSettings, getBackgroundStyles, getFontFamilyCSS } from "@/hooks/useThemeSettings";
import { useStoreBranding } from "@/hooks/useStoreBranding";

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

interface MinimalThemeProps {
  store: Store;
  products: Product[];
}

export default function MinimalTheme({ store, products }: MinimalThemeProps) {
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

  // Apply store branding
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
      
      return () => {
        styleEl?.remove();
      };
    }
  }, [themeSettings?.custom_css]);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category_id || "")
      ) {
        return false;
      }
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
      }
      if (
        filters.searchQuery &&
        !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const maxPrice = Math.max(...products.map((p) => p.price), 10000);

  // Get styles based on background mode
  const backgroundMode = themeSettings?.background_mode || "light";
  const colors = getBackgroundStyles(backgroundMode);
  const fontFamily = themeSettings?.font_family 
    ? getFontFamilyCSS(themeSettings.font_family) 
    : "'Inter', sans-serif";
  const showStoreName = themeSettings?.show_store_name ?? true;
  const showFeaturedProduct = themeSettings?.show_featured_product ?? false;
  const showBrandStory = themeSettings?.show_brand_story ?? false;
  const showTestimonials = themeSettings?.show_testimonials ?? false;

  // Featured product (first product for now)
  const featuredProduct = products[0];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily,
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur"
        style={{ 
          backgroundColor: `${colors.background}f2`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              to={`/store/${store.slug}`}
              className="flex items-center gap-3 text-xl font-light tracking-wide"
            >
              {store.logo_url && (
                <img src={store.logo_url} alt={store.name} className="h-8 w-auto object-contain" />
              )}
              {showStoreName && <span>{store.name}</span>}
            </Link>
            <nav className="hidden space-x-8 md:flex">
              <Link to={`/store/${store.slug}`} className="text-sm transition-opacity hover:opacity-70" style={{ color: colors.foregroundMuted }}>
                Shop
              </Link>
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: colors.foregroundMuted }}
                  onClick={() => setFilters({ ...filters, categories: [cat.id] })}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 transition-opacity hover:opacity-70" style={{ color: colors.foregroundMuted }} onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative p-2 transition-opacity hover:opacity-70"
              style={{ color: colors.foregroundMuted }}
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  {wishlistItems.length}
                </Badge>
              )}
            </button>
            <button
              className="relative flex items-center gap-2 p-2 transition-opacity hover:opacity-70"
              style={{ color: colors.foregroundMuted }}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </button>
            <button
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: colors.foregroundMuted }}
              onClick={() => setIsAuthOpen(true)}
            >
              <User className="h-5 w-5" />
            </button>
            <button
              className="p-2 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {/* Customer greeting */}
        {customer && (
          <div 
            className="py-1 text-center text-sm"
            style={{ 
              backgroundColor: colors.backgroundSecondary,
              borderTop: `1px solid ${colors.border}`,
              color: colors.foregroundMuted,
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
          style={{ backgroundColor: colors.background }}
        >
          <nav className="flex flex-col items-center gap-8 p-8">
            <Link to={`/store/${store.slug}`} className="text-lg" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </Link>
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
          </nav>
        </div>
      )}

      {/* Banner Carousel */}
      {banners.length > 0 && <BannerCarousel banners={banners} />}

      {/* Hero */}
      <section 
        className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        <h1 className="text-4xl font-light tracking-tight md:text-5xl lg:text-6xl">
          {store.name}
        </h1>
        {store.description && (
          <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: colors.foregroundMuted }}>
            {store.description}
          </p>
        )}
      </section>

      {/* Featured Product Section */}
      {showFeaturedProduct && featuredProduct && (
        <section className="py-16" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-2xl font-light tracking-tight">Featured Product</h2>
            <div className="mx-auto max-w-md">
              <ProductCard
                product={featuredProduct}
                storeSlug={store.slug}
                variant={backgroundMode === "light" ? "minimal" : "bold"}
              />
            </div>
          </div>
        </section>
      )}

      {/* Brand Story Section */}
      {showBrandStory && (
        <section className="py-16" style={{ backgroundColor: colors.background }}>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-light tracking-tight">Our Story</h2>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: colors.foregroundMuted }}>
              {store.description || "We are passionate about bringing you the best products with exceptional quality and service. Our journey started with a simple belief: everyone deserves access to premium products at fair prices."}
            </p>
          </div>
        </section>
      )}

      {/* Category Bar */}
      {categories.length > 0 && (
        <section 
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex gap-4">
              <Button
                variant={filters.categories.length === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, categories: [] })}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={
                    filters.categories.includes(cat.id) ? "default" : "outline"
                  }
                  size="sm"
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
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <ProductFiltersSidebar
            filters={filters}
            onFiltersChange={setFilters}
            maxPrice={maxPrice}
          />

          {/* Product Grid */}
          <div className="flex-1">
            {/* Filter Bar */}
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              maxPrice={maxPrice}
              productCount={filteredProducts.length}
            />

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="mx-auto h-12 w-12" style={{ color: colors.foregroundMuted }} />
                <p className="mt-4" style={{ color: colors.foregroundMuted }}>No products found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    setFilters({
                      categories: [],
                      priceRange: [0, maxPrice],
                      sortBy: "newest",
                      searchQuery: "",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeSlug={store.slug}
                    variant={backgroundMode === "light" ? "minimal" : "bold"}
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
            backgroundColor: colors.backgroundSecondary,
            borderTop: `1px solid ${colors.border}`,
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
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
                >
                  <p className="mb-4 italic" style={{ color: colors.foregroundMuted }}>"{testimonial.text}"</p>
                  <p className="font-medium">— {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer 
        style={{ 
          backgroundColor: colors.backgroundSecondary,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="font-semibold">{store.name}</h4>
              <p className="mt-2 text-sm" style={{ color: colors.foregroundMuted }}>
                {store.description || "Your favorite online store"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Shop</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: colors.foregroundMuted }}>
                <li><Link to={`/store/${store.slug}`}>All Products</Link></li>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Information</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: colors.foregroundMuted }}>
                {pages.slice(0, 4).map((page) => (
                  <li key={page.id}>
                    <Link to={`/store/${store.slug}/page/${page.slug}`} className="hover:opacity-70">
                      {page.title}
                    </Link>
                  </li>
                ))}
                {pages.length === 0 && (
                  <>
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">Shipping</a></li>
                    <li><a href="#">Returns</a></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Contact</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: colors.foregroundMuted }}>
                <li>support@{store.slug}.com</li>
                <li>+91 9876543210</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center" style={{ borderColor: colors.border }}>
            <p className="text-sm" style={{ color: colors.foregroundMuted }}>
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Drawers and Modals */}
      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
      <StorefrontSearch products={products} storeSlug={store.slug} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
