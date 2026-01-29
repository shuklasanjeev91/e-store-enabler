-- Add color customization columns to store_theme_settings
ALTER TABLE public.store_theme_settings
ADD COLUMN primary_color text DEFAULT NULL,
ADD COLUMN accent_color text DEFAULT NULL;