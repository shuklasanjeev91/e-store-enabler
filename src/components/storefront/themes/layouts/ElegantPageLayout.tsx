import { ShoppingBag, Search, Menu, X, Heart, User, ArrowLeft, Clock } from "lucide-react";
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
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between border-b border-stone-200">
            <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <a href={`/store/${store.slug}`} className="absolute left-1/2 -translate-x-1/2 text-center">
              <span className="text-2xl font-light tracking-[0.3em] transition-colors hover:text-stone-600">{store.name.toUpperCase()}</span>
            </a>
            
            <div className="ml-auto flex items-center gap-3">
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
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a8a29e' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <button
            onClick={() => navigate(`/store/${store.slug}`)}
            className="mb-10 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-stone-500 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Collection
          </button>
          <h1 className="text-4xl font-light tracking-wide text-stone-900 sm:text-5xl lg:text-6xl">
            {page.title}
          </h1>
          <div className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          {page.updated_at && (
            <div className="mt-6 flex items-center justify-center gap-1.5 text-sm uppercase tracking-widest text-stone-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{format(new Date(page.updated_at), "MMMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <article>
            {page.content ? (
              <div
                className="prose prose-stone prose-lg mx-auto max-w-none prose-headings:font-light prose-headings:tracking-wide prose-p:leading-loose prose-a:text-amber-700 prose-a:no-underline prose-a:border-b prose-a:border-amber-700/30 hover:prose-a:border-amber-700 prose-blockquote:border-l-amber-600 prose-blockquote:italic prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-stone-200 bg-stone-100/50 p-12 text-center">
                <div className="mx-auto max-w-sm">
                  <p className="text-lg font-light italic text-stone-500">This page awaits content</p>
                  <p className="mt-2 text-sm text-stone-400">Beautiful words will appear here soon.</p>
                </div>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col items-center gap-6">
            <a href={`/store/${store.slug}`} className="text-xl font-light tracking-[0.2em] text-stone-900">
              {store.name.toUpperCase()}
            </a>
            <div className="h-px w-16 bg-amber-600/50" />
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
