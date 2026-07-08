CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS hr_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  father_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  cnic TEXT,
  personal_phone TEXT,
  personal_email TEXT,
  current_address TEXT,
  permanent_address TEXT,
  specialization TEXT,
  years_experience INTEGER,
  last_employer TEXT,
  linkedin TEXT,
  expected_salary INTEGER,
  available_to_join DATE,
  teaching_mode TEXT,
  emergency_name TEXT,
  emergency_relationship TEXT,
  emergency_phone TEXT,
  current_step INTEGER DEFAULT 1,
  hr_status TEXT DEFAULT 'pending',
  documents_submitted_at TIMESTAMPTZ,
  hired_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hr_profile_id UUID REFERENCES hr_profiles(id) ON DELETE CASCADE,
  category TEXT,
  doc_type TEXT,
  file_name TEXT,
  file_size TEXT,
  file_url TEXT,
  file_path TEXT,
  mime_type TEXT,
  link_url TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_jd_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialization TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  department TEXT DEFAULT 'Education',
  reporting_to TEXT DEFAULT 'Academic Director',
  location_mode TEXT,
  responsibilities JSONB NOT NULL,
  requirements JSONB NOT NULL,
  what_we_offer JSONB NOT NULL,
  working_hours TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_jds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hr_profile_id UUID REFERENCES hr_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES hr_jd_templates(id),
  position_title TEXT,
  department TEXT DEFAULT 'Education',
  reporting_to TEXT DEFAULT 'Academic Director',
  employment_type TEXT,
  location TEXT,
  responsibilities JSONB,
  requirements JSONB,
  what_we_offer JSONB,
  working_hours TEXT,
  compensation_text TEXT,
  issue_date DATE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  admin_edited BOOLEAN DEFAULT FALSE,
  is_sent_to_teacher BOOLEAN DEFAULT FALSE,
  teacher_status TEXT DEFAULT 'pending',
  change_request TEXT,
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS hr_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hr_profile_id UUID REFERENCES hr_profiles(id) ON DELETE CASCADE UNIQUE,
  signature_type TEXT CHECK (signature_type IN ('drawn', 'typed')),
  signature_data TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hr_profile_id UUID REFERENCES hr_profiles(id) ON DELETE CASCADE,
  file_type TEXT CHECK (file_type IN ('acceptance_letter', 'hiring_file')),
  file_url TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  admin_note TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_profiles_status ON hr_profiles(hr_status);
CREATE INDEX IF NOT EXISTS idx_hr_profiles_step ON hr_profiles(current_step);
CREATE INDEX IF NOT EXISTS idx_hr_documents_profile ON hr_documents(hr_profile_id);
CREATE INDEX IF NOT EXISTS idx_hr_jds_profile ON hr_jds(hr_profile_id);
CREATE INDEX IF NOT EXISTS idx_hr_files_profile ON hr_files(hr_profile_id);

ALTER TABLE public.hr_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_jd_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_jds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hr_profiles_authenticated_admin_access" ON public.hr_profiles;
CREATE POLICY "hr_profiles_authenticated_admin_access"
ON public.hr_profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

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

INSERT INTO hr_jd_templates (
  specialization,
  employment_type,
  title_template,
  location_mode,
  responsibilities,
  requirements,
  what_we_offer,
  working_hours
)
VALUES
(
  'Frontend Development',
  'Full-time',
  '{{specialization}} Instructor',
  'Onsite',
  '["Deliver practical frontend development lessons.", "Teach HTML, CSS, JavaScript, and React.", "Review student assignments and capstone work.", "Guide students through debugging and best practices.", "Coordinate with academic staff on student progress.", "Refresh lessons with current industry standards."]'::jsonb,
  '["Bachelor''s degree in Computer Science or equivalent background.", "Strong command of HTML, CSS, JavaScript, and React.", "Previous instructional or mentoring experience is preferred.", "Excellent communication and classroom management skills.", "Ability to support students across mixed skill levels."]'::jsonb,
  '["Competitive compensation package.", "Collaborative teaching environment.", "Professional development opportunities.", "Access to DeepSkill teaching resources."]'::jsonb,
  'Batch timing(s) shared by administration'
),
(
  'Backend Development',
  'Full-time',
  '{{specialization}} Instructor',
  'Onsite',
  '["Teach backend architecture and API development.", "Lead practical sessions on databases and server-side logic.", "Review assignments and technical assessments.", "Support students in project delivery.", "Coordinate curriculum updates with academic leadership.", "Promote secure and scalable coding practices."]'::jsonb,
  '["Strong backend development background.", "Experience with databases and API design.", "Teaching or mentoring experience preferred.", "Clear communication and structured lesson planning.", "Ability to evaluate hands-on student work."]'::jsonb,
  '["Structured academic support.", "Growth-focused environment.", "Stable monthly compensation.", "Professional teaching platform."]'::jsonb,
  'Batch timing(s) shared by administration'
),
(
  'Full Stack Development',
  'Full-time',
  '{{specialization}} Instructor',
  'Hybrid',
  '["Teach frontend and backend project workflows.", "Guide students through full stack applications.", "Review code submissions and project milestones.", "Support debugging, deployment, and integration tasks.", "Track progress with academic coordinators.", "Keep course material aligned with industry practice."]'::jsonb,
  '["Strong full stack development portfolio.", "Experience across frontend and backend stacks.", "Ability to mentor project-based learning.", "Clear communication skills.", "Comfort working with diverse student levels."]'::jsonb,
  '["Competitive compensation.", "Practical teaching environment.", "Opportunity to shape course delivery.", "Supportive academic team."]'::jsonb,
  'Batch timing(s) shared by administration'
),
(
  'Graphic Design',
  'Full-time',
  '{{specialization}} Instructor',
  'Onsite',
  '["Deliver hands-on graphic design lessons.", "Teach branding, layout, and visual communication.", "Review assignments and portfolio pieces.", "Mentor students through software workflows.", "Track progress and coordinate with academic staff.", "Update lessons with current design trends."]'::jsonb,
  '["Strong command of modern design tools.", "Portfolio demonstrating design expertise.", "Teaching or mentoring experience preferred.", "Excellent communication skills.", "Ability to guide creative student work."]'::jsonb,
  '["Professional learning environment.", "Creative collaboration opportunities.", "Competitive salary package.", "Teaching resources and support."]'::jsonb,
  'Batch timing(s) shared by administration'
),
(
  'WordPress',
  'Full-time',
  '{{specialization}} Instructor',
  'Online',
  '["Teach WordPress setup, customization, and deployment.", "Guide students in theme and plugin workflows.", "Review assignments and live projects.", "Support troubleshooting and CMS best practices.", "Coordinate outcomes with academic leadership.", "Keep training practical and market-relevant."]'::jsonb,
  '["Hands-on experience with WordPress development.", "Understanding of themes, plugins, and hosting.", "Teaching or mentoring experience preferred.", "Strong communication and instructional skills.", "Ability to support beginner and intermediate students."]'::jsonb,
  '["Competitive compensation.", "Supportive instructional team.", "Access to practical teaching material.", "Consistent learner engagement."]'::jsonb,
  'Batch timing(s) shared by administration'
),
(
  'Laravel',
  'Full-time',
  '{{specialization}} Instructor',
  'Hybrid',
  '["Teach Laravel fundamentals and application architecture.", "Guide students through MVC development workflows.", "Review assignments, projects, and assessments.", "Support students in building real-world applications.", "Collaborate with academic leadership on curriculum delivery.", "Promote clean, secure, and scalable coding habits."]'::jsonb,
  '["Strong professional experience with Laravel.", "Understanding of PHP, databases, and APIs.", "Teaching or mentoring experience preferred.", "Clear communication and documentation skills.", "Ability to manage classroom progress effectively."]'::jsonb,
  '["Competitive monthly salary.", "Collaborative team environment.", "Professional development support.", "Hands-on teaching experience."]'::jsonb,
  'Batch timing(s) shared by administration'
),
(
  'Generic Instructor',
  'Full-time',
  '{{specialization}} Instructor',
  'Onsite',
  '["Deliver structured and engaging lessons.", "Support students through assignments and assessments.", "Track attendance and academic progress.", "Provide guidance during practical sessions.", "Coordinate with academic leadership.", "Maintain updated subject knowledge."]'::jsonb,
  '["Relevant academic or professional background.", "Subject matter expertise in assigned specialization.", "Strong communication skills.", "Teaching or mentoring experience preferred.", "Ability to support learner growth effectively."]'::jsonb,
  '["Competitive salary package.", "Supportive academic environment.", "Professional development opportunities.", "Collaborative institutional culture."]'::jsonb,
  'Batch timing(s) shared by administration'
)
ON CONFLICT DO NOTHING;
