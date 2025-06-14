
-- 更新 profiles 表以支援用戶名稱登入
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_username TEXT UNIQUE;

-- 創建索引以加快用戶名稱查詢
CREATE INDEX IF NOT EXISTS idx_profiles_email_username ON profiles(email_username);

-- 創建用戶名稱到用戶ID的映射函數
CREATE OR REPLACE FUNCTION get_user_id_by_username(username_input TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid 
    FROM profiles 
    WHERE email_username = username_input;
    
    RETURN user_uuid;
END;
$$;

-- 創建同步狀態表（如果不存在）
CREATE TABLE IF NOT EXISTS user_sync_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_type TEXT NOT NULL,
    data_content JSONB NOT NULL DEFAULT '{}',
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 為同步表添加索引
CREATE INDEX IF NOT EXISTS idx_user_sync_data_user_id ON user_sync_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sync_data_type ON user_sync_data(data_type);

-- 創建同步觸發器函數
CREATE OR REPLACE FUNCTION update_sync_version()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.last_modified = NOW();
    NEW.sync_version = COALESCE(OLD.sync_version, 0) + 1;
    RETURN NEW;
END;
$$;

-- 為同步表添加觸發器
DROP TRIGGER IF EXISTS trigger_update_sync_version ON user_sync_data;
CREATE TRIGGER trigger_update_sync_version
    BEFORE UPDATE ON user_sync_data
    FOR EACH ROW
    EXECUTE FUNCTION update_sync_version();

-- 啟用 RLS 策略
ALTER TABLE user_sync_data ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略
CREATE POLICY "Users can access own sync data" ON user_sync_data
    FOR ALL USING (auth.uid() = user_id);

-- 更新 profiles 表的觸發器以處理用戶名稱
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 從 email 中提取用戶名稱（如果是 @game.local 格式）
    INSERT INTO public.profiles (
        id, 
        username, 
        display_name, 
        email_username,
        points,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'points')::bigint, 100000000),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$;

-- 重新創建觸發器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
