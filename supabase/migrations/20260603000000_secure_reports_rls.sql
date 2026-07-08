ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_report_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "report_templates_authenticated_admin_access" ON public.report_templates;
CREATE POLICY "report_templates_authenticated_admin_access"
ON public.report_templates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "scheduled_reports_authenticated_admin_access" ON public.scheduled_reports;
CREATE POLICY "scheduled_reports_authenticated_admin_access"
ON public.scheduled_reports
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "scheduled_report_log_authenticated_admin_access" ON public.scheduled_report_log;
CREATE POLICY "scheduled_report_log_authenticated_admin_access"
ON public.scheduled_report_log
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
