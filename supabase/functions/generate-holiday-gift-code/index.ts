
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
    const { holiday } = await req.json();
    
    console.log('生成節日禮包碼:', holiday);

    // 檢查今天是否已經生成過節日禮包碼
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCode } = await supabase
      .from('gift_codes')
      .select('id')
      .ilike('code', `%HOLIDAY_${holiday.replace(/\s+/g, '_').toUpperCase()}%`)
      .gte('created_at', today)
      .single();

    if (existingCode) {
      return new Response(JSON.stringify({
        success: false,
        error: '今日已生成過該節日的禮包碼'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 使用 AI 生成節日相關的禮包碼內容
    let giftCodeData;
    
    if (openAIApiKey) {
      console.log('使用 AI 生成節日禮包碼內容');
      
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: '你是一個節日禮包碼生成器。請根據節日生成合適的禮包碼名稱和積分獎勵。回應格式必須是JSON：{"code": "禮包碼", "points": 積分數量, "description": "描述"}'
            },
            {
              role: 'user',
              content: `請為${holiday}節日生成一個特別的禮包碼，積分獎勵應該在500-2000之間`
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        try {
          const generatedData = JSON.parse(aiData.choices[0].message.content);
          giftCodeData = {
            code: `HOLIDAY_${holiday.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-4)}`,
            points: Math.max(500, Math.min(2000, generatedData.points || 1000)),
            description: generatedData.description || `${holiday}特別禮包碼`
          };
        } catch (parseError) {
          console.error('AI回應解析失敗:', parseError);
          // 使用默認值
          giftCodeData = {
            code: `HOLIDAY_${holiday.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-4)}`,
            points: 1000,
            description: `${holiday}特別禮包碼`
          };
        }
      } else {
        console.error('AI請求失敗');
        // 使用默認值
        giftCodeData = {
          code: `HOLIDAY_${holiday.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-4)}`,
          points: 1000,
          description: `${holiday}特別禮包碼`
        };
      }
    } else {
      console.log('使用默認節日禮包碼生成');
      // 根據節日設定不同的積分獎勵
      const holidayPoints: Record<string, number> = {
        // 國定假日
        '中華民國開國紀念日': 2000,
        '和平紀念日': 1500,
        '反侵略日': 1200,
        '革命先烈紀念日': 1300,
        '解嚴紀念日': 1500,
        '孔子誕辰紀念日': 1400,
        '國慶日': 2500,
        '臺灣聯合國日': 1600,
        '國父誕辰紀念日': 1800,
        '行憲紀念日': 1700,
        
        // 其他節日
        '婦女節': 800,
        '兒童節': 888,
        '勞動節': 1200,
        '軍人節': 1300,
        '臺灣光復節': 1600,
        '中華文化復興節': 1500
      };

      giftCodeData = {
        code: `HOLIDAY_${holiday.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-4)}`,
        points: holidayPoints[holiday] || 1000,
        description: `${holiday}特別禮包碼，祝您節日快樂！`
      };
    }

    // 將禮包碼保存到數據庫
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999); // 當天結束前有效

    const { data: newGiftCode, error: insertError } = await supabase
      .from('gift_codes')
      .insert([{
        code: giftCodeData.code,
        points: giftCodeData.points,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        used_by: []
      }])
      .select()
      .single();

    if (insertError) {
      console.error('插入禮包碼失敗:', insertError);
      throw insertError;
    }

    console.log('節日禮包碼生成成功:', newGiftCode);

    // 發送Discord通知
    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `🎉 今天是**${holiday}**！\n\n今天的節日禮包碼是：**${giftCodeData.code}**\n積分獎勵：${giftCodeData.points} 點\n\n快來領取吧！ 🎁`,
            embeds: [{
              title: '🎊 節日禮包碼生成通知',
              description: giftCodeData.description,
              color: 0x7C3AED,
              fields: [
                {
                  name: '節日',
                  value: holiday,
                  inline: true
                },
                {
                  name: '禮包碼',
                  value: `\`${giftCodeData.code}\``,
                  inline: true
                },
                {
                  name: '積分獎勵',
                  value: `${giftCodeData.points} 點`,
                  inline: true
                },
                {
                  name: '到期時間',
                  value: `${expiresAt.toLocaleDateString('zh-TW')} 23:59`,
                  inline: false
                }
              ],
              timestamp: new Date().toISOString()
            }]
          }),
        });
        console.log('Discord通知發送成功');
      } catch (discordError) {
        console.error('Discord通知發送失敗:', discordError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      giftCode: {
        ...newGiftCode,
        description: giftCodeData.description
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('生成節日禮包碼時發生錯誤:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
