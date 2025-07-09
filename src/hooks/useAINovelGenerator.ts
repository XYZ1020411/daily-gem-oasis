
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAINovelGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateDailyNovel = async () => {
    setLoading(true);
    try {
      console.log('開始生成每日小說...');
      
      const { data, error } = await supabase.functions.invoke('generate-ai-novel', {
        body: {
          type: 'daily',
          prompt: '請生成一篇適合今日閱讀的溫馨短篇小說，內容積極正面，字數約500-800字。'
        }
      });

      console.log('AI小說生成回應:', data, error);

      if (error) {
        console.error('Supabase函數調用錯誤:', error);
        throw error;
      }

      if (data && data.success) {
        toast({
          title: "AI小說生成成功！",
          description: "今日小說已更新，快去閱讀吧！",
        });
        return data.novel;
      } else {
        const errorMsg = data?.error || '生成失敗';
        console.error('小說生成失敗:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('AI小說生成失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message || "小說生成時發生錯誤",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateCustomNovel = async (prompt: string, genre: string) => {
    setLoading(true);
    try {
      console.log('開始生成自定義小說...', { prompt, genre });
      
      const { data, error } = await supabase.functions.invoke('generate-ai-novel', {
        body: {
          type: 'custom',
          prompt,
          genre
        }
      });

      console.log('自定義小說生成回應:', data, error);

      if (error) {
        console.error('Supabase函數調用錯誤:', error);
        throw error;
      }

      if (data && data.success) {
        toast({
          title: "自定義小說生成成功！",
          description: `${genre}類型小說已生成`,
        });
        return data.novel;
      } else {
        const errorMsg = data?.error || '生成失敗';
        console.error('自定義小說生成失敗:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('自定義小說生成失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message || "自定義小說生成時發生錯誤",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateDailyNovel,
    generateCustomNovel
  };
};
