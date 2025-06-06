
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield,
  Database,
  Users,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeSessions: number;
  totalGameData: number;
  recentActivity: number;
}

interface AdminLog {
  id: string;
  action_type: string;
  target_table: string;
  created_at: string;
  admin_user_id: string;
}

const AdminSync = () => {
  const { user, profile } = useUser();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSessions: 0,
    totalGameData: 0,
    recentActivity: 0
  });
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // 檢查管理員權限
  const isAdmin = profile?.role === 'admin';

  // 載入管理員統計數據
  const loadAdminStats = async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      // 載入用戶總數
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 載入活躍會話數
      const { count: sessionCount } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // 載入遊戲數據總數
      const { count: gameDataCount } = await supabase
        .from('user_game_data')
        .select('*', { count: 'exact', head: true });

      // 載入近期活動數量（最近24小時）
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: activityCount } = await supabase
        .from('points_transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      setStats({
        totalUsers: userCount || 0,
        activeSessions: sessionCount || 0,
        totalGameData: gameDataCount || 0,
        recentActivity: activityCount || 0
      });

      setLastSync(new Date());
    } catch (error) {
      console.error('載入管理員統計失敗:', error);
      toast({
        title: "載入失敗",
        description: "無法載入管理員統計數據",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 載入管理員日誌
  const loadAdminLogs = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAdminLogs(data || []);
    } catch (error) {
      console.error('載入管理員日誌失敗:', error);
    }
  };

  // 記錄管理員操作
  const logAdminAction = async (actionType: string, targetTable?: string, targetId?: string, actionData?: any) => {
    if (!isAdmin || !user) return;

    try {
      const { error } = await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: user.id,
          action_type: actionType,
          target_table: targetTable,
          target_id: targetId,
          action_data: actionData
        });

      if (error) throw error;
      await loadAdminLogs();
    } catch (error) {
      console.error('記錄管理員操作失敗:', error);
    }
  };

  // 強制同步所有數據
  const forceSyncAll = async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    try {
      await Promise.all([
        loadAdminStats(),
        loadAdminLogs()
      ]);

      await logAdminAction('force_sync_all', 'all_tables');
      
      toast({
        title: "同步完成",
        description: "所有數據已強制同步",
      });
    } catch (error) {
      console.error('強制同步失敗:', error);
      toast({
        title: "同步失敗",
        description: "無法完成數據同步",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 清理過期會話
  const cleanupExpiredSessions = async () => {
    if (!isAdmin) return;

    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { error } = await supabase
        .from('game_sessions')
        .update({ is_active: false })
        .lt('created_at', oneDayAgo.toISOString())
        .eq('is_active', true);

      if (error) throw error;

      await logAdminAction('cleanup_expired_sessions', 'game_sessions');
      await loadAdminStats();
      
      toast({
        title: "清理完成",
        description: "過期會話已清理",
      });
    } catch (error) {
      console.error('清理會話失敗:', error);
      toast({
        title: "清理失敗",
        description: "無法清理過期會話",
        variant: "destructive",
      });
    }
  };

  // 設置即時監聽
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadAdminStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        () => {
          loadAdminStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_logs'
        },
        () => {
          loadAdminLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // 初始載入
  useEffect(() => {
    if (isAdmin) {
      loadAdminStats();
      loadAdminLogs();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500" />
            <h3 className="text-xl font-semibold">需要管理員權限</h3>
            <p className="text-muted-foreground">此功能僅限管理員使用</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 管理員統計 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍會話</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">遊戲數據</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGameData}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h活動</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
          </CardContent>
        </Card>
      </div>

      {/* 管理員操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>管理員操作</span>
            {lastSync && (
              <Badge variant="outline" className="ml-auto">
                最後同步: {lastSync.toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              onClick={forceSyncAll}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              強制同步所有數據
            </Button>
            <Button 
              onClick={cleanupExpiredSessions}
              disabled={isLoading}
              variant="outline"
            >
              <Database className="w-4 h-4 mr-2" />
              清理過期會話
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 管理員日誌 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-6 h-6" />
            <span>管理員操作日誌</span>
            <Badge variant="secondary">{adminLogs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暫無管理員操作記錄</p>
              </div>
            ) : (
              adminLogs.map((log) => (
                <div key={log.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{log.action_type}</span>
                      {log.target_table && (
                        <Badge variant="outline" className="text-xs">
                          {log.target_table}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSync;
