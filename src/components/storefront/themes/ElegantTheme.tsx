import { ShoppingBag, Search, Menu, X, Heart, User } from "lucide-react";
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

interface ElegantThemeProps {
  store: Store;
  products: Product[];
}

export default function ElegantTheme({ store, products }: ElegantThemeProps) {
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
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between border-b border-stone-200">
            <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <nav className="hidden gap-12 md:flex">
              <a href="#" className="text-sm uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900">Collection</a>
              {categories.slice(0, 2).map((cat) => (
                <a key={cat.id} href="#" className="text-sm uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900"
                  onClick={(e) => { e.preventDefault(); setFilters({ ...filters, categories: [cat.id] }); }}>
                  {cat.name}
                </a>
              ))}
            </nav>
            
            <a href={`/store/${store.slug}`} className="absolute left-1/2 -translate-x-1/2 text-2xl tracking-[0.3em] md:text-3xl">
              {store.name.toUpperCase()}
            </a>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-stone-600 hover:text-stone-900">
                <Search className="h-5 w-5" />
              </button>
              <button className="relative p-2 text-stone-600 hover:text-stone-900" onClick={() => setIsWishlistOpen(true)}>
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">{wishlistItems.length}</Badge>
                )}
              </button>
              <button className="relative p-2 text-stone-600 hover:text-stone-900" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">{cartCount}</Badge>
                )}
              </button>
              <button className="p-2 text-stone-600 hover:text-stone-900" onClick={() => setIsAuthOpen(true)}>
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {customer && (
          <div className="border-b border-stone-200 bg-stone-100 py-1 text-center text-sm text-stone-600">
            Welcome, {customer.name || customer.email || customer.phone}
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-stone-50 pt-20 md:hidden">
          <nav className="flex flex-col items-center gap-8 p-8">
            <a href="#" className="text-lg uppercase tracking-[0.2em]">Collection</a>
            {categories.map((cat) => (
              <a key={cat.id} href="#" className="text-lg uppercase tracking-[0.2em]"
                onClick={(e) => { e.preventDefault(); setFilters({ ...filters, categories: [cat.id] }); setMobileMenuOpen(false); }}>
                {cat.name}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Welcome to</p>
        <h1 className="mt-4 text-5xl italic md:text-6xl lg:text-7xl">{store.name}</h1>
        {store.description && (
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-stone-600">{store.description}</p>
        )}
        <div className="mt-10">
          <a href="#products" className="inline-block border border-stone-900 px-10 py-4 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-stone-900 hover:text-white">
            Explore Collection
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-xs border-t border-stone-300" />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant={filters.categories.length === 0 ? "default" : "outline"} size="sm"
              onClick={() => setFilters({ ...filters, categories: [] })}>All</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={filters.categories.includes(cat.id) ? "default" : "outline"} size="sm"
                onClick={() => setFilters({ ...filters, categories: filters.categories.includes(cat.id)
                  ? filters.categories.filter((c) => c !== cat.id) : [...filters.categories, cat.id] })}>
                {cat.name}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-sm uppercase tracking-[0.3em] text-stone-500">Our Collection</h2>
        <ProductFilters filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} productCount={filteredProducts.length} />
        
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="italic text-stone-400">No products found</p>
            <Button variant="outline" className="mt-4"
              onClick={() => setFilters({ categories: [], priceRange: [0, maxPrice], sortBy: "newest", searchQuery: "" })}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={store.slug} variant="elegant" />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <h4 className="text-sm uppercase tracking-[0.2em]">{store.name}</h4>
              <p className="mt-2 text-sm text-stone-600">{store.description || "Timeless elegance"}</p>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-[0.2em]">Customer Care</h4>
              <ul className="mt-2 space-y-2 text-sm text-stone-600">
                {pages.slice(0, 4).map((page) => (
                  <li key={page.id}>
                    <a href={`/store/${store.slug}/page/${page.slug}`} className="hover:text-stone-900">
                      {page.title}
                    </a>
                  </li>
                ))}
                {pages.length === 0 && (
                  <>
                    <li><a href="#">Contact Us</a></li>
                    <li><a href="#">Shipping & Returns</a></li>
                    <li><a href="#">FAQ</a></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-[0.2em]">Connect</h4>
              <p className="mt-2 text-sm text-stone-600">contact@{store.slug}.com</p>
            </div>
          </div>
          <div className="mt-12 border-t border-stone-200 pt-8">
            <p className="text-center text-sm uppercase tracking-[0.2em] text-stone-500">
              © {new Date().getFullYear()} {store.name}
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
