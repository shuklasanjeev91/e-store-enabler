import { ShoppingBag, Search, Menu, X, Heart, User, ArrowLeft, Clock, Zap } from "lucide-react";
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
          <a href={`/store/${store.slug}`} className="text-2xl font-black uppercase tracking-wider transition-colors hover:text-yellow-400">
            {store.name}
          </a>
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
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <button
            onClick={() => navigate(`/store/${store.slug}`)}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white/70 transition-all hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400">
              <Zap className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">Page</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {page.title}
          </h1>
          {page.updated_at && (
            <div className="mt-6 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-white/50">
              <Clock className="h-4 w-4" />
              <span>Updated {format(new Date(page.updated_at), "MMMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <article>
            {page.content ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 sm:p-10 lg:p-12">
                <div
                  className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-yellow-400 prose-blockquote:border-l-yellow-400 prose-code:text-yellow-400 prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/30 p-12 text-center">
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
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <a href={`/store/${store.slug}`} className="text-xl font-black uppercase tracking-wider text-white hover:text-yellow-400 transition-colors">
              {store.name}
            </a>
            <p className="text-sm font-medium uppercase tracking-wider text-white/50">
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
