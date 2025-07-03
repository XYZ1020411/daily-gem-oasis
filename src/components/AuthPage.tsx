
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { Loader2, User, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TestAccountSwitcher from './TestAccountSwitcher';
import AccountCreator from './AccountCreator';
import { supabase } from '@/integrations/supabase/client';
import { useEmailService } from '@/hooks/useEmailService';

const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [showAccountCreator, setShowAccountCreator] = useState(false);
  const { signIn, signUp } = useUser();
  const { toast } = useToast();
  const { sendWelcomeEmail } = useEmailService();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入電子郵件和密碼",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "登入成功",
        description: "歡迎回來！",
      });
    } catch (error: any) {
      console.error('登入錯誤:', error);
      
      let errorMessage = "請檢查您的電子郵件和密碼";
      
      if (error.message === 'Invalid login credentials') {
        errorMessage = "電子郵件或密碼錯誤，請檢查後重試";
      } else if (error.message === 'Email not confirmed') {
        errorMessage = "請先確認您的電子郵件地址";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "登入失敗",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !displayName) {
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

    if (password.length < 6) {
      toast({
        title: "密碼太短",
        description: "密碼長度至少需要6個字符",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name: displayName,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user && !data?.user?.email_confirmed_at) {
        // 顯示驗證碼通知
        if (Notification.permission === 'granted') {
          new Notification('註冊成功', {
            body: '請檢查您的電子郵件並點擊確認連結完成註冊',
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('註冊成功', {
                body: '請檢查您的電子郵件並點擊確認連結完成註冊',
                icon: '/favicon.ico'
              });
            }
          });
        }
        
        toast({
          title: "註冊成功",
          description: "請檢查您的電子郵件並點擊確認連結完成註冊",
        });
      }
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

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Discord登入錯誤:', error);
      toast({
        title: "Discord登入失敗",
        description: error.message || "Discord登入時發生錯誤，請重試",
        variant: "destructive"
      });
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
                  <Label htmlFor="signin-email">電子郵件</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="輸入您的電子郵件"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
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
                  <Label htmlFor="signup-email">電子郵件</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="輸入電子郵件"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name">顯示名稱</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="display-name"
                      type="text"
                      placeholder="輸入顯示名稱"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
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
                      placeholder="輸入您的密碼 (至少6個字符)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
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

        </Card>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>© 2024 積分會員系統. 版權所有.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
