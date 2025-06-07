
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2, Trophy, Star, Users, Crown, Globe, Sword } from 'lucide-react';
import CountryGameModal from './CountryGameModal';
import ModernWorld2Game from './ModernWorld2Game';

const GamesPage = () => {
  const { user, profile, updatePoints } = useUser();
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showCountryGame, setShowCountryGame] = useState(false);
  const [showModernWorld2, setShowModernWorld2] = useState(false);

  const games = [
    {
      id: 'scratch-card',
      title: '刮刮樂',
      description: '花費積分購買刮刮樂，有機會獲得豐厚獎勵！',
      icon: Star,
      cost: 1000,
      maxReward: 50000,
      category: '運氣遊戲'
    },
    {
      id: 'daily-quiz',
      title: '每日問答',
      description: '回答問題獲得積分，每天都有新題目！',
      icon: Trophy,
      cost: 0,
      maxReward: 5000,
      category: '益智遊戲'
    },
    {
      id: 'country-guess',
      title: '猜國家遊戲',
      description: '根據提示猜出正確的國家名稱',
      icon: Globe,
      cost: 500,
      maxReward: 3000,
      category: '地理遊戲'
    },
    {
      id: 'modern-world-2',
      title: '現代世界2',
      description: '地緣政治策略遊戲，以總統身份管理現代國家',
      icon: Crown,
      cost: 0,
      maxReward: 0,
      category: '策略遊戲',
      featured: true
    }
  ];

  const playGame = async (gameId: string, cost: number) => {
    if (!profile || profile.points < cost) {
      toast({
        title: "積分不足",
        description: "您的積分不足以玩這個遊戲",
        variant: "destructive"
      });
      return;
    }

    if (gameId === 'country-guess') {
      setShowCountryGame(true);
      return;
    }

    if (gameId === 'modern-world-2') {
      setShowModernWorld2(true);
      return;
    }

    // 扣除遊戲費用
    if (cost > 0) {
      await updatePoints(-cost, `玩遊戲: ${games.find(g => g.id === gameId)?.title}`);
    }

    // 模擬遊戲結果
    let reward = 0;
    let resultMessage = '';

    switch (gameId) {
      case 'scratch-card':
        const random = Math.random();
        if (random < 0.01) { // 1% 大獎
          reward = 50000;
          resultMessage = '恭喜！中了大獎！';
        } else if (random < 0.1) { // 9% 中獎
          reward = Math.floor(Math.random() * 5000) + 2000;
          resultMessage = '恭喜中獎！';
        } else if (random < 0.3) { // 20% 小獎
          reward = Math.floor(Math.random() * 1000) + 500;
          resultMessage = '獲得小獎！';
        } else {
          resultMessage = '謝謝參與，下次再來！';
        }
        break;
      
      case 'daily-quiz':
        // 模擬問答正確率
        const correct = Math.random() > 0.3; // 70% 正確率
        if (correct) {
          reward = Math.floor(Math.random() * 3000) + 2000;
          resultMessage = '回答正確！';
        } else {
          reward = 500; // 安慰獎
          resultMessage = '回答錯誤，但獲得安慰獎';
        }
        break;
    }

    // 發放獎勵
    if (reward > 0) {
      await updatePoints(reward, `遊戲獎勵: ${games.find(g => g.id === gameId)?.title}`);
    }

    toast({
      title: resultMessage,
      description: reward > 0 ? `獲得 ${reward.toLocaleString()} 積分！` : "感謝參與！"
    });
  };

  const handleCountryGameComplete = async (points: number) => {
    await updatePoints(points, '猜國家遊戲獎勵');
    setShowCountryGame(false);
    toast({
      title: "遊戲完成",
      description: `獲得 ${points.toLocaleString()} 積分！`
    });
  };

  if (showModernWorld2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">現代世界2</h1>
            <p className="text-muted-foreground">總統策略模擬遊戲</p>
          </div>
          <Button variant="outline" onClick={() => setShowModernWorld2(false)}>
            返回遊戲大廳
          </Button>
        </div>
        
        <ModernWorld2Game />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          遊戲娛樂中心
        </h1>
        <p className="text-muted-foreground">
          玩遊戲賺積分，享受娛樂時光！
        </p>
      </div>

      {/* 用戶狀態 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {(profile?.username || profile?.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">歡迎, {profile?.username || profile?.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  當前積分: <span className="font-medium text-green-600">{profile?.points?.toLocaleString() || 0}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">遊戲愛好者</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 遊戲列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Card key={game.id} className={`relative ${game.featured ? 'ring-2 ring-yellow-500' : ''}`}>
              {game.featured && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Star className="w-3 h-3 mr-1" />
                    精選
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {game.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{game.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>遊戲費用:</span>
                    <span className={game.cost === 0 ? 'text-green-600' : 'text-orange-600'}>
                      {game.cost === 0 ? '免費' : `${game.cost.toLocaleString()} 積分`}
                    </span>
                  </div>
                  
                  {game.maxReward > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>最高獎勵:</span>
                      <span className="text-green-600 font-medium">
                        {game.maxReward.toLocaleString()} 積分
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => playGame(game.id, game.cost)}
                  disabled={profile && profile.points < game.cost}
                >
                  {game.cost === 0 ? '開始遊戲' : `花費 ${game.cost.toLocaleString()} 積分遊玩`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 遊戲統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>今日遊戲統計</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-muted-foreground">今日遊玩次數</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">+15,500</p>
              <p className="text-sm text-muted-foreground">今日獲得積分</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">85%</p>
              <p className="text-sm text-muted-foreground">勝率</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">7</p>
              <p className="text-sm text-muted-foreground">連勝次數</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 猜國家遊戲對話框 */}
      <CountryGameModal 
        isOpen={showCountryGame}
        onClose={() => setShowCountryGame(false)}
        onComplete={handleCountryGameComplete}
      />
    </div>
  );
};

export default GamesPage;
