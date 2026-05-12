CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB,
  content_html TEXT,
  cover_image TEXT,
  category TEXT,
  tags TEXT[],
  author_id UUID,
  author_name TEXT,
  status TEXT CHECK (status IN ('draft','published','scheduled')) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  reading_time INTEGER,
  view_count INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  related_course_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT 'gray'
);

CREATE OR REPLACE FUNCTION increment_blog_view(post_slug TEXT)
RETURNS void AS $$
  UPDATE blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = post_slug;
$$ LANGUAGE sql;

INSERT INTO blog_categories (name, slug, color) VALUES
  ('Tech', 'tech', 'blue'),
  ('Career', 'career', 'green'),
  ('Design', 'design', 'purple'),
  ('Education', 'education', 'amber'),
  ('General', 'general', 'gray')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at
  ON blog_posts (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts (slug);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON blog_posts (category);

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public blog image reads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated blog image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated blog image updates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated blog image deletes" ON storage.objects;

CREATE POLICY "Public blog image reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated blog image uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated blog image updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-covers')
WITH CHECK (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated blog image deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-covers');
