import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import HomePage from './HomePage';
import ShopPage from './ShopPage';
import WalletPage from './WalletPage';
import AdminPage from './AdminPage';
import AuthPage from './AuthPage';


const AppLayout: React.FC = () => {
  const { isLoggedIn } = useUser();
  const [currentPage, setCurrentPage] = useState('home');

  // 如果未登入，顯示登入頁面
  if (!isLoggedIn) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'shop':
        return <ShopPage />;
      case 'wallet':
        return <WalletPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <SidebarProvider>
      {/* 頂部導航欄 */}
      <header className="h-16 flex items-center justify-between border-b bg-background px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-bold">積分會員系統</h1>
        </div>
        
      </header>

      <div className="flex min-h-screen w-full pt-16">
        <AppSidebar onPageChange={setCurrentPage} currentPage={currentPage} />
        
        <main className="flex-1 p-6 bg-gray-50/50">
          {renderPage()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;