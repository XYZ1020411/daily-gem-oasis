
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Menu, X, Home, BookOpen, Wallet, ShoppingBag, Settings, LogOut, MessageSquare, Info, Wand2 } from 'lucide-react';
import CustomerServiceScript from './CustomerServiceScript';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, profile, signOut } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: '首頁', icon: Home },
    { id: 'novels', label: '每日小說', icon: BookOpen },
    { id: 'wallet', label: '我的錢包', icon: Wallet },
    { id: 'shop', label: '積分商城', icon: ShoppingBag },
    { id: 'info', label: '資訊服務', icon: Info },
    { id: 'ai-web', label: 'AI 網頁生成', icon: Wand2 },
    ...(profile?.role === 'admin' ? [{ id: 'admin', label: '管理後台', icon: Settings }] : [])
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 載入客服聊天工具 */}
      <CustomerServiceScript />
      
      {/* 頂部導航 */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                積分會員系統
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">歡迎回來,</span>
              <span className="font-medium">{profile?.username || profile?.display_name || '用戶'}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                profile?.role === 'admin' ? 'bg-red-100 text-red-700' :
                profile?.role === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {profile?.role === 'admin' ? '管理員' : profile?.role === 'vip' ? 'VIP會員' : '普通會員'}
              </span>
            </div>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={signOut} className="text-red-600">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 側邊欄 */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16 md:pt-0`}>
          <div className="flex flex-col h-full">
            <div className="flex-1 py-6">
              <nav className="space-y-2 px-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        onPageChange(item.id);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>

            {/* 用戶資訊卡片 */}
            <div className="p-4 border-t">
              <Card className="p-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {(profile?.username || profile?.display_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{profile?.username || profile?.display_name || '用戶'}</p>
                    <p className="text-sm text-muted-foreground">積分: {profile?.points?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </aside>

        {/* 主內容區域 */}
        <main className="flex-1 p-6 md:ml-0">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* 移動端遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 客服聊天按鈕 */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          onClick={() => {
            // 觸發客服聊天窗口
            console.log('打開客服聊天');
          }}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          客服聊天
        </Button>
      </div>
    </div>
  );
};

export default AppLayout;
