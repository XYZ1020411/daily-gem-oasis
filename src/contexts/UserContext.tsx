
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
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // 更新積分
  const updatePoints = async (amount: number, reason: string) => {
    if (!user || !profile) return;

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

  // 設置認證狀態監聽
  useEffect(() => {
    let mounted = true;

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
  }, []);

  const value: UserContextType = {
    user,
    profile,
    session,
    isLoggedIn: !!user,
    isLoading,
    updatePoints,
    refreshProfile,
    signOut
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
