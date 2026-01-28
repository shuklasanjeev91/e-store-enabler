import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingBag, Store } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  currency: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  status: string;
}

export default function Storefront() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchStore();
    }
  }, [slug]);

  const fetchStore = async () => {
    try {
      // Fetch store by slug
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        setNotFound(true);
        return;
      }

      setStore(storeData);

      // Fetch published products for this store
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeData.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!productsError && productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error fetching store:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Store className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Store Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The store you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  {store.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-display text-xl font-bold">{store.name}</span>
          </div>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            <ShoppingBag className="h-4 w-4" />
            Cart (0)
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Welcome to {store.name}
          </h1>
          {store.description && (
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {store.description}
            </p>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Products Yet</h2>
            <p className="mt-2 text-muted-foreground">
              This store hasn't added any products yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-8 font-display text-2xl font-bold">Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl border bg-background transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {formatCurrency(product.price, store.currency)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.compare_at_price, store.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <p className="mt-1">Powered by Shopdu</p>
        </div>
      </footer>
    </div>
  );
}
