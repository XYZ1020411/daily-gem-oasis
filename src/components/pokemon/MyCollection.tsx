
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Star, 
  Zap, 
  Shield, 
  Flame,
  Droplets,
  Leaf,
  Mountain,
  Wind,
  Eye,
  Ghost,
  Bug,
  Crown,
  Sparkles
} from 'lucide-react';
import { UserCard } from '@/hooks/usePokemonCards';

interface MyCollectionProps {
  userCards: UserCard[];
  loading: boolean;
}

const MyCollection = ({ userCards, loading }: MyCollectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all');

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

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire': case '火': return <Flame className="w-4 h-4" />;
      case 'water': case '水': return <Droplets className="w-4 h-4" />;
      case 'grass': case '草': return <Leaf className="w-4 h-4" />;
      case 'electric': case '電': return <Zap className="w-4 h-4" />;
      case 'psychic': case '超能力': return <Eye className="w-4 h-4" />;
      case 'fighting': case '格鬥': return <Shield className="w-4 h-4" />;
      case 'rock': case '岩石': return <Mountain className="w-4 h-4" />;
      case 'flying': case '飛行': return <Wind className="w-4 h-4" />;
      case 'ghost': case '幽靈': return <Ghost className="w-4 h-4" />;
      case 'bug': case '蟲': return <Bug className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire': case '火': return 'text-red-500';
      case 'water': case '水': return 'text-blue-500';
      case 'grass': case '草': return 'text-green-500';
      case 'electric': case '電': return 'text-yellow-500';
      case 'psychic': case '超能力': return 'text-purple-500';
      case 'fighting': case '格鬥': return 'text-orange-500';
      case 'rock': case '岩石': return 'text-gray-600';
      case 'flying': case '飛行': return 'text-indigo-500';
      case 'ghost': case '幽靈': return 'text-purple-700';
      case 'bug': case '蟲': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  const filteredCards = userCards.filter(userCard => {
    const card = userCard.card;
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.name_en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || card.rarity === filterRarity;
    const matchesType = filterType === 'all' || card.type1 === filterType || card.type2 === filterType;
    
    return matchesSearch && matchesRarity && matchesType;
  });

  const totalCards = userCards.length;
  const uniqueCards = new Set(userCards.map(uc => uc.card_id)).size;
  const collectionProgress = ((uniqueCards / 1025) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-16 h-16 mx-auto text-purple-500 mb-4 animate-spin" />
        <p className="text-muted-foreground">載入收藏中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 收藏統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">總卡片數</p>
              <p className="text-2xl font-bold">{totalCards}</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">獨特卡片</p>
              <p className="text-2xl font-bold">{uniqueCards}</p>
            </div>
            <Star className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">收集進度</p>
              <p className="text-2xl font-bold">{collectionProgress}%</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* 搜尋和篩選 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="搜尋寶可夢名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="稀有度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部稀有度</SelectItem>
                <SelectItem value="C">普通 (C)</SelectItem>
                <SelectItem value="UC">稀有 (UC)</SelectItem>
                <SelectItem value="R">超稀有 (R)</SelectItem>
                <SelectItem value="SR">特級稀有 (SR)</SelectItem>
                <SelectItem value="SSR">傳說 (SSR)</SelectItem>
                <SelectItem value="UR">終極稀有 (UR)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="屬性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部屬性</SelectItem>
                <SelectItem value="火">火</SelectItem>
                <SelectItem value="水">水</SelectItem>
                <SelectItem value="草">草</SelectItem>
                <SelectItem value="電">電</SelectItem>
                <SelectItem value="超能力">超能力</SelectItem>
                <SelectItem value="格鬥">格鬥</SelectItem>
                <SelectItem value="岩石">岩石</SelectItem>
                <SelectItem value="飛行">飛行</SelectItem>
                <SelectItem value="幽靈">幽靈</SelectItem>
                <SelectItem value="蟲">蟲</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 卡片收藏 */}
      {filteredCards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCards.map((userCard) => {
            const card = userCard.card;
            return (
              <Card key={userCard.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getRarityColor(card.rarity)} text-white`}>
                      {card.rarity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      #{card.pokemon_id.toString().padStart(4, '0')}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{card.name_en}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* 屬性 */}
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 ${getTypeColor(card.type1)}`}>
                      {getTypeIcon(card.type1)}
                      <span className="text-sm">{card.type1}</span>
                    </div>
                    {card.type2 && (
                      <div className={`flex items-center space-x-1 ${getTypeColor(card.type2)}`}>
                        {getTypeIcon(card.type2)}
                        <span className="text-sm">{card.type2}</span>
                      </div>
                    )}
                  </div>

                  {/* 基本數值 */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>HP:</span>
                      <span className="font-medium">{card.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>攻擊:</span>
                      <span className="font-medium">{card.attack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>防禦:</span>
                      <span className="font-medium">{card.defense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>速度:</span>
                      <span className="font-medium">{card.speed}</span>
                    </div>
                  </div>

                  {/* 總戰力 */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">總戰力:</span>
                      <span className="text-lg font-bold text-purple-600">{card.total_stats}</span>
                    </div>
                  </div>

                  {/* 擁有數量 */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">擁有數量:</span>
                    <Badge variant="outline">{userCard.quantity} 張</Badge>
                  </div>

                  {/* 特殊標記 */}
                  <div className="flex flex-wrap gap-1">
                    {card.is_legendary && (
                      <Badge variant="destructive" className="text-xs">
                        傳說
                      </Badge>
                    )}
                    {card.is_mythical && (
                      <Badge variant="secondary" className="text-xs">
                        幻獸
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      第 {card.generation} 世代
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">沒有找到卡片</h3>
            <p className="text-muted-foreground">
              {userCards.length === 0 
                ? '您還沒有任何卡片，去商店購買卡包吧！'
                : '沒有符合篩選條件的卡片'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyCollection;
