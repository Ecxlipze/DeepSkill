DO $$
BEGIN
  IF to_regprocedure('public.enroll_counsellor_student(jsonb)') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.enroll_counsellor_student(jsonb) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.enroll_counsellor_student(jsonb) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.enroll_counsellor_student(jsonb) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.enroll_counsellor_student(jsonb) TO service_role;
  END IF;
END $$;
