-- 創建VIP帳號
DO $$
DECLARE
    vip_user_id UUID;
BEGIN
    -- 創建VIP用戶
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
        'vip8888@gmail.com',
        crypt('vip8888', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) RETURNING id INTO vip_user_id;

    -- 創建VIP的profile記錄
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
        vip_user_id,
        'vip8888',
        'VIP會員8888',
        'vip8888',
        100000000,
        'vip',
        5,
        now(),
        now()
    );
END $$;

-- 確保管理員帳號已確認郵件
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'liue102041187@gmail.com';