
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
  const [drawnCards, setDrawnCards] = useState<PokemonCard[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentPackType, setCurrentPackType] = useState<'basic' | 'premium' | 'legendary'>('basic');
  const { user, updatePoints } = useUser();
  const { toast } = useToast();

  // 載入用戶卡片
  const getUserCards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_pokemon_cards')
        .select(`
          *,
          card:pokemon_cards(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Type cast the data to ensure rarity is properly typed
      const typedData = data?.map(item => ({
        ...item,
        card: {
          ...item.card,
          rarity: item.card.rarity as 'C' | 'UC' | 'R' | 'SR' | 'SSR' | 'UR'
        }
      })) as UserCard[] || [];

      setUserCards(typedData);
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

  // 模擬抽卡邏輯
  const simulateCardDraw = (packType: 'basic' | 'premium' | 'legendary'): PokemonCard[] => {
    const rarityRates = {
      basic: { 'C': 0.6, 'UC': 0.25, 'R': 0.12, 'SR': 0.025, 'SSR': 0.005 },
      premium: { 'UC': 0.4, 'R': 0.35, 'SR': 0.18, 'SSR': 0.06, 'UR': 0.01 },
      legendary: { 'R': 0.3, 'SR': 0.4, 'SSR': 0.25, 'UR': 0.05 }
    };

    const cardCounts = { basic: 5, premium: 8, legendary: 10 };
    const count = cardCounts[packType];
    const rates = rarityRates[packType];

    const cards: PokemonCard[] = [];
    
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let rarity: string = 'C';
      let cumulative = 0;
      
      for (const [r, rate] of Object.entries(rates)) {
        cumulative += rate;
        if (rand <= cumulative) {
          rarity = r;
          break;
        }
      }

      // 生成模擬寶可夢卡片
      const pokemonId = Math.floor(Math.random() * 1025) + 1;
      const types = ['火', '水', '草', '電', '超能力', '格鬥', '岩石', '飛行', '幽靈', '蟲'];
      const type1 = types[Math.floor(Math.random() * types.length)];
      const type2 = Math.random() < 0.3 ? types[Math.floor(Math.random() * types.length)] : undefined;
      
      const baseStats = {
        'C': { min: 200, max: 350 },
        'UC': { min: 300, max: 450 },
        'R': { min: 400, max: 550 },
        'SR': { min: 500, max: 650 },
        'SSR': { min: 600, max: 750 },
        'UR': { min: 700, max: 850 }
      };

      const statRange = baseStats[rarity as keyof typeof baseStats] || baseStats['C'];
      const totalStats = Math.floor(Math.random() * (statRange.max - statRange.min + 1)) + statRange.min;
      
      const hp = Math.floor(totalStats * 0.25);
      const attack = Math.floor(totalStats * 0.2);
      const defense = Math.floor(totalStats * 0.18);
      const spAttack = Math.floor(totalStats * 0.17);
      const spDefense = Math.floor(totalStats * 0.15);
      const speed = totalStats - (hp + attack + defense + spAttack + spDefense);

      cards.push({
        id: `card-${Date.now()}-${i}`,
        pokemon_id: pokemonId,
        name: `寶可夢 #${pokemonId}`,
        name_en: `Pokemon #${pokemonId}`,
        type1,
        type2,
        hp,
        attack,
        defense,
        sp_attack: spAttack,
        sp_defense: spDefense,
        speed,
        total_stats: totalStats,
        rarity: rarity as 'C' | 'UC' | 'R' | 'SR' | 'SSR' | 'UR',
        generation: Math.floor((pokemonId - 1) / 151) + 1,
        evolution_stage: Math.floor(Math.random() * 3) + 1,
        is_legendary: rarity === 'SSR' || rarity === 'UR' ? Math.random() < 0.3 : false,
        is_mythical: rarity === 'UR' ? Math.random() < 0.2 : false,
        created_at: new Date().toISOString()
      });
    }

    return cards;
  };

  // 儲存抽到的卡片到數據庫
  const saveCardsToDatabase = async (cards: PokemonCard[]) => {
    if (!user) return;

    try {
      // 首先檢查並插入不存在的寶可夢卡片
      for (const card of cards) {
        const { error: cardError } = await supabase
          .from('pokemon_cards')
          .upsert({
            pokemon_id: card.pokemon_id,
            name: card.name,
            name_en: card.name_en,
            type1: card.type1,
            type2: card.type2,
            hp: card.hp,
            attack: card.attack,
            defense: card.defense,
            sp_attack: card.sp_attack,
            sp_defense: card.sp_defense,
            speed: card.speed,
            total_stats: card.total_stats,
            rarity: card.rarity,
            generation: card.generation,
            evolution_stage: card.evolution_stage,
            is_legendary: card.is_legendary,
            is_mythical: card.is_mythical
          }, { 
            onConflict: 'pokemon_id',
            ignoreDuplicates: true 
          });

        if (cardError) {
          console.error('Error inserting pokemon card:', cardError);
        }
      }

      // 獲取已插入的卡片ID
      const { data: pokemonCards, error: fetchError } = await supabase
        .from('pokemon_cards')
        .select('id, pokemon_id')
        .in('pokemon_id', cards.map(c => c.pokemon_id));

      if (fetchError) throw fetchError;

      // 為用戶添加卡片到收藏
      const userCardsToInsert = cards.map(card => {
        const dbCard = pokemonCards?.find(pc => pc.pokemon_id === card.pokemon_id);
        return {
          user_id: user.id,
          card_id: dbCard?.id,
          quantity: 1
        };
      }).filter(uc => uc.card_id);

      if (userCardsToInsert.length > 0) {
        const { error: userCardError } = await supabase
          .from('user_pokemon_cards')
          .insert(userCardsToInsert);

        if (userCardError) throw userCardError;
      }

    } catch (error: any) {
      console.error('Error saving cards to database:', error);
      throw error;
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
    setCurrentPackType(packType);
    
    try {
      // 扣除積分
      updatePoints(-cost, `開啟${packType}卡包`);

      // 模擬抽卡
      const cards = simulateCardDraw(packType);
      setDrawnCards(cards);
      setShowAnimation(true);

      // 儲存卡片到數據庫
      await saveCardsToDatabase(cards);

      toast({
        title: "抽卡成功！",
        description: `開啟了 ${packType} 卡包，獲得 ${cards.length} 張卡片！`,
      });

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

  // 動畫完成後的處理
  const handleAnimationComplete = () => {
    // 重新載入用戶卡片
    getUserCards();
  };

  // 關閉動畫
  const handleCloseAnimation = () => {
    setShowAnimation(false);
    setDrawnCards([]);
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
    drawnCards,
    showAnimation,
    currentPackType,
    openCardPack,
    getUserCards,
    createBattle,
    joinBattle,
    loadActiveBattles,
    handleAnimationComplete,
    handleCloseAnimation
  };
};
