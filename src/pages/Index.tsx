
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

  // 優化載入狀態顯示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-sm">載入中...</p>
        </div>
      </div>
    );
  }

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
