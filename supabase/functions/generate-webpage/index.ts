
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = 'sk-ewG8UzJo8InfJ2AljMDAzEuzJqggpLT88XBDVHtoW7BevFEN';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, title, description } = await req.json();

    const systemPrompt = `你是一個專業的網頁開發助手。請根據用戶的需求生成一個完整的 HTML 網頁。

要求：
1. 生成完整的 HTML 文檔，包含 <!DOCTYPE html>、<html>、<head> 和 <body> 標籤
2. 使用現代的 CSS 樣式，包含響應式設計
3. 使用 Tailwind CSS CDN 來快速創建美觀的界面
4. HTML 內容應該是繁體中文
5. 包含適當的 meta 標籤和標題
6. 確保代碼乾淨、格式良好
7. 如果需要交互功能，可以包含簡單的 JavaScript

請直接返回 HTML 代碼，不要包含任何解釋文字。`;

    const userPrompt = `請創建一個網頁：
標題：${title}
描述：${description || '無特別描述'}
詳細需求：${prompt}

請生成一個完整的、美觀的、響應式的 HTML 網頁。`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.statusText}`);
    }

    const data = await response.json();
    const htmlContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ htmlContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('生成網頁錯誤:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
