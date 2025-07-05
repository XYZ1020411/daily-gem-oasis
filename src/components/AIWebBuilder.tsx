
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { Loader2, Globe, Copy, Eye, Trash2, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WebPage {
  id: string;
  title: string;
  description: string;
  html_content: string;
  generated_url: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
}

const AIWebBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userPages, setUserPages] = useState<WebPage[]>([]);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useUser();

  const MAX_DAILY_USAGE = 10;

  useEffect(() => {
    if (profile) {
      loadUserPages();
      checkDailyUsage();
    }
  }, [profile]);

  const loadUserPages = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('user_web_pages')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPages(data || []);
    } catch (error) {
      console.error('載入網頁失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDailyUsage = async () => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('user_web_pages')
        .select('id')
        .eq('user_id', profile.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (error) throw error;
      setDailyUsage(data?.length || 0);
    } catch (error) {
      console.error('檢查每日使用量失敗:', error);
    }
  };

  const generateWebPage = async () => {
    if (!profile) {
      toast({
        title: "錯誤",
        description: "請先登入",
        variant: "destructive"
      });
      return;
    }

    if (dailyUsage >= MAX_DAILY_USAGE) {
      toast({
        title: "達到每日限制",
        description: `您今天已經生成了 ${MAX_DAILY_USAGE} 個網頁，請明天再試`,
        variant: "destructive"
      });
      return;
    }

    if (!prompt.trim() || !title.trim()) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入網頁標題和描述",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // 調用 Edge Function 生成網頁
      const response = await fetch('/api/generate-webpage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          title,
          description
        }),
      });

      if (!response.ok) {
        throw new Error('生成網頁失敗');
      }

      const { htmlContent } = await response.json();
      
      // 生成唯一的 URL ID
      const pageId = crypto.randomUUID();
      const generatedUrl = `${window.location.origin}/page/${pageId}`;

      // 儲存到資料庫
      const { error } = await supabase
        .from('user_web_pages')
        .insert({
          id: pageId,
          user_id: profile.id,
          title,
          description,
          html_content: htmlContent,
          generated_url: generatedUrl,
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "網頁生成成功！",
        description: "您的網頁已經生成並可以分享了",
      });

      // 重置表單
      setPrompt('');
      setTitle('');
      setDescription('');
      
      // 重新載入數據
      await loadUserPages();
      await checkDailyUsage();

    } catch (error) {
      console.error('生成網頁錯誤:', error);
      toast({
        title: "生成失敗",
        description: "無法生成網頁，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "連結已複製",
      description: "網頁連結已複製到剪貼板",
    });
  };

  const deleteWebPage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_web_pages')
        .delete()
        .eq('id', id)
        .eq('user_id', profile?.id);

      if (error) throw error;

      toast({
        title: "刪除成功",
        description: "網頁已刪除",
      });

      await loadUserPages();
      await checkDailyUsage();
    } catch (error) {
      console.error('刪除網頁失敗:', error);
      toast({
        title: "刪除失敗",
        description: "無法刪除網頁，請稍後再試",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 生成器卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-purple-500" />
              <CardTitle>AI 網頁制作工具</CardTitle>
            </div>
            <Badge variant={dailyUsage >= MAX_DAILY_USAGE ? "destructive" : "secondary"}>
              今日使用: {dailyUsage}/{MAX_DAILY_USAGE}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">網頁標題</label>
            <Input
              placeholder="請輸入網頁標題"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isGenerating || dailyUsage >= MAX_DAILY_USAGE}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">網頁描述 (可選)</label>
            <Input
              placeholder="簡短描述您的網頁"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isGenerating || dailyUsage >= MAX_DAILY_USAGE}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">網頁內容描述</label>
            <Textarea
              placeholder="詳細描述您想要的網頁內容，例如：一個介紹咖啡的網頁，包含咖啡種類、沖泡方法等..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isGenerating || dailyUsage >= MAX_DAILY_USAGE}
            />
          </div>

          <Button 
            onClick={generateWebPage}
            disabled={isGenerating || dailyUsage >= MAX_DAILY_USAGE || !prompt.trim() || !title.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                生成網頁
              </>
            )}
          </Button>
          
          {dailyUsage >= MAX_DAILY_USAGE && (
            <p className="text-sm text-muted-foreground text-center">
              您今天已達到生成限制，請明天再來！
            </p>
          )}
        </CardContent>
      </Card>

      {/* 我的網頁列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>我的網頁</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userPages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              您還沒有創建任何網頁
            </p>
          ) : (
            <div className="space-y-4">
              {userPages.map((page) => (
                <div key={page.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{page.title}</h3>
                      {page.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {page.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        創建於 {new Date(page.created_at).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(page.generated_url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        預覽
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => copyUrl(page.generated_url)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        複製連結
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteWebPage(page.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    連結: {page.generated_url}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIWebBuilder;
