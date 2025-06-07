
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
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePoints: (amount: number, description?: string) => Promise<void>;
  switchToVipAccount: () => Promise<void>;
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

  const value: UserContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updatePoints,
    switchToVipAccount,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
