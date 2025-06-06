
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users,
  Plus,
  Play,
  Crown,
  LogOut,
  RefreshCw,
  Database,
  Wifi
} from 'lucide-react';

interface GameSession {
  id: string;
  session_name: string;
  game_type: string;
  host_user_id: string;
  max_players: number;
  is_active: boolean;
  session_data: any;
  created_at: string;
  participant_count?: number;
}

interface UserGameData {
  id: string;
  game_type: string;
  game_data: any;
  last_played: string;
}

const GamesPage = () => {
  const { user, updatePoints } = useUser();
  const { toast } = useToast();
  
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [userGameData, setUserGameData] = useState<UserGameData[]>([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // 載入用戶遊戲數據
  const loadUserGameData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_game_data')
        .select('*')
        .eq('user_id', user.id)
        .order('last_played', { ascending: false });

      if (error) throw error;
      setUserGameData(data || []);
    } catch (error) {
      console.error('載入用戶遊戲數據失敗:', error);
      toast({
        title: "載入失敗",
        description: "無法載入您的遊戲數據",
        variant: "destructive",
      });
    }
  };

  // 載入遊戲會話
  const loadGameSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          *,
          game_session_participants(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const sessionsWithCount = data?.map(session => ({
        ...session,
        participant_count: session.game_session_participants?.[0]?.count || 0
      })) || [];
      
      setGameSessions(sessionsWithCount);
    } catch (error) {
      console.error('載入遊戲會話失敗:', error);
      toast({
        title: "載入失敗",
        description: "無法載入遊戲會話",
        variant: "destructive",
      });
    }
  };

  // 創建新遊戲會話
  const createGameSession = async (gameType: string) => {
    if (!user || !newSessionName.trim()) {
      toast({
        title: "請輸入會話名稱",
        description: "創建遊戲會話需要名稱",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          session_name: newSessionName.trim(),
          game_type: gameType,
          host_user_id: user.id,
          session_data: { created_by: user.username || user.id }
        })
        .select()
        .single();

      if (error) throw error;

      // 自動加入自己創建的會話
      await joinGameSession(data.id);
      
      setNewSessionName('');
      toast({
        title: "會話已創建",
        description: `成功創建遊戲會話：${newSessionName}`,
      });
      
      updatePoints(50, '創建遊戲會話');
      await loadGameSessions();
    } catch (error) {
      console.error('創建遊戲會話失敗:', error);
      toast({
        title: "創建失敗",
        description: "無法創建遊戲會話",
        variant: "destructive",
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
          user_id: user.id,
          is_online: true
        });

      if (error && error.code !== '23505') { // 忽略重複加入錯誤
        throw error;
      }

      toast({
        title: "加入成功",
        description: "已加入遊戲會話",
      });
      
      updatePoints(20, '加入遊戲會話');
      await loadGameSessions();
    } catch (error) {
      console.error('加入遊戲會話失敗:', error);
      toast({
        title: "加入失敗",
        description: "無法加入遊戲會話",
        variant: "destructive",
      });
    }
  };

  // 保存遊戲數據
  const saveGameData = async (gameType: string, gameData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_game_data')
        .upsert({
          user_id: user.id,
          game_type: gameType,
          game_data: gameData,
          last_played: new Date().toISOString()
        }, {
          onConflict: 'user_id,game_type'
        });

      if (error) throw error;

      await loadUserGameData();
      setLastSync(new Date());
      
      toast({
        title: "數據已保存",
        description: "遊戲數據已同步到雲端",
      });
    } catch (error) {
      console.error('保存遊戲數據失敗:', error);
      toast({
        title: "保存失敗",
        description: "無法保存遊戲數據到雲端",
        variant: "destructive",
      });
    }
  };

  // 設置即時監聽
  useEffect(() => {
    if (!user) return;

    // 監聽遊戲會話變化
    const sessionChannel = supabase
      .channel('game-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        () => {
          loadGameSessions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_session_participants'
        },
        () => {
          loadGameSessions();
        }
      )
      .subscribe();

    // 監聽用戶遊戲數據變化
    const userDataChannel = supabase
      .channel('user-game-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_game_data',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUserGameData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(userDataChannel);
    };
  }, [user]);

  // 初始化加載數據
  useEffect(() => {
    if (user) {
      loadGameSessions();
      loadUserGameData();
    }
  }, [user]);

  // 更新在線狀態
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Crown className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">需要登入</h2>
          <p className="text-muted-foreground">請先登入以使用雲端遊戲功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和狀態 */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            雲端遊戲中心
          </h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isOnline ? '在線' : '離線'}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground">
          享受雲端存儲和多人即時同步的遊戲體驗
        </p>
        {lastSync && (
          <p className="text-xs text-muted-foreground">
            最後同步: {lastSync.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* 創建遊戲會話 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-6 h-6" />
            <span>創建遊戲會話</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="輸入會話名稱..."
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => createGameSession('multiplayer')}
              disabled={!newSessionName.trim()}
            >
              創建會話
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 活躍遊戲會話 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>活躍遊戲會話</span>
            <Badge variant="secondary">{gameSessions.length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadGameSessions}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gameSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>目前沒有活躍的遊戲會話</p>
              </div>
            ) : (
              gameSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{session.session_name}</h3>
                      <Badge className="text-xs">{session.game_type}</Badge>
                      {session.host_user_id === user.id && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      參與者: {session.participant_count || 0}/{session.max_players}
                    </p>
                  </div>
                  <Button onClick={() => joinGameSession(session.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    加入
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 我的遊戲數據 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-6 h-6" />
            <span>我的遊戲數據</span>
            <Badge variant="secondary">{userGameData.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userGameData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>還沒有遊戲數據</p>
              </div>
            ) : (
              userGameData.map((data) => (
                <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{data.game_type}</h3>
                    <p className="text-sm text-muted-foreground">
                      最後遊玩: {new Date(data.last_played).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => saveGameData(data.game_type, { ...data.game_data, updated: Date.now() })}
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      同步
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 快速測試按鈕 */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold mb-3">測試雲端存儲</h4>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => saveGameData('test_game', { score: Math.floor(Math.random() * 1000), timestamp: Date.now() })}
              >
                保存測試數據
              </Button>
              <Button 
                variant="outline" 
                onClick={loadUserGameData}
              >
                重新載入
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesPage;
