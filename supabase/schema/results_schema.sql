-- Add marks columns to task submissions
ALTER TABLE task_submissions ADD COLUMN IF NOT EXISTS marks_obtained NUMERIC;

-- Add total marks to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT NULL;

-- Results cache table (computed and stored for performance)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES admissions(id),
  batch_id TEXT,
  exam_type TEXT CHECK (exam_type IN ('midterm', 'finalterm')),
  attendance_marks NUMERIC,
  assignment_marks NUMERIC,
  quiz_marks NUMERIC,
  task_completion_marks NUMERIC,
  project_marks NUMERIC DEFAULT 0,
  total_marks NUMERIC,
  grade TEXT,
  remarks TEXT,
  passed BOOLEAN,
  batch_rank INTEGER,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_type)
);
