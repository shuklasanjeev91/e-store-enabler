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

interface ElegantThemeProps {
  store: Store;
  products: Product[];
}

export default function ElegantTheme({ store, products }: ElegantThemeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between border-b border-stone-200">
            <button 
              className="p-2 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <nav className="hidden gap-12 md:flex">
              <a href="#" className="text-sm uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900">
                Collection
              </a>
              <a href="#" className="text-sm uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900">
                About
              </a>
            </nav>
            
            <a href={`/store/${store.slug}`} className="absolute left-1/2 -translate-x-1/2 text-2xl tracking-[0.3em] md:text-3xl">
              {store.name.toUpperCase()}
            </a>
            
            <div className="flex items-center gap-6">
              <nav className="hidden gap-12 md:flex">
                <a href="#" className="text-sm uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900">
                  Journal
                </a>
                <a href="#" className="text-sm uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900">
                  Contact
                </a>
              </nav>
              <button className="p-2 text-stone-600 hover:text-stone-900">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-stone-600 hover:text-stone-900">
                <ShoppingBag className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-stone-50 pt-20 md:hidden">
          <nav className="flex flex-col items-center gap-8 p-8">
            <a href="#" className="text-lg uppercase tracking-[0.2em]">Collection</a>
            <a href="#" className="text-lg uppercase tracking-[0.2em]">About</a>
            <a href="#" className="text-lg uppercase tracking-[0.2em]">Journal</a>
            <a href="#" className="text-lg uppercase tracking-[0.2em]">Contact</a>
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:py-32">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Welcome to</p>
        <h1 className="mt-4 text-5xl italic md:text-6xl lg:text-7xl">
          {store.name}
        </h1>
        {store.description && (
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-stone-600">
            {store.description}
          </p>
        )}
        <div className="mt-10">
          <a 
            href="#products" 
            className="inline-block border border-stone-900 px-10 py-4 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-stone-900 hover:text-white"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-xs border-t border-stone-300" />

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h2 className="mb-16 text-center text-sm uppercase tracking-[0.3em] text-stone-500">
          Our Collection
        </h2>
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="italic text-stone-400">Collection coming soon</p>
          </div>
        ) : (
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer text-center">
                <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-stone-200" />
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-lg italic">{product.name}</h3>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className="text-sm tracking-wider">
                      {formatCurrency(product.price, store.currency)}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-stone-400 line-through">
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
      <footer className="border-t border-stone-200 bg-stone-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-center text-sm uppercase tracking-[0.2em] text-stone-500">
            © {new Date().getFullYear()} {store.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
