
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import AuthPage from '@/components/AuthPage';
import AppLayout from '@/components/AppLayout';
import HomePage from '@/components/HomePage';
import NovelPage from '@/components/NovelPage';
import WalletPage from '@/components/WalletPage';
import ShopPage from '@/components/ShopPage';
import AdminPage from '@/components/AdminPage';
import InfoPage from '@/components/InfoPage';
import AIWebBuilder from '@/components/AIWebBuilder';

const Index = () => {
  const { isLoggedIn, isLoading } = useUser();
  const [currentPage, setCurrentPage] = useState('home');

  console.log('Index component - isLoading:', isLoading, 'isLoggedIn:', isLoggedIn);

  // 顯示載入狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果未登入，顯示認證頁面
  if (!isLoggedIn) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'novels':
        return <NovelPage />;
      case 'wallet':
        return <WalletPage />;
      case 'shop':
        return <ShopPage />;
      case 'info':
        return <InfoPage />;
      case 'admin':
        return <AdminPage />;
      case 'ai-web':
        return <AIWebBuilder />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
};

export default Index;
