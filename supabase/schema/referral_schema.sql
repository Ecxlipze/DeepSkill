-- Referral codes (one per user)
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,          -- student or teacher id
  user_role TEXT CHECK (user_role IN ('student', 'teacher')),
  code TEXT UNIQUE NOT NULL,      -- e.g. DS-ALI-7X92
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual referral records
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,      -- who referred
  referrer_role TEXT,
  referred_name TEXT,
  referred_phone TEXT,
  referred_email TEXT,
  referred_id UUID UNIQUE,           -- linked to admission id
  referred_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('registered','approved','enrolled')) DEFAULT 'registered',
  reward_type TEXT CHECK (reward_type IN ('cash','fee_discount')),
  reward_amount INTEGER,
  payout_status TEXT CHECK (payout_status IN ('not_earned','pending','paid')) DEFAULT 'not_earned',
  payout_approved_at TIMESTAMPTZ,
  payout_method TEXT,
  payout_reference TEXT,
  payout_notes TEXT,
  approved_by UUID              -- admin who approved payout
);

-- Referral program settings
CREATE TABLE IF NOT EXISTS referral_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  cash_reward INTEGER DEFAULT 1000,
  fee_discount INTEGER DEFAULT 1500,
  is_active BOOLEAN DEFAULT TRUE,
  max_referrals_per_user INTEGER DEFAULT 0  -- 0 = unlimited
);

-- Insert default settings
INSERT INTO referral_settings (id, cash_reward, fee_discount, is_active, max_referrals_per_user)
VALUES (1, 1000, 1500, TRUE, 0)
ON CONFLICT (id) DO NOTHING;

-- Add referral tracking to admissions table
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS referred_by TEXT;
