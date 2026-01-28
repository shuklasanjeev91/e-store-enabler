import { ShoppingBag, Search, Menu, X, ArrowRight } from "lucide-react";
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

interface BoldThemeProps {
  store: Store;
  products: Product[];
}

export default function BoldTheme({ store, products }: BoldThemeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <a href="#" className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white">
                Shop
              </a>
              <a href="#" className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white">
                New
              </a>
              <a href="#" className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white">
                Sale
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/70 hover:text-white">
              <Search className="h-6 w-6" />
            </button>
            <button className="relative p-2 text-white/70 hover:text-white">
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                0
              </span>
            </button>
            <button 
              className="p-2 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950 pt-20 md:hidden">
          <nav className="flex flex-col items-center gap-8 p-8">
            <a href="#" className="text-2xl font-black uppercase">Shop</a>
            <a href="#" className="text-2xl font-black uppercase">New</a>
            <a href="#" className="text-2xl font-black uppercase">Sale</a>
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl lg:text-8xl">
            {store.name}
          </h1>
          {store.description && (
            <p className="mt-6 max-w-xl text-lg text-white/60">
              {store.description}
            </p>
          )}
          <button className="mt-8 inline-flex items-center gap-2 bg-amber-500 px-8 py-4 font-bold uppercase tracking-wider text-black transition-transform hover:scale-105">
            Shop Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-3xl font-black uppercase tracking-tight">
          Featured Products
        </h2>
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-white/20" />
            <p className="mt-4 text-white/40">Coming soon</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-square overflow-hidden bg-slate-900">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-white/10" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-bold uppercase tracking-wide">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xl font-black text-amber-500">
                      {formatCurrency(product.price, store.currency)}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-white/40 line-through">
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
      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
