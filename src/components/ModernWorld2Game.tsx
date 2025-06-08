
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserContext';
import { useGameSession } from '@/hooks/useGameSession';
import { Globe, Crown, Sword, Shield, Users, DollarSign, Factory, Zap, Save, Upload, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Country {
  id: string;
  name: string;
  flag_emoji: string;
  difficulty: string;
  power_level: number;
  region: string;
  capital: string;
  population: number;
  gdp: number;
}

interface GameState {
  selectedCountry: Country | null;
  economy: number;
  military: number;
  technology: number;
  population: number;
  happiness: number;
  year: number;
  events: string[];
  achievements: string[];
  resources: {
    oil: number;
    minerals: number;
    agriculture: number;
  };
  relations: {
    [countryId: string]: number;
  };
}

const ModernWorld2Game: React.FC = () => {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    selectedCountry: null,
    economy: 50,
    military: 50,
    technology: 50,
    population: 50,
    happiness: 50,
    year: 2024,
    events: [],
    achievements: [],
    resources: { oil: 100, minerals: 100, agriculture: 100 },
    relations: {}
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { session, createSession, updateGameState, recordAction } = useGameSession();

  // 獨立遊戲系統 - 不需要登入即可遊玩
  const isPlayable = true;

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    // 模擬國家數據 - 獨立遊戲系統
    const mockCountries: Country[] = [
      { id: '1', name: '美國', flag_emoji: '🇺🇸', difficulty: '困難', power_level: 100, region: '北美洲', capital: '華盛頓', population: 331000000, gdp: 21.43 },
      { id: '2', name: '中國', flag_emoji: '🇨🇳', difficulty: '困難', power_level: 95, region: '亞洲', capital: '北京', population: 1440000000, gdp: 14.34 },
      { id: '3', name: '俄羅斯', flag_emoji: '🇷🇺', difficulty: '困難', power_level: 85, region: '歐亞大陸', capital: '莫斯科', population: 146000000, gdp: 1.78 },
      { id: '4', name: '日本', flag_emoji: '🇯🇵', difficulty: '中等', power_level: 75, region: '亞洲', capital: '東京', population: 125000000, gdp: 4.94 },
      { id: '5', name: '德國', flag_emoji: '🇩🇪', difficulty: '中等', power_level: 70, region: '歐洲', capital: '柏林', population: 83000000, gdp: 3.85 },
      { id: '6', name: '英國', flag_emoji: '🇬🇧', difficulty: '中等', power_level: 68, region: '歐洲', capital: '倫敦', population: 67000000, gdp: 2.83 },
      { id: '7', name: '法國', flag_emoji: '🇫🇷', difficulty: '中等', power_level: 65, region: '歐洲', capital: '巴黎', population: 67000000, gdp: 2.72 },
      { id: '8', name: '印度', flag_emoji: '🇮🇳', difficulty: '中等', power_level: 60, region: '亞洲', capital: '新德里', population: 1380000000, gdp: 2.87 },
      { id: '9', name: '加拿大', flag_emoji: '🇨🇦', difficulty: '簡單', power_level: 55, region: '北美洲', capital: '渥太華', population: 38000000, gdp: 1.74 },
      { id: '10', name: '澳洲', flag_emoji: '🇦🇺', difficulty: '簡單', power_level: 52, region: '大洋洲', capital: '坎培拉', population: 26000000, gdp: 1.39 },
      { id: '11', name: '韓國', flag_emoji: '🇰🇷', difficulty: '中等', power_level: 58, region: '亞洲', capital: '首爾', population: 52000000, gdp: 1.81 },
      { id: '12', name: '義大利', flag_emoji: '🇮🇹', difficulty: '簡單', power_level: 50, region: '歐洲', capital: '羅馬', population: 60000000, gdp: 2.11 },
      { id: '13', name: '西班牙', flag_emoji: '🇪🇸', difficulty: '簡單', power_level: 48, region: '歐洲', capital: '馬德里', population: 47000000, gdp: 1.39 },
      { id: '14', name: '荷蘭', flag_emoji: '🇳🇱', difficulty: '簡單', power_level: 46, region: '歐洲', capital: '阿姆斯特丹', population: 17000000, gdp: 0.91 },
      { id: '15', name: '瑞士', flag_emoji: '🇨🇭', difficulty: '簡單', power_level: 44, region: '歐洲', capital: '伯恩', population: 8700000, gdp: 0.75 }
    ];
    setCountries(mockCountries);
  };

  const confirmCountrySelection = async () => {
    if (!selectedCountry) return;

    setLoading(true);
    try {
      const initialGameState: GameState = {
        selectedCountry,
        economy: selectedCountry.difficulty === '困難' ? 80 : selectedCountry.difficulty === '中等' ? 60 : 40,
        military: selectedCountry.power_level,
        technology: selectedCountry.gdp > 5 ? 80 : selectedCountry.gdp > 2 ? 60 : 40,
        population: Math.floor(selectedCountry.population / 1000000),
        happiness: 60,
        year: 2024,
        events: [`你已成為${selectedCountry.name}的領導者！`],
        achievements: [],
        resources: { oil: 100, minerals: 100, agriculture: 100 },
        relations: {}
      };

      setGameState(initialGameState);
      
      // 如果用戶已登入，創建遊戲會話保存進度
      if (user) {
        await createSession(selectedCountry.id, initialGameState);
        await recordAction('country_selected', { countryId: selectedCountry.id, countryName: selectedCountry.name });
      }
      
      setGameStarted(true);
      
      toast({
        title: `歡迎來到${selectedCountry.name}！`,
        description: `你現在是${selectedCountry.name}的領導者。開始建設你的國家吧！`,
      });
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: "遊戲啟動失敗",
        description: "無法啟動遊戲，請重試",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGame = async () => {
    if (!user || !session) {
      toast({
        title: "請先登入",
        description: "需要登入才能保存遊戲進度",
        variant: "destructive"
      });
      return;
    }

    setSaveStatus('saving');
    try {
      await updateGameState(gameState);
      await recordAction('game_saved', { year: gameState.year });
      setSaveStatus('saved');
      
      toast({
        title: "遊戲已保存",
        description: "你的遊戲進度已成功保存",
      });
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving game:', error);
      setSaveStatus('error');
      toast({
        title: "保存失敗",
        description: "無法保存遊戲進度，請重試",
        variant: "destructive"
      });
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const loadGame = async () => {
    if (!user || !session) return;

    try {
      if (session.game_state) {
        setGameState(session.game_state);
        setSelectedCountry(session.game_state.selectedCountry);
        setGameStarted(true);
        
        toast({
          title: "遊戲已載入",
          description: "已載入你的遊戲進度",
        });
      }
    } catch (error) {
      console.error('Error loading game:', error);
      toast({
        title: "載入失敗",
        description: "無法載入遊戲進度",
        variant: "destructive"
      });
    }
  };

  const executeAction = async (actionType: string, impact: Partial<GameState>) => {
    const newGameState = { ...gameState, ...impact };
    setGameState(newGameState);
    
    if (user && session) {
      await updateGameState(newGameState);
      await recordAction(actionType, impact);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '困難': return 'bg-red-500';
      case '中等': return 'bg-yellow-500';
      case '簡單': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-6 h-6" />
              <span>現代世界2 - 獨立遊戲系統</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                選擇一個國家開始你的統治之路！建設你的國家，發展經濟，擴張軍事力量。
              </p>
              
              {selectedCountry && (
                <Card className="border-2 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{selectedCountry.flag_emoji}</span>
                        <div>
                          <h3 className="font-bold text-lg">{selectedCountry.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            首都: {selectedCountry.capital} | 人口: {(selectedCountry.population / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Badge className={getDifficultyColor(selectedCountry.difficulty)}>
                          {selectedCountry.difficulty}
                        </Badge>
                        <div className="text-sm">
                          國力: {selectedCountry.power_level}/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        onClick={confirmCountrySelection}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? '啟動中...' : '確認選擇並開始遊戲'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedCountry(null)}
                        disabled={loading}
                      >
                        重新選擇
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((country) => (
            <Card 
              key={country.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCountry?.id === country.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCountry(country)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag_emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{country.name}</h3>
                    <p className="text-sm text-muted-foreground">{country.region}</p>
                  </div>
                  <Badge className={getDifficultyColor(country.difficulty)}>
                    {country.difficulty}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground">
                    國力: {country.power_level}/100
                  </div>
                  <Progress value={country.power_level} className="mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {user && session && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>載入遊戲</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={loadGame} variant="outline" className="w-full">
                載入已保存的遊戲
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 遊戲標題和保存狀態 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{gameState.selectedCountry?.flag_emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{gameState.selectedCountry?.name}</h1>
            <p className="text-muted-foreground">{gameState.year}年</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={saveGame}
              disabled={saveStatus === 'saving'}
              variant="outline"
              size="sm"
            >
              {saveStatus === 'saving' && <Save className="w-4 h-4 mr-2 animate-spin" />}
              {saveStatus === 'saved' && <Check className="w-4 h-4 mr-2 text-green-500" />}
              {saveStatus === 'idle' && <Save className="w-4 h-4 mr-2" />}
              {saveStatus === 'error' && <Save className="w-4 h-4 mr-2 text-red-500" />}
              保存遊戲
            </Button>
            <div className="text-xs text-muted-foreground">
              {saveStatus === 'saved' && '已保存'}
              {saveStatus === 'saving' && '保存中...'}
              {saveStatus === 'error' && '保存失敗'}
            </div>
          </div>
        )}
      </div>

      {/* 國家統計 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{gameState.economy}</div>
            <div className="text-sm text-muted-foreground">經濟</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Sword className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{gameState.military}</div>
            <div className="text-sm text-muted-foreground">軍事</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{gameState.technology}</div>
            <div className="text-sm text-muted-foreground">科技</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{gameState.population}M</div>
            <div className="text-sm text-muted-foreground">人口</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{gameState.happiness}</div>
            <div className="text-sm text-muted-foreground">民心</div>
          </CardContent>
        </Card>
      </div>

      {/* 遊戲動作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>經濟發展</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => executeAction('build_factory', { 
                economy: gameState.economy + 5, 
                events: [...gameState.events, `${gameState.year}年: 建設了新工廠，經濟+5`] 
              })}
              className="w-full"
            >
              <Factory className="w-4 h-4 mr-2" />
              建設工廠 (+5 經濟)
            </Button>
            <Button 
              onClick={() => executeAction('trade_deal', { 
                economy: gameState.economy + 3, 
                events: [...gameState.events, `${gameState.year}年: 簽署貿易協定，經濟+3`] 
              })}
              className="w-full"
              variant="outline"
            >
              簽署貿易協定 (+3 經濟)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>軍事建設</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => executeAction('military_training', { 
                military: gameState.military + 4, 
                events: [...gameState.events, `${gameState.year}年: 進行軍事訓練，軍事+4`] 
              })}
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              軍事訓練 (+4 軍事)
            </Button>
            <Button 
              onClick={() => executeAction('buy_weapons', { 
                military: gameState.military + 6, 
                economy: gameState.economy - 3,
                events: [...gameState.events, `${gameState.year}年: 購買武器，軍事+6，經濟-3`] 
              })}
              className="w-full"
              variant="outline"
            >
              購買武器 (+6 軍事, -3 經濟)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 最近事件 */}
      <Card>
        <CardHeader>
          <CardTitle>最近事件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {gameState.events.slice(-5).reverse().map((event, index) => (
              <div key={index} className="text-sm p-2 bg-muted rounded">
                {event}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 重新開始按鈕 */}
      <div className="text-center">
        <Button 
          onClick={() => {
            setGameStarted(false);
            setSelectedCountry(null);
            setGameState({
              selectedCountry: null,
              economy: 50,
              military: 50,
              technology: 50,
              population: 50,
              happiness: 50,
              year: 2024,
              events: [],
              achievements: [],
              resources: { oil: 100, minerals: 100, agriculture: 100 },
              relations: {}
            });
          }}
          variant="outline"
        >
          重新開始遊戲
        </Button>
      </div>
    </div>
  );
};

export default ModernWorld2Game;
