import { ShoppingBag, Search, Menu, X, Heart, User, Home, ChevronRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStorefront } from "@/contexts/StorefrontContext";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import { Badge } from "@/components/ui/badge";

interface Store {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  currency: string;
  slug: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  created_at?: string;
  updated_at?: string;
}

interface BoldPageLayoutProps {
  store: Store;
  page: Page;
}

export default function BoldPageLayout({ store, page }: BoldPageLayoutProps) {
  const navigate = useNavigate();
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
    pages,
  } = useStorefront();

  useEffect(() => {
    setStoreId(store.id);
    setCurrency(store.currency);
  }, [store.id, store.currency]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to={`/store/${store.slug}`} className="text-2xl font-black uppercase tracking-wider transition-colors hover:text-yellow-400">
              {store.name}
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link to={`/store/${store.slug}`} className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white">
                Shop
              </Link>
              {pages.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className={`text-sm font-bold uppercase tracking-wider transition-colors ${p.slug === page.slug ? "text-yellow-400" : "text-white/70 hover:text-white"}`}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative rounded-lg p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-yellow-400 p-0 text-xs font-bold text-slate-950">
                  {wishlistItems.length}
                </Badge>
              )}
            </button>
            <button
              className="relative rounded-lg p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-yellow-400 p-0 text-xs font-bold text-slate-950">
                  {cartCount}
                </Badge>
              )}
            </button>
            <button
              className="rounded-lg p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setIsAuthOpen(true)}
            >
              <User className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2.5 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {customer && (
          <div className="border-t border-white/10 bg-yellow-400/10 py-2 text-center text-sm font-medium text-yellow-400">
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-slate-900 p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link to={`/store/${store.slug}`} className="text-sm font-bold uppercase tracking-wider text-white/70">Shop</Link>
              {pages.map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className="text-sm font-bold uppercase tracking-wider text-white/70"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
            <Link
              to={`/store/${store.slug}`}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-white/30" />
            <span className="text-yellow-400">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Page Content - Full Width */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* Page Header */}
          <div className="mb-12 lg:mb-16">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              {page.title}
            </h1>
          </div>

          {/* Content */}
          <article className="w-full">
            {page.content ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 lg:p-12">
                <div
                  className="prose prose-invert prose-lg lg:prose-xl max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-yellow-400 prose-blockquote:border-l-yellow-400 prose-code:text-yellow-400 prose-img:rounded-xl prose-img:w-full"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/30 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-400/10 mb-4">
                  <Zap className="h-8 w-8 text-yellow-400" />
                </div>
                <p className="text-lg font-bold uppercase tracking-wide text-white/70">No content yet</p>
                <p className="mt-2 text-sm text-white/40">Epic content coming soon.</p>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link to={`/store/${store.slug}`} className="text-xl font-black uppercase tracking-wider text-white hover:text-yellow-400 transition-colors">
                {store.name}
              </Link>
              {store.description && (
                <p className="mt-3 text-sm text-white/50">{store.description}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">Links</h3>
              <nav className="mt-4 flex flex-col gap-2">
                <Link to={`/store/${store.slug}`} className="text-sm font-medium text-white/50 hover:text-white">Shop</Link>
                {pages.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/store/${store.slug}/page/${p.slug}`} className="text-sm font-medium text-white/50 hover:text-white">
                    {p.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium uppercase tracking-wider text-white/50">
                © {new Date().getFullYear()} {store.name}
              </p>
              <p className="mt-1 text-sm text-white/30">All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
    </div>
  );
}
