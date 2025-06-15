
-- 檢查並創建 pokemon_cards 表的政策（如果不存在）
DO $$
BEGIN
    -- 為 pokemon_cards 表格啟用 RLS（如果尚未啟用）
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'pokemon_cards' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.pokemon_cards ENABLE ROW LEVEL SECURITY;
    END IF;

    -- 創建查看政策（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pokemon_cards' 
        AND policyname = 'Anyone can view pokemon cards'
    ) THEN
        CREATE POLICY "Anyone can view pokemon cards" 
        ON public.pokemon_cards 
        FOR SELECT 
        TO public 
        USING (true);
    END IF;

    -- 創建插入政策（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pokemon_cards' 
        AND policyname = 'Anyone can insert pokemon cards'
    ) THEN
        CREATE POLICY "Anyone can insert pokemon cards" 
        ON public.pokemon_cards 
        FOR INSERT 
        TO public 
        WITH CHECK (true);
    END IF;
END $$;

-- 檢查並創建 pokemon_battles 表的政策（如果不存在）
DO $$
BEGIN
    -- 為 pokemon_battles 表格啟用 RLS（如果尚未啟用）
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'pokemon_battles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.pokemon_battles ENABLE ROW LEVEL SECURITY;
    END IF;

    -- 創建查看政策（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pokemon_battles' 
        AND policyname = 'Users can view their battles'
    ) THEN
        CREATE POLICY "Users can view their battles" 
        ON public.pokemon_battles 
        FOR SELECT 
        USING (auth.uid() = player1_id OR auth.uid() = player2_id);
    END IF;

    -- 創建插入政策（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pokemon_battles' 
        AND policyname = 'Users can create battles'
    ) THEN
        CREATE POLICY "Users can create battles" 
        ON public.pokemon_battles 
        FOR INSERT 
        WITH CHECK (auth.uid() = player1_id);
    END IF;

    -- 創建更新政策（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pokemon_battles' 
        AND policyname = 'Users can update their battles'
    ) THEN
        CREATE POLICY "Users can update their battles" 
        ON public.pokemon_battles 
        FOR UPDATE 
        USING (auth.uid() = player1_id OR auth.uid() = player2_id);
    END IF;
END $$;
