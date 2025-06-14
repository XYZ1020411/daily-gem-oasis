
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface GameSession {
  id: string;
  user_id: string;
  country_id: string;
  game_state: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGameSession = (countryId?: string) => {
  const { user } = useUser();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && countryId) {
      loadExistingSession(countryId);
    }
  }, [user, countryId]);

  const loadExistingSession = async (selectedCountryId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions_mw2')
        .select('*')
        .eq('user_id', user.id)
        .eq('country_id', selectedCountryId)
        .eq('is_active', true)
        .single();

      if (data) {
        setSession(data);
      }
    } catch (err) {
      // 沒有找到會話是正常的
      console.log('No existing session found');
    }
  };

  const createSession = async (selectedCountryId: string, initialGameState: any) => {
    if (!user) {
      setError('請先登入');
      return null;
    }

    try {
      setLoading(true);
      
      // 停用舊的會話
      await supabase
        .from('game_sessions_mw2')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('country_id', selectedCountryId);

      const { data, error } = await supabase
        .from('game_sessions_mw2')
        .insert({
          user_id: user.id,
          country_id: selectedCountryId,
          game_state: initialGameState,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      return data;
    } catch (err) {
      console.error('Error creating game session:', err);
      setError(err instanceof Error ? err.message : '創建遊戲會話失敗');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGameState = async (newGameState: any) => {
    if (!session || !user) return;

    try {
      const { error } = await supabase
        .from('game_sessions_mw2')
        .update({ 
          game_state: newGameState,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSession(prev => prev ? { ...prev, game_state: newGameState } : null);
    } catch (err) {
      console.error('Error updating game state:', err);
      setError(err instanceof Error ? err.message : '更新遊戲狀態失敗');
    }
  };

  const recordAction = async (actionType: string, actionData: any) => {
    if (!session || !user) return;

    try {
      await supabase
        .from('player_actions_mw2')
        .insert({
          session_id: session.id,
          action_type: actionType,
          action_data: actionData
        });
    } catch (err) {
      console.error('Error recording action:', err);
    }
  };

  const syncGameState = async () => {
    if (!session || !user) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions_mw2')
        .select('*')
        .eq('id', session.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setSession(data);
        return data.game_state;
      }
    } catch (err) {
      console.error('Error syncing game state:', err);
      setError(err instanceof Error ? err.message : '同步遊戲狀態失敗');
    }
  };

  useEffect(() => {
    if (!session || !user) return;

    // 監聽即時更新
    const channel = supabase
      .channel('game-session-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions_mw2',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          console.log('Game session updated:', payload);
          setSession(payload.new as GameSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, user]);

  return {
    session,
    loading,
    error,
    createSession,
    updateGameState,
    recordAction,
    syncGameState
  };
};
