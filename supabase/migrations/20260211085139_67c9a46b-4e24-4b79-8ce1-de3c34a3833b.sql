-- Add section_order column to store_theme_settings to persist section arrangement
ALTER TABLE public.store_theme_settings
ADD COLUMN section_order text[] DEFAULT ARRAY['hero', 'collections', 'featured_product', 'brand_story', 'products', 'testimonials', 'newsletter'];