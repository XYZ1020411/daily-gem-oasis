
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
      // 將用戶名稱轉換為電子郵件格式進行登入
      const emailFormat = username.includes('@') ? username : `${username}@game.local`;
      await signIn(emailFormat, password);
    } catch (error: any) {
      console.error('登入錯誤:', error);
      
      let errorMessage = "請檢查您的用戶名稱和密碼";
      
      if (error.message === 'Email logins are disabled' || error.code === 'email_provider_disabled') {
        errorMessage = "系統暫時使用離線模式，請使用預設帳號登入";
      } else if (error.message === '電子郵件或密碼錯誤') {
        errorMessage = "用戶名稱或密碼錯誤，請檢查後重試";
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
    if (!username || !email || !password || !confirmPassword || !displayName) {
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
      await signUp(email, password, displayName);
      
      // 發送歡迎電子郵件
      try {
        await sendWelcomeEmail(email, displayName);
        toast({
          title: "註冊成功",
          description: "歡迎郵件已發送至您的電子郵件地址",
        });
      } catch (emailError) {
        console.error('發送歡迎郵件失敗:', emailError);
        toast({
          title: "註冊成功",
          description: "註冊完成，但歡迎郵件發送失敗",
          variant: "destructive"
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">或使用</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4] border-[#5865F2]"
                onClick={handleDiscordLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                使用 Discord 登入
              </Button>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">系統提示：</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="mb-2">目前使用離線模式，請使用以下預設帳號：</div>
                  <div>• 用戶名稱: <strong>vip001</strong> 密碼: <strong>001password</strong> (VIP用戶)</div>
                  <div>• 用戶名稱: <strong>vip8888</strong> 密碼: <strong>vip8888password</strong> (VIP用戶)</div>
                  <div>• 用戶名稱: <strong>admin002</strong> 密碼: <strong>002password</strong> (管理員)</div>
                </div>
              </div>
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">或使用</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4] border-[#5865F2]"
                onClick={handleDiscordLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                使用 Discord 註冊
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">特殊帳號管理</p>
              <Button
                variant="outline"
                onClick={() => setShowAccountCreator(true)}
                className="w-full mb-2"
              >
                創建特殊帳號到數據庫
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
