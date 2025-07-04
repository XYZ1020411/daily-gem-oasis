import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

export interface Novel {
  id: string;
  title: string;
  author: string;
  content: string;
  genre: string;
  read_time: number;
  publish_date: string;
  rating: number;
  views: number;
  is_featured: boolean;
  is_daily_novel: boolean;
  created_at: string;
  updated_at: string;
  source_url?: string;
  tags?: string[];
}

export interface NovelReadingRecord {
  id: string;
  user_id: string;
  novel_id: string;
  read_at: string;
  points_earned: number;
}

export const useNovels = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [todayNovel, setTodayNovel] = useState<Novel | null>(null);
  const [readingRecords, setReadingRecords] = useState<NovelReadingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile, updatePoints } = useUser();

  // 載入小說數據
  const loadNovels = async () => {
    setLoading(true);
    try {
      // 載入所有小說
      const { data: novelsData, error: novelsError } = await supabase
        .from('novels')
        .select('*')
        .order('created_at', { ascending: false });

      if (novelsError) {
        console.error('載入小說失敗:', novelsError);
        throw novelsError;
      }

      // 載入今日小說
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyNovelData, error: dailyError } = await supabase
        .from('novels')
        .select('*')
        .eq('is_daily_novel', true)
        .eq('publish_date', today)
        .single();

      if (dailyError && dailyError.code !== 'PGRST116') {
        console.error('載入今日小說失敗:', dailyError);
      }

      setNovels(novelsData || []);
      setTodayNovel(dailyNovelData || null);

      // 如果用戶已登入，載入閱讀記錄
      if (user) {
        const { data: recordsData, error: recordsError } = await supabase
          .from('novel_reading_records')
          .select('*')
          .eq('user_id', user.id);

        if (recordsError) {
          console.error('載入閱讀記錄失敗:', recordsError);
        } else {
          setReadingRecords(recordsData || []);
        }
      }

    } catch (error: any) {
      console.error('載入數據失敗:', error);
      toast({
        title: "載入失敗",
        description: "無法載入小說數據",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 標記小說為已讀
  const markAsRead = async (novelId: string) => {
    if (!user) {
      toast({
        title: "請先登入",
        description: "需要登入才能記錄閱讀",
        variant: "destructive"
      });
      return false;
    }

    try {
      // 檢查是否已經讀過
      const existingRecord = readingRecords.find(record => record.novel_id === novelId);
      if (existingRecord) {
        toast({
          title: "已經讀過了",
          description: "您已經讀過這篇小說了",
          variant: "destructive"
        });
        return false;
      }

      // 獲取小說信息
      const novel = novels.find(n => n.id === novelId) || todayNovel;
      if (!novel) {
        toast({
          title: "小說不存在",
          description: "找不到指定的小說",
          variant: "destructive"
        });
        return false;
      }

      // 計算獎勵積分
      const basePoints = novel.is_daily_novel ? 50 : 20;
      const vipMultiplier = profile?.role === 'vip' ? 2 : 1;
      const pointsEarned = basePoints * vipMultiplier;

      // 創建閱讀記錄
      const { data: recordData, error: recordError } = await supabase
        .from('novel_reading_records')
        .insert([{
          user_id: user.id,
          novel_id: novelId,
          points_earned: pointsEarned
        }])
        .select()
        .single();

      if (recordError) {
        console.error('創建閱讀記錄失敗:', recordError);
        throw recordError;
      }

      // 更新用戶積分
      updatePoints(pointsEarned, `閱讀小說《${novel.title}》獎勵`);

      // 更新本地狀態
      setReadingRecords(prev => [...prev, recordData]);

      // 更新小說瀏覽數
      await supabase
        .from('novels')
        .update({ views: novel.views + 1 })
        .eq('id', novelId);

      toast({
        title: "閱讀完成！",
        description: `獲得 ${pointsEarned} 積分獎勵`,
      });

      return true;
    } catch (error: any) {
      console.error('標記已讀失敗:', error);
      toast({
        title: "操作失敗",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // 手動觸發每日小說生成
  const generateDailyNovel = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-daily-novel');
      
      if (error) {
        console.error('生成每日小說失敗:', error);
        throw error;
      }
      
      if (data.success) {
        toast({
          title: "生成成功",
          description: "每日小說已更新",
        });
        
        // 重新載入數據
        await loadNovels();
      } else {
        throw new Error(data.error || '生成失敗');
      }
    } catch (error: any) {
      console.error('生成每日小說失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 檢查是否已讀過某篇小說
  const hasRead = (novelId: string) => {
    return readingRecords.some(record => record.novel_id === novelId);
  };

  // 獲取不同類型的小說
  const getNovelsByType = (type: 'recent' | 'popular' | 'featured') => {
    switch (type) {
      case 'recent':
        return novels.filter(n => !n.is_daily_novel).slice(0, 10);
      case 'popular':
        return novels
          .filter(n => !n.is_daily_novel)
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
      case 'featured':
        return novels.filter(n => n.is_featured);
      default:
        return [];
    }
  };

  useEffect(() => {
    loadNovels();
  }, [user]);

  return {
    novels,
    todayNovel,
    readingRecords,
    loading,
    loadNovels,
    markAsRead,
    generateDailyNovel,
    hasRead,
    getNovelsByType
  };
};