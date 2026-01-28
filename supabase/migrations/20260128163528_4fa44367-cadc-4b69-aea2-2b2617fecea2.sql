-- Add theme column to stores table
ALTER TABLE public.stores 
ADD COLUMN theme text NOT NULL DEFAULT 'minimal';

-- Add a comment to describe valid themes
COMMENT ON COLUMN public.stores.theme IS 'Store theme: minimal, bold, elegant, modern';