import { ShoppingBag, Search, Menu, X, Heart, User, Home, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStorefront } from "@/contexts/StorefrontContext";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import { Badge } from "@/components/ui/badge";
import BlockRenderer from "@/components/page-builder/BlockRenderer";
import { isBlockContent } from "@/components/page-builder/types";

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

interface ElegantPageLayoutProps {
  store: Store;
  page: Page;
}

export default function ElegantPageLayout({ store, page }: ElegantPageLayoutProps) {
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
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between border-b border-stone-200">
            <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <Link to={`/store/${store.slug}`} className="absolute left-1/2 -translate-x-1/2 text-center md:static md:translate-x-0">
              <span className="text-2xl font-light tracking-[0.3em] transition-colors hover:text-stone-600">{store.name.toUpperCase()}</span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <Link to={`/store/${store.slug}`} className="text-sm uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900">
                Collection
              </Link>
              {pages.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className={`text-sm uppercase tracking-[0.15em] transition-colors ${p.slug === page.slug ? "text-stone-900 border-b border-amber-600" : "text-stone-600 hover:text-stone-900"}`}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <button className="rounded-full p-2.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900">
                <Search className="h-5 w-5" />
              </button>
              <button
                className="relative rounded-full p-2.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setIsWishlistOpen(true)}
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-amber-600 p-0 text-xs text-white">
                    {wishlistItems.length}
                  </Badge>
                )}
              </button>
              <button
                className="relative rounded-full p-2.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-amber-600 p-0 text-xs text-white">
                    {cartCount}
                  </Badge>
                )}
              </button>
              <button
                className="rounded-full p-2.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setIsAuthOpen(true)}
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {customer && (
          <div className="border-b border-stone-200 bg-amber-50 py-2 text-center text-sm text-amber-800">
            Welcome back, {customer.name || customer.email || customer.phone}
          </div>
        )}
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-b border-stone-200 bg-stone-50 p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link to={`/store/${store.slug}`} className="text-sm uppercase tracking-[0.15em] text-stone-600">Collection</Link>
              {pages.map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className="text-sm uppercase tracking-[0.15em] text-stone-600"
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
      <div className="border-b border-stone-200 bg-stone-100/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-3 text-sm uppercase tracking-[0.15em]">
            <Link
              to={`/store/${store.slug}`}
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-stone-400" />
            <span className="text-stone-900">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Page Content - Full Width */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* Page Header */}
          <div className="mb-12 text-center lg:mb-16">
            <h1 className="text-4xl font-light tracking-wide text-stone-900 sm:text-5xl lg:text-6xl">
              {page.title}
            </h1>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          </div>

          {/* Content */}
          <article className="w-full">
            {page.content ? (
              isBlockContent(page.content) ? (
                <BlockRenderer content={page.content} />
              ) : (
                <div
                  className="prose prose-stone prose-lg mx-auto max-w-none lg:prose-xl prose-headings:font-light prose-headings:tracking-wide prose-p:leading-loose prose-a:text-amber-700 prose-a:no-underline prose-a:border-b prose-a:border-amber-700/30 hover:prose-a:border-amber-700 prose-blockquote:border-l-amber-600 prose-blockquote:italic prose-img:rounded-lg prose-img:w-full"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              )
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-stone-200 bg-stone-100/50 p-8 text-center">
                <p className="text-lg font-light italic text-stone-500">This page awaits content</p>
                <p className="mt-2 text-sm text-stone-400">Beautiful words will appear here soon.</p>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link to={`/store/${store.slug}`} className="text-xl font-light tracking-[0.2em] text-stone-900">
                {store.name.toUpperCase()}
              </Link>
              {store.description && (
                <p className="mt-3 text-sm italic text-stone-500">{store.description}</p>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-sm uppercase tracking-[0.2em] text-stone-700">Explore</h3>
              <nav className="mt-4 flex flex-col gap-2">
                <Link to={`/store/${store.slug}`} className="text-sm text-stone-500 hover:text-stone-900">Collection</Link>
                {pages.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/store/${store.slug}/page/${p.slug}`} className="text-sm text-stone-500 hover:text-stone-900">
                    {p.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="text-right">
              <div className="h-px w-16 bg-amber-600/50 ml-auto mb-4" />
              <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                © {new Date().getFullYear()} {store.name}
              </p>
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
