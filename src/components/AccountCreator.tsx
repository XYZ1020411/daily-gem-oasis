
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { User, Shield, Crown, Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AccountCreator: React.FC = () => {
  const { createRealAccounts } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Array<{email: string, password: string, role: string}>>([]);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  const handleCreateAccounts = async () => {
    setLoading(true);
    try {
      const result = await createRealAccounts();
      setAccounts(result.accounts);
      
      toast({
        title: "帳號創建成功",
        description: `已成功創建 ${result.accounts.length} 個真實帳號`,
      });
    } catch (error) {
      console.error('Error creating accounts:', error);
      toast({
        title: "創建失敗",
        description: "創建帳號時發生錯誤，請重試",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
            <span>真實帳號創建器</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              點擊下方按鈕為 001、vip8888 和管理員創建真實的 Supabase 帳號。
              這些帳號將可以用於登入系統並使用完整功能。
            </p>
            
            <Button 
              onClick={handleCreateAccounts} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  創建帳號中...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  創建真實帳號
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>帳號資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                以下是已創建的帳號資訊，請妥善保存：
              </p>
              
              {accounts.map((account, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(account.role)}
                      <span className="font-medium">{account.email.split('@')[0]}</span>
                      {getRoleBadge(account.role)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        <strong>帳號:</strong> {account.email}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(account.email, `email-${index}`)}
                      >
                        {copiedStates[`email-${index}`] ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        <strong>密碼:</strong> {account.password}
                      </span>
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
                    onClick={() => copyToClipboard(`帳號: ${account.email}\n密碼: ${account.password}`, `full-${index}`)}
                  >
                    {copiedStates[`full-${index}`] ? (
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    複製完整帳號資訊
                  </Button>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">使用說明：</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 這些是真實的 Supabase 帳號，可以用於登入系統</li>
                  <li>• 001 帳號：普通用戶，積分 1,500</li>
                  <li>• vip8888 帳號：VIP用戶，積分 800,000，VIP等級 5</li>
                  <li>• 002 帳號：管理員，積分 1,000,000，擁有管理權限</li>
                  <li>• 可以在認證頁面使用這些帳號登入</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountCreator;
