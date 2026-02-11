import { useEffect, useRef } from "react";

interface StoreBrandingOptions {
  storeName: string | null;
  storeDescription?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  /** Override the page title (e.g. product name, blog post title) */
  pageTitle?: string | null;
  /** Override the meta description */
  pageDescription?: string | null;
  /** OG image URL override */
  ogImage?: string | null;
}

const DEFAULT_TITLE = "ShopDu - Create Your Online Store";
const DEFAULT_DESCRIPTION = "Build and launch your online store in minutes with ShopDu.";
const DEFAULT_FAVICON = "/favicon.png";

/**
 * Dynamically sets document title, favicon, and meta/OG tags
 * based on the current store. Restores defaults on unmount.
 */
export function useStoreBranding(options: StoreBrandingOptions) {
  const {
    storeName,
    storeDescription,
    logoUrl,
    faviconUrl,
    pageTitle,
    pageDescription,
    ogImage,
  } = options;

  const originalTitle = useRef(document.title);

  useEffect(() => {
    // --- Title ---
    if (pageTitle && storeName) {
      document.title = `${pageTitle} | ${storeName}`;
    } else if (storeName) {
      document.title = storeName;
    }

    // --- Favicon ---
    const favicon = faviconUrl || logoUrl;
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (link) {
        link.href = favicon;
      } else {
        link = document.createElement("link");
        link.rel = "icon";
        link.href = favicon;
        document.head.appendChild(link);
      }
    }

    // --- Meta description ---
    const desc = pageDescription || storeDescription;
    if (desc) {
      setMetaTag("description", desc);
    }

    // --- OG tags ---
    const title = pageTitle
      ? `${pageTitle} | ${storeName || ""}`
      : storeName || "";
    if (title) setMetaProperty("og:title", title);
    if (desc) setMetaProperty("og:description", desc);
    if (ogImage || logoUrl) setMetaProperty("og:image", ogImage || logoUrl || "");

    // --- Twitter card ---
    setMetaTag("twitter:card", "summary_large_image");
    if (title) setMetaProperty("twitter:title", title);
    if (desc) setMetaProperty("twitter:description", desc);
    if (ogImage || logoUrl) setMetaProperty("twitter:image", ogImage || logoUrl || "");

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag("description", DEFAULT_DESCRIPTION);
      setMetaProperty("og:title", DEFAULT_TITLE);
      setMetaProperty("og:description", DEFAULT_DESCRIPTION);
      setMetaProperty("og:image", "/og-image.png");
      setMetaProperty("twitter:title", "");
      setMetaProperty("twitter:description", "");
      setMetaProperty("twitter:image", "");

      // Restore favicon
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (link) link.href = DEFAULT_FAVICON;
    };
  }, [storeName, storeDescription, logoUrl, faviconUrl, pageTitle, pageDescription, ogImage]);
}

function setMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (el) {
    el.setAttribute("content", content);
  } else {
    el = document.createElement("meta");
    el.name = name;
    el.content = content;
    document.head.appendChild(el);
  }
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (el) {
    el.setAttribute("content", content);
  } else {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.content = content;
    document.head.appendChild(el);
  }
}
