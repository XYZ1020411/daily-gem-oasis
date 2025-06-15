
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Sword, 
  Star, 
  Zap, 
  Trophy,
  CreditCard,
  Sparkles,
  Crown,
  Shield,
  Flame
} from 'lucide-react';
import CardPackShop from './pokemon/CardPackShop';
import MyCollection from './pokemon/MyCollection';
import BattleArena from './pokemon/BattleArena';
import { usePokemonCards } from '@/hooks/usePokemonCards';

const PokemonCardGame = () => {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('shop');
  const { 
    userCards, 
    loading, 
    openCardPack, 
    getUserCards,
    createBattle,
    joinBattle,
    activeBattles 
  } = usePokemonCards();

  if (!user) {
    return (
      <div className="text-center py-20">
        <CreditCard className="w-16 h-16 mx-auto text-purple-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">請先登入</h2>
        <p className="text-muted-foreground">需要登入才能遊玩寶可夢卡牌遊戲</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 遊戲標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 bg-clip-text text-transparent">
          寶可夢卡牌大師
        </h1>
        <p className="text-muted-foreground">
          收集 1025 種寶可夢卡片，挑戰其他訓練師！
        </p>
      </div>

      {/* 用戶狀態卡片 */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">訓練師</p>
              <p className="text-xl font-bold">{profile?.display_name || profile?.username}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm opacity-90">可用積分</p>
            <p className="text-2xl font-bold">{(profile?.points || 0).toLocaleString()}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm opacity-90">收藏卡片</p>
            <p className="text-2xl font-bold">{userCards.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* 主要遊戲界面 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shop" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>卡包商店</span>
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>我的收藏</span>
          </TabsTrigger>
          <TabsTrigger value="battle" className="flex items-center space-x-2">
            <Sword className="w-4 h-4" />
            <span>對戰競技場</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-6">
          <CardPackShop 
            userPoints={profile?.points || 0}
            onPackOpened={openCardPack}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          <MyCollection 
            userCards={userCards}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="battle" className="space-y-6">
          <BattleArena 
            userCards={userCards}
            activeBattles={activeBattles}
            onCreateBattle={createBattle}
            onJoinBattle={joinBattle}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PokemonCardGame;
