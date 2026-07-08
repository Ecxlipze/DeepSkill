ALTER TABLE public.hr_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hr_profiles_authenticated_admin_access" ON public.hr_profiles;
CREATE POLICY "hr_profiles_authenticated_admin_access"
ON public.hr_profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
