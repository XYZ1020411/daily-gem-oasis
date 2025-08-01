import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Gift, Clock, Users, Copy, Check } from 'lucide-react';

const GiftCodeBoard: React.FC = () => {
  const { giftCodes, redeemGiftCode } = useUser();
  const { toast } = useToast();
  const [redeemCode, setRedeemCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleRedeem = () => {
    if (!redeemCode.trim()) {
      toast({
        title: "請輸入兌換碼",
        variant: "destructive",
      });
      return;
    }

    const success = redeemGiftCode(redeemCode.trim());
    if (success) {
      toast({
        title: "兌換成功",
        description: "積分已發放到您的帳戶",
      });
      setRedeemCode('');
    } else {
      toast({
        title: "兌換失敗",
        description: "兌換碼無效或已過期",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "已複製",
      description: "兌換碼已複製到剪貼板",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const activeGiftCodes = giftCodes?.filter(code => code.is_active && !isExpired(code.expires_at)) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          兌換碼公告
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 兌換區域 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            兌換禮品碼
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="輸入兌換碼"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRedeem()}
              className="flex-1"
            />
            <Button onClick={handleRedeem} className="whitespace-nowrap">
              兌換
            </Button>
          </div>
        </div>

        {/* 可用兌換碼列表 */}
        {activeGiftCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>目前沒有可用的兌換碼</p>
            <p className="text-sm">請關注最新活動公告</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              可用兌換碼
            </h3>
            {activeGiftCodes.map((giftCode) => (
              <div
                key={giftCode.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <code className="bg-gray-100 px-3 py-1 rounded font-mono text-lg font-bold text-purple-600">
                      {giftCode.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(giftCode.code)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === giftCode.code ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {giftCode.points} 積分
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    到期時間: {formatDate(giftCode.expires_at)}
                  </div>
                  {giftCode.used_by && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      已使用: {giftCode.used_by.length} 次
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GiftCodeBoard;