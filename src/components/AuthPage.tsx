
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { Loader2, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TestAccountSwitcher from './TestAccountSwitcher';
import AccountCreator from './AccountCreator';

const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [showAccountCreator, setShowAccountCreator] = useState(false);
  const { signIn, signUp } = useUser();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入用戶名稱和密碼",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // 將用戶名轉換為email格式進行登入
      const email = `${username}@game.local`;
      await signIn(email, password);
      toast({
        title: "登入成功",
        description: "歡迎回來！",
      });
    } catch (error: any) {
      console.error('登入錯誤:', error);
      toast({
        title: "登入失敗",
        description: "請檢查您的用戶名稱和密碼",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入所有必填欄位",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "密碼不一致",
        description: "請確認兩次輸入的密碼相同",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // 將用戶名轉換為email格式進行註冊
      const email = `${username}@game.local`;
      await signUp(email, password, username);
      toast({
        title: "註冊成功",
        description: "帳號已成功創建！",
      });
    } catch (error: any) {
      console.error('註冊錯誤:', error);
      toast({
        title: "註冊失敗", 
        description: error.message || "註冊時發生錯誤，請重試",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showTestAccounts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <TestAccountSwitcher />
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowTestAccounts(false)}
              className="text-white hover:bg-white/20"
            >
              返回登入頁面
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showAccountCreator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AccountCreator />
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowAccountCreator(false)}
              className="text-white hover:bg-white/20"
            >
              返回登入頁面
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">積分會員系統</h1>
          <p className="text-white/80">歡迎使用我們的會員積分平台</p>
        </div>

        <Card className="p-6 backdrop-blur-sm bg-white/95">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">登入</TabsTrigger>
              <TabsTrigger value="signup">註冊</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用戶名稱</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="輸入您的用戶名稱"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="輸入您的密碼"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登入中...
                    </>
                  ) : (
                    '登入'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">用戶名稱</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="輸入用戶名稱"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="輸入您的密碼"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">確認密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="再次輸入密碼"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      註冊中...
                    </>
                  ) : (
                    '註冊'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">特殊帳號</p>
              <Button
                variant="outline"
                onClick={() => setShowAccountCreator(true)}
                className="w-full mb-2"
              >
                創建特殊帳號 (001, VIP8888, 002)
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTestAccounts(true)}
                className="w-full"
              >
                使用測試帳號
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>© 2024 積分會員系統. 版權所有.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
