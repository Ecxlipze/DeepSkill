CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  cnic TEXT,
  city TEXT,
  course_interest TEXT,
  hear_about_us TEXT,
  message TEXT,
  referral_code TEXT,
  status TEXT CHECK (status IN ('new','contacted','follow_up','enrolled','lost')) DEFAULT 'new',
  admission_id UUID REFERENCES admissions(id),
  counsellor_notes JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiry_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  note TEXT,
  status_changed_to TEXT,
  added_by TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admissions
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS enrolled_by TEXT DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS enrollment_source TEXT,
  ADD COLUMN IF NOT EXISTS inquiry_id UUID REFERENCES inquiries(id),
  ADD COLUMN IF NOT EXISTS counsellor_notes TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_reason TEXT,
  ADD COLUMN IF NOT EXISTS enrollment_type TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS batch_assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

ALTER TABLE fee_plans
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_reason TEXT,
  ADD COLUMN IF NOT EXISTS final_fee INTEGER,
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS reference_number TEXT,
  ADD COLUMN IF NOT EXISTS total_installments INTEGER,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS paid_date DATE,
  ADD COLUMN IF NOT EXISTS method TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_course ON inquiries(course_interest);
CREATE INDEX IF NOT EXISTS idx_inquiries_submitted_at ON inquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON inquiry_notes(inquiry_id, added_at DESC);

INSERT INTO custom_roles (name, description, icon, color, permissions, is_builtin, created_at, updated_at)
VALUES (
  'Counsellor',
  'Manages inquiries, student enrollment, and counselling workflow.',
  '🎓',
  'blue',
  '{
    "dashboard": "view",
    "counsellor": "full",
    "students": "view",
    "teachers": "none",
    "courses": "view",
    "finance": "view",
    "hr": "none",
    "users": "none",
    "settings": "none",
    "announcements": "view",
    "attendance": "view",
    "tasks": "none",
    "results": "none",
    "complaints": "view",
    "referral": "view",
    "reports": "view",
    "admissions": "full",
    "blog": "none"
  }'::jsonb,
  FALSE,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();

CREATE OR REPLACE FUNCTION enroll_counsellor_student(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admission admissions%ROWTYPE;
  v_batch batches%ROWTYPE;
  v_inquiry inquiries%ROWTYPE;
  v_ref referral_codes%ROWTYPE;
  v_settings referral_settings%ROWTYPE;
  v_cnic TEXT := NULLIF(TRIM(payload->>'cnic'), '');
  v_name TEXT := NULLIF(TRIM(payload->>'name'), '');
  v_course TEXT := NULLIF(TRIM(payload->>'course'), '');
  v_batch_id UUID := NULLIF(payload->>'batchId', '')::UUID;
  v_inquiry_id UUID := NULLIF(payload->>'inquiryId', '')::UUID;
  v_final_fee INTEGER := GREATEST(COALESCE((payload->>'finalFee')::INTEGER, 0), 0);
  v_total_fee INTEGER := GREATEST(COALESCE((payload->>'totalFee')::INTEGER, 0), 0);
  v_discount INTEGER := GREATEST(COALESCE((payload->>'discountAmount')::INTEGER, 0), 0);
  v_plan_type TEXT := COALESCE(NULLIF(payload->>'paymentPlan', ''), 'full');
  v_installments INTEGER := GREATEST(COALESCE((payload->>'installmentCount')::INTEGER, 1), 1);
  v_first_payment INTEGER := GREATEST(COALESCE((payload->>'firstPayment')::INTEGER, 0), 0);
  v_first_payment_date DATE := COALESCE(NULLIF(payload->>'firstPaymentDate', '')::DATE, CURRENT_DATE);
  v_payment_method TEXT := NULLIF(payload->>'firstPaymentMethod', '');
  v_payment_ref TEXT := NULLIF(payload->>'firstPaymentRef', '');
  v_source TEXT := COALESCE(NULLIF(payload->>'enrollmentSource', ''), 'walk_in');
  v_amount_per INTEGER;
  v_i INTEGER;
  v_enrolled_count INTEGER;
  v_reward INTEGER;
  v_note JSONB;
BEGIN
  IF v_cnic IS NULL OR v_name IS NULL OR v_course IS NULL OR v_batch_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'missing_required', 'message', 'Required enrollment data is missing.');
  END IF;

  IF EXISTS (SELECT 1 FROM admissions WHERE cnic = v_cnic) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'duplicate_cnic', 'message', 'This CNIC is already enrolled.');
  END IF;

  SELECT * INTO v_batch FROM batches WHERE id = v_batch_id AND COALESCE(status, 'Active') = 'Active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'batch_not_found', 'message', 'Selected batch was not found.');
  END IF;

  SELECT COUNT(*) INTO v_enrolled_count
  FROM admissions
  WHERE batch = v_batch.batch_name AND status = 'Active';

  IF v_enrolled_count >= COALESCE(v_batch.capacity, 30) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'batch_full', 'message', 'This batch is full. Please select another.');
  END IF;

  IF v_plan_type = 'full' THEN
    v_installments := 1;
  END IF;
  v_amount_per := CASE WHEN v_installments > 0 THEN ROUND(v_final_fee::NUMERIC / v_installments)::INTEGER ELSE v_final_fee END;

  INSERT INTO admissions (
    name, father_name, cnic, dob, gender, phone, email, city, address, education,
    hear_about_us, referred_by, referral_code, course, batch, batch_timing,
    batch_assigned_at, status, enrollment_type, enrolled_by, enrollment_source,
    inquiry_id, counsellor_notes, discount_amount, discount_reason, submitted_at, approved_at
  )
  VALUES (
    v_name,
    NULLIF(payload->>'fatherName', ''),
    v_cnic,
    NULLIF(payload->>'dob', '')::DATE,
    NULLIF(payload->>'gender', ''),
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'email', ''),
    NULLIF(payload->>'city', ''),
    NULLIF(payload->>'address', ''),
    NULLIF(payload->>'education', ''),
    NULLIF(payload->>'hearAboutUs', ''),
    NULLIF(payload->>'referralCode', ''),
    NULLIF(payload->>'referralCode', ''),
    v_course,
    v_batch.batch_name,
    COALESCE(v_batch.time_shift, v_batch.timing_label, CONCAT(v_batch.start_time, '-', v_batch.end_time)),
    NOW(),
    'Active',
    COALESCE(NULLIF(payload->>'enrollmentType', ''), 'new'),
    'counsellor',
    v_source,
    v_inquiry_id,
    NULLIF(payload->>'notes', ''),
    v_discount,
    NULLIF(payload->>'discountReason', ''),
    NOW(),
    NOW()
  )
  RETURNING * INTO v_admission;

  INSERT INTO allowed_cnics (cnic, name, role, assigned_course, batch)
  VALUES (v_cnic, v_name, 'student', v_course, v_batch.batch_name)
  ON CONFLICT (cnic) DO UPDATE
  SET name = EXCLUDED.name,
      role = EXCLUDED.role,
      assigned_course = EXCLUDED.assigned_course,
      batch = EXCLUDED.batch;

  INSERT INTO fee_plans (
    student_id, course, batch, total_fee, discount_amount, discount_reason, final_fee,
    plan_type, installment_count, created_by
  )
  VALUES (
    v_admission.id, v_course, v_batch.batch_name, v_total_fee, v_discount,
    NULLIF(payload->>'discountReason', ''), v_final_fee, v_plan_type, v_installments, 'counsellor'
  );

  FOR v_i IN 1..v_installments LOOP
    INSERT INTO payments (
      entity_id, entity_type, installment_number, total_installments, amount, due_date,
      paid_date, method, reference_number, status, description, notes
    )
    VALUES (
      v_admission.id,
      'student',
      CASE WHEN v_plan_type = 'full' THEN NULL ELSE v_i END,
      CASE WHEN v_plan_type = 'full' THEN NULL ELSE v_installments END,
      CASE WHEN v_i = 1 AND v_first_payment > 0 THEN v_first_payment ELSE v_amount_per END,
      (v_first_payment_date + ((v_i - 1) || ' months')::INTERVAL)::DATE,
      CASE WHEN v_i = 1 AND v_first_payment > 0 THEN v_first_payment_date ELSE NULL END,
      CASE WHEN v_i = 1 AND v_first_payment > 0 THEN v_payment_method ELSE NULL END,
      CASE WHEN v_i = 1 AND v_first_payment > 0 THEN v_payment_ref ELSE NULL END,
      CASE WHEN v_i = 1 AND v_first_payment > 0 THEN 'paid' ELSE 'pending' END,
      CASE WHEN v_plan_type = 'full' THEN 'Full Course Fee' ELSE CONCAT('Installment ', v_i, ' of ', v_installments) END,
      CASE WHEN v_i = 1 AND v_first_payment > 0 THEN 'First payment at enrollment' ELSE NULL END
    );
  END LOOP;

  IF v_inquiry_id IS NOT NULL THEN
    v_note := jsonb_build_object(
      'note', 'Student enrolled by counsellor.',
      'timestamp', NOW(),
      'by', COALESCE(NULLIF(payload->>'counsellorName', ''), 'Counsellor')
    );

    UPDATE inquiries
    SET status = 'enrolled',
        admission_id = v_admission.id,
        last_updated = NOW(),
        counsellor_notes = COALESCE(counsellor_notes, '[]'::jsonb) || jsonb_build_array(v_note)
    WHERE id = v_inquiry_id
    RETURNING * INTO v_inquiry;

    INSERT INTO inquiry_notes (inquiry_id, note, status_changed_to, added_by)
    VALUES (v_inquiry_id, 'Student enrolled by counsellor.', 'enrolled', COALESCE(NULLIF(payload->>'counsellorName', ''), 'Counsellor'));
  END IF;

  IF NULLIF(payload->>'referralCode', '') IS NOT NULL THEN
    SELECT * INTO v_ref FROM referral_codes WHERE code = NULLIF(payload->>'referralCode', '');
    IF FOUND THEN
      SELECT * INTO v_settings FROM referral_settings WHERE id = 1;
      v_reward := COALESCE(v_settings.cash_reward, 1000);
      INSERT INTO referrals (
        referrer_id, referrer_role, referred_name, referred_phone, referred_email,
        referred_id, referred_at, status, reward_type, reward_amount, payout_status
      )
      VALUES (
        v_ref.user_id, v_ref.user_role, v_admission.name, v_admission.phone, v_admission.email,
        v_admission.id, NOW(), 'enrolled', 'cash', v_reward, 'pending'
      )
      ON CONFLICT (referred_id) DO UPDATE
      SET status = 'enrolled',
          reward_amount = EXCLUDED.reward_amount,
          payout_status = 'pending';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'admission', jsonb_build_object(
      'id', v_admission.id,
      'name', v_admission.name,
      'cnic', v_admission.cnic,
      'email', v_admission.email,
      'course', v_admission.course,
      'batch', v_admission.batch,
      'batch_timing', v_admission.batch_timing
    )
  );
END;
$$;
