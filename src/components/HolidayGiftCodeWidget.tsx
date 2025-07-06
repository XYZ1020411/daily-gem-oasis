
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Code, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

interface HolidayGiftCode {
  id: string;
  holiday: string;
  code: string;
  points: number;
  description: string;
  expires_at: string;
  created_at: string;
}

const HolidayGiftCodeWidget: React.FC = () => {
  const [giftCodes, setGiftCodes] = useState<HolidayGiftCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { profile, updatePoints } = useUser();

  // 檢查今日節日
  const getTodayHoliday = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    const holidays: Record<string, string> = {
      '1-1': '元旦',
      '2-14': '情人節',
      '3-8': '婦女節',
      '4-1': '愚人節',
      '5-1': '勞動節',
      '6-1': '兒童節',
      '7-7': '七夕',
      '10-10': '國慶日',
      '12-25': '聖誕節',
      '12-31': '跨年夜'
    };
    
    return holidays[`${month}-${date}`] || null;
  };

  const generateHolidayGiftCode = async () => {
    const holiday = getTodayHoliday();
    if (!holiday) {
      toast({
        title: "今日無特殊節日",
        description: "今天不是特殊節日，無法生成節日禮包碼",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-holiday-gift-code', {
        body: { holiday }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "節日禮包碼生成成功！",
          description: `${holiday}特別禮包碼已生成`,
        });
        loadTodayGiftCodes();
      }
    } catch (error: any) {
      console.error('生成節日禮包碼失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const loadTodayGiftCodes = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('gift_codes')
        .select('*')
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedCodes = (data || []).map(code => ({
        id: code.id,
        holiday: code.code.includes('HOLIDAY') ? getTodayHoliday() || '特殊節日' : '一般',
        code: code.code,
        points: code.points,
        description: `獲得 ${code.points} 積分`,
        expires_at: code.expires_at,
        created_at: code.created_at
      }));

      setGiftCodes(formattedCodes);
    } catch (error: any) {
      console.error('載入禮包碼失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemGiftCode = async (code: string, points: number) => {
    try {
      updatePoints(points, `節日禮包碼兌換: ${code}`);
      toast({
        title: "兌換成功！",
        description: `成功兌換 ${points} 積分`,
      });
    } catch (error: any) {
      toast({
        title: "兌換失敗",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTodayGiftCodes();
  }, []);

  const todayHoliday = getTodayHoliday();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-lg">節日禮包碼公告</CardTitle>
          </div>
          <div className="flex space-x-2">
            {todayHoliday && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateHolidayGiftCode}
                disabled={generating}
              >
                <Sparkles className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                生成{todayHoliday}禮包碼
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTodayGiftCodes}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {todayHoliday && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                今日節日：{todayHoliday} 🎉
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : giftCodes.length > 0 ? (
          <div className="space-y-3">
            {giftCodes.map((giftCode) => (
              <div key={giftCode.id} className="p-3 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Code className="w-4 h-4 text-orange-600" />
                      <span className="font-mono text-sm font-bold text-orange-700">
                        {giftCode.code}
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                        {giftCode.holiday}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {giftCode.description} • 到期時間: {new Date(giftCode.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => redeemGiftCode(giftCode.code, giftCode.points)}
                    className="ml-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  >
                    兌換
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">今日暫無節日禮包碼</p>
            {!todayHoliday && (
              <p className="text-xs mt-1">非節日期間，請期待特殊節日活動！</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HolidayGiftCodeWidget;
