
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [generating, setGenerating] = useState(false);
  const [customHoliday, setCustomHoliday] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { profile, updatePoints } = useUser();

  const isAdmin = profile?.role === 'admin';

  // 檢查今日節日
  const getTodayHoliday = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    const holidays: Record<string, string> = {
      // 國定假日
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
      
      // 其他節日
      '3-8': '婦女節',
      '4-4': '兒童節',
      '5-1': '勞動節',
      '9-3': '軍人節',
      '10-25': '臺灣光復節'
    };
    
    return holidays[`${month}-${date}`] || null;
  };

  const generateAdminGiftCode = async () => {
    if (!isAdmin) return;

    const holiday = customHoliday.trim() || '管理員特別活動';
    setGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-holiday-gift-code', {
        body: { 
          holiday,
          isManualGeneration: true,
          adminGenerated: true 
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "管理員禮包碼生成成功！",
          description: `${holiday}禮包碼已生成`,
        });
        setCustomHoliday('');
        setDialogOpen(false);
        loadTodayGiftCodes();
      } else {
        throw new Error(data.error || '生成失敗');
      }
    } catch (error: any) {
      console.error('生成管理員禮包碼失敗:', error);
      toast({
        title: "生成失敗",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
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
      } else {
        throw new Error(data.error || '生成失敗');
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
            <CardTitle className="text-lg">AI節日禮包碼公告</CardTitle>
          </div>
          <div className="flex space-x-2">
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    管理員生成禮包碼
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>管理員手動生成禮包碼</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="customHoliday" className="text-sm font-medium">
                        節日名稱（可選）
                      </label>
                      <Input
                        id="customHoliday"
                        value={customHoliday}
                        onChange={(e) => setCustomHoliday(e.target.value)}
                        placeholder="例如：特別活動、週年慶等（留空則使用默認）"
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={generateAdminGiftCode}
                      disabled={generating}
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {generating ? '生成中...' : 'AI生成禮包碼'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {todayHoliday && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateHolidayGiftCode}
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI生成{todayHoliday}禮包碼
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTodayGiftCodes}
            >
              <RefreshCw className="w-4 h-4" />
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
                今日節日：{todayHoliday} 🎉 可使用AI生成專屬禮包碼！
              </span>
            </div>
          </div>
        )}

        {giftCodes.length > 0 ? (
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
                        AI生成·{giftCode.holiday}
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
            {!todayHoliday ? (
              <p className="text-xs mt-1">非節日期間，請期待特殊節日活動！</p>
            ) : (
              <p className="text-xs mt-1">點擊上方按鈕讓AI為您生成專屬節日禮包碼</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HolidayGiftCodeWidget;
