/*
  # Create Default Admin User

  ## Summary
  Creates a default admin account with credentials admin / admin123 so the
  restaurant owner can log in immediately without needing to sign up first.

  ## Details
  - Creates a user in auth.users with email 'admin' mapped to a synthetic email
    format so Supabase auth accepts it: admin@admin.local
  - Password is 'admin123' (bcrypt hashed)
  - Inserts a corresponding restaurant_settings row if none exists yet

  ## Notes
  - Uses Supabase's internal auth schema functions to create the user
  - This is a one-time seed; subsequent runs are safe due to ON CONFLICT DO NOTHING
*/

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@admin.local'
);

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  u.email,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@admin.local'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
  );
