import { ShoppingBag, Search, Menu, X, Heart, User, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStorefront } from "@/contexts/StorefrontContext";
import ProductCard from "@/components/storefront/ProductCard";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import ProductFilters, { FilterState, ProductFiltersSidebar } from "@/components/storefront/ProductFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryThemeConfig } from "./config/themeConfig";

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
  } = useStorefront();

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

  const isDark = config.colors.background.startsWith("#0") || config.colors.background.startsWith("#1");

  const borderRadiusClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  }[config.style.borderRadius];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: config.colors.background,
        color: config.colors.foreground,
        fontFamily: config.typography.fontFamily,
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ 
          backgroundColor: `${config.colors.background}e6`,
          borderBottom: `1px solid ${config.colors.border}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              to={`/store/${store.slug}`}
              className="text-xl transition-opacity hover:opacity-80"
              style={{ 
                fontFamily: config.typography.headingFamily,
                fontWeight: config.typography.headingWeight,
                letterSpacing: config.typography.letterSpacing,
                textTransform: config.typography.headingStyle === "uppercase" ? "uppercase" : undefined,
              }}
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-8 object-contain" />
              ) : (
                store.name
              )}
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link to={`/store/${store.slug}`} className="text-sm transition-opacity hover:opacity-70" style={{ color: config.colors.foregroundMuted }}>
                Shop
              </Link>
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: config.colors.foregroundMuted }}
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
                  style={{ color: config.colors.foregroundMuted }}
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className={`p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: config.colors.foregroundMuted }}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className={`relative p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: config.colors.foregroundMuted }}
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span 
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: config.colors.accent, color: config.colors.accentForeground }}
                >
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button
              className={`relative p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: config.colors.foregroundMuted }}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span 
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: config.colors.primary, color: config.colors.primaryForeground }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className={`p-2.5 ${borderRadiusClass} transition-colors`}
              style={{ color: config.colors.foregroundMuted }}
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
              backgroundColor: config.colors.backgroundSecondary,
              borderTop: `1px solid ${config.colors.border}`,
              color: config.colors.foregroundMuted,
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
          style={{ backgroundColor: config.colors.background }}
        >
          <nav className="flex flex-col items-center gap-6 p-8">
            <Link to={`/store/${store.slug}`} className="text-lg" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
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
          </nav>
        </div>
      )}

      {/* Hero */}
      <section 
        className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"
        style={{ backgroundColor: config.colors.backgroundSecondary }}
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
          <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: config.colors.foregroundMuted }}>
            {store.description}
          </p>
        )}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            className={`px-8 py-3 ${borderRadiusClass} font-semibold transition-all hover:scale-105`}
            style={{ 
              backgroundColor: config.colors.primary,
              color: config.colors.primaryForeground,
            }}
          >
            Shop Now
          </button>
          {config.features.includes("lookbook") && (
            <button
              className={`px-8 py-3 ${borderRadiusClass} font-semibold transition-all`}
              style={{ 
                backgroundColor: "transparent",
                color: config.colors.primary,
                border: `2px solid ${config.colors.primary}`,
              }}
            >
              View Lookbook
            </button>
          )}
        </div>
      </section>

      {/* Category Pills */}
      {categories.length > 0 && (
        <section 
          className="border-y"
          style={{ 
            backgroundColor: config.colors.backgroundTertiary,
            borderColor: config.colors.border,
          }}
        >
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex gap-3">
              <button
                className={`px-4 py-2 text-sm font-medium transition-all ${borderRadiusClass}`}
                style={{
                  backgroundColor: filters.categories.length === 0 ? config.colors.primary : "transparent",
                  color: filters.categories.length === 0 ? config.colors.primaryForeground : config.colors.foregroundMuted,
                  border: `1px solid ${filters.categories.length === 0 ? config.colors.primary : config.colors.border}`,
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
                    backgroundColor: filters.categories.includes(cat.id) ? config.colors.primary : "transparent",
                    color: filters.categories.includes(cat.id) ? config.colors.primaryForeground : config.colors.foregroundMuted,
                    border: `1px solid ${filters.categories.includes(cat.id) ? config.colors.primary : config.colors.border}`,
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
                <ShoppingBag className="mx-auto h-12 w-12" style={{ color: config.colors.foregroundSubtle }} />
                <p className="mt-4" style={{ color: config.colors.foregroundMuted }}>No products found</p>
                <button
                  className={`mt-4 px-6 py-2 ${borderRadiusClass}`}
                  style={{ 
                    border: `1px solid ${config.colors.border}`,
                    color: config.colors.foreground,
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

      {/* Footer */}
      <footer 
        className="border-t"
        style={{ 
          backgroundColor: config.colors.backgroundSecondary,
          borderColor: config.colors.border,
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
              <p className="mt-2 text-sm" style={{ color: config.colors.foregroundMuted }}>
                {store.description || "Your favorite online store"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Shop</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: config.colors.foregroundMuted }}>
                <li><Link to={`/store/${store.slug}`}>All Products</Link></li>
                {categories.slice(0, 3).map((cat) => (
                  <li key={cat.id}>
                    <button onClick={() => setFilters({ ...filters, categories: [cat.id] })}>{cat.name}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Information</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: config.colors.foregroundMuted }}>
                {pages.slice(0, 4).map((page) => (
                  <li key={page.id}>
                    <Link to={`/store/${store.slug}/page/${page.slug}`}>{page.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Contact</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: config.colors.foregroundMuted }}>
                <li>support@{store.slug}.com</li>
                <li>+91 9876543210</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center" style={{ borderColor: config.colors.border }}>
            <p className="text-sm" style={{ color: config.colors.foregroundMuted }}>
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
