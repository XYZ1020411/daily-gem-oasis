
-- 創建商品表
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  sync_version INTEGER DEFAULT 1,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 創建兌換記錄表
CREATE TABLE public.exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_date TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id),
  sync_version INTEGER DEFAULT 1,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 創建公告表
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sync_version INTEGER DEFAULT 1,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 創建禮品碼表
CREATE TABLE public.gift_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  sync_version INTEGER DEFAULT 1,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 為所有表格啟用 RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

-- 商品表的 RLS 政策
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 兌換記錄的 RLS 政策
CREATE POLICY "Users can view their own exchanges" ON public.exchanges
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own exchanges" ON public.exchanges
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all exchanges" ON public.exchanges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 公告的 RLS 政策
CREATE POLICY "Anyone can view active announcements" ON public.announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 禮品碼的 RLS 政策
CREATE POLICY "Admins can view all gift codes" ON public.gift_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage gift codes" ON public.gift_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 添加更新時間和同步版本的觸發器
CREATE OR REPLACE FUNCTION update_sync_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  NEW.sync_version = COALESCE(OLD.sync_version, 0) + 1;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為每個表格添加觸發器
CREATE TRIGGER products_sync_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_sync_metadata();

CREATE TRIGGER exchanges_sync_trigger
  BEFORE UPDATE ON public.exchanges
  FOR EACH ROW EXECUTE FUNCTION update_sync_metadata();

CREATE TRIGGER announcements_sync_trigger
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_sync_metadata();

CREATE TRIGGER gift_codes_sync_trigger
  BEFORE UPDATE ON public.gift_codes
  FOR EACH ROW EXECUTE FUNCTION update_sync_metadata();

-- 啟用實時更新功能
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.exchanges REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
ALTER TABLE public.gift_codes REPLICA IDENTITY FULL;

-- 添加到實時發布
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exchanges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_codes;
