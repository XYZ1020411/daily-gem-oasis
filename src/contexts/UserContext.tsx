
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'user' | 'vip' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  points: number;
  vipLevel: number;
  checkInDays: number;
  lastCheckIn: string | null;
  avatar?: string;
  joinDate: string;
}

interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePoints: (amount: number) => void;
  checkIn: () => boolean;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 預設用戶資料
const defaultUsers: Record<string, User> = {
  '001': {
    id: '001',
    username: 'VIP會員001',
    email: 'vip001@example.com',
    role: 'vip',
    points: 5000,
    vipLevel: 3,
    checkInDays: 15,
    lastCheckIn: null,
    avatar: '🌟',
    joinDate: '2024-01-01'
  },
  '002': {
    id: '002',
    username: '系統管理員',
    email: 'admin@example.com',
    role: 'admin',
    points: 99999,
    vipLevel: 5,
    checkInDays: 100,
    lastCheckIn: null,
    avatar: '👑',
    joinDate: '2023-12-01'
  },
  'vip8888': {
    id: 'vip8888',
    username: 'VIP鑽石會員',
    email: 'vip8888@example.com',
    role: 'vip',
    points: 10000,
    vipLevel: 5,
    checkInDays: 30,
    lastCheckIn: null,
    avatar: '💎',
    joinDate: '2024-02-01'
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 從 localStorage 載入用戶資料
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // 簡單的登入驗證
    if (defaultUsers[username]) {
      const userData = defaultUsers[username];
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }
    
    // 普通用戶註冊/登入
    if (username && password) {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email: `${username}@example.com`,
        role: 'user',
        points: 100,
        vipLevel: 0,
        checkInDays: 0,
        lastCheckIn: null,
        avatar: '👤',
        joinDate: new Date().toISOString().split('T')[0]
      };
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const updatePoints = (amount: number) => {
    if (user) {
      const newPoints = Math.max(0, user.points + amount);
      updateUser({ points: newPoints });
    }
  };

  const checkIn = (): boolean => {
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCheckIn === today) return false;
    
    const baseReward = user.role === 'vip' ? 20 : 10;
    const bonusReward = Math.floor(user.checkInDays / 7) * 5;
    const totalReward = baseReward + bonusReward;
    
    updateUser({
      checkInDays: user.checkInDays + 1,
      lastCheckIn: today,
      points: user.points + totalReward
    });
    
    return true;
  };

  const value: UserContextType = {
    user,
    login,
    logout,
    updateUser,
    updatePoints,
    checkIn,
    isLoggedIn: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
