
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  points?: number;
  vip_level?: number;
  role?: string;
  check_in_streak?: number;
  last_check_in?: string;
  created_at?: string;
}

interface MockUser {
  id: string;
  username: string;
  email: string;
  points: number;
  role: 'user' | 'vip' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
}

interface Exchange {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'checkin' | 'game' | 'gift';
  description: string;
  timestamp: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  isTestMode: boolean;
  users: MockUser[];
  products: Product[];
  exchanges: Exchange[];
  transactions: Transaction[];
  announcements: Announcement[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePoints: (amount: number, description?: string) => Promise<void>;
  switchToVipAccount: () => Promise<void>;
  switchToTestAccount: (type: 'vip1' | 'vip2') => Promise<void>;
  checkIn: () => boolean;
  redeemGiftCode: (code: string) => boolean;
  updateUserById: (userId: string, updates: Partial<MockUser>) => void;
  deleteUser: (userId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addExchange: (exchange: Omit<Exchange, 'id' | 'requestDate'>) => void;
  updateExchange: (exchangeId: string, updates: Partial<Exchange>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (announcementId: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (announcementId: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);

  // Mock data for admin functionality
  const [users, setUsers] = useState<MockUser[]>([
    { id: '1', username: 'user001', email: 'user001@test.com', points: 1500, role: 'user', status: 'active' },
    { id: '2', username: 'vip001', email: 'vip001@test.com', points: 5000, role: 'vip', status: 'active' },
    { id: '3', username: 'admin002', email: 'admin002@test.com', points: 10000, role: 'admin', status: 'active' },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'iPhone 15', description: '最新款 iPhone', price: 50000, category: '電子產品', stock: 10, isActive: true },
    { id: '2', name: '星巴克咖啡券', description: '價值 200 元', price: 180, category: '餐飲券', stock: 50, isActive: true },
    { id: '3', name: '購物金 500', description: '通用購物金', price: 450, category: '購物券', stock: 100, isActive: true },
  ]);

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: '系統維護通知',
      content: '系統將於明日凌晨進行維護',
      type: 'info',
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      isActive: true
    }
  ]);

  // 檢查用戶認證狀態
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchProfile(user.id);
      }
      setLoading(false);
    };

    getUser();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsTestMode(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setIsTestMode(false);
  };

  const updatePoints = async (amount: number, description?: string) => {
    if (!user || !profile) return;

    try {
      const newPoints = (profile.points || 0) + amount;
      
      // 更新用戶積分
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 記錄積分交易
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: amount > 0 ? 'earned' : 'spent',
          description: description || '積分變動',
        });

      if (transactionError) throw transactionError;

      // 更新本地狀態
      setProfile(prev => prev ? { ...prev, points: newPoints } : null);
      
      // 添加到本地交易記錄
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        userId: user.id,
        amount,
        type: amount > 0 ? 'earn' : 'spend',
        description: description || '積分變動',
        timestamp: new Date().toISOString()
      };
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Error updating points:', error);
      throw error;
    }
  };

  // VIP測試帳號切換
  const switchToVipAccount = async () => {
    try {
      // 先登出當前用戶
      await supabase.auth.signOut();
      
      // 登入VIP測試帳號
      const { error } = await supabase.auth.signInWithPassword({
        email: 'vip@test.com',
        password: 'vip123456',
      });

      if (error) {
        throw new Error('VIP測試帳號登入失敗');
      }
    } catch (error) {
      console.error('Error switching to VIP account:', error);
      throw error;
    }
  };

  const switchToTestAccount = async (type: 'vip1' | 'vip2') => {
    try {
      await supabase.auth.signOut();
      setIsTestMode(true);
      
      // 模擬測試帳號登入
      const testAccounts = {
        vip1: {
          id: 'test-vip1',
          email: 'vip1@test.com',
          username: '001',
          points: 500000,
          role: 'vip',
          vip_level: 3
        },
        vip2: {
          id: 'test-vip2',
          email: 'vip2@test.com',
          username: 'vip8888',
          points: 800000,
          role: 'vip',
          vip_level: 5
        }
      };

      const testAccount = testAccounts[type];
      
      // 模擬用戶和 profile
      setUser({
        id: testAccount.id,
        email: testAccount.email,
        role: testAccount.role
      } as User);
      
      setProfile({
        id: testAccount.id,
        username: testAccount.username,
        display_name: testAccount.username,
        points: testAccount.points,
        role: testAccount.role,
        vip_level: testAccount.vip_level,
        check_in_streak: 7,
        last_check_in: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error switching to test account:', error);
      throw error;
    }
  };

  const checkIn = () => {
    if (!profile || !user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (profile.last_check_in === today) {
      return false; // 今日已簽到
    }
    
    const reward = profile.role === 'vip' ? 20 : 10;
    const newStreak = (profile.check_in_streak || 0) + 1;
    
    // 更新 profile
    setProfile(prev => prev ? {
      ...prev,
      points: (prev.points || 0) + reward,
      check_in_streak: newStreak,
      last_check_in: today
    } : null);
    
    // 添加交易記錄
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      amount: reward,
      type: 'checkin',
      description: '每日簽到獎勵',
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    return true;
  };

  const redeemGiftCode = (code: string) => {
    if (!user || !profile) return false;
    
    const giftCodes: Record<string, number> = {
      'WELCOME100': 100,
      'VIP500': 500,
      'LUCKY1000': 1000
    };
    
    const points = giftCodes[code.toUpperCase()];
    if (!points) return false;
    
    // 更新積分
    setProfile(prev => prev ? {
      ...prev,
      points: (prev.points || 0) + points
    } : null);
    
    // 添加交易記錄
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      amount: points,
      type: 'gift',
      description: `禮品碼兌換: ${code}`,
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    return true;
  };

  // Admin functions
  const updateUserById = (userId: string, updates: Partial<MockUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addExchange = (exchange: Omit<Exchange, 'id' | 'requestDate'>) => {
    const newExchange: Exchange = {
      ...exchange,
      id: Date.now().toString(),
      requestDate: new Date().toISOString()
    };
    setExchanges(prev => [...prev, newExchange]);
  };

  const updateExchange = (exchangeId: string, updates: Partial<Exchange>) => {
    setExchanges(prev => prev.map(e => e.id === exchangeId ? { ...e, ...updates } : e));
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAnnouncements(prev => [...prev, newAnnouncement]);
  };

  const updateAnnouncement = (announcementId: string, updates: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, ...updates } : a));
  };

  const deleteAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };

  const value: UserContextType = {
    user,
    profile,
    loading,
    isLoggedIn: !!user,
    isLoading: loading,
    isTestMode,
    users,
    products,
    exchanges,
    transactions,
    announcements,
    signIn,
    signUp,
    signOut,
    updatePoints,
    switchToVipAccount,
    switchToTestAccount,
    checkIn,
    redeemGiftCode,
    updateUserById,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    addExchange,
    updateExchange,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
