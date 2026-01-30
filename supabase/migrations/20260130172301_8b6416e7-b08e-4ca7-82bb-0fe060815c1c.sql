-- Create product_variants table for individual pricing and inventory per variant
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Combined variant name like "Red / Large"
  sku TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  inventory_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  option1_name TEXT, -- e.g., "Color"
  option1_value TEXT, -- e.g., "Red"
  option2_name TEXT, -- e.g., "Size"
  option2_value TEXT, -- e.g., "Large"
  option3_name TEXT, -- e.g., "Material"
  option3_value TEXT, -- e.g., "Cotton"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners can manage variants for their products
CREATE POLICY "Store owners can manage product variants"
ON public.product_variants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON s.id = p.store_id
    WHERE p.id = product_variants.product_id
    AND s.user_id = auth.uid()
  )
);

-- Policy: Public can view variants for published products
CREATE POLICY "Public can view variants for published products"
ON public.product_variants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_variants.product_id
    AND p.status = 'published'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add has_variants column to products table to track if product uses variants
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false;