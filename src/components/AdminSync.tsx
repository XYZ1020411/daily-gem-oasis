
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSync } from '@/hooks/useSync';
import { useUser } from '@/contexts/UserContext';
import { RefreshCw, Download, Upload, Users, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSync: React.FC = () => {
  const { profile } = useUser();
  const { syncData, getAllUserData, syncStatus } = useSync();
  const { toast } = useToast();
  const [allUserData, setAllUserData] = useState<any[]>([]);
  const [syncStats, setSyncStats] = useState<any>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadAllData();
    }
  }, [profile]);

  const loadAllData = async () => {
    try {
      const data = await getAllUserData();
      setAllUserData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "載入失敗",
        description: "無法載入同步資料",
        variant: "destructive"
      });
    }
  };

  const handleForceSync = async () => {
    try {
      await syncData('admin_sync', {
        timestamp: new Date().toISOString(),
        action: 'force_sync'
      });
      
      toast({
        title: "同步成功",
        description: "管理員強制同步已完成",
      });
      
      loadAllData();
    } catch (error) {
      toast({
        title: "同步失敗",
        description: "強制同步時發生錯誤",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(allUserData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sync_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="p-4">
        <Card className="p-6 text-center">
          <p className="text-gray-600">此功能僅限管理員使用</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">網路同步管理</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">同步狀態</p>
              <p className="font-semibold capitalize">{syncStatus}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">用戶資料</p>
              <p className="font-semibold">{allUserData.length} 筆記錄</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">資料類型</p>
              <p className="font-semibold">{new Set(allUserData.map(d => d.data_type)).size} 種</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">同步操作</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleForceSync}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>強制同步</span>
          </Button>

          <Button
            onClick={loadAllData}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>重新載入</span>
          </Button>

          <Button
            onClick={handleExportData}
            variant="outline"
            disabled={allUserData.length === 0}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>匯出資料</span>
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">同步資料</h3>
        <div className="max-h-96 overflow-y-auto">
          {allUserData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暫無同步資料</p>
          ) : (
            <div className="space-y-2">
              {allUserData.map((item) => (
                <div key={item.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.data_type}</p>
                      <p className="text-sm text-gray-600">
                        版本: {item.sync_version} | 
                        更新時間: {new Date(item.last_modified).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminSync;
