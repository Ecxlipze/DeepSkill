CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS student_cnic TEXT,
  ADD COLUMN IF NOT EXISTS marked_by TEXT DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS distance_meters INTEGER,
  ADD COLUMN IF NOT EXISTS absence_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS override_reason TEXT,
  ADD COLUMN IF NOT EXISTS overridden_by TEXT,
  ADD COLUMN IF NOT EXISTS overridden_at TIMESTAMPTZ;

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_marked_by_fkey;

ALTER TABLE attendance
  ALTER COLUMN marked_by DROP DEFAULT,
  ALTER COLUMN marked_by TYPE TEXT USING marked_by::TEXT,
  ALTER COLUMN marked_by SET DEFAULT 'auto';

UPDATE attendance a
SET student_cnic = s.cnic
FROM admissions s
WHERE a.student_id = s.id
  AND a.student_cnic IS NULL;

UPDATE attendance
SET marked_by = COALESCE(marked_by, 'auto'),
    is_locked = COALESCE(is_locked, FALSE);

DELETE FROM attendance a
USING attendance b
WHERE a.ctid < b.ctid
  AND a.student_id = b.student_id
  AND a.batch_id = b.batch_id
  AND a.date = b.date;

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_id_date_key;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_batch_date_unique;
ALTER TABLE attendance
  ADD CONSTRAINT attendance_student_batch_date_unique UNIQUE (student_id, batch_id, date);

CREATE INDEX IF NOT EXISTS attendance_batch_date_idx ON attendance (batch_id, date);
CREATE INDEX IF NOT EXISTS attendance_student_date_idx ON attendance (student_id, date);

INSERT INTO app_settings (key, value)
VALUES (
  'attendance_location',
  '{
    "instituteName": "DeepSkill Main Campus",
    "latitude": 31.5204,
    "longitude": 74.3587,
    "radiusMeters": 100,
    "maxAccuracyBufferMeters": 200,
    "onTimeWindowMins": 15,
    "lateThresholdMins": 15,
    "absentCutoffMins": 60,
    "weekendDays": ["Saturday", "Sunday"],
    "isActive": true
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

UPDATE batches
SET start_time = CASE
  WHEN time_shift ~* '\m(1[0-2]|0?[1-9])(:[0-5][0-9])?\s*AM\M' THEN
    LPAD(SUBSTRING(time_shift FROM '\m(1[0-2]|0?[1-9])')::INT::TEXT, 2, '0') || ':' ||
    COALESCE(NULLIF(SUBSTRING(time_shift FROM ':(\d{2})\s*AM'), ''), '00')
  WHEN time_shift ~* '\m(1[0-2]|0?[1-9])(:[0-5][0-9])?\s*PM\M' THEN
    LPAD((
      CASE
        WHEN SUBSTRING(time_shift FROM '\m(1[0-2]|0?[1-9])')::INT = 12 THEN 12
        ELSE SUBSTRING(time_shift FROM '\m(1[0-2]|0?[1-9])')::INT + 12
      END
    )::TEXT, 2, '0') || ':' ||
    COALESCE(NULLIF(SUBSTRING(time_shift FROM ':(\d{2})\s*PM'), ''), '00')
  ELSE start_time
END
WHERE (start_time IS NULL OR start_time = '')
  AND time_shift IS NOT NULL;
