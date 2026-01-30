-- Add images array column to product_variants for multiple images per variant
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

-- Migrate existing image_url data to images array
UPDATE public.product_variants 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_url != '' AND (images IS NULL OR images = '{}');

-- Keep image_url for backward compatibility (it can remain as the primary/first image)