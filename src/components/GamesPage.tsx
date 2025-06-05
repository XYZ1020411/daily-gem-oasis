
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Target, Zap, Coins, Trophy, Star, Gift, Flag } from 'lucide-react';

const GamesPage = () => {
  const { user, updatePoints } = useUser();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const playGame = async (gameType: string, gameName: string, baseReward: number) => {
    if (!user) return;
    
    setIsPlaying(gameType);
    
    // 模擬遊戲過程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 隨機獲得獎勵 (50% 機率獲得基礎獎勵，30% 機率獲得雙倍獎勵，20% 機率沒有獎勵)
    const random = Math.random();
    let reward = 0;
    let message = '';
    
    if (random < 0.5) {
      reward = baseReward;
      message = `恭喜！您在${gameName}中獲得了 ${reward} 積分！`;
    } else if (random < 0.8) {
      reward = baseReward * 2;
      message = `太棒了！您在${gameName}中獲得了雙倍獎勵 ${reward} 積分！`;
    } else {
      message = `很遺憾，這次${gameName}沒有獲得獎勵，再試一次吧！`;
    }
    
    if (reward > 0) {
      updatePoints(reward, `${gameName}獎勵`);
    }
    
    toast({
      title: reward > 0 ? "遊戲獲勝！" : "再接再厲！",
      description: message,
      variant: reward > 0 ? "default" : "destructive"
    });
    
    setIsPlaying(null);
  };

  const games = [
    {
      id: 'balloon',
      title: '射氣球遊戲',
      description: '測試您的準確度，射爆氣球贏取積分獎勵！',
      icon: Target,
      baseReward: 50,
      gradient: 'from-red-500 to-pink-500'
    },
    {
      id: 'dart',
      title: '射飛鏢遊戲',
      description: '挑戰飛鏢技巧，命中靶心獲得豐厚獎勵！',
      icon: Zap,
      baseReward: 75,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'country',
      title: '建立你的國家',
      description: '建造並管理您的專屬國家，發布法律、管理經濟、外交等獲得獎勵！',
      icon: Flag,
      baseReward: 100,
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const vipGames = [
    {
      id: 'roulette',
      title: 'VIP幸運輪盤',
      description: 'VIP專屬每日抽獎，有機會獲得超級大獎！',
      icon: Star,
      baseReward: 200,
      gradient: 'from-yellow-500 to-orange-500',
      vipOnly: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          遊戲娛樂中心
        </h1>
        <p className="text-muted-foreground">
          享受精彩遊戲，贏取豐富積分獎勵！
        </p>
      </div>

      {/* 一般遊戲 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;
          const isCurrentlyPlaying = isPlaying === game.id;
          
          return (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${game.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {game.description}
                </p>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      基礎獎勵: {game.baseReward} 積分
                    </span>
                  </div>
                  <Button
                    onClick={() => playGame(game.id, game.title, game.baseReward)}
                    disabled={isCurrentlyPlaying}
                    className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90`}
                  >
                    {isCurrentlyPlaying ? '遊戲進行中...' : '開始遊戲'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* VIP專屬遊戲 */}
      {user?.role === 'vip' || user?.role === 'admin' ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-yellow-600">VIP 專屬遊戲</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vipGames.map((game) => {
              const Icon = game.icon;
              const isCurrentlyPlaying = isPlaying === game.id;
              
              return (
                <Card key={game.id} className="border-2 border-yellow-200 hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${game.gradient} flex items-center justify-center mb-4 animate-pulse`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl flex items-center justify-center space-x-2">
                      <span>{game.title}</span>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      {game.description}
                    </p>
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          基礎獎勵: {game.baseReward} 積分
                        </span>
                      </div>
                      <Button
                        onClick={() => playGame(game.id, game.title, game.baseReward)}
                        disabled={isCurrentlyPlaying}
                        className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90`}
                      >
                        {isCurrentlyPlaying ? '遊戲進行中...' : '開始遊戲'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">VIP專屬遊戲</h3>
            <p className="text-muted-foreground mb-4">
              升級為VIP會員即可解鎖更多精彩遊戲和豐厚獎勵！
            </p>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500">
              <Gift className="w-4 h-4 mr-2" />
              立即升級VIP
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 許願池 */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">許願池</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            在許願池中提交您的願望和建議，管理員會認真考慮每一個建議！
          </p>
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
            <Gift className="w-4 h-4 mr-2" />
            許個願望
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesPage;
