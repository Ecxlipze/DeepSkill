CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '👤',
  color TEXT DEFAULT 'gray',
  permissions JSONB NOT NULL,
  is_builtin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  cnic TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL,
  custom_role_id UUID REFERENCES custom_roles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  account_notes TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role TEXT,
  event_type TEXT CHECK (
    event_type IN (
      'login',
      'logout',
      'action',
      'profile_change',
      'warning',
      'suspension',
      'reactivation'
    )
  ),
  event_description TEXT,
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_custom_role ON users(custom_role_id);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_logs_time ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_role ON activity_logs(user_role);

INSERT INTO users (full_name, cnic, phone, email, role, status, created_at, updated_at)
SELECT
  a.name,
  a.cnic,
  a.phone,
  a.email,
  'student',
  CASE
    WHEN LOWER(COALESCE(a.status, '')) IN ('active', 'graduated') THEN 'active'
    WHEN LOWER(COALESCE(a.status, '')) = 'inactive' THEN 'inactive'
    ELSE 'inactive'
  END,
  COALESCE(a.submitted_at, NOW()),
  NOW()
FROM admissions a
WHERE a.cnic IS NOT NULL AND a.name IS NOT NULL
ON CONFLICT (cnic) DO NOTHING;

INSERT INTO users (full_name, cnic, phone, email, role, status, created_at, updated_at)
SELECT
  t.name,
  t.cnic,
  t.phone,
  t.email,
  'teacher',
  CASE
    WHEN LOWER(COALESCE(t.status, '')) = 'active' THEN 'active'
    ELSE 'inactive'
  END,
  COALESCE(t.created_at, NOW()),
  NOW()
FROM teachers t
WHERE t.cnic IS NOT NULL AND t.name IS NOT NULL
ON CONFLICT (cnic) DO NOTHING;

INSERT INTO users (full_name, cnic, role, status, created_at, updated_at)
SELECT
  ac.name,
  ac.cnic,
  CASE
    WHEN ac.role IN ('student', 'teacher', 'admin', 'custom') THEN ac.role
    ELSE 'custom'
  END,
  'active',
  COALESCE(ac.created_at, NOW()),
  NOW()
FROM allowed_cnics ac
WHERE ac.cnic IS NOT NULL
ON CONFLICT (cnic) DO NOTHING;
