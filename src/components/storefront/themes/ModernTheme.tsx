import { ShoppingBag, Search, Menu, X, ChevronRight, Heart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useStorefront } from "@/contexts/StorefrontContext";
import ProductCard from "@/components/storefront/ProductCard";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import ProductFilters, { FilterState } from "@/components/storefront/ProductFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface ModernThemeProps {
  store: Store;
  products: Product[];
}

export default function ModernTheme({ store, products }: ModernThemeProps) {
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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <a href={`/store/${store.slug}`} className="flex items-center gap-2">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                  <span className="text-sm font-semibold text-white">{store.name.charAt(0)}</span>
                </div>
              )}
              <span className="font-semibold">{store.name}</span>
            </a>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900">Products</a>
              {categories.slice(0, 3).map((cat) => (
                <a key={cat.id} href="#" className="text-sm text-zinc-600 hover:text-zinc-900"
                  onClick={(e) => { e.preventDefault(); setFilters({ ...filters, categories: [cat.id] }); }}>
                  {cat.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 hover:bg-zinc-100">
              <Search className="h-5 w-5 text-zinc-600" />
            </button>
            <button className="relative rounded-full p-2 hover:bg-zinc-100" onClick={() => setIsWishlistOpen(true)}>
              <Heart className="h-5 w-5 text-zinc-600" />
              {wishlistItems.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button className="relative rounded-full p-2 hover:bg-zinc-100" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-5 w-5 text-zinc-600" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="rounded-full p-2 hover:bg-zinc-100" onClick={() => setIsAuthOpen(true)}>
              <User className="h-5 w-5 text-zinc-600" />
            </button>
            <button className="rounded-full p-2 hover:bg-zinc-100 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {customer && (
          <div className="border-t bg-zinc-50 py-1 text-center text-sm text-zinc-600">
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            <a href="#" className="rounded-lg p-3 hover:bg-zinc-100">Products</a>
            {categories.map((cat) => (
              <a key={cat.id} href="#" className="rounded-lg p-3 hover:bg-zinc-100"
                onClick={(e) => { e.preventDefault(); setFilters({ ...filters, categories: [cat.id] }); setMobileMenuOpen(false); }}>
                {cat.name}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white">New Collection</span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">{store.name}</h1>
              {store.description && <p className="mt-6 text-lg leading-relaxed text-zinc-600">{store.description}</p>}
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800">
                  Shop Now <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-3xl bg-zinc-200">
                {products[0]?.images?.[0] ? (
                  <img src={products[0].images[0]} alt="Featured" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-20 w-20 text-zinc-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-y bg-white">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex gap-3">
              <Button variant={filters.categories.length === 0 ? "default" : "outline"} size="sm" className="rounded-full"
                onClick={() => setFilters({ ...filters, categories: [] })}>All</Button>
              {categories.map((cat) => (
                <Button key={cat.id} variant={filters.categories.includes(cat.id) ? "default" : "outline"} size="sm" className="rounded-full"
                  onClick={() => setFilters({ ...filters, categories: filters.categories.includes(cat.id)
                    ? filters.categories.filter((c) => c !== cat.id) : [...filters.categories, cat.id] })}>
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">All Products</h2>
            <p className="mt-1 text-zinc-600">Browse our latest collection</p>
          </div>
        </div>
        
        <ProductFilters filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} productCount={filteredProducts.length} />
        
        {filteredProducts.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-4 text-zinc-500">No products found</p>
            <Button variant="outline" className="mt-4"
              onClick={() => setFilters({ categories: [], priceRange: [0, maxPrice], sortBy: "newest", searchQuery: "" })}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={store.slug} variant="modern" />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                  <span className="text-sm font-semibold text-white">{store.name.charAt(0)}</span>
                </div>
                <span className="font-semibold">{store.name}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{store.description || "Modern shopping experience"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Shop</h4>
              <ul className="mt-2 space-y-2 text-sm text-zinc-600">
                <li><a href="#">All Products</a></li>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Information</h4>
              <ul className="mt-2 space-y-2 text-sm text-zinc-600">
                {pages.slice(0, 4).map((page) => (
                  <li key={page.id}>
                    <a href={`/store/${store.slug}/page/${page.slug}`} className="hover:text-zinc-900">
                      {page.title}
                    </a>
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
              <p className="mt-2 text-sm text-zinc-600">support@{store.slug}.com</p>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex items-center justify-between">
            <p className="text-sm text-zinc-500">© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
    </div>
  );
}
