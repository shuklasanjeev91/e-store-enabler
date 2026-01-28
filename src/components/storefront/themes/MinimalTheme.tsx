import { ShoppingBag, Search, Menu, X } from "lucide-react";
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

interface MinimalThemeProps {
  store: Store;
  products: Product[];
}

export default function MinimalTheme({ store, products }: MinimalThemeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <a href={`/store/${store.slug}`} className="text-xl font-light tracking-wide">
              {store.name}
            </a>
            <nav className="hidden space-x-8 md:flex">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Shop</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm">0</span>
            </button>
            <button 
              className="p-2 md:hidden"
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
          <nav className="flex flex-col items-center gap-8 p-8">
            <a href="#" className="text-lg">Shop</a>
            <a href="#" className="text-lg">About</a>
            <a href="#" className="text-lg">Contact</a>
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl lg:text-6xl">
          {store.name}
        </h1>
        {store.description && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            {store.description}
          </p>
        )}
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No products available yet</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-200" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm">{formatCurrency(product.price, store.currency)}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-gray-400 line-through">
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
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
