-- Create storage bucket for page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Public can view page images"
ON storage.objects FOR SELECT
USING (bucket_id = 'page-images');

-- Create policy for authenticated store owners to upload
CREATE POLICY "Store owners can upload page images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'page-images' AND
  auth.uid() IS NOT NULL
);

-- Create policy for authenticated users to delete their images
CREATE POLICY "Store owners can delete page images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'page-images' AND
  auth.uid() IS NOT NULL
);