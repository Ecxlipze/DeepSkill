DO $$
DECLARE
  admin_tables TEXT[] := ARRAY[
    'task_submissions',
    'referral_codes',
    'tasks',
    'referrals',
    'complaints',
    'complaint_messages',
    'teachers',
    'payments',
    'referral_settings',
    'results',
    'enrollment_settings',
    'batches',
    'enrollments',
    'blog_posts',
    'blog_categories',
    'app_settings',
    'inquiries',
    'inquiry_notes',
    'admissions',
    'fee_plans'
  ];
  anon_full_tables TEXT[] := ARRAY[
    'task_submissions',
    'referral_codes',
    'tasks',
    'referrals',
    'complaints',
    'complaint_messages',
    'teachers',
    'referral_settings',
    'results',
    'enrollment_settings',
    'batches',
    'enrollments',
    'inquiries',
    'inquiry_notes',
    'admissions'
  ];
  table_name TEXT;
  policy_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY admin_tables LOOP
    IF to_regclass('public.' || quote_ident(table_name)) IS NOT NULL THEN
      policy_name := table_name || '_authenticated_admin_access';
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
        policy_name,
        table_name
      );
    END IF;
  END LOOP;

  FOREACH table_name IN ARRAY anon_full_tables LOOP
    IF to_regclass('public.' || quote_ident(table_name)) IS NOT NULL THEN
      policy_name := table_name || '_anon_current_app_access';
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)',
        policy_name,
        table_name
      );
    END IF;
  END LOOP;

  IF to_regclass('public.payments') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "payments_anon_current_app_access" ON public.payments';
  END IF;

  IF to_regclass('public.fee_plans') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "fee_plans_anon_current_app_access" ON public.fee_plans';
  END IF;

  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "blog_posts_anon_published_read" ON public.blog_posts';
    EXECUTE 'CREATE POLICY "blog_posts_anon_published_read" ON public.blog_posts FOR SELECT TO anon USING (status = ''published'')';
  END IF;

  IF to_regclass('public.blog_categories') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "blog_categories_anon_read" ON public.blog_categories';
    EXECUTE 'CREATE POLICY "blog_categories_anon_read" ON public.blog_categories FOR SELECT TO anon USING (true)';
  END IF;

  IF to_regclass('public.app_settings') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "app_settings_anon_read" ON public.app_settings';
    EXECUTE 'CREATE POLICY "app_settings_anon_read" ON public.app_settings FOR SELECT TO anon USING (true)';
  END IF;
END $$;
