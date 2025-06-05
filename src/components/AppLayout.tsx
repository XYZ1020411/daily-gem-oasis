
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Gamepad2, 
  Wallet, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  User,
  Crown,
  Shield
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    { id: 'home', label: '首頁', icon: Home },
    { id: 'games', label: '遊戲', icon: Gamepad2 },
    { id: 'wallet', label: '錢包', icon: Wallet },
    { id: 'shop', label: '商城', icon: ShoppingBag },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: '管理', icon: Settings }] : []),
  ];

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <Shield className="w-5 h-5 text-red-500" />;
      case 'vip': return <Crown className="w-5 h-5 text-yellow-500" />;
      default: return <User className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin': return 'bg-red-500';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 頂部導航欄 */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                積分會員系統
              </h1>
            </div>

            {/* 用戶信息 */}
            <div className="flex items-center space-x-4">
              {/* 主題切換 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full p-2"
              >
                {theme === 'light' ? 
                  <Moon className="w-5 h-5" /> : 
                  <Sun className="w-5 h-5" />
                }
              </Button>

              {/* 用戶資訊 */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon()}
                    <span className="text-sm font-medium">{user?.username}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">積分: {user?.points}</span>
                    <div className={`w-2 h-2 rounded-full ${getRoleBadge()}`}></div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* 側邊導航 */}
        <aside className="w-64 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* 主要內容區域 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
