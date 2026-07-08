ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "login_otps_no_client_access" ON public.login_otps;
CREATE POLICY "login_otps_no_client_access"
ON public.login_otps
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
