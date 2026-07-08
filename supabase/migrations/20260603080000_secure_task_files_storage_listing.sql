DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Allow all uploads li7ubh_0" ON storage.objects;
    DROP POLICY IF EXISTS "task_files_public_read" ON storage.objects;
    DROP POLICY IF EXISTS "task_files_anon_read" ON storage.objects;
    DROP POLICY IF EXISTS "task_files_authenticated_read" ON storage.objects;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'task_files_client_upload'
    ) THEN
      CREATE POLICY "task_files_client_upload"
      ON storage.objects
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'task_files');
    END IF;
  END IF;
END $$;
