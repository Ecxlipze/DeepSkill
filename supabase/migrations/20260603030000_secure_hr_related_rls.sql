ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_jd_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_jds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hr_documents_authenticated_admin_access" ON public.hr_documents;
CREATE POLICY "hr_documents_authenticated_admin_access"
ON public.hr_documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "hr_jd_templates_authenticated_admin_read" ON public.hr_jd_templates;
CREATE POLICY "hr_jd_templates_authenticated_admin_read"
ON public.hr_jd_templates
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "hr_jds_authenticated_admin_access" ON public.hr_jds;
CREATE POLICY "hr_jds_authenticated_admin_access"
ON public.hr_jds
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "hr_signatures_authenticated_admin_access" ON public.hr_signatures;
CREATE POLICY "hr_signatures_authenticated_admin_access"
ON public.hr_signatures
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "hr_files_authenticated_admin_access" ON public.hr_files;
CREATE POLICY "hr_files_authenticated_admin_access"
ON public.hr_files
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
