import { ShoppingBag, Search, Menu, X, Heart, User, ArrowLeft, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
            <a
              href={`/store/${store.slug}`}
              className="text-xl font-light tracking-wide transition-colors hover:text-gray-600"
            >
              {store.name}
            </a>
            <nav className="hidden space-x-8 md:flex">
              <a href={`/store/${store.slug}`} className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                Shop
              </a>
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
      </header>

      {/* Hero Section */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <button
            onClick={() => navigate(`/store/${store.slug}`)}
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </button>
          <h1 className="text-4xl font-light tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {page.title}
          </h1>
          {(page.created_at || page.updated_at) && (
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {page.updated_at && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Updated {format(new Date(page.updated_at), "MMMM d, yyyy")}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <article>
            {page.content ? (
              <div
                className="prose prose-gray prose-lg max-w-none prose-headings:font-light prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-4 prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                <div className="mx-auto max-w-sm">
                  <p className="text-lg font-light text-gray-500">This page is empty</p>
                  <p className="mt-2 text-sm text-gray-400">Content will appear here once it's added.</p>
                </div>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <a href={`/store/${store.slug}`} className="text-lg font-light tracking-wide text-gray-900">
              {store.name}
            </a>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
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
