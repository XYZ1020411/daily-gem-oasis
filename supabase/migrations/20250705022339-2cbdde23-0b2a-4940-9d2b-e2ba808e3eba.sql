
-- 創建用戶網頁表
CREATE TABLE public.user_web_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL,
  generated_url TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE public.user_web_pages ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略
CREATE POLICY "Users can view their own web pages" 
  ON public.user_web_pages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own web pages" 
  ON public.user_web_pages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own web pages" 
  ON public.user_web_pages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own web pages" 
  ON public.user_web_pages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 允許公開訪問已發布的網頁
CREATE POLICY "Public can view published web pages" 
  ON public.user_web_pages 
  FOR SELECT 
  USING (is_public = true);

-- 添加更新時間戳觸發器
CREATE TRIGGER update_user_web_pages_updated_at
  BEFORE UPDATE ON public.user_web_pages
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
