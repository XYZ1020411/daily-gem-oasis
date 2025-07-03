-- 創建管理員帳號
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'liue102041187@gmail.com',
  crypt('002', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- 創建對應的 profile 記錄
INSERT INTO public.profiles (
  id,
  username,
  display_name,
  email_username,
  points,
  role,
  vip_level,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'liue102041187@gmail.com'),
  'admin',
  '系統管理員',
  'admin',
  1000000,
  'admin',
  10,
  now(),
  now()
);