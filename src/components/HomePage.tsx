
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import NewsWidget from './NewsWidget';
import HolidayGiftCodeWidget from './HolidayGiftCodeWidget';
import { 
  Gift, 
  Wallet, 
  ShoppingBag, 
  Star,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  const { profile } = useUser();

  const quickActions = [
    {
      title: '我的錢包',
      description: '查看積分和交易記錄',
      icon: Wallet,
      action: () => onPageChange('wallet'),
      color: 'from-green-500 to-teal-600'
    },
    {
      title: '積分商城',
      description: '使用積分兌換獎品',
      icon: ShoppingBag,
      action: () => onPageChange('shop'),
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 歡迎區域 */}
      <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                歡迎回來，{profile?.display_name || profile?.username || '用戶'}！
              </h1>
              <p className="text-blue-100">
                今天是美好的一天，準備好享受精彩的內容了嗎？
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">當前積分</div>
              <div className="text-3xl font-bold">
                {(profile?.points || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={action.action}
            >
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 主要內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <NewsWidget />
        </div>
        <div className="space-y-6">
          <HolidayGiftCodeWidget />
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{profile?.vip_level || 0}</div>
            <p className="text-sm text-muted-foreground">VIP等級</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{profile?.check_in_streak || 0}</div>
            <p className="text-sm text-muted-foreground">連續簽到</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {new Date(profile?.join_date || '').toLocaleDateString('zh-TW').replace(/\//g, '/')}
            </div>
            <p className="text-sm text-muted-foreground">加入日期</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
