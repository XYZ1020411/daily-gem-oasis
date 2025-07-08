
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { User, Shield, Crown, Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AccountCreator: React.FC = () => {
  const { createRealAccounts } = useUser();
  const { toast } = useToast();
  const [isCreated, setIsCreated] = useState(false);
  const [accounts, setAccounts] = useState<Array<{email: string, password: string, role: string}>>([]);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [autoCreated, setAutoCreated] = useState(false);

  // 自動創建帳號
  useEffect(() => {
    if (!autoCreated) {
      handleCreateAccounts();
      setAutoCreated(true);
    }
  }, [autoCreated]);

  const handleCreateAccounts = async () => {
    try {
      const result = await createRealAccounts();
      setAccounts(result.accounts);
      
      toast({
        title: "帳號創建成功",
        description: `已成功創建 ${result.accounts.length} 個特殊帳號`,
      });
    } catch (error) {
      console.error('Error creating accounts:', error);
      toast({
        title: "創建失敗",
        description: "創建帳號時發生錯誤，請重試",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
      
      toast({
        title: "已複製",
        description: "帳號資訊已複製到剪貼板",
        duration: 1000
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'vip':
        return <Shield className="w-5 h-5 text-purple-500" />;
      default:
        return <User className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-yellow-500">管理員</Badge>;
      case 'vip':
        return <Badge className="bg-purple-500">VIP用戶</Badge>;
      default:
        return <Badge className="bg-blue-500">普通用戶</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span>特殊帳號資訊</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              以下特殊帳號已成功創建並註冊到 Supabase：
            </p>
            
            <Button 
              onClick={handleCreateAccounts} 
              variant="outline"
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              重新創建帳號
            </Button>
          </div>
        </CardContent>
      </Card>

      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>帳號登入資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                以下是所有帳號的登入資訊，請妥善保存：
              </p>
              
              {accounts.map((account, index) => {
                const displayName = account.email.split('@')[0];
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(account.role)}
                        <span className="font-medium text-lg">{displayName}</span>
                        {getRoleBadge(account.role)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <span className="text-sm font-medium text-gray-700">帳號名稱:</span>
                          <p className="text-lg font-mono">{displayName}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(displayName, `username-${index}`)}
                        >
                          {copiedStates[`username-${index}`] ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <span className="text-sm font-medium text-gray-700">密碼:</span>
                          <p className="text-lg font-mono">{account.password}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(account.password, `password-${index}`)}
                        >
                          {copiedStates[`password-${index}`] ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => copyToClipboard(`帳號: ${displayName}\n密碼: ${account.password}`, `full-${index}`)}
                    >
                      {copiedStates[`full-${index}`] ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      複製完整登入資訊
                    </Button>
                  </div>
                );
              })}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">帳號詳細資訊：</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded">
                      <p className="font-semibold">001 帳號</p>
                      <p>• 類型：VIP用戶</p>
                      <p>• 積分：500,000</p>
                      <p>• VIP等級：3</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="font-semibold">vip8888 帳號</p>
                      <p>• 類型：VIP用戶</p>
                      <p>• 積分：800,000</p>
                      <p>• VIP等級：5</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="font-semibold">002 帳號</p>
                      <p>• 類型：管理員</p>
                      <p>• 積分：1,000,000</p>
                      <p>• 管理權限：完整</p>
                    </div>
                  </div>
                  <div className="mt-4 p-2 bg-yellow-100 rounded">
                    <p className="font-medium text-yellow-800">重要提醒：</p>
                    <p className="text-yellow-700">• 這些是真實的 Supabase 帳號，已註冊到數據庫</p>
                    <p className="text-yellow-700">• 可以在登入頁面直接使用帳號名稱和密碼登入</p>
                    <p className="text-yellow-700">• 所有帳號資料已同步到 Supabase 數據庫</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountCreator;
