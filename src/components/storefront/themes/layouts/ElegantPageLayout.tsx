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
  } = useStorefront();

  useEffect(() => {
    setStoreId(store.id);
    setCurrency(store.currency);
  }, [store.id, store.currency]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between border-b border-stone-200">
            <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <a href={`/store/${store.slug}`} className="absolute left-1/2 -translate-x-1/2 text-center">
              <span className="text-2xl font-light tracking-[0.3em]">{store.name.toUpperCase()}</span>
            </a>
            
            <div className="ml-auto flex items-center gap-4">
              <button className="p-2 text-stone-600 hover:text-stone-900">
                <Search className="h-5 w-5" />
              </button>
              <button
                className="relative p-2 text-stone-600 hover:text-stone-900"
                onClick={() => setIsWishlistOpen(true)}
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-amber-600 p-0 text-xs text-white">
                    {wishlistItems.length}
                  </Badge>
                )}
              </button>
              <button
                className="relative p-2 text-stone-600 hover:text-stone-900"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-amber-600 p-0 text-xs text-white">
                    {cartCount}
                  </Badge>
                )}
              </button>
              <button
                className="p-2 text-stone-600 hover:text-stone-900"
                onClick={() => setIsAuthOpen(true)}
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {customer && (
          <div className="border-t bg-amber-50 py-1 text-center text-sm text-amber-800">
            Welcome back, {customer.name || customer.email || customer.phone}
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/store/${store.slug}`)}
          className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Collection
        </button>
      </div>

      {/* Page Content */}
      <main className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <article className="text-center">
          <h1 className="text-4xl font-light tracking-wide md:text-5xl">{page.title}</h1>
          <div className="mx-auto mt-4 h-px w-24 bg-amber-600"></div>
          {page.content && (
            <div
              className="prose prose-stone prose-lg mx-auto mt-12 max-w-none text-left prose-headings:font-light prose-headings:tracking-wide prose-a:text-amber-700"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              © {new Date().getFullYear()} {store.name}
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
