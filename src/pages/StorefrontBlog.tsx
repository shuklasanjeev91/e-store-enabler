import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, Calendar, User } from "lucide-react";
import { useStorefront } from "@/contexts/StorefrontContext";
import CartDrawer from "@/components/storefront/CartDrawer";
import WishlistDrawer from "@/components/storefront/WishlistDrawer";
import CustomerAuthModal from "@/components/storefront/CustomerAuthModal";
import { useThemeSettings, getBackgroundStyles, getFontFamilyCSS } from "@/hooks/useThemeSettings";
import { format } from "date-fns";

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  currency: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  tags: string[];
}

export default function StorefrontBlog() {
  const { slug } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setStoreId, setCurrency } = useStorefront();
  const { themeSettings } = useThemeSettings(store?.id || null);

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  useEffect(() => {
    if (store) {
      setStoreId(store.id);
      setCurrency(store.currency);
    }
  }, [store]);

  const fetchData = async () => {
    try {
      // Fetch store
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (storeError) throw storeError;
      if (!storeData) {
        setError("Store not found");
        setIsLoading(false);
        return;
      }

      setStore(storeData);

      // Fetch published blog posts
      const { data: postsData, error: postsError } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, author_name, published_at, tags")
        .eq("store_id", storeData.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{error || "Store not found"}</h1>
          <Link to="/" className="mt-4 text-primary hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const backgroundMode = themeSettings?.background_mode || "light";
  const bgStyles = getBackgroundStyles(backgroundMode);
  const fontFamily = themeSettings?.font_family
    ? getFontFamilyCSS(themeSettings.font_family)
    : "Inter, sans-serif";
  const primaryColor = themeSettings?.primary_color || "#0d9488";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: bgStyles.background,
        color: bgStyles.foreground,
        fontFamily,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: `${bgStyles.background}e6`,
          borderBottom: `1px solid ${bgStyles.border}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to={`/store/${store.slug}`}
            className="flex items-center gap-3 text-xl font-semibold transition-opacity hover:opacity-80"
          >
            {store.logo_url && (
              <img src={store.logo_url} alt={store.name} className="h-8 object-contain" />
            )}
            <span>{store.name}</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to={`/store/${store.slug}`}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: bgStyles.foregroundMuted }}
            >
              Shop
            </Link>
            <Link
              to={`/store/${store.slug}/blog`}
              className="text-sm font-medium"
              style={{ color: primaryColor }}
            >
              Blog
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-16 text-center"
        style={{ backgroundColor: bgStyles.backgroundSecondary }}
      >
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog</h1>
          <p
            className="mt-4 text-lg"
            style={{ color: bgStyles.foregroundMuted }}
          >
            Insights, stories, and updates from {store.name}
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p style={{ color: bgStyles.foregroundMuted }}>
              No blog posts yet. Check back soon!
            </p>
            <Link
              to={`/store/${store.slug}`}
              className="mt-4 inline-block text-sm hover:underline"
              style={{ color: primaryColor }}
            >
              Browse our products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/store/${store.slug}/blog/${post.slug}`}
                className="group overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
                style={{
                  backgroundColor: bgStyles.backgroundSecondary,
                  border: `1px solid ${bgStyles.border}`,
                }}
              >
                {post.featured_image_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-video flex items-center justify-center"
                    style={{ backgroundColor: bgStyles.border }}
                  >
                    <span
                      className="text-4xl font-bold"
                      style={{ color: bgStyles.foregroundMuted }}
                    >
                      {post.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="text-xl font-semibold group-hover:underline">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p
                      className="mt-2 line-clamp-2 text-sm"
                      style={{ color: bgStyles.foregroundMuted }}
                    >
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div
                    className="mt-4 flex items-center gap-4 text-xs"
                    style={{ color: bgStyles.foregroundMuted }}
                  >
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(post.published_at), "MMM d, yyyy")}
                      </span>
                    )}
                    {post.author_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {post.author_name}
                      </span>
                    )}
                  </div>

                  <div
                    className="mt-4 flex items-center gap-1 text-sm font-medium"
                    style={{ color: primaryColor }}
                  >
                    Read more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{
          backgroundColor: bgStyles.backgroundSecondary,
          borderColor: bgStyles.border,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm" style={{ color: bgStyles.foregroundMuted }}>
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
        </div>
      </footer>

      <CartDrawer storeSlug={store.slug} />
      <WishlistDrawer />
      <CustomerAuthModal />
    </div>
  );
}
