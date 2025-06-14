
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserContextType } from './UserContextTypes';
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

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        toast({
          title: "無法獲取用戶會話",
          description: "請檢查您的網路連接",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        fetchProfile(session.user.id).then(() => {
          toast({
            title: "登入成功",
            description: "歡迎回來！",
          });
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsTestMode(false);
        toast({
          title: "登出成功",
          description: "您已成功登出",
        });
      }
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          throw error;
        }

        setUsers(data || []);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: "載入用戶失敗",
          description: error.message || "無法載入用戶列表",
          variant: "destructive"
        });
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

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "載入個人資料失敗",
        description: error.message || "無法載入您的個人資料",
        variant: "destructive"
      });
    }
  };

  const signIn = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@game.local`,
        password: password,
      })

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('登入錯誤:', error);
      toast({
        title: "登入失敗",
        description: error.message || "請檢查您的用戶名稱和密碼",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${username}@game.local`,
        password: password,
        options: {
          data: {
            username: username,
            display_name: displayName,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('註冊錯誤:', error);
      toast({
        title: "註冊失敗",
        description: error.message || "註冊時發生錯誤，請重試",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      setIsTestMode(false);
    } catch (error: any) {
      console.error('登出錯誤:', error);
      toast({
        title: "登出失敗",
        description: error.message || "登出時發生錯誤，請重試",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserContextType['profile']>) => {
    if (!profile) {
      toast({
        title: "錯誤",
        description: "找不到用戶個人資料",
        variant: "destructive"
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

      if (error) {
        throw error;
      }

      setProfile(data);
      setUsers(prevUsers => {
        return prevUsers.map(u => u.id === profile.id ? { ...u, ...updates } : u);
      });

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

  const updateUserById = async (userId: string, updates: Partial<UserContextType['profile']>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUsers(prevUsers => {
        return prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u);
      });

      toast({
        title: "更新成功",
        description: "用戶資料已成功更新",
      });
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
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));

      toast({
        title: "刪除成功",
        description: "用戶已成功刪除",
      });
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
      toast({
        title: "錯誤",
        description: "找不到用戶個人資料",
        variant: "destructive"
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

      if (error) {
        throw error;
      }

      setProfile(data);
      setUsers(prevUsers => {
        return prevUsers.map(u => u.id === profile.id ? { ...u, points: (u.points || 0) + amount } : u);
      });

      // 添加交易記錄
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

  // 測試帳號切換功能
  const switchToTestAccount = (accountType: 'vip1' | 'vip2') => {
    const testAccounts = {
      vip1: {
        id: 'test-vip1',
        username: '001',
        display_name: 'VIP會員001',
        email_username: '001',
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
    
    toast({
      title: "切換成功",
      description: `已切換到測試帳號 ${testAccounts[accountType].username}`,
    });
  };

  // 簽到功能
  const checkIn = () => {
    if (!profile) return;

    const points = 100 + (profile.vip_level * 50);
    updatePoints(points, '每日簽到獎勵');
    
    const newStreak = (profile.check_in_streak || 0) + 1;
    updateProfile({
      check_in_streak: newStreak,
      last_check_in: new Date().toISOString()
    });
  };

  // 禮品碼兌換功能
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

  // 創建真實帳號功能
  const createRealAccounts = async () => {
    const accounts = [
      { email: '001@game.local', password: 'password123', role: 'vip' },
      { email: 'vip8888@game.local', password: 'vip8888pass', role: 'vip' },
      { email: '002@game.local', password: 'admin123', role: 'admin' }
    ];

    // 模擬創建帳號的過程
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { accounts };
  };

  const value = {
    user,
    profile,
    users,
    isLoading,
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
    
    // 數據庫相關功能
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
