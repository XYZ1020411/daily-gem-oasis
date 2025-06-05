
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  History, 
  Gift, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Crown,
  User,
  Shield,
  Star,
  CheckCircle,
  Clock
} from 'lucide-react';

const WalletPage = () => {
  const { user, transactions, redeemGiftCode } = useUser();
  const { toast } = useToast();
  const [giftCode, setGiftCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemGiftCode = async () => {
    if (!giftCode.trim()) {
      toast({
        title: "請輸入禮品碼",
        description: "禮品碼不能為空",
        variant: "destructive"
      });
      return;
    }

    setIsRedeeming(true);
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = redeemGiftCode(giftCode);
    
    if (success) {
      toast({
        title: "兌換成功！",
        description: `禮品碼 ${giftCode} 已成功兌換`,
      });
      setGiftCode('');
    } else {
      toast({
        title: "兌換失敗",
        description: "無效的禮品碼或已使用過",
        variant: "destructive"
      });
    }
    
    setIsRedeeming(false);
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <Shield className="w-5 h-5 text-red-500" />;
      case 'vip': return <Crown className="w-5 h-5 text-yellow-500" />;
      default: return <User className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin': return <Badge className="bg-red-500">管理員</Badge>;
      case 'vip': return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">VIP會員</Badge>;
      default: return <Badge className="bg-blue-500">普通會員</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'spend': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'checkin': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'game': return <Star className="w-4 h-4 text-purple-500" />;
      case 'gift': return <Gift className="w-4 h-4 text-orange-500" />;
      default: return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const userTransactions = transactions.filter(t => t.userId === user?.id).slice(0, 10);

  if (!user) {
    return <div>請先登入</div>;
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          積分錢包
        </h1>
        <p className="text-muted-foreground">
          管理您的積分餘額和交易記錄
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 積分餘額卡片 */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-green-600" />
              <span>積分餘額</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {user.points.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">可用積分</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-blue-600">
                  {user.checkInDays}
                </div>
                <p className="text-xs text-muted-foreground">簽到天數</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-purple-600">
                  {user.vipLevel}
                </div>
                <p className="text-xs text-muted-foreground">VIP等級</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 會員資訊卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getRoleIcon()}
              <span>會員資訊</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">用戶名稱</span>
                <span className="font-medium">{user.username}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">會員等級</span>
                {getRoleBadge()}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">加入日期</span>
                <span className="font-medium">{user.joinDate}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">會員狀態</span>
                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                  {user.status === 'active' ? '正常' : '停用'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">累計消費</span>
                <span className="font-medium">{user.totalSpent} 積分</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 禮品碼兌換 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-6 h-6 text-orange-500" />
            <span>禮品碼兌換</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="giftCode">禮品碼</Label>
              <Input
                id="giftCode"
                placeholder="請輸入禮品碼"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleRedeemGiftCode}
                disabled={isRedeeming}
                className="bg-gradient-to-r from-orange-500 to-red-500"
              >
                {isRedeeming ? '兌換中...' : '兌換'}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">可用的測試禮品碼：</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Badge variant="outline" className="justify-center">WELCOME100 (+100分)</Badge>
              <Badge variant="outline" className="justify-center">VIP500 (+500分)</Badge>
              <Badge variant="outline" className="justify-center">LUCKY1000 (+1000分)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 交易記錄 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-500" />
            <span>最近交易記錄</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userTransactions.length > 0 ? (
            <div className="space-y-3">
              {userTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'spend' ? 'text-red-500' : 'text-green-500'}`}>
                    {transaction.type === 'spend' ? '-' : '+'}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">暫無交易記錄</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
