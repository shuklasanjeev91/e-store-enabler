-- Create blog_posts table for store blog content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_name TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- Create indexes for faster queries
CREATE INDEX idx_blog_posts_store_id ON public.blog_posts(store_id);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(store_id, status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their blog posts
CREATE POLICY "Store owners can manage blog posts"
  ON public.blog_posts
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = blog_posts.store_id
    AND stores.user_id = auth.uid()
  ));

-- Public can view published blog posts for published stores
CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (
    status = 'published' 
    AND EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = blog_posts.store_id
      AND stores.status = 'published'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();