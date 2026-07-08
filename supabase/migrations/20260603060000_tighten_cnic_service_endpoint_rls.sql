DO $$
BEGIN
  IF to_regclass('public.custom_roles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "custom_roles_anon_login_read" ON public.custom_roles';
  END IF;

  IF to_regclass('public.users') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "users_anon_active_login_read" ON public.users';
  END IF;

  IF to_regclass('public.payments') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "payments_anon_current_app_access" ON public.payments';
  END IF;

  IF to_regclass('public.fee_plans') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.fee_plans ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "fee_plans_anon_current_app_access" ON public.fee_plans';
  END IF;
END $$;
