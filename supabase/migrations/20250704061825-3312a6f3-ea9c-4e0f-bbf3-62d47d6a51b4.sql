-- 先檢查是否存在重複的ID，如果存在則刪除孤立的profile記錄
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 創建VIP帳號
DO $$
DECLARE
    vip_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- 檢查用戶是否已存在
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'vip8888@gmail.com';
    
    IF existing_user_id IS NULL THEN
        -- 創建新的VIP用戶
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
    ELSE
        -- 更新現有用戶
        vip_user_id := existing_user_id;
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('vip8888', gen_salt('bf')),
            email_confirmed_at = now(),
            updated_at = now()
        WHERE id = vip_user_id;
    END IF;

    -- 創建或更新profile記錄
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
    ) ON CONFLICT (id) DO UPDATE SET
        points = 100000000,
        role = 'vip',
        vip_level = 5,
        display_name = 'VIP會員8888',
        username = 'vip8888',
        email_username = 'vip8888',
        updated_at = now();
END $$;