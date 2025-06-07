import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
  points?: number;
  vip_level?: number;
  created_at?: string;
  updated_at?: string;
  last_check_in?: string;
  check_in_streak?: number;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  updatePoints: (amount: number, reason: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  checkIn: () => boolean;
  
  // Mock data for components that were using static data
  users: any[];
  products: any[];
  exchanges: any[];
  announcements: any[];
  transactions: any[];
  
  // Mock functions for admin features
  updateUserById: (id: string, data: any) => void;
  deleteUser: (id: string) => void;
  addProduct: (product: any) => void;
  updateProduct: (id: string, product: any) => void;
  deleteProduct: (id: string) => void;
  updateExchange: (id: string, data: any) => void;
  addAnnouncement: (announcement: any) => void;
  updateAnnouncement: (id: string, announcement: any) => void;
  deleteAnnouncement: (id: string) => void;
  addExchange: (exchange: any) => void;
  redeemGiftCode: (code: string) => boolean;
  
  // 測試帳號功能
  switchToTestAccount: (accountType: 'vip1' | 'vip2') => void;
  isTestMode: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Mock data - these would normally come from Supabase
  const [users] = useState([
    {
      id: 'admin-real-001',
      username: 'admin',
      email: 'admin@system.com',
      role: 'admin',
      points: 1000000,
      vip_level: 0,
      status: 'active',
      created_at: new Date().toISOString()
    }
  ]);
  const [products] = useState([]);
  const [exchanges] = useState([]);
  const [announcements] = useState([]);
  const [transactions] = useState([]);

  // 測試帳號資料 (移除管理員帳號，只保留VIP測試帳號)
  const testAccounts = {
    vip1: {
      id: 'test-vip-001',
      username: 'vip001',
      display_name: 'VIP會員 (001)',
      role: 'vip',
      points: 500000,
      vip_level: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_check_in: null,
      check_in_streak: 0
    },
    vip2: {
      id: 'test-vip-8888',
      username: 'vip8888',
      display_name: 'VIP會員 (vip8888)',
      role: 'vip',
      points: 800000,
      vip_level: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_check_in: null,
      check_in_streak: 0
    }
  };

  // 切換到測試帳號 (只支援VIP帳號)
  const switchToTestAccount = (accountType: 'vip1' | 'vip2') => {
    const testProfile = testAccounts[accountType];
    setProfile(testProfile);
    setIsTestMode(true);
    // 創建模擬用戶對象
    setUser({
      id: testProfile.id,
      email: `${testProfile.username}@test.com`,
      created_at: testProfile.created_at,
      updated_at: testProfile.updated_at,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      confirmation_sent_at: testProfile.created_at,
      confirmed_at: testProfile.created_at,
      email_confirmed_at: testProfile.created_at,
      last_sign_in_at: new Date().toISOString(),
      role: 'authenticated',
      phone: '',
      phone_confirmed_at: null,
      recovery_sent_at: null,
      email_change: '',
      email_change_sent_at: null,
      email_change_confirm_status: 0,
      new_email: null,
      invited_at: null,
      action_link: null,
      new_phone: null,
      phone_change: '',
      phone_change_sent_at: null,
      phone_change_token: '',
      identities: [],
      factors: [],
      is_anonymous: false
    } as User);
    setSession({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      expires_at: Date.now() / 1000 + 3600,
      token_type: 'bearer',
      user: user!
    } as Session);
  };

  // 載入用戶資料
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // 如果用戶資料不存在，創建新的資料
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: user?.email?.split('@')[0] || 'user',
              display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User',
              role: 'user',
              points: 1000000,
              vip_level: 0
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  // 刷新用戶資料
  const refreshProfile = async () => {
    if (user && !isTestMode) {
      await loadUserProfile(user.id);
    }
  };

  // 簽到功能
  const checkIn = () => {
    if (!profile) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (profile.last_check_in === today) {
      return false; // 今天已經簽到過了
    }
    
    // 這裡應該調用 Supabase 更新簽到狀態
    // 暫時返回 true
    return true;
  };

  // 更新積分
  const updatePoints = async (amount: number, reason: string) => {
    if (!user || !profile) return;

    if (isTestMode) {
      // 測試模式下直接更新本地狀態
      setProfile(prev => prev ? { ...prev, points: (prev.points || 0) + amount } : null);
      return;
    }

    try {
      // 更新用戶積分
      const newPoints = (profile.points || 0) + amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 記錄積分交易
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          transaction_type: amount > 0 ? 'earn' : 'spend',
          description: reason
        });

      if (transactionError) throw transactionError;

      // 更新本地狀態
      setProfile(prev => prev ? { ...prev, points: newPoints } : null);
    } catch (error) {
      console.error('更新積分失敗:', error);
    }
  };

  // 登出
  const signOut = async () => {
    if (isTestMode) {
      // 測試模式下直接清除狀態
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsTestMode(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  // Mock admin functions
  const updateUserById = (id: string, data: any) => {
    console.log('updateUserById:', id, data);
  };

  const deleteUser = (id: string) => {
    console.log('deleteUser:', id);
  };

  const addProduct = (product: any) => {
    console.log('addProduct:', product);
  };

  const updateProduct = (id: string, product: any) => {
    console.log('updateProduct:', id, product);
  };

  const deleteProduct = (id: string) => {
    console.log('deleteProduct:', id);
  };

  const updateExchange = (id: string, data: any) => {
    console.log('updateExchange:', id, data);
  };

  const addAnnouncement = (announcement: any) => {
    console.log('addAnnouncement:', announcement);
  };

  const updateAnnouncement = (id: string, announcement: any) => {
    console.log('updateAnnouncement:', id, announcement);
  };

  const deleteAnnouncement = (id: string) => {
    console.log('deleteAnnouncement:', id);
  };

  const addExchange = (exchange: any) => {
    console.log('addExchange:', exchange);
  };

  const redeemGiftCode = (code: string) => {
    console.log('redeemGiftCode:', code);
    // Mock implementation
    return ['WELCOME100', 'VIP500', 'LUCKY1000'].includes(code);
  };

  // 設置認證狀態監聽
  useEffect(() => {
    let mounted = true;

    if (isTestMode) {
      setIsLoading(false);
      return;
    }

    // 設置認證狀態監聽器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('認證狀態變化:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // 用戶已登入，載入資料
          await loadUserProfile(session.user.id);
        } else {
          // 用戶已登出，清除資料
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // 初始化時檢查現有會話
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session) {
        setSession(session);
        setUser(session.user);
        loadUserProfile(session.user.id).then(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isTestMode]);

  const value: UserContextType = {
    user,
    profile,
    session,
    isLoggedIn: !!user,
    isLoading,
    updatePoints,
    refreshProfile,
    signOut,
    checkIn,
    users,
    products,
    exchanges,
    announcements,
    transactions,
    updateUserById,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    updateExchange,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addExchange,
    redeemGiftCode,
    switchToTestAccount,
    isTestMode
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
