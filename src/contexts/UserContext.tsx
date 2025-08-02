import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserContextType, User } from './UserContextTypes';
import { useDatabase } from '@/hooks/useDatabase';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserContextType['user']>(null);
  const [profile, setProfile] = useState<UserContextType['profile']>(null);
  const [users, setUsers] = useState<UserContextType['users']>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  const {
    products,
    exchanges,
    announcements,
    giftCodes,
    addProduct,
    updateProduct,
    deleteProduct,
    addExchange,
    updateExchange,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addGiftCode,
    updateGiftCode,
    deleteGiftCode,
    loadProducts,
    loadExchanges,
    loadGiftCodes,
    loadAnnouncements
  } = useDatabase();

  const isLoggedIn = !!(user && (profile || isTestMode));

  // 認證初始化
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsTestMode(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // 檢查 Discord 用戶名是否為特殊管理員
      const userData = await supabase.auth.getUser();
      const discordUsername = userData.data.user?.user_metadata?.user_name || 
                            userData.data.user?.user_metadata?.full_name || 
                            userData.data.user?.user_metadata?.name ||
                            userData.data.user?.user_metadata?.preferred_username;
      
      let role = data.role as 'admin' | 'vip' | 'user';
      if (discordUsername === 'etcsfxrf_20944' && role !== 'admin') {
        // 自動升級為管理員
        const { data: updatedData, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
          .select()
          .single();
        
        if (!updateError) {
          role = 'admin';
        }
      }

      const typedProfile = {
        ...data,
        role
      } as User;

      setProfile(typedProfile);
      return typedProfile;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSpecialLogin = async (username: string, password: string) => {
    const specialAccounts = {
      'vip001': { password: '001password', role: 'vip' as const, display_name: 'VIP會員001', points: 500000, vip_level: 3 },
      'vip8888': { password: 'vip8888password', role: 'vip' as const, display_name: 'VIP會員8888', points: 800000, vip_level: 5 },
      'admin002': { password: '002password', role: 'admin' as const, display_name: '系統管理員', points: 1000000, vip_level: 10 },
      'testuser': { password: 'test123', role: 'user' as const, display_name: '測試用戶', points: 10000, vip_level: 0 },
      'demo': { password: 'demo123', role: 'user' as const, display_name: '演示用戶', points: 50000, vip_level: 1 }
    };

    const account = specialAccounts[username as keyof typeof specialAccounts];
    if (account && account.password === password) {
      const mockUser = {
        id: `special-${username}`,
        email: `${username}@game.local`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockProfile: User = {
        id: mockUser.id,
        username: username,
        display_name: account.display_name,
        email_username: username,
        role: account.role,
        points: account.points,
        vip_level: account.vip_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        check_in_streak: 15,
        last_check_in: new Date().toISOString(),
        join_date: new Date().toISOString()
      };

      setUser(mockUser);
      setProfile(mockProfile);
      setIsTestMode(true);

      toast({
        title: "登入成功",
        description: `歡迎回來，${account.display_name}！`,
      });
      return;
    }

    throw new Error("用戶名稱或密碼錯誤");
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    try {
      const isSpecialAccount = ['vip001', 'vip8888', 'admin002', 'testuser', 'demo'].includes(usernameOrEmail);
      
      if (isSpecialAccount) {
        await handleSpecialLogin(usernameOrEmail, password);
        return;
      }

      const emailFormat = usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@game.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailFormat,
        password: password,
      });

      if (error) {
        if (error.message === 'Email logins are disabled' || error.code === 'email_provider_disabled') {
          await handleSpecialLogin(usernameOrEmail, password);
          return;
        }
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('登入錯誤:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: email.split('@')[0],
            display_name: displayName,
          }
        }
      });

      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('註冊錯誤:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (isTestMode) {
      setUser(null);
      setProfile(null);
      setIsTestMode(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      console.error('登出錯誤:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserContextType['profile']>) => {
    if (!profile) return;

    if (isTestMode) {
      setProfile(prev => prev ? { ...prev, ...updates } : prev);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      const typedProfile = {
        ...data,
        role: data.role as 'admin' | 'vip' | 'user'
      } as User;

      setProfile(typedProfile);
      setUsers(prevUsers => prevUsers.map(u => u.id === profile.id ? { ...u, ...updates } : u));
    } catch (error: any) {
      console.error('更新個人資料錯誤:', error);
    }
  };

  const updateUserById = async (userId: string, updates: Partial<UserContextType['profile']>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
    } catch (error: any) {
      console.error('更新用戶資料錯誤:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error('刪除用戶錯誤:', error);
    }
  };

  const updatePoints = async (amount: number, description: string) => {
    if (!profile) return;

    if (isTestMode) {
      setProfile(prev => prev ? { ...prev, points: (prev.points || 0) + amount } : prev);
      const transaction = {
        id: Date.now().toString(),
        userId: profile.id,
        amount,
        description,
        timestamp: new Date().toISOString(),
        type: amount > 0 ? 'earn' : 'spend'
      };
      setTransactions(prev => [transaction, ...prev]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ points: (profile.points || 0) + amount })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      const typedProfile = { ...data, role: data.role as 'admin' | 'vip' | 'user' } as User;
      setProfile(typedProfile);
      setUsers(prevUsers => prevUsers.map(u => u.id === profile.id ? { ...u, points: (u.points || 0) + amount } : u));

      const transaction = {
        id: Date.now().toString(),
        userId: profile.id,
        amount,
        description,
        timestamp: new Date().toISOString(),
        type: amount > 0 ? 'earn' : 'spend'
      };
      setTransactions(prev => [transaction, ...prev]);
    } catch (error: any) {
      console.error('更新積分錯誤:', error);
    }
  };

  const switchToTestAccount = (accountType: 'vip1' | 'vip2') => {
    const testAccounts = {
      vip1: {
        id: 'test-vip1',
        username: 'vip001',
        display_name: 'VIP會員001',
        email_username: 'vip001',
        role: 'vip' as const,
        points: 500000,
        vip_level: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        check_in_streak: 15,
        last_check_in: new Date().toISOString(),
        join_date: new Date().toISOString()
      },
      vip2: {
        id: 'test-vip2',
        username: 'vip8888',
        display_name: 'VIP會員8888',
        email_username: 'vip8888',
        role: 'vip' as const,
        points: 800000,
        vip_level: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        check_in_streak: 30,
        last_check_in: new Date().toISOString(),
        join_date: new Date().toISOString()
      }
    };

    setProfile(testAccounts[accountType]);
    setUser({ id: testAccounts[accountType].id });
    setIsTestMode(true);
  };

  const checkIn = () => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    if (profile.last_check_in === today) {
      throw new Error("今日已簽到");
    }

    const points = 100 + (profile.vip_level * 50);
    updatePoints(points, '每日簽到獎勵');
    
    const newStreak = (profile.check_in_streak || 0) + 1;
    updateProfile({
      check_in_streak: newStreak,
      last_check_in: today
    });
  };

  const redeemGiftCode = (code: string): boolean => {
    const giftCodes: Record<string, number> = {
      'WELCOME100': 100,
      'VIP500': 500,
      'LUCKY1000': 1000
    };

    if (giftCodes[code]) {
      updatePoints(giftCodes[code], `禮品碼兌換: ${code}`);
      return true;
    }
    return false;
  };

  const createRealAccounts = async () => {
    const accounts = [
      { email: 'vip001@game.local', password: '001password', role: 'vip' },
      { email: 'vip8888@game.local', password: 'vip8888password', role: 'vip' },
      { email: 'admin002@game.local', password: '002password', role: 'admin' }
    ];

    await new Promise(resolve => setTimeout(resolve, 1000));
    return { accounts };
  };

  const value = {
    user,
    profile,
    users,
    isLoading: false,
    isLoggedIn,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUserById,
    deleteUser,
    updatePoints,
    switchToTestAccount,
    isTestMode,
    checkIn,
    transactions,
    redeemGiftCode,
    createRealAccounts,
    products,
    exchanges,
    announcements,
    giftCodes,
    dbLoading: false,
    addProduct,
    updateProduct,
    deleteProduct,
    addExchange,
    updateExchange,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addGiftCode,
    updateGiftCode,
    deleteGiftCode,
    loadProducts,
    loadExchanges,
    loadGiftCodes,
    loadAnnouncements
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
