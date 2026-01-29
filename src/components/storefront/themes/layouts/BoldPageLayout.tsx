import { ShoppingBag, Search, Menu, X, Heart, User, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href={`/store/${store.slug}`} className="text-2xl font-black uppercase tracking-wider">
            {store.name}
          </a>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/70 hover:text-white">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative p-2 text-white/70 hover:text-white"
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-yellow-400 p-0 text-xs text-slate-950">
                  {wishlistItems.length}
                </Badge>
              )}
            </button>
            <button
              className="relative p-2 text-white/70 hover:text-white"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-yellow-400 p-0 text-xs text-slate-950">
                  {cartCount}
                </Badge>
              )}
            </button>
            <button
              className="p-2 text-white/70 hover:text-white"
              onClick={() => setIsAuthOpen(true)}
            >
              <User className="h-5 w-5" />
            </button>
            <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {customer && (
          <div className="border-t border-white/10 bg-yellow-400/10 py-1 text-center text-sm text-yellow-400">
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/store/${store.slug}`)}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </button>
      </div>

      {/* Page Content */}
      <main className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <article>
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">{page.title}</h1>
          {page.content && (
            <div
              className="prose prose-invert prose-lg mt-8 max-w-none prose-headings:font-black prose-headings:uppercase prose-a:text-yellow-400"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-white/50">
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
