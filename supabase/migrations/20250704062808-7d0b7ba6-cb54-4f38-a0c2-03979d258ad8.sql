-- 創建小說表
CREATE TABLE public.novels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT '其他',
  read_time INTEGER NOT NULL DEFAULT 5,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  views INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_daily_novel BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_url TEXT,
  tags TEXT[]
);

-- 啟用RLS
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;

-- 創建策略
CREATE POLICY "任何人都可以查看小說" 
ON public.novels 
FOR SELECT 
USING (true);

CREATE POLICY "管理員可以管理小說" 
ON public.novels 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- 創建用戶閱讀記錄表
CREATE TABLE public.novel_reading_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  novel_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (novel_id) REFERENCES public.novels(id) ON DELETE CASCADE
);

-- 啟用RLS
ALTER TABLE public.novel_reading_records ENABLE ROW LEVEL SECURITY;

-- 創建策略
CREATE POLICY "用戶可以查看自己的閱讀記錄" 
ON public.novel_reading_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "用戶可以創建自己的閱讀記錄" 
ON public.novel_reading_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理員可以查看所有閱讀記錄" 
ON public.novel_reading_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- 創建索引
CREATE INDEX idx_novels_publish_date ON public.novels(publish_date DESC);
CREATE INDEX idx_novels_is_daily ON public.novels(is_daily_novel) WHERE is_daily_novel = true;
CREATE INDEX idx_novels_is_featured ON public.novels(is_featured) WHERE is_featured = true;
CREATE INDEX idx_novel_reading_records_user_id ON public.novel_reading_records(user_id);
CREATE INDEX idx_novel_reading_records_novel_id ON public.novel_reading_records(novel_id);

-- 創建更新時間觸發器
CREATE TRIGGER update_novels_updated_at
BEFORE UPDATE ON public.novels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 插入一些示例數據
INSERT INTO public.novels (title, author, content, genre, read_time, rating, views, is_daily_novel) VALUES
('星空下的約定', '月影書齋', '夜空中繁星點點，如同散落在黑絲絨上的鑽石。李雨晴站在天台上，望著這片她從小就熟悉的星空。今晚的月亮格外圓潤，灑下的銀輝為整個城市披上了一層神秘的面紗。

"你還記得我們的約定嗎？"身後傳來熟悉的聲音。

雨晴沒有回頭，嘴角卻不禁上揚。"當然記得，我們說好要在滿月的夜晚，一起數星星到天亮。"

陳浩走到她身邊，兩人並肩而立。十年了，從青澀的中學時代到現在，他們都在各自的人生道路上奔跑著，但這個約定，卻像是一根無形的線，將他們緊緊相連。

"一、二、三..."雨晴開始輕聲數著星星。

"四、五、六..."陳浩接著她的節拍。

就這樣，在這個特殊的夜晚，兩個人重新找回了那份純真的美好。星空見證著他們的友誼，也見證著某種更深層的情感在悄悄萌芽...', '浪漫', 8, 4.8, 1247, true),

('時光旅人的咖啡館', '時間守護者', '在城市的一個小巷裡，有一家神秘的咖啡館。每當有人帶著遺憾走進這裡，都能在一杯特殊的咖啡中，重新經歷生命中的某個重要時刻...', '奇幻', 12, 4.6, 892, false),

('雨夜中的祕密', '雨聲創作', '大雨滂沱的夜晚，她發現了一個改變命運的祕密。這個祕密不僅關乎她的過去，更將決定她的未來...', '懸疑', 15, 4.4, 756, false);