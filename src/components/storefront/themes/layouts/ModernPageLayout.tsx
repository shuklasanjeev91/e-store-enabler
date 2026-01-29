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
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <a href={`/store/${store.slug}`} className="flex items-center gap-2">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                  <span className="text-sm font-semibold text-white">{store.name.charAt(0)}</span>
                </div>
              )}
              <span className="font-semibold">{store.name}</span>
            </a>
            <nav className="hidden items-center gap-6 md:flex">
              <a href={`/store/${store.slug}`} className="text-sm text-zinc-600 hover:text-zinc-900">Products</a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  {wishlistItems.length}
                </Badge>
              )}
            </button>
            <button
              className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </button>
            <button
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
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
          <div className="border-t bg-zinc-100 py-1 text-center text-sm text-zinc-600">
            Welcome back, {customer.name || customer.email || customer.phone}!
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/store/${store.slug}`)}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </button>
      </div>

      {/* Page Content */}
      <main className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <article className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm md:p-12">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{page.title}</h1>
          {page.content && (
            <div
              className="prose prose-zinc prose-lg mt-8 max-w-none prose-headings:font-bold prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
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
