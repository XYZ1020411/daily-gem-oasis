
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sword, 
  Shield, 
  Users, 
  Trophy, 
  Clock,
  Star,
  Zap,
  Crown,
  Plus
} from 'lucide-react';
import { UserCard, Battle } from '@/hooks/usePokemonCards';

interface BattleArenaProps {
  userCards: UserCard[];
  activeBattles: Battle[];
  onCreateBattle: (selectedCards: string[]) => Promise<any>;
  onJoinBattle: (battleId: string, selectedCards: string[]) => Promise<any>;
  loading: boolean;
}

const BattleArena = ({ 
  userCards, 
  activeBattles, 
  onCreateBattle, 
  onJoinBattle, 
  loading 
}: BattleArenaProps) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('create');

  const maxDeckSize = 6;

  const handleCardSelection = (cardId: string, isSelected: boolean) => {
    if (isSelected && selectedCards.length < maxDeckSize) {
      setSelectedCards([...selectedCards, cardId]);
    } else if (!isSelected) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    }
  };

  const handleCreateBattle = async () => {
    if (selectedCards.length === 0) return;
    
    await onCreateBattle(selectedCards);
    setSelectedCards([]);
  };

  const handleJoinBattle = async (battleId: string) => {
    if (selectedCards.length === 0) return;
    
    await onJoinBattle(battleId, selectedCards);
    setSelectedCards([]);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'C': return 'bg-gray-500';
      case 'UC': return 'bg-green-500';
      case 'R': return 'bg-blue-500';
      case 'SR': return 'bg-purple-500';
      case 'SSR': return 'bg-yellow-500';
      case 'UR': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // 計算卡組總戰力
  const getTotalPower = (cardIds: string[]) => {
    return cardIds.reduce((total, cardId) => {
      const userCard = userCards.find(uc => uc.card_id === cardId);
      return total + (userCard?.card.total_stats || 0);
    }, 0);
  };

  const selectedPower = getTotalPower(selectedCards);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">對戰競技場</h2>
        <p className="text-muted-foreground">選擇你的最強卡組，挑戰其他訓練師！</p>
      </div>

      {/* 卡組狀態 */}
      <Card className="bg-gradient-to-r from-red-500 to-purple-500 text-white">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sword className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">當前卡組</p>
              <p className="text-xl font-bold">{selectedCards.length} / {maxDeckSize} 張</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">總戰力</p>
            <p className="text-2xl font-bold">{selectedPower.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">創建對戰</TabsTrigger>
          <TabsTrigger value="join">加入對戰</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* 卡片選擇 */}
          <Card>
            <CardHeader>
              <CardTitle>選擇你的卡組</CardTitle>
              <p className="text-sm text-muted-foreground">
                最多選擇 {maxDeckSize} 張卡片參與對戰
              </p>
            </CardHeader>
            <CardContent>
              {userCards.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                  {userCards.map((userCard) => {
                    const card = userCard.card;
                    const isSelected = selectedCards.includes(card.id);
                    const canSelect = selectedCards.length < maxDeckSize || isSelected;
                    
                    return (
                      <div
                        key={userCard.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          isSelected 
                            ? 'bg-purple-50 border-purple-300' 
                            : canSelect 
                              ? 'hover:bg-gray-50 border-gray-200' 
                              : 'opacity-50 border-gray-200'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCardSelection(card.id, checked as boolean)}
                          disabled={!canSelect}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getRarityColor(card.rarity)} text-white text-xs`}>
                              {card.rarity}
                            </Badge>
                            <span className="font-medium truncate">{card.name}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-muted-foreground">
                              戰力: {card.total_stats}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              x{userCard.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">您還沒有任何卡片</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleCreateBattle}
            disabled={selectedCards.length === 0 || loading}
            className="w-full bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? '創建中...' : `創建對戰 (${selectedCards.length}/${maxDeckSize})`}
          </Button>
        </TabsContent>

        <TabsContent value="join" className="space-y-6">
          {/* 可加入的對戰 */}
          <Card>
            <CardHeader>
              <CardTitle>可加入的對戰</CardTitle>
              <p className="text-sm text-muted-foreground">
                選擇一場對戰加入，需要準備好你的卡組
              </p>
            </CardHeader>
            <CardContent>
              {activeBattles.filter(battle => battle.status === 'waiting').length > 0 ? (
                <div className="space-y-4">
                  {activeBattles
                    .filter(battle => battle.status === 'waiting')
                    .map((battle) => {
                      const player1Power = getTotalPower(battle.player1_deck);
                      
                      return (
                        <div
                          key={battle.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">等待對手</span>
                              <Badge variant="outline">
                                <Clock className="w-3 h-3 mr-1" />
                                等待中
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              對手戰力: {player1Power.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleJoinBattle(battle.id)}
                            disabled={selectedCards.length === 0 || loading}
                            variant="outline"
                          >
                            <Sword className="w-4 h-4 mr-2" />
                            加入對戰
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">目前沒有可加入的對戰</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    創建一個新的對戰或等待其他玩家
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 卡片選擇（加入對戰用） */}
          {activeBattles.filter(battle => battle.status === 'waiting').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>準備你的卡組</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto">
                  {userCards.slice(0, 12).map((userCard) => {
                    const card = userCard.card;
                    const isSelected = selectedCards.includes(card.id);
                    const canSelect = selectedCards.length < maxDeckSize || isSelected;
                    
                    return (
                      <div
                        key={userCard.id}
                        className={`flex items-center space-x-3 p-2 rounded border ${
                          isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCardSelection(card.id, checked as boolean)}
                          disabled={!canSelect}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <Badge className={`${getRarityColor(card.rarity)} text-white text-xs`}>
                              {card.rarity}
                            </Badge>
                            <span className="text-sm font-medium truncate">{card.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {card.total_stats}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 進行中的對戰 */}
      {activeBattles.filter(battle => battle.status === 'active').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>進行中的對戰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBattles
                .filter(battle => battle.status === 'active')
                .map((battle) => (
                  <div
                    key={battle.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="font-medium">對戰進行中</span>
                      <Badge className="bg-green-500 text-white">
                        激戰中
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      觀戰
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BattleArena;
