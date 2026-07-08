CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_builtin BOOLEAN DEFAULT FALSE,
  departments TEXT[] DEFAULT ARRAY[]::TEXT[],
  config JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily','weekly','monthly','end_of_batch')),
  day_of_week INTEGER,
  day_of_month INTEGER,
  send_time TEXT DEFAULT '08:00',
  recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  subject_line TEXT,
  include_pdf BOOLEAN DEFAULT TRUE,
  include_csv BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_report_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES scheduled_reports(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent','failed','skipped')),
  error_message TEXT,
  recipients_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_report_templates_builtin ON report_templates(is_builtin);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(is_active, next_send_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_report_log_schedule ON scheduled_report_log(schedule_id, sent_at DESC);

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

INSERT INTO report_templates (name, description, is_builtin, departments, config)
VALUES
  ('Monthly Summary', 'Cross-department overview for end of month', true, ARRAY['counsellor','finance','academic','management'], '{"timePeriod":"this_month","sections":["overview","counsellor","finance","academic","management"]}'::jsonb),
  ('Batch Completion Report', 'Full performance report for a completed batch', true, ARRAY['academic','management'], '{"timePeriod":"batch","sections":["academic","management"]}'::jsonb),
  ('Finance Statement', 'Revenue, expenses and net balance', true, ARRAY['finance'], '{"timePeriod":"this_month","sections":["finance"]}'::jsonb),
  ('Student Progress Report', 'Individual student performance, attendance and tasks', true, ARRAY['academic'], '{"timePeriod":"batch","sections":["academic"]}'::jsonb),
  ('Counsellor Conversion Report', 'Inquiry pipeline and conversion analytics', true, ARRAY['counsellor'], '{"timePeriod":"this_month","sections":["counsellor"]}'::jsonb),
  ('Teacher Performance Report', 'Per-teacher KPIs and metrics', true, ARRAY['academic','management'], '{"timePeriod":"this_quarter","sections":["academic","management"]}'::jsonb)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    is_builtin = EXCLUDED.is_builtin,
    departments = EXCLUDED.departments,
    config = EXCLUDED.config,
    updated_at = NOW();
