CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'custom')),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_created
  ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_client_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_client_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_client_update" ON public.notifications;

CREATE POLICY "notifications_client_select"
  ON public.notifications FOR SELECT
  USING (true);

CREATE POLICY "notifications_client_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "notifications_client_update"
  ON public.notifications FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for this table in Supabase Dashboard:
-- Table Editor -> notifications -> Enable Realtime.

-- Optional pg_cron cleanup, if your Supabase plan supports it:
-- SELECT cron.schedule(
--   'delete-old-notifications',
--   '0 0 * * *',
--   $$ DELETE FROM public.notifications WHERE created_at < now() - interval '30 days' $$
-- );
