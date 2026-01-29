-- Create pages table for store content pages
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their pages
CREATE POLICY "Store owners can view their pages" ON public.pages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = pages.store_id AND stores.user_id = auth.uid())
  );

CREATE POLICY "Store owners can create pages" ON public.pages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = pages.store_id AND stores.user_id = auth.uid())
  );

CREATE POLICY "Store owners can update their pages" ON public.pages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = pages.store_id AND stores.user_id = auth.uid())
  );

CREATE POLICY "Store owners can delete their pages" ON public.pages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = pages.store_id AND stores.user_id = auth.uid())
  );

-- Public can view published pages
CREATE POLICY "Public can view published pages" ON public.pages
  FOR SELECT USING (status = 'published');

-- Add trigger for updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_pages_store_id ON public.pages(store_id);
CREATE INDEX idx_pages_slug ON public.pages(store_id, slug);