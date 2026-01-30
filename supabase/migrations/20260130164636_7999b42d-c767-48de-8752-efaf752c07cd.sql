-- Create storage bucket for store media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-media', 
  'store-media', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']
);

-- Allow store owners to upload files to their store folder
CREATE POLICY "Store owners can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-media' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

-- Allow store owners to update their media
CREATE POLICY "Store owners can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'store-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

-- Allow store owners to delete their media
CREATE POLICY "Store owners can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

-- Allow public read access to store media
CREATE POLICY "Public can view store media"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-media');