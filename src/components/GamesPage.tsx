
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Gamepad2, 
  Users, 
  Clock, 
  Trophy,
  Play,
  Plus,
  Share2,
  Zap
} from 'lucide-react';

const GamesPage = () => {
  const { user, profile, updatePoints } = useUser();
  const { toast } = useToast();
  const [gameSessions, setGameSessions] = useState<any[]>([]);
  const [userGameData, setUserGameData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 載入遊戲數據
  useEffect(() => {
    if (user) {
      loadGameData();
    }
  }, [user]);

  const loadGameData = async () => {
    try {
      // 載入活躍的遊戲會話
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select(`
          *,
          game_session_participants(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // 載入用戶遊戲數據
      const { data: gameData, error: gameDataError } = await supabase
        .from('user_game_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_played', { ascending: false });

      if (gameDataError) throw gameDataError;

      setGameSessions(sessions || []);
      setUserGameData(gameData || []);
    } catch (error) {
      console.error('載入遊戲數據失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 創建新遊戲會話
  const createGameSession = async (gameType: string, sessionName: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          session_name: sessionName,
          game_type: gameType,
          host_user_id: user.id,
          max_players: 4,
          session_data: {}
        })
        .select()
        .single();

      if (error) throw error;

      // 自動加入會話
      await joinGameSession(data.id);
      
      toast({
        title: "遊戲會話已創建",
        description: `${sessionName} 已成功創建`
      });

      loadGameData();
    } catch (error) {
      console.error('創建遊戲會話失敗:', error);
      toast({
        title: "創建失敗",
        description: "無法創建遊戲會話",
        variant: "destructive"
      });
    }
  };

  // 加入遊戲會話
  const joinGameSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('game_session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "加入成功",
        description: "已成功加入遊戲會話"
      });

      loadGameData();
    } catch (error) {
      console.error('加入遊戲會話失敗:', error);
      toast({
        title: "加入失敗",
        description: "無法加入遊戲會話",
        variant: "destructive"
      });
    }
  };

  const gameTypes = [
    { id: 'memory', name: '記憶遊戲', icon: '🧠', description: '測試你的記憶力' },
    { id: 'puzzle', name: '拼圖遊戲', icon: '🧩', description: '挑戰邏輯思維' },
    { id: 'trivia', name: '問答遊戲', icon: '❓', description: '知識問答挑戰' },
    { id: 'action', name: '動作遊戲', icon: '⚡', description: '反應速度測試' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入遊戲數據中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          遊戲娛樂中心
        </h1>
        <p className="text-muted-foreground">
          歡迎 {profile?.username || profile?.display_name || '玩家'} 來到遊戲世界！
        </p>
      </div>

      {/* 用戶遊戲統計 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{profile?.points || 0}</div>
            <p className="text-sm text-muted-foreground">總積分</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Gamepad2 className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{userGameData.length}</div>
            <p className="text-sm text-muted-foreground">已玩遊戲</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">{gameSessions.length}</div>
            <p className="text-sm text-muted-foreground">活躍會話</p>
          </CardContent>
        </Card>
      </div>

      {/* 快速開始遊戲 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-orange-500" />
            <span>快速開始</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {gameTypes.map((game) => (
              <Button
                key={game.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => createGameSession(game.id, `${game.name} - ${new Date().toLocaleTimeString()}`)}
              >
                <span className="text-2xl">{game.icon}</span>
                <span className="font-medium">{game.name}</span>
                <span className="text-xs text-muted-foreground text-center">{game.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 活躍遊戲會話 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-500" />
              <span>活躍遊戲會話</span>
            </CardTitle>
            <Button 
              size="sm"
              onClick={() => createGameSession('custom', `自定義會話 - ${new Date().toLocaleTimeString()}`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              創建會話
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gameSessions.length > 0 ? (
            <div className="space-y-4">
              {gameSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{session.session_name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center space-x-1">
                        <Gamepad2 className="w-4 h-4" />
                        <span>{session.game_type}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{session.game_session_participants?.[0]?.count || 0}/{session.max_players}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(session.created_at).toLocaleTimeString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => joinGameSession(session.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      加入
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gamepad2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">目前沒有活躍的遊戲會話</p>
              <Button 
                className="mt-4"
                onClick={() => createGameSession('memory', `記憶遊戲 - ${new Date().toLocaleTimeString()}`)}
              >
                開始第一個遊戲
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 我的遊戲記錄 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>我的遊戲記錄</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userGameData.length > 0 ? (
            <div className="space-y-3">
              {userGameData.slice(0, 5).map((gameData) => (
                <div key={gameData.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{gameData.game_type}</p>
                    <p className="text-sm text-muted-foreground">
                      最後遊玩: {new Date(gameData.last_played).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {JSON.stringify(gameData.game_data).length > 50 ? '有數據' : '無數據'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">還沒有遊戲記錄</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesPage;
