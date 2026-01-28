import { ShoppingBag, Search, Menu, X, Heart, User } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";
import { useStorefront } from "@/contexts/StorefrontContext";
import ProductCard from "@/components/storefront/ProductCard";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import ProductFilters, {
  FilterState,
  ProductFiltersSidebar,
} from "@/components/storefront/ProductFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category_id || "")
      ) {
        return false;
      }
      // Price filter
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
      }
      // Search filter
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <a
              href={`/store/${store.slug}`}
              className="text-xl font-light tracking-wide"
            >
              {store.name}
            </a>
            <nav className="hidden space-x-8 md:flex">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Shop
              </a>
              {categories.slice(0, 4).map((cat) => (
                <a
                  key={cat.id}
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={(e) => {
                    e.preventDefault();
                    setFilters({ ...filters, categories: [cat.id] });
                  }}
                >
                  {cat.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900"
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
              className="relative flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900"
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
              className="p-2 text-gray-600 hover:text-gray-900"
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
          <div className="border-t bg-gray-50 py-1 text-center text-sm text-gray-600">
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <nav className="flex flex-col items-center gap-8 p-8">
            <a href="#" className="text-lg">
              Shop
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href="#"
                className="text-lg"
                onClick={(e) => {
                  e.preventDefault();
                  setFilters({ ...filters, categories: [cat.id] });
                  setMobileMenuOpen(false);
                }}
              >
                {cat.name}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl lg:text-6xl">
          {store.name}
        </h1>
        {store.description && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            {store.description}
          </p>
        )}
      </section>

      {/* Category Bar */}
      {categories.length > 0 && (
        <section className="border-y bg-gray-50">
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
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">No products found</p>
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
                    variant="minimal"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="font-semibold">{store.name}</h4>
              <p className="mt-2 text-sm text-gray-600">
                {store.description || "Your favorite online store"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Shop</h4>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li><a href="#">All Products</a></li>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Help</h4>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Shipping</a></li>
                <li><a href="#">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Contact</h4>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>support@{store.slug}.com</li>
                <li>+91 9876543210</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Drawers and Modals */}
      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
    </div>
  );
}
