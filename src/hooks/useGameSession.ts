
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

  const createSession = async (selectedCountryId: string, initialGameState: any) => {
    if (!user) {
      setError('請先登入');
      return null;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_sessions_mw2')
        .insert({
          user_id: user.id,
          country_id: selectedCountryId,
          game_state: initialGameState
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
    if (!session) return;

    try {
      const { error } = await supabase
        .from('game_sessions_mw2')
        .update({ 
          game_state: newGameState,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;
      
      setSession(prev => prev ? { ...prev, game_state: newGameState } : null);
    } catch (err) {
      console.error('Error updating game state:', err);
      setError(err instanceof Error ? err.message : '更新遊戲狀態失敗');
    }
  };

  const recordAction = async (actionType: string, actionData: any) => {
    if (!session) return;

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

  useEffect(() => {
    if (!session) return;

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
  }, [session?.id]);

  return {
    session,
    loading,
    error,
    createSession,
    updateGameState,
    recordAction
  };
};
