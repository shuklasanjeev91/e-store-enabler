-- Create store_menus table for storing header/footer navigation links
CREATE TABLE public.store_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  location TEXT NOT NULL CHECK (location IN ('header', 'footer')),
  link_type TEXT NOT NULL CHECK (link_type IN ('page', 'category', 'product', 'custom')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  reference_id UUID, -- Optional: references pages, categories, or products
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_store_menus_store_id ON public.store_menus(store_id);
CREATE INDEX idx_store_menus_location ON public.store_menus(store_id, location);

-- Enable RLS
ALTER TABLE public.store_menus ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their menus
CREATE POLICY "Store owners can manage menus"
  ON public.store_menus
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_menus.store_id
    AND stores.user_id = auth.uid()
  ));

-- Public can view active menu items for published stores
CREATE POLICY "Public can view active menus for published stores"
  ON public.store_menus
  FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_menus.store_id
      AND stores.status = 'published'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_store_menus_updated_at
  BEFORE UPDATE ON public.store_menus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();