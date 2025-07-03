-- 更新現有帳號為管理員角色
UPDATE public.profiles 
SET 
  role = 'admin',
  display_name = '系統管理員',
  vip_level = 10,
  points = 1000000,
  updated_at = now()
WHERE id = '29c6f12f-f822-4552-a1f3-8498d6cde612';

-- 同時更新 auth.users 表中的密碼（如果需要）
UPDATE auth.users 
SET 
  encrypted_password = crypt('002', gen_salt('bf')),
  updated_at = now()
WHERE id = '29c6f12f-f822-4552-a1f3-8498d6cde612';