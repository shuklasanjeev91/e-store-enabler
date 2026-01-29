import { ShoppingBag, Search, Menu, X, Heart, User, ArrowLeft, Clock, FileText } from "lucide-react";
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
            <a href={`/store/${store.slug}`} className="flex items-center gap-3 transition-opacity hover:opacity-70">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-9 w-9 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-sm">
                  <span className="text-sm font-bold text-white">{store.name.charAt(0)}</span>
                </div>
              )}
              <span className="font-semibold">{store.name}</span>
            </a>
            <nav className="hidden items-center gap-6 md:flex">
              <a href={`/store/${store.slug}`} className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">Products</a>
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
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-zinc-100 via-white to-zinc-50">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <button
            onClick={() => navigate(`/store/${store.slug}`)}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 hover:text-zinc-900 hover:shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Page</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            {page.title}
          </h1>
          {page.updated_at && (
            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="h-4 w-4" />
              <span>Last updated {format(new Date(page.updated_at), "MMMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <article>
            {page.content ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
                <div className="p-6 sm:p-10 lg:p-12">
                  <div
                    className="prose prose-zinc prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-pre:bg-zinc-900 prose-code:text-blue-600"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-12 text-center">
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
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <a href={`/store/${store.slug}`} className="flex items-center gap-3 transition-opacity hover:opacity-70">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                  <span className="text-sm font-bold text-white">{store.name.charAt(0)}</span>
                </div>
              )}
              <span className="font-semibold text-zinc-900">{store.name}</span>
            </a>
            <p className="text-sm text-zinc-500">
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
