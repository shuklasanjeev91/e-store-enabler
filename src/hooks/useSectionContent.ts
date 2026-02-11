import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface HeroContent {
  heading?: string;
  subheading?: string;
  cta_text?: string;
  cta_secondary_text?: string;
  background_image?: string;
}

export interface BrandStoryContent {
  title?: string;
  content?: string;
  image_url?: string;
}

export interface TestimonialItem {
  name: string;
  text: string;
  rating?: number;
}

export interface TestimonialsContent {
  title?: string;
  items?: TestimonialItem[];
}

export interface FeaturedProductContent {
  title?: string;
  subtitle?: string;
}

export interface FooterContent {
  tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  copyright_text?: string;
}

export interface NewsletterContent {
  title?: string;
  subtitle?: string;
  button_text?: string;
}

export interface LabelsContent {
  shop_all?: string;
  featured?: string;
  collection?: string;
  cta?: string;
}

export type SectionKey = "hero" | "brand_story" | "testimonials" | "featured_product" | "footer" | "newsletter" | "labels";

export type SectionContent = {
  hero: HeroContent;
  brand_story: BrandStoryContent;
  testimonials: TestimonialsContent;
  featured_product: FeaturedProductContent;
  footer: FooterContent;
  newsletter: NewsletterContent;
  labels: LabelsContent;
};

const DEFAULT_CONTENT: SectionContent = {
  hero: {
    heading: "",
    subheading: "",
    cta_text: "Shop Now",
    cta_secondary_text: "View Lookbook",
  },
  brand_story: {
    title: "Our Story",
    content: "",
  },
  testimonials: {
    title: "What Our Customers Say",
    items: [
      { name: "Sarah M.", text: "Amazing quality products! Fast shipping and excellent customer service.", rating: 5 },
      { name: "John D.", text: "I've been a loyal customer for years. The quality never disappoints.", rating: 5 },
      { name: "Emily R.", text: "Best online shopping experience I've ever had. Highly recommend!", rating: 5 },
    ],
  },
  featured_product: {
    title: "Featured Product",
    subtitle: "",
  },
  footer: {
    tagline: "",
    contact_email: "",
    contact_phone: "",
    copyright_text: "",
  },
  newsletter: {
    title: "Stay Updated",
    subtitle: "Subscribe to our newsletter for the latest updates and offers.",
    button_text: "Subscribe",
  },
  labels: {
    shop_all: "",
    featured: "",
    collection: "",
    cta: "",
  },
};

export function useSectionContent(storeId: string | null) {
  const [sectionContent, setSectionContent] = useState<SectionContent>({ ...DEFAULT_CONTENT });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      fetchAllContent();
    }
  }, [storeId]);

  const fetchAllContent = async () => {
    if (!storeId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("store_section_content")
      .select("section_key, content")
      .eq("store_id", storeId);

    if (data) {
      const merged = { ...DEFAULT_CONTENT };
      data.forEach((row: { section_key: string; content: unknown }) => {
        const key = row.section_key as SectionKey;
        if (key in merged) {
          merged[key] = { ...merged[key], ...(row.content as Record<string, unknown>) } as any;
        }
      });
      setSectionContent(merged);
    }
    setIsLoading(false);
  };

  const updateSection = useCallback(<K extends SectionKey>(
    sectionKey: K,
    updates: Partial<SectionContent[K]>
  ) => {
    setSectionContent((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], ...updates },
    }));
  }, []);

  const saveSection = useCallback(async (sectionKey: SectionKey) => {
    if (!storeId) return;

    const content = sectionContent[sectionKey];

    const { error } = await supabase
      .from("store_section_content")
      .upsert(
        {
          store_id: storeId,
          section_key: sectionKey,
          content: content as unknown as Json,
        },
        { onConflict: "store_id,section_key" }
      );

    return !error;
  }, [storeId, sectionContent]);

  const saveAllSections = useCallback(async () => {
    if (!storeId) return false;

    const sections: SectionKey[] = ["hero", "brand_story", "testimonials", "featured_product", "footer", "newsletter", "labels"];
    
    const rows = sections.map((key) => ({
      store_id: storeId,
      section_key: key,
      content: sectionContent[key] as unknown as Json,
    }));

    const { error } = await supabase
      .from("store_section_content")
      .upsert(rows, { onConflict: "store_id,section_key" });

    return !error;
  }, [storeId, sectionContent]);

  const getDefaults = useCallback((key: SectionKey) => DEFAULT_CONTENT[key], []);

  return {
    sectionContent,
    updateSection,
    saveSection,
    saveAllSections,
    isLoading,
    getDefaults,
  };
}
