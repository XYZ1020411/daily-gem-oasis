
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Star, 
  Zap,
  Crown,
  Gift
} from 'lucide-react';
import { PokemonCard } from '@/hooks/usePokemonCards';

interface CardPackAnimationProps {
  packType: 'basic' | 'premium' | 'legendary';
  drawnCards: PokemonCard[];
  isOpen: boolean;
  onClose: () => void;
  onRevealComplete: () => void;
}

const CardPackAnimation = ({ 
  packType, 
  drawnCards, 
  isOpen, 
  onClose, 
  onRevealComplete 
}: CardPackAnimationProps) => {
  const [stage, setStage] = useState<'opening' | 'revealing' | 'complete'>('opening');
  const [revealedCards, setRevealedCards] = useState<number>(0);

  const packConfig = {
    basic: {
      name: '基礎卡包',
      gradient: 'from-gray-400 to-gray-600',
      icon: Gift,
      sparkleColor: 'text-gray-300'
    },
    premium: {
      name: '高級卡包',
      gradient: 'from-purple-500 to-blue-500',
      icon: Star,
      sparkleColor: 'text-purple-300'
    },
    legendary: {
      name: '傳說卡包',
      gradient: 'from-yellow-400 to-red-500',
      icon: Crown,
      sparkleColor: 'text-yellow-300'
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'C': return 'from-gray-400 to-gray-600';
      case 'UC': return 'from-green-400 to-green-600';
      case 'R': return 'from-blue-400 to-blue-600';
      case 'SR': return 'from-purple-400 to-purple-600';
      case 'SSR': return 'from-yellow-400 to-yellow-600';
      case 'UR': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire': case '火': return '🔥';
      case 'water': case '水': return '💧';
      case 'grass': case '草': return '🌿';
      case 'electric': case '電': return '⚡';
      case 'psychic': case '超能力': return '🔮';
      case 'fighting': case '格鬥': return '👊';
      case 'rock': case '岩石': return '🗿';
      case 'flying': case '飛行': return '🕊️';
      case 'ghost': case '幽靈': return '👻';
      case 'bug': case '蟲': return '🐛';
      default: return '⭐';
    }
  };

  useEffect(() => {
    if (isOpen && stage === 'opening') {
      const timer = setTimeout(() => {
        setStage('revealing');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, stage]);

  useEffect(() => {
    if (stage === 'revealing' && revealedCards < drawnCards.length) {
      const timer = setTimeout(() => {
        setRevealedCards(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (stage === 'revealing' && revealedCards === drawnCards.length) {
      setStage('complete');
      onRevealComplete();
    }
  }, [stage, revealedCards, drawnCards.length, onRevealComplete]);

  const handleClose = () => {
    setStage('opening');
    setRevealedCards(0);
    onClose();
  };

  if (!isOpen) return null;

  const config = packConfig[packType];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full">
        {stage === 'opening' && (
          <div className="text-center">
            <div className={`relative w-48 h-64 mx-auto mb-8 bg-gradient-to-br ${config.gradient} rounded-lg shadow-2xl animate-pulse`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-24 h-24 text-white animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className={`w-8 h-8 ${config.sparkleColor} animate-spin`} />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Sparkles className={`w-6 h-6 ${config.sparkleColor} animate-ping`} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              正在開啟 {config.name}...
            </h2>
            <p className="text-white/80">準備揭曉你的卡片！</p>
          </div>
        )}

        {(stage === 'revealing' || stage === 'complete') && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                恭喜獲得新卡片！
              </h2>
              <p className="text-white/80">
                {revealedCards} / {drawnCards.length} 已揭曉
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {drawnCards.slice(0, revealedCards).map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Card className={`bg-gradient-to-br ${getRarityColor(card.rarity)} border-2 border-white/20 shadow-xl transform hover:scale-105 transition-transform`}>
                    <CardContent className="p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-white/20 text-white border-white/30">
                          {card.rarity}
                        </Badge>
                        <span className="text-sm opacity-80">
                          #{card.pokemon_id.toString().padStart(4, '0')}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-1">{card.name}</h3>
                      <p className="text-sm opacity-80 mb-3">{card.name_en}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getTypeIcon(card.type1)}</span>
                        <span className="text-sm">{card.type1}</span>
                        {card.type2 && (
                          <>
                            <span className="text-lg">{getTypeIcon(card.type2)}</span>
                            <span className="text-sm">{card.type2}</span>
                          </>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>HP:</span>
                          <span className="font-medium">{card.hp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>攻擊:</span>
                          <span className="font-medium">{card.attack}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>總戰力:</span>
                          <span className="font-bold text-yellow-200">{card.total_stats}</span>
                        </div>
                      </div>

                      {(card.is_legendary || card.is_mythical) && (
                        <div className="mt-2 flex gap-1">
                          {card.is_legendary && (
                            <Badge className="bg-red-500/80 text-white text-xs">
                              傳說
                            </Badge>
                          )}
                          {card.is_mythical && (
                            <Badge className="bg-purple-500/80 text-white text-xs">
                              幻獸
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {stage === 'complete' && (
              <div className="text-center">
                <Button
                  onClick={handleClose}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  完成
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPackAnimation;
