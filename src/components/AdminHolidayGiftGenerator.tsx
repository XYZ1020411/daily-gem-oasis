
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Sparkles, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminHolidayGiftGenerator: React.FC = () => {
  const [customHoliday, setCustomHoliday] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // 檢查今日節日
  const getTodayHoliday = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    const holidays: Record<string, string> = {
      '1-1': '中華民國開國紀念日',
      '2-28': '和平紀念日',
      '3-14': '反侵略日',
      '3-29': '革命先烈紀念日',
      '7-15': '解嚴紀念日',
      '9-28': '孔子誕辰紀念日',
      '10-10': '國慶日',
      '10-24': '臺灣聯合國日',
      '11-12': '國父誕辰紀念日',
      '12-25': '行憲紀念日',
      '3-8': '婦女節',
      '4-4': '兒童節',
      '5-1': '勞動節',
      '9-3': '軍人節',
      '10-25': '臺灣光復節'
    };
    
    return holidays[`${month}-${date}`] || null;
  };

  const generateHolidayGiftCode = async (holiday: string) => {
    setGenerating(true);
    
    try {
      console.log('管理員生成節日禮包碼:', holiday);
      
      const { data, error } = await supabase.functions.invoke('generate-holiday-gift-code', {
        body: { 
          holiday,
          isManualGeneration: true,
          adminGenerated: true 
        }
      });

      console.log('禮包碼生成回應:', data, error);

      if (error) {
        console.error('Supabase函數調用錯誤:', error);
        throw error;
      }

      if (data && data.success) {
        toast({
          title: "管理員禮包碼生成成功！",
          description: `${holiday}禮包碼已生成並發送到Discord`,
        });
        setCustomHoliday('');
        return data.giftCode;
      } else {
        const errorMsg = data?.error || '生成失敗';
        console.error('禮包碼生成失敗:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('生成管理員禮包碼失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message || "禮包碼生成時發生錯誤",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCustom = () => {
    const holiday = customHoliday.trim() || '管理員特別活動';
    generateHolidayGiftCode(holiday);
  };

  const handleGenerateToday = () => {
    const holiday = getTodayHoliday();
    if (holiday) {
      generateHolidayGiftCode(holiday);
    } else {
      toast({
        title: "今日無特殊節日",
        description: "今天不是特殊節日，請使用自定義生成",
        variant: "destructive"
      });
    }
  };

  const todayHoliday = getTodayHoliday();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-purple-500" />
          <span>AI節日禮包碼生成器</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayHoliday && (
          <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  今日節日：{todayHoliday}
                </span>
              </div>
              <Button
                onClick={handleGenerateToday}
                disabled={generating}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                生成今日禮包碼
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="customHoliday" className="text-sm font-medium">
              自定義節日/活動名稱
            </Label>
            <Input
              id="customHoliday"
              value={customHoliday}
              onChange={(e) => setCustomHoliday(e.target.value)}
              placeholder="例如：週年慶活動、特別促銷等（留空則使用默認）"
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={handleGenerateCustom}
            disabled={generating}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'AI生成中...' : 'AI生成自定義禮包碼'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">功能說明：</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• AI會根據節日生成合適的禮包碼和積分獎勵</p>
            <p>• 生成後會自動發送通知到Discord頻道</p>
            <p>• 禮包碼當天有效，過期自動失效</p>
            <p>• 積分獎勵範圍：500-2000點</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminHolidayGiftGenerator;
