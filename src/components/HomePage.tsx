
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Coins, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Star,
  Gift,
  Megaphone,
  CheckCircle,
  Crown,
  Zap,
  Heart,
  Clock
} from 'lucide-react';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  const { user, profile, checkIn, updatePoints } = useUser();
  const { toast } = useToast();

  const handleCheckIn = () => {
    try {
      checkIn();
      const reward = profile?.role === 'vip' ? 20 : 10;
      toast({
        title: "簽到成功！",
        description: `獲得 ${reward} 積分獎勵`,
      });
    } catch (error) {
      toast({
        title: "今日已簽到",
        description: "明天再來簽到吧！",
        variant: "destructive",
      });
    }
  };

  const getRoleDisplay = () => {
    switch (profile?.role) {
      case 'admin':
        return { 
          label: '系統管理員', 
          color: 'bg-red-500', 
          icon: <Crown className="w-4 h-4" />,
          gradient: 'from-red-500 to-orange-500'
        };
      case 'vip':
        return { 
          label: `VIP ${profile.vip_level || 1} 級會員`, 
          color: 'bg-yellow-500', 
          icon: <Star className="w-4 h-4" />,
          gradient: 'from-yellow-400 to-orange-500'
        };
      default:
        return { 
          label: '普通會員', 
          color: 'bg-blue-500', 
          icon: <Users className="w-4 h-4" />,
          gradient: 'from-blue-500 to-purple-500'
        };
    }
  };

  const roleInfo = getRoleDisplay();
  const canCheckIn = profile?.last_check_in !== new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* 歡迎橫幅 */}
      <Card className={`bg-gradient-to-r ${roleInfo.gradient} text-white shadow-2xl animate-fade-in`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {roleInfo.icon}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  歡迎回來，{profile?.username || profile?.display_name || '用戶'}！
                </CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  {roleInfo.label}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{profile?.points || 0}</div>
              <div className="text-white/80">積分餘額</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 每日簽到 */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg">每日簽到</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-600">
                {profile?.check_in_streak || 0} 天
              </div>
              <p className="text-sm text-muted-foreground">連續簽到天數</p>
              <Button 
                onClick={handleCheckIn} 
                disabled={!canCheckIn}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {canCheckIn ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    立即簽到
                  </>
                ) : (
                  '今日已簽到'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 積分錢包 */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-lg">積分錢包</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-yellow-600">
                {profile?.points || 0}
              </div>
              <p className="text-sm text-muted-foreground">當前積分</p>
              <Button 
                onClick={() => onPageChange('wallet')} 
                variant="outline"
                className="w-full"
              >
                查看詳情
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 每日小說 */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-lg">每日小說</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-purple-600">
                最新
              </div>
              <p className="text-sm text-muted-foreground">精彩小說每日更新</p>
              <Button 
                onClick={() => onPageChange('novels')} 
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                開始閱讀
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 積分商城 */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-pink-500" />
              <CardTitle className="text-lg">積分商城</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-pink-600">
                100+
              </div>
              <p className="text-sm text-muted-foreground">精美商品等你兌換</p>
              <Button 
                onClick={() => onPageChange('shop')} 
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                <Gift className="w-4 h-4 mr-2" />
                立即購買
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 資訊服務快速入口 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-lg">資訊服務</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-indigo-600">
                全方位
              </div>
              <p className="text-sm text-muted-foreground">天氣預報、新聞資訊、氣象警報</p>
              <Button 
                onClick={() => onPageChange('info')} 
                className="w-full bg-indigo-500 hover:bg-indigo-600"
              >
                <Megaphone className="w-4 h-4 mr-2" />
                查看資訊
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <CardTitle className="text-lg">閱讀統計</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-emerald-600">
                實時
              </div>
              <p className="text-sm text-muted-foreground">閱讀進度與統計分析</p>
              <Button 
                variant="outline"
                className="w-full"
                disabled
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                即將開放
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP升級推薦 */}
      {user?.role !== 'vip' && user?.role !== 'admin' && (
        <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white animate-pulse-glow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8" />
              <div>
                <CardTitle className="text-xl">升級VIP會員</CardTitle>
                <CardDescription className="text-white/80">
                  享受雙倍積分、專屬小說、優先客服等特權
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>雙倍積分獎勵</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>專屬VIP小說</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>專屬客服服務</span>
                </div>
              </div>
              <Button className="bg-white text-orange-500 hover:bg-orange-50">
                立即升級
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 系統公告 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-blue-500" />
            <CardTitle>系統公告</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Badge variant="secondary">新功能</Badge>
              <div>
                <h4 className="font-medium">每日小說系統上線</h4>
                <p className="text-sm text-muted-foreground">全新的每日小說功能現已開放，每天精選優質小說供您閱讀！</p>
                <span className="text-xs text-muted-foreground">2024-06-15</span>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <Badge variant="outline" className="border-green-500 text-green-600">活動</Badge>
              <div>
                <h4 className="font-medium">閱讀獎勵加倍</h4>
                <p className="text-sm text-muted-foreground">本週內完成每日小說閱讀可獲得額外積分獎勵！</p>
                <span className="text-xs text-muted-foreground">2024-06-01</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 社群統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">總會員數</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <BookOpen className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">89</div>
            <p className="text-sm text-muted-foreground">今日閱讀者</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-sm text-muted-foreground">平均評分</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
