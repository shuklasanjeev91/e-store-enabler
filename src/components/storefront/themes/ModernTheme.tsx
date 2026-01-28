import { ShoppingBag, Search, Menu, X, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
}

interface Store {
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
              <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900">Categories</a>
              <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900">About</a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 hover:bg-zinc-100">
              <Search className="h-5 w-5 text-zinc-600" />
            </button>
            <button className="relative rounded-full p-2 hover:bg-zinc-100">
              <ShoppingBag className="h-5 w-5 text-zinc-600" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                0
              </span>
            </button>
            <button 
              className="rounded-full p-2 hover:bg-zinc-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            <a href="#" className="rounded-lg p-3 hover:bg-zinc-100">Products</a>
            <a href="#" className="rounded-lg p-3 hover:bg-zinc-100">Categories</a>
            <a href="#" className="rounded-lg p-3 hover:bg-zinc-100">About</a>
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white">
                New Collection
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                {store.name}
              </h1>
              {store.description && (
                <p className="mt-6 text-lg leading-relaxed text-zinc-600">
                  {store.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800">
                  Shop Now
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3 font-medium transition-colors hover:bg-zinc-50">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-3xl bg-zinc-200">
                {products[0]?.images?.[0] ? (
                  <img
                    src={products[0].images[0]}
                    alt="Featured"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-20 w-20 text-zinc-300" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-xl lg:block">
                <p className="text-sm font-medium text-zinc-900">Trusted by</p>
                <p className="text-2xl font-bold">1,000+ customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">All Products</h2>
            <p className="mt-1 text-zinc-600">Browse our latest collection</p>
          </div>
          <button className="hidden items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:flex">
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {products.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-4 text-zinc-500">No products yet</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-zinc-200" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-semibold">
                      {formatCurrency(product.price, store.currency)}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-zinc-400 line-through">
                        {formatCurrency(product.compare_at_price, store.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                <span className="text-sm font-semibold text-white">{store.name.charAt(0)}</span>
              </div>
              <span className="font-semibold">{store.name}</span>
            </div>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
