-- Create store theme settings table for customization
CREATE TABLE public.store_theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Background settings
  background_mode TEXT NOT NULL DEFAULT 'light', -- 'light', 'dim', 'dark'
  
  -- Header & Favicon
  show_store_name BOOLEAN NOT NULL DEFAULT true,
  favicon_url TEXT,
  
  -- Sections visibility
  show_featured_product BOOLEAN NOT NULL DEFAULT false,
  show_image_overlay BOOLEAN NOT NULL DEFAULT false,
  show_testimonials BOOLEAN NOT NULL DEFAULT false,
  show_brand_story BOOLEAN NOT NULL DEFAULT false,
  
  -- Fonts
  font_family TEXT NOT NULL DEFAULT 'Inter',
  
  -- Advanced settings
  show_add_to_bag_button BOOLEAN NOT NULL DEFAULT true,
  custom_css TEXT,
  show_sticky_buy_button BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(store_id)
);

-- Create banners table
CREATE TABLE public.store_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL DEFAULT 'desktop', -- 'mobile', 'desktop'
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_banners ENABLE ROW LEVEL SECURITY;

-- RLS policies for store_theme_settings
CREATE POLICY "Users can view their own store theme settings"
ON public.store_theme_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_theme_settings.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own store theme settings"
ON public.store_theme_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_theme_settings.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own store theme settings"
ON public.store_theme_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_theme_settings.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own store theme settings"
ON public.store_theme_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_theme_settings.store_id
    AND stores.user_id = auth.uid()
  )
);

-- RLS policies for store_banners
CREATE POLICY "Users can view their own store banners"
ON public.store_banners
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_banners.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own store banners"
ON public.store_banners
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_banners.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own store banners"
ON public.store_banners
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_banners.store_id
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own store banners"
ON public.store_banners
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_banners.store_id
    AND stores.user_id = auth.uid()
  )
);

-- Public read access for storefront visitors
CREATE POLICY "Public can view theme settings for published stores"
ON public.store_theme_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_theme_settings.store_id
    AND stores.status = 'published'
  )
);

CREATE POLICY "Public can view banners for published stores"
ON public.store_banners
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_banners.store_id
    AND stores.status = 'published'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_store_theme_settings_updated_at
BEFORE UPDATE ON public.store_theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_banners_updated_at
BEFORE UPDATE ON public.store_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();