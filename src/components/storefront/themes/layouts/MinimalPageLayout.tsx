import { ShoppingBag, Search, Menu, X, Heart, User, Home, ChevronRight, Clock } from "lucide-react";
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

interface MinimalPageLayoutProps {
  store: Store;
  page: Page;
}

export default function MinimalPageLayout({ store, page }: MinimalPageLayoutProps) {
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
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              to={`/store/${store.slug}`}
              className="text-xl font-light tracking-wide transition-colors hover:text-gray-600"
            >
              {store.name}
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link to={`/store/${store.slug}`} className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                Shop
              </Link>
              {pages.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className={`text-sm transition-colors ${p.slug === page.slug ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-gray-900 p-0 text-xs text-white">
                  {wishlistItems.length}
                </Badge>
              )}
            </button>
            <button
              className="relative rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-gray-900 p-0 text-xs text-white">
                  {cartCount}
                </Badge>
              )}
            </button>
            <button
              className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setIsAuthOpen(true)}
            >
              <User className="h-5 w-5" />
            </button>
            <button
              className="rounded-full p-2.5 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {customer && (
          <div className="border-t border-gray-100 bg-gray-50 py-2 text-center text-sm text-gray-600">
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link to={`/store/${store.slug}`} className="text-sm text-gray-600 hover:text-gray-900">Shop</Link>
              {pages.map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${store.slug}/page/${p.slug}`}
                  className="text-sm text-gray-600 hover:text-gray-900"
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
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to={`/store/${store.slug}`}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Page Content - Full Width */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {page.title}
            </h1>
            {page.updated_at && (
              <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated {format(new Date(page.updated_at), "MMMM d, yyyy")}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <article className="w-full">
            {page.content ? (
              <div
                className="prose prose-gray prose-lg max-w-none prose-headings:font-light prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-4 prose-img:rounded-xl prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                <p className="text-lg font-light text-gray-500">This page is empty</p>
                <p className="mt-2 text-sm text-gray-400">Content will appear here once it's added.</p>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link to={`/store/${store.slug}`} className="text-lg font-light tracking-wide text-gray-900">
                {store.name}
              </Link>
              {store.description && (
                <p className="mt-2 text-sm text-gray-500">{store.description}</p>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Quick Links</h3>
              <nav className="mt-3 flex flex-col gap-2">
                <Link to={`/store/${store.slug}`} className="text-sm text-gray-500 hover:text-gray-900">Shop</Link>
                {pages.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/store/${store.slug}/page/${p.slug}`} className="text-sm text-gray-500 hover:text-gray-900">
                    {p.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} {store.name}
              </p>
              <p className="mt-1 text-sm text-gray-400">All rights reserved.</p>
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
