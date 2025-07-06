
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, genre } = await req.json();
    
    console.log('AI小說生成請求:', { type, genre });

    // 檢查是否已有今日小說（僅針對每日小說）
    if (type === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingNovel } = await supabase
        .from('novels')
        .select('id')
        .eq('is_daily_novel', true)
        .eq('publish_date', today)
        .single();

      if (existingNovel) {
        return new Response(JSON.stringify({
          success: false,
          error: '今日已生成過每日小說'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let novelData;

    if (openAIApiKey) {
      console.log('使用 OpenAI 生成小說');
      
      const systemPrompt = type === 'daily' 
        ? '你是一位專業的小說作家。請根據要求創作一篇溫馨、積極正面的短篇小說，字數控制在500-800字之間。小說應該有完整的情節，包含開頭、發展、高潮和結尾。內容要適合所有年齡層閱讀。'
        : `你是一位專業的${genre}小說作家。請根據用戶的要求創作一篇${genre}類型的短篇小說，字數控制在600-1000字之間。小說應該有完整的情節結構，符合${genre}類型的特色。`;

      const userPrompt = type === 'daily'
        ? '請創作一篇適合今日閱讀的溫馨短篇小說，主題可以是友情、親情、成長或者日常生活中的小確幸。'
        : prompt;

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI請求失敗');
      }

      const aiData = await aiResponse.json();
      const generatedContent = aiData.choices[0].message.content;

      // 生成標題
      const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: '請根據小說內容生成一個吸引人的標題，不超過20個字。只回答標題，不要其他內容。' 
            },
            { role: 'user', content: `小說內容：${generatedContent.substring(0, 200)}...` }
          ],
          max_tokens: 50,
          temperature: 0.7,
        }),
      });

      const titleData = await titleResponse.json();
      const generatedTitle = titleData.choices[0].message.content.replace(/["""'']/g, '').trim();

      novelData = {
        title: generatedTitle || (type === 'daily' ? '今日溫馨小故事' : `${genre}小說`),
        author: 'AI作家',
        content: generatedContent,
        genre: type === 'daily' ? '溫馨' : genre,
        read_time: Math.ceil(generatedContent.length / 100), // 根據字數估算閱讀時間
        rating: Number((4.2 + Math.random() * 0.6).toFixed(1)), // 4.2-4.8分
        views: Math.floor(Math.random() * 200) + 50,
        is_daily_novel: type === 'daily',
        is_featured: type === 'daily' || Math.random() > 0.7,
        publish_date: new Date().toISOString().split('T')[0]
      };

    } else {
      console.log('使用備用小說生成');
      // 備用小說內容
      const fallbackNovels = [
        {
          title: '午後的陽光',
          content: '陽光透過百葉窗灑在桌案上，形成一道道金色的光條。小李放下手中的工作，望向窗外。街道上人來人往，每個人都有自己的故事...',
          genre: '溫馨'
        },
        {
          title: '星空下的約定',
          content: '夜晚的星空格外璀璨，小明和小美坐在山坡上，仰望著滿天繁星。他們約定，無論走到哪裡，都要記住今晚的星空...',
          genre: '浪漫'
        }
      ];

      const randomNovel = fallbackNovels[Math.floor(Math.random() * fallbackNovels.length)];
      
      novelData = {
        title: randomNovel.title,
        author: 'AI作家',
        content: randomNovel.content,
        genre: type === 'daily' ? '溫馨' : (genre || randomNovel.genre),
        read_time: 5,
        rating: 4.5,
        views: Math.floor(Math.random() * 100) + 50,
        is_daily_novel: type === 'daily',
        is_featured: type === 'daily',
        publish_date: new Date().toISOString().split('T')[0]
      };
    }

    // 保存到數據庫
    const { data: savedNovel, error: saveError } = await supabase
      .from('novels')
      .insert([novelData])
      .select()
      .single();

    if (saveError) {
      console.error('保存小說失敗:', saveError);
      throw saveError;
    }

    console.log('AI小說生成成功:', savedNovel.title);

    return new Response(JSON.stringify({
      success: true,
      novel: savedNovel
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('AI小說生成失敗:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
