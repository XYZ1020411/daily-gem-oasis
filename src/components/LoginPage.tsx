
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Crown, Star, Shield } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "登入成功！",
          description: "歡迎回到積分會員系統",
        });
      } else {
        toast({
          title: "登入失敗",
          description: "請檢查您的帳號密碼",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "登入錯誤",
        description: "系統發生錯誤，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (account: string) => {
    setIsLoading(true);
    const success = await login(account, 'password');
    if (success) {
      toast({
        title: "快速登入成功！",
        description: `歡迎 ${account}`,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 標題區域 */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl animate-float">
            <Crown className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">積分會員系統</h1>
          <p className="text-white/80">歡迎登入享受專屬服務</p>
        </div>

        {/* 登入表單 */}
        <Card className="glass-effect border-white/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">會員登入</CardTitle>
            <CardDescription className="text-center">
              請輸入您的帳號密碼登入系統
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">帳號</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="請輸入帳號"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                disabled={isLoading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isLoading ? '登入中...' : '登入'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 快速登入 */}
        <Card className="glass-effect border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-lg">快速登入</CardTitle>
            <CardDescription className="text-center">
              使用特殊帳戶快速體驗系統功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => quickLogin('002')}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              disabled={isLoading}
            >
              <Shield className="w-4 h-4 mr-2" />
              管理員 (002)
            </Button>
            <Button
              onClick={() => quickLogin('001')}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              disabled={isLoading}
            >
              <Star className="w-4 h-4 mr-2" />
              VIP會員 (001)
            </Button>
            <Button
              onClick={() => quickLogin('vip8888')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isLoading}
            >
              <Crown className="w-4 h-4 mr-2" />
              VIP鑽石會員 (vip8888)
            </Button>
          </CardContent>
        </Card>

        {/* 註冊提示 */}
        <Card className="glass-effect border-white/20 shadow-2xl">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-white/80 mb-4">
              還沒有帳號？輸入任意帳號密碼即可註冊新會員
            </p>
            <div className="flex items-center justify-center">
              <UserPlus className="w-4 h-4 mr-2 text-white/60" />
              <span className="text-sm text-white/60">自動註冊為普通會員</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
