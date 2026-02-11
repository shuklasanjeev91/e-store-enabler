
-- Store section content: customizable text/images per storefront section
CREATE TABLE public.store_section_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, section_key)
);

-- Enable RLS
ALTER TABLE public.store_section_content ENABLE ROW LEVEL SECURITY;

-- Public can view section content for published stores
CREATE POLICY "Public can view section content for published stores"
ON public.store_section_content
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = store_section_content.store_id AND stores.status = 'published'
));

-- Store owners can manage their section content
CREATE POLICY "Store owners can manage section content"
ON public.store_section_content
FOR ALL
USING (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = store_section_content.store_id AND stores.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_store_section_content_updated_at
BEFORE UPDATE ON public.store_section_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
