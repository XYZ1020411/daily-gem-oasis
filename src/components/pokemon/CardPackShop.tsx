
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Coins, 
  Star, 
  Crown, 
  Sparkles,
  Gift
} from 'lucide-react';
import CardPackAnimation from './CardPackAnimation';
import { usePokemonCards } from '@/hooks/usePokemonCards';

interface CardPackShopProps {
  userPoints: number;
  onPackOpened: (packType: 'basic' | 'premium' | 'legendary') => Promise<any>;
  loading: boolean;
}

const CardPackShop = ({ userPoints, onPackOpened, loading }: CardPackShopProps) => {
  const { 
    drawnCards, 
    showAnimation, 
    currentPackType, 
    handleAnimationComplete, 
    handleCloseAnimation 
  } = usePokemonCards();

  const cardPacks = [
    {
      id: 'basic',
      name: '基礎卡包',
      description: '包含常見和稀有的寶可夢',
      cost: 1000,
      cardCount: 5,
      rarityChance: {
        'C': '60%',
        'UC': '25%',
        'R': '12%',
        'SR': '2.5%',
        'SSR': '0.5%'
      },
      icon: Package,
      gradient: 'from-gray-400 to-gray-600',
      textColor: 'text-white'
    },
    {
      id: 'premium',
      name: '高級卡包',
      description: '更高機率獲得稀有卡片',
      cost: 5000,
      cardCount: 8,
      rarityChance: {
        'UC': '40%',
        'R': '35%',
        'SR': '18%',
        'SSR': '6%',
        'UR': '1%'
      },
      icon: Star,
      gradient: 'from-purple-500 to-blue-500',
      textColor: 'text-white'
    },
    {
      id: 'legendary',
      name: '傳說卡包',
      description: '保證至少一張SSR或以上',
      cost: 15000,
      cardCount: 10,
      rarityChance: {
        'R': '30%',
        'SR': '40%',
        'SSR': '25%',
        'UR': '5%'
      },
      icon: Crown,
      gradient: 'from-yellow-400 to-red-500',
      textColor: 'text-white'
    }
  ];

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

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">卡包商店</h2>
          <p className="text-muted-foreground">使用積分購買卡包，收集寶可夢卡片</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cardPacks.map((pack) => {
            const Icon = pack.icon;
            const canAfford = userPoints >= pack.cost;
            
            return (
              <Card 
                key={pack.id} 
                className={`hover:shadow-lg transition-shadow ${!canAfford ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className={`w-full h-32 bg-gradient-to-r ${pack.gradient} rounded-lg flex items-center justify-center mb-4 relative overflow-hidden`}>
                    <Icon className={`w-16 h-16 ${pack.textColor} z-10`} />
                    <div className="absolute inset-0">
                      <Sparkles className="absolute top-2 right-2 w-4 h-4 text-white/50 animate-pulse" />
                      <Sparkles className="absolute bottom-3 left-3 w-3 h-3 text-white/30 animate-ping" />
                      <Sparkles className="absolute top-1/2 left-1/4 w-2 h-2 text-white/40 animate-bounce" />
                    </div>
                  </div>
                  <CardTitle className="text-center">{pack.name}</CardTitle>
                  <p className="text-sm text-muted-foreground text-center">
                    {pack.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">卡片數量</span>
                    <Badge variant="outline">{pack.cardCount} 張</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">稀有度機率</p>
                    <div className="space-y-1">
                      {Object.entries(pack.rarityChance).map(([rarity, chance]) => (
                        <div key={rarity} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded ${getRarityColor(rarity)}`} />
                            <span>{rarity}</span>
                          </div>
                          <span className="text-muted-foreground">{chance}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg">{pack.cost.toLocaleString()}</span>
                    </div>
                    <Button
                      onClick={() => onPackOpened(pack.id as any)}
                      disabled={!canAfford || loading}
                      className={`bg-gradient-to-r ${pack.gradient} hover:opacity-90 transition-opacity`}
                    >
                      {loading ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          開啟中...
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          購買
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 卡片稀有度說明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">稀有度等級說明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { rarity: 'C', name: '普通', color: 'bg-gray-500' },
                { rarity: 'UC', name: '稀有', color: 'bg-green-500' },
                { rarity: 'R', name: '超稀有', color: 'bg-blue-500' },
                { rarity: 'SR', name: '特級稀有', color: 'bg-purple-500' },
                { rarity: 'SSR', name: '傳說', color: 'bg-yellow-500' },
                { rarity: 'UR', name: '終極稀有', color: 'bg-red-500' }
              ].map((item) => (
                <div key={item.rarity} className="text-center space-y-2">
                  <div className={`w-12 h-12 ${item.color} rounded-full mx-auto flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{item.rarity}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.rarity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 抽卡動畫 */}
      <CardPackAnimation
        packType={currentPackType}
        drawnCards={drawnCards}
        isOpen={showAnimation}
        onClose={handleCloseAnimation}
        onRevealComplete={handleAnimationComplete}
      />
    </>
  );
};

export default CardPackShop;
