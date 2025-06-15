
-- 創建寶可夢卡片基礎表
CREATE TABLE public.pokemon_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pokemon_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type1 TEXT NOT NULL,
  type2 TEXT,
  hp INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  sp_attack INTEGER NOT NULL,
  sp_defense INTEGER NOT NULL,
  speed INTEGER NOT NULL,
  total_stats INTEGER NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('C', 'UC', 'R', 'SR', 'SSR', 'UR')),
  generation INTEGER NOT NULL,
  evolution_stage INTEGER NOT NULL DEFAULT 1,
  is_legendary BOOLEAN NOT NULL DEFAULT FALSE,
  is_mythical BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 創建用戶卡片收藏表
CREATE TABLE public.user_pokemon_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  obtained_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 創建寶可夢對戰表
CREATE TABLE public.pokemon_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player1_deck TEXT[] NOT NULL,
  player2_deck TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 添加索引提升查詢性能
CREATE INDEX idx_user_pokemon_cards_user_id ON user_pokemon_cards(user_id);
CREATE INDEX idx_user_pokemon_cards_card_id ON user_pokemon_cards(card_id);
CREATE INDEX idx_pokemon_battles_player1 ON pokemon_battles(player1_id);
CREATE INDEX idx_pokemon_battles_player2 ON pokemon_battles(player2_id);
CREATE INDEX idx_pokemon_battles_status ON pokemon_battles(status);

-- 啟用 RLS
ALTER TABLE public.pokemon_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pokemon_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_battles ENABLE ROW LEVEL SECURITY;

-- pokemon_cards 表的 RLS 政策（所有人可讀取）
CREATE POLICY "Pokemon cards are viewable by everyone" 
  ON public.pokemon_cards 
  FOR SELECT 
  USING (true);

-- user_pokemon_cards 表的 RLS 政策
CREATE POLICY "Users can view their own cards" 
  ON public.user_pokemon_cards 
  FOR SELECT 
  USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own cards" 
  ON public.user_pokemon_cards 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own cards" 
  ON public.user_pokemon_cards 
  FOR UPDATE 
  USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

-- pokemon_battles 表的 RLS 政策
CREATE POLICY "Users can view battles they participate in" 
  ON public.pokemon_battles 
  FOR SELECT 
  USING (
    player1_id = (SELECT id FROM profiles WHERE id = auth.uid()) OR 
    player2_id = (SELECT id FROM profiles WHERE id = auth.uid()) OR
    status = 'waiting'
  );

CREATE POLICY "Users can create battles" 
  ON public.pokemon_battles 
  FOR INSERT 
  WITH CHECK (player1_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can join battles" 
  ON public.pokemon_battles 
  FOR UPDATE 
  USING (
    (player1_id = (SELECT id FROM profiles WHERE id = auth.uid())) OR 
    (player2_id IS NULL AND status = 'waiting')
  );
