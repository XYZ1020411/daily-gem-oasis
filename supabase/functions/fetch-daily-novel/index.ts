import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  content: string;
  description: string;
  pubDate: string;
  creator?: string[];
  source_url: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// 新聞API key
const NEWS_API_KEY = 'pub_77914c9ab741571647f817116519227c8df64';

async function fetchNewsStories() {
  try {
    console.log('開始獲取新聞故事...');
    
    // 使用提供的新聞API
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&category=entertainment,lifestyle&language=zh&size=10`
    );
    
    if (!response.ok) {
      console.error('新聞API請求失敗:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log('獲取新聞數據:', data);
    
    return data.results || [];
  } catch (error) {
    console.error('獲取新聞時發生錯誤:', error);
    return [];
  }
}

function convertNewsToNovel(article: NewsArticle): any {
  // 將新聞轉換為小說格式
  const genres = ['生活', '娛樂', '文化', '社會', '人文'];
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];
  
  // 基於新聞內容創建小說化的內容
  const novelContent = createNovelFromNews(article);
  
  return {
    title: article.title || '今日故事',
    author: article.creator?.[0] || '今日作者',
    content: novelContent,
    genre: randomGenre,
    read_time: Math.max(5, Math.min(15, Math.floor(novelContent.length / 100))),
    rating: Number((4.0 + Math.random() * 1.0).toFixed(1)),
    views: Math.floor(Math.random() * 1000) + 100,
    is_daily_novel: true,
    source_url: article.source_url,
    publish_date: new Date().toISOString().split('T')[0]
  };
}

function createNovelFromNews(article: NewsArticle): string {
  // 如果有完整內容，使用它；否則使用描述
  let baseContent = article.content || article.description || article.title;
  
  // 清理HTML標籤
  baseContent = baseContent.replace(/<[^>]*>/g, '');
  
  // 如果內容太短，擴充它
  if (baseContent.length < 200) {
    const expansions = [
      '\n\n這個故事讓我們思考人生的意義。',
      '\n\n在這個快節奏的世界裡，我們常常忽略了身邊的美好。',
      '\n\n每個人都有自己的故事，每個故事都值得被聆聽。',
      '\n\n生活中的小確幸，往往比大富大貴更能觸動人心。',
      '\n\n時間會證明一切，真相總會浮出水面。',
      '\n\n在人生的十字路口，我們都需要做出選擇。'
    ];
    
    const randomExpansion = expansions[Math.floor(Math.random() * expansions.length)];
    baseContent += randomExpansion;
  }
  
  return baseContent;
}

async function saveNovelToDatabase(novelData: any) {
  try {
    console.log('準備保存小說到數據庫:', novelData.title);
    
    // 檢查今天是否已經有每日小說
    const today = new Date().toISOString().split('T')[0];
    const { data: existingNovel } = await supabase
      .from('novels')
      .select('id')
      .eq('is_daily_novel', true)
      .eq('publish_date', today)
      .single();
    
    if (existingNovel) {
      console.log('今天已經有每日小說，更新現有記錄');
      
      const { data, error } = await supabase
        .from('novels')
        .update(novelData)
        .eq('id', existingNovel.id)
        .select()
        .single();
      
      if (error) {
        console.error('更新小說時發生錯誤:', error);
        return null;
      }
      
      return data;
    } else {
      console.log('創建新的每日小說');
      
      const { data, error } = await supabase
        .from('novels')
        .insert([novelData])
        .select()
        .single();
      
      if (error) {
        console.error('插入小說時發生錯誤:', error);
        return null;
      }
      
      return data;
    }
  } catch (error) {
    console.error('保存小說到數據庫時發生錯誤:', error);
    return null;
  }
}

async function generateDailyNovel() {
  try {
    console.log('開始生成每日小說...');
    
    // 獲取新聞文章
    const articles = await fetchNewsStories();
    
    if (!articles || articles.length === 0) {
      console.log('沒有獲取到新聞文章，使用備用內容');
      
      // 備用小說內容
      const fallbackNovels = [
        {
          title: '城市的夜晚',
          author: '夜行者',
          content: '霓虹燈閃爍的城市夜晚，每個窗戶後面都有一個故事。在這個不眠的城市裡，有人在追逐夢想，有人在尋找歸宿，有人在品味孤獨...',
          genre: '都市',
          read_time: 8,
          rating: 4.5,
          views: Math.floor(Math.random() * 500) + 200,
          is_daily_novel: true,
          publish_date: new Date().toISOString().split('T')[0]
        }
      ];
      
      const randomNovel = fallbackNovels[Math.floor(Math.random() * fallbackNovels.length)];
      return await saveNovelToDatabase(randomNovel);
    }
    
    // 選擇一篇文章轉換為小說
    const selectedArticle = articles[Math.floor(Math.random() * articles.length)];
    console.log('選中的文章:', selectedArticle.title);
    
    const novelData = convertNewsToNovel(selectedArticle);
    const savedNovel = await saveNovelToDatabase(novelData);
    
    if (savedNovel) {
      console.log('每日小說生成成功:', savedNovel.title);
      return savedNovel;
    } else {
      throw new Error('保存小說失敗');
    }
    
  } catch (error) {
    console.error('生成每日小說時發生錯誤:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('每日小說抓取功能啟動...');
    
    const novel = await generateDailyNovel();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: '每日小說生成成功',
        novel: novel
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
    
  } catch (error: any) {
    console.error('處理請求時發生錯誤:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});