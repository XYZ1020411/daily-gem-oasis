
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import LoginPage from '@/components/LoginPage';
import AppLayout from '@/components/AppLayout';
import HomePage from '@/components/HomePage';

const Index = () => {
  const { isLoggedIn } = useUser();
  const [currentPage, setCurrentPage] = useState('home');

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'games':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">遊戲娛樂</h2>
            <p className="text-muted-foreground">遊戲功能開發中...</p>
          </div>
        );
      case 'wallet':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">積分錢包</h2>
            <p className="text-muted-foreground">錢包功能開發中...</p>
          </div>
        );
      case 'shop':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">積分商城</h2>
            <p className="text-muted-foreground">商城功能開發中...</p>
          </div>
        );
      case 'admin':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">管理後台</h2>
            <p className="text-muted-foreground">管理功能開發中...</p>
          </div>
        );
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
