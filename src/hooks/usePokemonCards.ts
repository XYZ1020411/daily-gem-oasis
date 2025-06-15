
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

export interface PokemonCard {
  id: string;
  pokemon_id: number;
  name: string;
  name_en: string;
  type1: string;
  type2?: string;
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
  total_stats: number;
  rarity: 'C' | 'UC' | 'R' | 'SR' | 'SSR' | 'UR';
  generation: number;
  evolution_stage: number;
  is_legendary: boolean;
  is_mythical: boolean;
  image_url?: string;
  created_at: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  obtained_at: string;
  card: PokemonCard;
}

export interface Battle {
  id: string;
  player1_id: string;
  player2_id?: string;
  player1_deck: string[];
  player2_deck: string[];
  status: 'waiting' | 'active' | 'completed';
  winner_id?: string;
  created_at: string;
}

export const usePokemonCards = () => {
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, updatePoints } = useUser();
  const { toast } = useToast();

  // 載入用戶卡片
  const getUserCards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 暫時返回空數組，等 Edge Function 實現後再完善
      setUserCards([]);
      
      toast({
        title: "載入完成",
        description: "卡片收藏已載入",
      });
    } catch (error: any) {
      console.error('Error loading user cards:', error);
      toast({
        title: "載入失敗",
        description: "無法載入您的卡片收藏",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 抽卡包
  const openCardPack = async (packType: 'basic' | 'premium' | 'legendary') => {
    if (!user) return;

    const packCosts = {
      basic: 1000,
      premium: 5000,
      legendary: 15000
    };

    const cost = packCosts[packType];
    
    setLoading(true);
    try {
      // 暫時模擬抽卡成功
      updatePoints(-cost, `開啟${packType}卡包`);

      toast({
        title: "抽卡成功！",
        description: `開啟了 ${packType} 卡包！`,
      });

      // 重新載入用戶卡片
      getUserCards();
    } catch (error: any) {
      console.error('Error opening card pack:', error);
      toast({
        title: "抽卡失敗",
        description: error.message || "開啟卡包時發生錯誤",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 創建對戰 - 暫時簡化實現
  const createBattle = async (selectedCards: string[]) => {
    if (!user || selectedCards.length === 0) return;

    try {
      toast({
        title: "對戰房間已創建",
        description: "等待其他玩家加入..."
      });

      loadActiveBattles();
    } catch (error: any) {
      console.error('Error creating battle:', error);
      toast({
        title: "創建對戰失敗",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 加入對戰 - 暫時簡化實現
  const joinBattle = async (battleId: string, selectedCards: string[]) => {
    if (!user || selectedCards.length === 0) return;

    try {
      toast({
        title: "加入對戰成功",
        description: "對戰即將開始！"
      });

      loadActiveBattles();
    } catch (error: any) {
      console.error('Error joining battle:', error);
      toast({
        title: "加入對戰失敗",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 載入活躍對戰 - 暫時返回空數組
  const loadActiveBattles = async () => {
    try {
      setActiveBattles([]);
    } catch (error: any) {
      console.error('Error loading battles:', error);
    }
  };

  useEffect(() => {
    if (user) {
      getUserCards();
      loadActiveBattles();
    }
  }, [user]);

  return {
    userCards,
    activeBattles,
    loading,
    openCardPack,
    getUserCards,
    createBattle,
    joinBattle,
    loadActiveBattles
  };
};
