-- Add meta_keywords column to pages table
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS meta_keywords text;