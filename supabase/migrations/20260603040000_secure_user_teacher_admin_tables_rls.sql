ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_roles_authenticated_admin_access" ON public.custom_roles;
CREATE POLICY "custom_roles_authenticated_admin_access"
ON public.custom_roles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "custom_roles_anon_login_read" ON public.custom_roles;

DROP POLICY IF EXISTS "users_authenticated_admin_access" ON public.users;
CREATE POLICY "users_authenticated_admin_access"
ON public.users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "users_anon_active_login_read" ON public.users;

DROP POLICY IF EXISTS "teacher_batches_authenticated_admin_access" ON public.teacher_batches;
CREATE POLICY "teacher_batches_authenticated_admin_access"
ON public.teacher_batches
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "teacher_batches_anon_read" ON public.teacher_batches;
CREATE POLICY "teacher_batches_anon_read"
ON public.teacher_batches
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "activity_logs_authenticated_admin_access" ON public.activity_logs;
CREATE POLICY "activity_logs_authenticated_admin_access"
ON public.activity_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "activity_logs_anon_insert" ON public.activity_logs;
CREATE POLICY "activity_logs_anon_insert"
ON public.activity_logs
FOR INSERT
TO anon
WITH CHECK (true);

DO $$
BEGIN
  IF to_regclass('public.teacher_payments') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.teacher_payments ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "teacher_payments_authenticated_admin_access" ON public.teacher_payments';
    EXECUTE 'CREATE POLICY "teacher_payments_authenticated_admin_access" ON public.teacher_payments FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;

  IF to_regclass('public.teacher_salaries') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.teacher_salaries ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "teacher_salaries_authenticated_admin_access" ON public.teacher_salaries';
    EXECUTE 'CREATE POLICY "teacher_salaries_authenticated_admin_access" ON public.teacher_salaries FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;

  IF to_regclass('public.activity_log') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "activity_log_authenticated_admin_access" ON public.activity_log';
    EXECUTE 'CREATE POLICY "activity_log_authenticated_admin_access" ON public.activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "activity_log_anon_insert" ON public.activity_log';
    EXECUTE 'CREATE POLICY "activity_log_anon_insert" ON public.activity_log FOR INSERT TO anon WITH CHECK (true)';
  END IF;

  IF to_regclass('public."user"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "user_authenticated_admin_access" ON public."user"';
    EXECUTE 'CREATE POLICY "user_authenticated_admin_access" ON public."user" FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;
