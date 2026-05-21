CREATE TABLE IF NOT EXISTS login_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnic TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  token_hash TEXT,
  token_expires_at TIMESTAMPTZ,
  token_used_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS login_otps_cnic_created_idx ON login_otps (cnic, created_at DESC);
CREATE INDEX IF NOT EXISTS login_otps_expires_idx ON login_otps (expires_at);

ALTER TABLE login_otps ENABLE ROW LEVEL SECURITY;
