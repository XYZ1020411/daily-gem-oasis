import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Globe, Gamepad2, Trophy, Users, Target, Dice6, Zap, Skull } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModernWorld2Game from './ModernWorld2Game';
import DoomsdaySurvivalGame from './DoomsdaySurvivalGame';

const GamesPage: React.FC = () => {
  const { profile, updatePoints } = useUser();
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<{[key: string]: number}>({});

  const games = [
    {
      id: 'modernworld2',
      name: '現代世界2',
      description: '成為國家領導者，建設你的帝國，征服世界！',
      icon: Globe,
      difficulty: '中等',
      reward: '50-200',
      category: '策略',
      isNew: true,
      isIndependent: true
    },
    {
      id: 'doomsday-survival',
      name: '末日生存模擬器',
      description: '在末日世界中求生，管理資源，對抗威脅！',
      icon: Skull,
      difficulty: '困難',
      reward: '100-300',
      category: '生存',
      isNew: true,
      isIndependent: true
    },
    {
      id: 'lucky-wheel',
      name: '幸運轉盤',
      description: '轉動命運之輪，贏取豐厚積分獎勵！',
      icon: Target,
      difficulty: '簡單',
      reward: '10-500',
      category: '運氣'
    },
    {
      id: 'dice-game',
      name: '骰子遊戲',
      description: '擲骰子比大小，考驗你的運氣！',
      icon: Dice6,
      difficulty: '簡單',
      reward: '20-100',
      category: '運氣'
    },
    {
      id: 'trivia-quiz',
      name: '知識問答',
      description: '回答問題獲得積分，展現你的智慧！',
      icon: Zap,
      difficulty: '中等',
      reward: '30-150',
      category: '益智'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '困難': return 'bg-red-500';
      case '中等': return 'bg-yellow-500';
      case '簡單': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const playGame = async (gameId: string) => {
    if (gameId === 'modernworld2') {
      setSelectedGame('modernworld2');
      return;
    }

    if (gameId === 'doomsday-survival') {
      setSelectedGame('doomsday-survival');
      return;
    }

    try {
      let points = 0;
      let resultMessage = '';

      switch (gameId) {
        case 'lucky-wheel':
          points = Math.floor(Math.random() * 491) + 10; // 10-500
          resultMessage = `幸運轉盤停在了 ${points} 積分！`;
          break;
        case 'dice-game':
          const dice1 = Math.floor(Math.random() * 6) + 1;
          const dice2 = Math.floor(Math.random() * 6) + 1;
          const total = dice1 + dice2;
          points = total >= 10 ? 100 : total >= 7 ? 50 : 20;
          resultMessage = `你擲出了 ${dice1} 和 ${dice2}（總和：${total}），獲得 ${points} 積分！`;
          break;
        case 'trivia-quiz':
          const correct = Math.random() > 0.5;
          points = correct ? 150 : 30;
          resultMessage = correct ? '回答正確！獲得 150 積分！' : '回答錯誤，獲得安慰獎 30 積分。';
          break;
        default:
          points = 50;
          resultMessage = '遊戲完成，獲得 50 積分！';
      }

      if (profile) {
        await updatePoints(points, `遊戲獎勵: ${games.find(g => g.id === gameId)?.name}`);
      }

      setGameResults(prev => ({ ...prev, [gameId]: points }));

      toast({
        title: "遊戲完成！",
        description: resultMessage,
      });

    } catch (error) {
      console.error('Error playing game:', error);
      toast({
        title: "遊戲錯誤",
        description: "遊戲過程中發生錯誤，請重試",
        variant: "destructive"
      });
    }
  };

  if (selectedGame === 'modernworld2') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">現代世界2</h1>
          <Button 
            onClick={() => setSelectedGame(null)}
            variant="outline"
          >
            返回遊戲列表
          </Button>
        </div>
        <ModernWorld2Game />
      </div>
    );
  }

  if (selectedGame === 'doomsday-survival') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">末日生存模擬器</h1>
          <Button 
            onClick={() => setSelectedGame(null)}
            variant="outline"
          >
            返回遊戲列表
          </Button>
        </div>
        <DoomsdaySurvivalGame />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Gamepad2 className="w-8 h-8" />
          <span>遊戲中心</span>
        </h1>
        <p className="text-muted-foreground">
          玩遊戲賺積分，享受娛樂的同時獲得獎勵！
        </p>
      </div>

      {profile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <div>
                  <div className="font-semibold">當前積分</div>
                  <div className="text-2xl font-bold text-blue-600">{profile.points?.toLocaleString() || 0}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">遊戲等級</div>
                <Badge className="bg-purple-500">
                  {profile.role === 'vip' ? 'VIP玩家' : '普通玩家'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => {
          const Icon = game.icon;
          const hasPlayed = gameResults[game.id] !== undefined;
          
          return (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon className="w-6 h-6" />
                    <span>{game.name}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {game.isNew && (
                      <Badge className="bg-green-500">新遊戲</Badge>
                    )}
                    {game.isIndependent && (
                      <Badge className="bg-blue-500">獨立系統</Badge>
                    )}
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{game.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-muted-foreground">類型: </span>
                      <span className="font-medium">{game.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">獎勵: </span>
                      <span className="font-medium text-green-600">{game.reward} 積分</span>
                    </div>
                  </div>
                </div>

                {hasPlayed && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        上次獲得: {gameResults[game.id]} 積分
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => playGame(game.id)}
                  className="w-full"
                  disabled={!profile && !game.isIndependent}
                >
                  {!profile && !game.isIndependent ? '需要登入' : '開始遊戲'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>遊戲規則</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">積分獲得</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 完成遊戲即可獲得積分獎勵</li>
                <li>• VIP 用戶獲得額外 20% 積分加成</li>
                <li>• 每日首次遊戲有雙倍積分</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">特殊說明</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 現代世界2和末日生存為獨立遊戲系統</li>
                <li>• 登入用戶可保存遊戲進度</li>
                <li>• 遊戲結果基於隨機算法</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesPage;
