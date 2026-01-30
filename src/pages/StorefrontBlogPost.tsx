import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Calendar, User, Tag } from "lucide-react";
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
  content: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  tags: string[];
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  tags: string[];
}

export default function StorefrontBlogPost() {
  const { slug, postSlug } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setStoreId, setCurrency } = useStorefront();
  const { themeSettings } = useThemeSettings(store?.id || null);

  useEffect(() => {
    if (slug && postSlug) {
      fetchData();
    }
  }, [slug, postSlug]);

  useEffect(() => {
    if (store) {
      setStoreId(store.id);
      setCurrency(store.currency);
    }
  }, [store]);

  // Update page meta tags
  useEffect(() => {
    if (post) {
      document.title = post.meta_title || post.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", post.meta_description || post.excerpt || "");
      }
    }
  }, [post]);

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

      // Fetch blog post
      const { data: postData, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("store_id", storeData.id)
        .eq("slug", postSlug)
        .eq("status", "published")
        .maybeSingle();

      if (postError) throw postError;
      if (!postData) {
        setError("Blog post not found");
        setIsLoading(false);
        return;
      }

      setPost(postData);

      // Fetch related posts (same tags or recent)
      const { data: relatedData } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, author_name, published_at, tags")
        .eq("store_id", storeData.id)
        .eq("status", "published")
        .neq("id", postData.id)
        .order("published_at", { ascending: false })
        .limit(3);

      setRelatedPosts(relatedData || []);
    } catch (err) {
      console.error("Error fetching blog post:", err);
      setError("Failed to load blog post");
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

  if (error || !store || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{error || "Not found"}</h1>
          <Link to={`/store/${slug}/blog`} className="mt-4 text-primary hover:underline">
            Back to blog
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

      {/* Back Link */}
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to={`/store/${store.slug}/blog`}
          className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-70"
          style={{ color: bgStyles.foregroundMuted }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>

      {/* Article */}
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full object-cover"
              style={{ maxHeight: "500px" }}
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                }}
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div
          className="mt-4 flex flex-wrap items-center gap-4 text-sm"
          style={{ color: bgStyles.foregroundMuted }}
        >
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </span>
          )}
          {post.author_name && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author_name}
            </span>
          )}
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            className="mt-6 text-xl leading-relaxed"
            style={{ color: bgStyles.foregroundMuted }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose prose-lg mt-8 max-w-none"
            style={{
              color: bgStyles.foreground,
              "--tw-prose-headings": bgStyles.foreground,
              "--tw-prose-body": bgStyles.foreground,
              "--tw-prose-links": primaryColor,
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section
          className="py-16"
          style={{
            backgroundColor: bgStyles.backgroundSecondary,
            borderTop: `1px solid ${bgStyles.border}`,
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold">More from our blog</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/store/${store.slug}/blog/${relatedPost.slug}`}
                  className="group overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
                  style={{
                    backgroundColor: bgStyles.background,
                    border: `1px solid ${bgStyles.border}`,
                  }}
                >
                  {relatedPost.featured_image_url ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className="aspect-video flex items-center justify-center"
                      style={{ backgroundColor: bgStyles.border }}
                    >
                      <span
                        className="text-3xl font-bold"
                        style={{ color: bgStyles.foregroundMuted }}
                      >
                        {relatedPost.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold group-hover:underline">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.published_at && (
                      <p
                        className="mt-2 text-xs"
                        style={{ color: bgStyles.foregroundMuted }}
                      >
                        {format(new Date(relatedPost.published_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
