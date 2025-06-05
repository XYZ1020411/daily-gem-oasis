
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import LoginPage from '@/components/LoginPage';
import AppLayout from '@/components/AppLayout';
import HomePage from '@/components/HomePage';
import GamesPage from '@/components/GamesPage';
import WalletPage from '@/components/WalletPage';
import ShopPage from '@/components/ShopPage';
import AdminPage from '@/components/AdminPage';
import InfoPage from '@/components/InfoPage';

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
        return <GamesPage />;
      case 'wallet':
        return <WalletPage />;
      case 'shop':
        return <ShopPage />;
      case 'info':
        return <InfoPage />;
      case 'admin':
        return <AdminPage />;
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
