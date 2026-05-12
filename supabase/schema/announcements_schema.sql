-- ============================================
-- Announcements Feature — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Core announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  posted_by_id UUID,
  posted_by_name TEXT,
  posted_by_role TEXT CHECK (posted_by_role IN ('admin', 'teacher')),
  audience_type TEXT CHECK (audience_type IN ('broadcast', 'targeted')),
  audience_courses TEXT[],
  audience_batches TEXT[],
  audience_roles TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attachments linked to announcements
CREATE TABLE IF NOT EXISTS announcement_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  file_name TEXT,
  file_size TEXT,
  file_url TEXT,
  file_type TEXT
);

-- 3. Read tracking per user
CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id TEXT,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated users
CREATE POLICY "Allow all for announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for announcement_attachments" ON announcement_attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for announcement_reads" ON announcement_reads FOR ALL USING (true) WITH CHECK (true);
