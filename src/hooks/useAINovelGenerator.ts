
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAINovelGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateDailyNovel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-novel', {
        body: {
          type: 'daily',
          prompt: '請生成一篇適合今日閱讀的溫馨短篇小說，內容積極正面，字數約500-800字。'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "AI小說生成成功！",
          description: "今日小說已更新，快去閱讀吧！",
        });
        return data.novel;
      } else {
        throw new Error(data.error || '生成失敗');
      }
    } catch (error: any) {
      console.error('AI小說生成失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message,
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
      const { data, error } = await supabase.functions.invoke('generate-ai-novel', {
        body: {
          type: 'custom',
          prompt,
          genre
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "自定義小說生成成功！",
          description: `${genre}類型小說已生成`,
        });
        return data.novel;
      } else {
        throw new Error(data.error || '生成失敗');
      }
    } catch (error: any) {
      console.error('自定義小說生成失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message,
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
