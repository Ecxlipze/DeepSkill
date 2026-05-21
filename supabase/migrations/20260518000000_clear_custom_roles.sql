UPDATE users
SET custom_role_id = NULL,
    updated_at = NOW()
WHERE custom_role_id IS NOT NULL;

UPDATE users
SET role = 'custom',
    updated_at = NOW()
WHERE role IN ('hr_manager', 'accountant', 'receptionist', 'blog');

DELETE FROM custom_roles;
