import { ShoppingBag, Search, Menu, X, ArrowRight, Heart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useStorefront } from "@/contexts/StorefrontContext";
import ProductCard from "@/components/storefront/ProductCard";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import ProductFilters, { FilterState, ProductFiltersSidebar } from "@/components/storefront/ProductFilters";
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

interface BoldThemeProps {
  store: Store;
  products: Product[];
}

export default function BoldTheme({ store, products }: BoldThemeProps) {
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href={`/store/${store.slug}`} className="text-2xl font-black uppercase tracking-wider">
            {store.name}
          </a>
          <div className="hidden items-center gap-8 md:flex">
            <nav className="flex gap-8">
              <a href="#" className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white">Shop</a>
              {categories.slice(0, 3).map((cat) => (
                <a key={cat.id} href="#" className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white"
                  onClick={(e) => { e.preventDefault(); setFilters({ ...filters, categories: [cat.id] }); }}>
                  {cat.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/70 hover:text-white">
              <Search className="h-6 w-6" />
            </button>
            <button className="relative p-2 text-white/70 hover:text-white" onClick={() => setIsWishlistOpen(true)}>
              <Heart className="h-6 w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button className="relative p-2 text-white/70 hover:text-white" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-2 text-white/70 hover:text-white" onClick={() => setIsAuthOpen(true)}>
              <User className="h-6 w-6" />
            </button>
            <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {customer && (
          <div className="border-t border-white/10 bg-amber-500/10 py-1 text-center text-sm text-amber-400">
            Welcome, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950 pt-20 md:hidden">
          <nav className="flex flex-col items-center gap-8 p-8">
            <a href="#" className="text-2xl font-black uppercase">Shop</a>
            {categories.map((cat) => (
              <a key={cat.id} href="#" className="text-xl font-black uppercase"
                onClick={(e) => { e.preventDefault(); setFilters({ ...filters, categories: [cat.id] }); setMobileMenuOpen(false); }}>
                {cat.name}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl lg:text-8xl">{store.name}</h1>
          {store.description && <p className="mt-6 max-w-xl text-lg text-white/60">{store.description}</p>}
          <button className="mt-8 inline-flex items-center gap-2 bg-amber-500 px-8 py-4 font-bold uppercase tracking-wider text-black transition-transform hover:scale-105">
            Shop Now <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-y border-white/10 bg-slate-900/50">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex gap-4">
              <Button variant={filters.categories.length === 0 ? "default" : "outline"} size="sm" className="bg-amber-500 text-black hover:bg-amber-400"
                onClick={() => setFilters({ ...filters, categories: [] })}>All</Button>
              {categories.map((cat) => (
                <Button key={cat.id} variant={filters.categories.includes(cat.id) ? "default" : "outline"} size="sm"
                  className={filters.categories.includes(cat.id) ? "bg-amber-500 text-black" : "border-white/20 text-white hover:bg-white/10"}
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
        <div className="mb-8">
          <ProductFilters filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} productCount={filteredProducts.length} />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-white/20" />
            <p className="mt-4 text-white/40">No products found</p>
            <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10"
              onClick={() => setFilters({ categories: [], priceRange: [0, maxPrice], sortBy: "newest", searchQuery: "" })}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={store.slug} variant="bold" />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-amber-500">{store.name}</h4>
              <p className="mt-2 text-sm text-white/60">{store.description || "Premium quality products"}</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider">Shop</h4>
              <ul className="mt-2 space-y-2 text-sm text-white/60">
                <li><a href="#">All Products</a></li>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider">Information</h4>
              <ul className="mt-2 space-y-2 text-sm text-white/60">
                {pages.slice(0, 4).map((page) => (
                  <li key={page.id}>
                    <a href={`/store/${store.slug}/page/${page.slug}`} className="hover:text-white">
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
              <h4 className="font-bold uppercase tracking-wider">Contact</h4>
              <ul className="mt-2 space-y-2 text-sm text-white/60">
                <li>support@{store.slug}.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-white/40">© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
    </div>
  );
}
