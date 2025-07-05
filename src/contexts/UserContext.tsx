
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
  const [isLoading, setIsLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  // 使用新的數據庫 hook
  const {
    products,
    exchanges,
    announcements,
    giftCodes,
    loading: dbLoading,
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
    loadData
  } = useDatabase();

  // 簡化 isLoggedIn 計算
  const isLoggedIn = !!(user && (profile || isTestMode));

  useEffect(() => {
    let mounted = true;
    
    // 優化認證初始化
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // 簡化認證狀態監聽
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsTestMode(false);
      }
      
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 簡化用戶列表載入
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        
        const typedUsers = (data || []).map(user => ({
          ...user,
          role: user.role as 'admin' | 'vip' | 'user'
        })) as User[];

        setUsers(typedUsers);
      } catch (error: any) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const typedProfile = {
        ...data,
        role: data.role as 'admin' | 'vip' | 'user'
      } as User;

      setProfile(typedProfile);
      return typedProfile;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "載入個人資料失敗",
        description: error.message || "無法載入您的個人資料",
        variant: "destructive"
      });
    }
  };

  // 優化特殊登錄處理
  const handleSpecialLogin = async (username: string, password: string) => {
    const specialAccounts = {
      'vip001': { password: '001password', role: 'vip' as const, display_name: 'VIP會員001', points: 500000, vip_level: 3 },
      'vip8888': { password: 'vip8888password', role: 'vip' as const, display_name: 'VIP會員8888', points: 800000, vip_level: 5 },
      'admin002': { password: '002password', role: 'admin' as const, display_name: '系統管理員', points: 1000000, vip_level: 10 }
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

  // 簡化登錄邏輯
  const signIn = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    
    try {
      const isSpecialAccount = ['vip001', 'vip8888', 'admin002'].includes(usernameOrEmail);
      
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
      setIsLoading(false);
      throw error;
    }
  };

  // 簡化註冊邏輯
  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // 簡化登出邏輯
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

  // 簡化更新個人資料
  const updateProfile = async (updates: Partial<UserContextType['profile']>) => {
    if (!profile) {
      toast({
        title: "錯誤",
        description: "找不到用戶個人資料",
        variant: "destructive"
      });
      return;
    }

    if (isTestMode) {
      setProfile(prev => prev ? { ...prev, ...updates } : prev);
      toast({
        title: "更新成功",
        description: "您的個人資料已成功更新",
      });
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

      toast({
        title: "更新成功",
        description: "您的個人資料已成功更新",
      });
    } catch (error: any) {
      console.error('更新個人資料錯誤:', error);
      toast({
        title: "更新失敗",
        description: error.message || "更新個人資料時發生錯誤，請重試",
        variant: "destructive"
      });
    }
  };

  // 其他必要方法的簡化版本
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
      toast({ title: "更新成功", description: "用戶資料已成功更新" });
    } catch (error: any) {
      console.error('更新用戶資料錯誤:', error);
      toast({
        title: "更新失敗",
        description: error.message || "更新用戶資料時發生錯誤，請重試",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      toast({ title: "刪除成功", description: "用戶已成功刪除" });
    } catch (error: any) {
      console.error('刪除用戶錯誤:', error);
      toast({
        title: "刪除失敗",
        description: error.message || "刪除用戶時發生錯誤，請重試",
        variant: "destructive"
      });
    }
  };

  const updatePoints = async (amount: number, description: string) => {
    if (!profile) {
      toast({ title: "錯誤", description: "找不到用戶個人資料", variant: "destructive" });
      return;
    }

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
      toast({
        title: "積分更新",
        description: `您的積分已更新 ${amount > 0 ? '增加' : '減少'} ${Math.abs(amount)} 點`,
      });
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

      toast({
        title: "積分更新",
        description: `您的積分已更新 ${amount > 0 ? '增加' : '減少'} ${Math.abs(amount)} 點`,
      });
    } catch (error: any) {
      console.error('更新積分錯誤:', error);
      toast({
        title: "更新失敗",
        description: error.message || "更新積分時發生錯誤，請重試",
        variant: "destructive"
      });
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
    setIsLoading(false);
    
    toast({
      title: "切換成功",
      description: `已切換到測試帳號 ${testAccounts[accountType].username}`,
    });
  };

  const checkIn = () => {
    if (!profile) {
      toast({ title: "錯誤", description: "找不到用戶個人資料", variant: "destructive" });
      return;
    }

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

    await new Promise(resolve => setTimeout(resolve, 2000));
    return { accounts };
  };

  const value = {
    user,
    profile,
    users,
    isLoading,
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
    dbLoading,
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
    loadData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
