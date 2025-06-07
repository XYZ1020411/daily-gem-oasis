
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { UserCheck, Crown } from 'lucide-react';

const TestAccountSwitcher: React.FC = () => {
  const { switchToTestAccount, signOut, isTestMode } = useUser();

  const testAccounts = [
    {
      type: 'vip1' as const,
      label: 'VIP會員 (001)',
      description: 'VIP等級3, 50萬積分',
      icon: Crown,
      color: 'bg-yellow-500'
    },
    {
      type: 'vip2' as const,
      label: 'VIP會員 (vip8888)',
      description: 'VIP等級5, 80萬積分',
      icon: Crown,
      color: 'bg-purple-500'
    }
  ];

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">測試帳號切換</h2>
          <p className="text-muted-foreground">選擇一個測試帳號來體驗不同角色的功能</p>
          <p className="text-sm text-orange-600 mt-2">管理員帳號請使用真實註冊方式登入</p>
        </div>

        <div className="grid gap-4">
          {testAccounts.map((account) => {
            const Icon = account.icon;
            return (
              <Button
                key={account.type}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => switchToTestAccount(account.type)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${account.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{account.label}</div>
                    <div className="text-sm text-muted-foreground">{account.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {isTestMode && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              退出測試模式
            </Button>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground">
          這些是模擬測試帳號，不會影響真實的資料庫資料
        </div>
      </div>
    </Card>
  );
};

export default TestAccountSwitcher;
