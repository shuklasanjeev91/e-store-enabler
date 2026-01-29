-- Add sort_order column to pages table for custom ordering
ALTER TABLE public.pages
ADD COLUMN sort_order integer DEFAULT 0;

-- Update existing pages to have sequential sort order based on creation date
WITH numbered_pages AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY created_at ASC) as rn
  FROM public.pages
)
UPDATE public.pages
SET sort_order = numbered_pages.rn
FROM numbered_pages
WHERE public.pages.id = numbered_pages.id;

-- Create index for efficient ordering queries
CREATE INDEX idx_pages_sort_order ON public.pages(store_id, sort_order);