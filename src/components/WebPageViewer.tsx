
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface WebPageData {
  id: string;
  title: string;
  description: string;
  html_content: string;
  created_at: string;
  is_public: boolean;
}

const WebPageViewer: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageData, setPageData] = useState<WebPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pageId) {
      loadPageData();
    }
  }, [pageId]);

  const loadPageData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_web_pages')
        .select('*')
        .eq('id', pageId)
        .eq('is_public', true)
        .single();

      if (error) {
        throw new Error('網頁不存在或已被刪除');
      }

      setPageData(data);
    } catch (err: any) {
      console.error('載入網頁失敗:', err);
      setError(err.message || '載入網頁失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">404 - 網頁不存在</h1>
          <p className="text-muted-foreground mb-4">
            {error || '找不到您要訪問的網頁'}
          </p>
          <a href="/" className="text-blue-500 hover:underline">
            返回首頁
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 設置頁面標題 */}
      <div className="hidden">
        <title>{pageData.title}</title>
        <meta name="description" content={pageData.description} />
      </div>
      
      {/* 渲染生成的 HTML 內容 */}
      <div 
        dangerouslySetInnerHTML={{ __html: pageData.html_content }}
        className="w-full h-full"
      />
    </div>
  );
};

export default WebPageViewer;
