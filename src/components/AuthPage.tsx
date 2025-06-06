
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username || email.split('@')[0],
            display_name: username || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast({
          title: "確認信箱",
          description: "請檢查您的信箱並點擊確認連結完成註冊",
        });
      } else {
        toast({
          title: "註冊成功！",
          description: "歡迎加入雲端遊戲系統",
        });
      }
    } catch (error: any) {
      console.error('註冊錯誤:', error);
      toast({
        title: "註冊失敗",
        description: error.message || "註冊過程中發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "登入成功！",
        description: "歡迎回到雲端遊戲系統",
      });
    } catch (error: any) {
      console.error('登入錯誤:', error);
      toast({
        title: "登入失敗",
        description: error.message || "請檢查您的帳號密碼",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickSignIn = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    toast({
      title: "測試帳號已填入",
      description: "點擊登入按鈕即可使用測試帳號",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 標題區域 */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl animate-float">
            <UserPlus className="w-10 h-10 text-purple-500" />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">雲端遊戲系統</h1>
          <p className="text-white/80">登入或註冊享受雲端遊戲體驗</p>
        </div>

        {/* 認證表單 */}
        <Card className="glass-effect border-white/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">帳戶認證</CardTitle>
            <CardDescription className="text-center">
              使用 Supabase 雲端認證系統
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">登入</TabsTrigger>
                <TabsTrigger value="signup">註冊</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>電子信箱</span>
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="請輸入電子信箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder-white/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>密碼</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="請輸入密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">用戶名稱 (選填)</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="請輸入用戶名稱"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>電子信箱</span>
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="請輸入電子信箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder-white/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>密碼</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="請輸入密碼 (至少6位)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" 
                    disabled={isLoading}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isLoading ? '註冊中...' : '註冊'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 快速測試 */}
        <Card className="glass-effect border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-lg">快速測試</CardTitle>
            <CardDescription className="text-center">
              使用測試帳號快速體驗系統
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => quickSignIn('admin@test.com', 'admin123')}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              disabled={isLoading}
            >
              管理員測試帳號
            </Button>
            <Button
              onClick={() => quickSignIn('user@test.com', 'user123')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              一般用戶測試帳號
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
