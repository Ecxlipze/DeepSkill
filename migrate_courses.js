require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function run() {
  const sqls = [
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🎓'",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'blue'",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'",
    "ALTER TABLE courses ADD COLUMN IF NOT EXISTS reenrollment_discount_pct INTEGER DEFAULT 5",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 30",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS start_date DATE",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS end_date DATE",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS start_time TEXT",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS end_time TEXT",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS timing_label TEXT",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS notes TEXT",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ",
    "ALTER TABLE batches ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ",
    "ALTER TABLE admissions ADD COLUMN IF NOT EXISTS graduated_at TIMESTAMPTZ"
  ];

  for (const sql of sqls) {
    const { error } = await sb.rpc('exec_sql', { sql });
    if (error) console.log('ERR:', sql.substring(0, 70), '=>', error.message);
    else console.log('OK:', sql.substring(0, 70));
  }

  // Backfill course_id from course text column
  const { data: courses } = await sb.from('courses').select('id, title');
  const { data: batches } = await sb.from('batches').select('id, course');
  
  if (courses && batches) {
    for (const batch of batches) {
      const match = courses.find(c => c.title === batch.course);
      if (match && !batch.course_id) {
        const { error } = await sb.from('batches').update({ course_id: match.id }).eq('id', batch.id);
        if (error) console.log('Backfill ERR:', batch.id, error.message);
        else console.log('Backfilled batch', batch.id, '=> course', match.title);
      }
    }
  }

  console.log('Done!');
}

run();
