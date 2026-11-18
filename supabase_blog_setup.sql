-- ==========================================
-- Blog Schema — thelook
-- ==========================================

CREATE TABLE public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text DEFAULT 'Equip thelook',
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_image_url text,
  category text,
  tags text[],
  status text DEFAULT 'draft',
  likes_count integer DEFAULT 0,
  reading_time integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT likes_count_non_negative CHECK (likes_count >= 0)
);

CREATE TABLE public.blog_likes (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Índices
CREATE INDEX idx_posts_status_published ON blog_posts(status, published_at DESC);
CREATE INDEX idx_posts_category ON blog_posts(category) WHERE status = 'published';
CREATE INDEX idx_posts_author ON blog_posts(author_id);
CREATE INDEX idx_posts_slug ON blog_posts(slug);

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger: sincronizar likes_count
CREATE OR REPLACE FUNCTION sync_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.blog_likes
  FOR EACH ROW
  EXECUTE FUNCTION sync_likes_count();

-- RLS: blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "author_read_own" ON public.blog_posts
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "auth_insert" ON public.blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "author_update" ON public.blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "author_delete" ON public.blog_posts
  FOR DELETE USING (auth.uid() = author_id);

-- RLS: blog_likes
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_likes" ON public.blog_likes
  FOR SELECT USING (true);

CREATE POLICY "auth_toggle_like" ON public.blog_likes
  FOR ALL USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
  VALUES ('blog-images', 'blog-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'blog-images' );

CREATE POLICY "Auth Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
  );
