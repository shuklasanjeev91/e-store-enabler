import { ShoppingBag, Search, Menu, X, Heart, User, Home, ChevronRight, Clock, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStorefront } from "@/contexts/StorefrontContext";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

interface ModernPageLayoutProps {
  store: Store;
  page: Page;
}

export default function ModernPageLayout({ store, page }: ModernPageLayoutProps) {
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
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to={`/store/${store.slug}`} className="flex items-center gap-3 transition-opacity hover:opacity-70">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-9 w-9 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-sm">
                  <span className="text-sm font-bold text-white">{store.name.charAt(0)}</span>
                </div>
              )}
              <span className="font-semibold">{store.name}</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link to={`/store/${store.slug}`} className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">Products</Link>
              {pages.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className={`text-sm transition-colors ${p.slug === page.slug ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-blue-600 p-0 text-xs text-white">
                  {wishlistItems.length}
                </Badge>
              )}
            </button>
            <button
              className="relative rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-blue-600 p-0 text-xs text-white">
                  {cartCount}
                </Badge>
              )}
            </button>
            <button
              className="rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => setIsAuthOpen(true)}
            >
              <User className="h-5 w-5" />
            </button>
            <button className="rounded-xl p-2.5 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {customer && (
          <div className="border-t border-zinc-200 bg-blue-50 py-2 text-center text-sm font-medium text-blue-700">
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link to={`/store/${store.slug}`} className="text-sm text-zinc-500">Products</Link>
              {pages.map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className="text-sm text-zinc-500"
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
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to={`/store/${store.slug}`}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
            <span className="font-medium text-zinc-900">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Page Content - Full Width */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Page</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              {page.title}
            </h1>
            {page.updated_at && (
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                <Clock className="h-4 w-4" />
                <span>Last updated {format(new Date(page.updated_at), "MMMM d, yyyy")}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <article className="w-full">
            {page.content ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
                <div className="p-6 sm:p-8 lg:p-12">
                  <div
                    className="prose prose-zinc prose-lg lg:prose-xl max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:w-full prose-img:shadow-lg prose-pre:bg-zinc-900 prose-code:text-blue-600"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 mb-4">
                  <FileText className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-lg font-semibold text-zinc-600">No content yet</p>
                <p className="mt-2 text-sm text-zinc-400">This page will be filled with amazing content soon.</p>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link to={`/store/${store.slug}`} className="flex items-center gap-3 transition-opacity hover:opacity-70">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                    <span className="text-sm font-bold text-white">{store.name.charAt(0)}</span>
                  </div>
                )}
                <span className="font-semibold text-zinc-900">{store.name}</span>
              </Link>
              {store.description && (
                <p className="mt-3 text-sm text-zinc-500">{store.description}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Quick Links</h3>
              <nav className="mt-4 flex flex-col gap-2">
                <Link to={`/store/${store.slug}`} className="text-sm text-zinc-500 hover:text-zinc-900">Products</Link>
                {pages.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/store/${store.slug}/page/${p.slug}`} className="text-sm text-zinc-500 hover:text-zinc-900">
                    {p.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">
                © {new Date().getFullYear()} {store.name}
              </p>
              <p className="mt-1 text-sm text-zinc-400">All rights reserved.</p>
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
