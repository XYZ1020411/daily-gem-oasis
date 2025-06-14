
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserContext';
import { useGameSession } from '@/hooks/useGameSession';
import { Globe, Crown, Sword, Shield, Users, DollarSign, Factory, Zap, Save, Upload, Check, Clock, Map, MessageCircle, Hammer, Pickaxe, Wheat, Fuel, Play, Pause, FastForward } from 'lucide-react';
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
  coordinates?: { lat: number; lng: number };
}

interface GameState {
  selectedCountry: Country | null;
  economy: number;
  military: number;
  technology: number;
  population: number;
  happiness: number;
  year: number;
  month: number;
  day: number;
  gameSpeed: number;
  events: string[];
  achievements: string[];
  resources: {
    oil: number;
    minerals: number;
    agriculture: number;
    steel: number;
    energy: number;
  };
  relations: {
    [countryId: string]: number;
  };
  diplomacy: {
    [countryId: string]: {
      embassies: boolean;
      tradeAgreements: boolean;
      militaryAlliance: boolean;
      warStatus: boolean;
    };
  };
  buildings: {
    factories: number;
    labs: number;
    barracks: number;
    embassies: number;
  };
  research: {
    military: number;
    economic: number;
    diplomatic: number;
  };
  construction: Array<{
    type: string;
    timeLeft: number;
    totalTime: number;
  }>;
  wars: Array<{
    opponent: string;
    startDate: string;
    type: 'offensive' | 'defensive';
  }>;
}

const ModernWorld2Game: React.FC = () => {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    selectedCountry: null,
    economy: 50,
    military: 50,
    technology: 50,
    population: 50,
    happiness: 50,
    year: 2024,
    month: 1,
    day: 1,
    gameSpeed: 1,
    events: [],
    achievements: [],
    resources: { oil: 100, minerals: 100, agriculture: 100, steel: 50, energy: 50 },
    relations: {},
    diplomacy: {},
    buildings: { factories: 5, labs: 2, barracks: 3, embassies: 0 },
    research: { military: 0, economic: 0, diplomatic: 0 },
    construction: [],
    wars: []
  });
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { session, createSession, updateGameState, recordAction } = useGameSession();

  // 生成200個國家數據，台灣設為最強
  useEffect(() => {
    loadCountries();
  }, []);

  // 時間流動系統
  useEffect(() => {
    if (gameStarted && !isGamePaused) {
      gameIntervalRef.current = setInterval(() => {
        setGameState(prev => {
          const newState = { ...prev };
          
          // 時間推進
          newState.day += newState.gameSpeed;
          if (newState.day > 30) {
            newState.day = 1;
            newState.month += 1;
            if (newState.month > 12) {
              newState.month = 1;
              newState.year += 1;
            }
          }
          
          // 更新建設進度
          newState.construction = newState.construction.map(item => ({
            ...item,
            timeLeft: Math.max(0, item.timeLeft - newState.gameSpeed)
          })).filter(item => {
            if (item.timeLeft === 0) {
              // 建設完成
              if (item.type === 'factory') newState.buildings.factories += 1;
              if (item.type === 'lab') newState.buildings.labs += 1;
              if (item.type === 'barracks') newState.buildings.barracks += 1;
              if (item.type === 'embassy') newState.buildings.embassies += 1;
              
              newState.events.push(`${newState.year}年${newState.month}月: ${item.type} 建設完成！`);
              return false;
            }
            return true;
          });
          
          // 資源產出
          newState.resources.oil += newState.buildings.factories * 0.5;
          newState.resources.energy += newState.buildings.factories * 0.3;
          newState.economy += newState.buildings.factories * 0.2;
          newState.technology += newState.buildings.labs * 0.3;
          newState.military += newState.buildings.barracks * 0.2;
          
          return newState;
        });
      }, 1000); // 每秒更新
    }
    
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [gameStarted, isGamePaused, gameState.gameSpeed]);

  const loadCountries = async () => {
    // 生成200個國家，台灣設為最強
    const mockCountries: Country[] = [
      { 
        id: '0', 
        name: '台灣', 
        flag_emoji: '🇹🇼', 
        difficulty: '困難', 
        power_level: 100, 
        region: '亞洲', 
        capital: '台北', 
        population: 23500000, 
        gdp: 0.79,
        coordinates: { lat: 23.8, lng: 121.0 }
      },
      { id: '1', name: '美國', flag_emoji: '🇺🇸', difficulty: '困難', power_level: 98, region: '北美洲', capital: '華盛頓', population: 331000000, gdp: 21.43, coordinates: { lat: 39.0, lng: -77.0 } },
      { id: '2', name: '中國', flag_emoji: '🇨🇳', difficulty: '困難', power_level: 95, region: '亞洲', capital: '北京', population: 1440000000, gdp: 14.34, coordinates: { lat: 39.9, lng: 116.4 } },
      { id: '3', name: '俄羅斯', flag_emoji: '🇷🇺', difficulty: '困難', power_level: 85, region: '歐亞大陸', capital: '莫斯科', population: 146000000, gdp: 1.78, coordinates: { lat: 55.7, lng: 37.6 } },
      { id: '4', name: '日本', flag_emoji: '🇯🇵', difficulty: '中等', power_level: 75, region: '亞洲', capital: '東京', population: 125000000, gdp: 4.94, coordinates: { lat: 35.7, lng: 139.7 } },
      { id: '5', name: '德國', flag_emoji: '🇩🇪', difficulty: '中等', power_level: 70, region: '歐洲', capital: '柏林', population: 83000000, gdp: 3.85, coordinates: { lat: 52.5, lng: 13.4 } },
      // ... 繼續生成到200個國家
    ];
    
    // 生成剩餘195個國家
    const additionalCountries = Array.from({ length: 195 }, (_, i) => ({
      id: (i + 6).toString(),
      name: `國家${i + 6}`,
      flag_emoji: '🏳️',
      difficulty: Math.random() > 0.7 ? '困難' : Math.random() > 0.4 ? '中等' : '簡單',
      power_level: Math.floor(Math.random() * 70) + 20,
      region: ['亞洲', '歐洲', '非洲', '北美洲', '南美洲', '大洋洲'][Math.floor(Math.random() * 6)],
      capital: `首都${i + 6}`,
      population: Math.floor(Math.random() * 100000000) + 1000000,
      gdp: Math.random() * 5,
      coordinates: { 
        lat: (Math.random() - 0.5) * 180, 
        lng: (Math.random() - 0.5) * 360 
      }
    }));
    
    setCountries([...mockCountries, ...additionalCountries]);
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
        month: 1,
        day: 1,
        gameSpeed: 1,
        events: [`你已成為${selectedCountry.name}的領導者！`],
        achievements: [],
        resources: { oil: 100, minerals: 100, agriculture: 100, steel: 50, energy: 50 },
        relations: {},
        diplomacy: {},
        buildings: { factories: 5, labs: 2, barracks: 3, embassies: 0 },
        research: { military: 0, economic: 0, diplomatic: 0 },
        construction: [],
        wars: []
      };

      setGameState(initialGameState);
      
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
      await recordAction('game_saved', { year: gameState.year, month: gameState.month });
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

  const executeConstruction = (type: string, cost: any, time: number) => {
    // 檢查資源是否足夠
    const hasEnoughResources = Object.entries(cost).every(([resource, amount]) => {
      const currentAmount = gameState.resources[resource as keyof typeof gameState.resources];
      return currentAmount >= Number(amount);
    });
    
    if (!hasEnoughResources) {
      toast({
        title: "資源不足",
        description: "建設需要更多資源",
        variant: "destructive"
      });
      return;
    }
    
    // 扣除資源並開始建設
    const newGameState = { ...gameState };
    Object.entries(cost).forEach(([resource, amount]) => {
      const currentAmount = newGameState.resources[resource as keyof typeof newGameState.resources];
      newGameState.resources[resource as keyof typeof newGameState.resources] = currentAmount - Number(amount);
    });
    
    newGameState.construction.push({
      type,
      timeLeft: time,
      totalTime: time
    });
    
    newGameState.events.push(`${newGameState.year}年${newGameState.month}月: 開始建設 ${type}，預計需要 ${time} 天`);
    
    setGameState(newGameState);
  };

  const startWar = (targetCountry: string) => {
    const newGameState = { ...gameState };
    newGameState.wars.push({
      opponent: targetCountry,
      startDate: `${newGameState.year}年${newGameState.month}月`,
      type: 'offensive'
    });
    newGameState.events.push(`${newGameState.year}年${newGameState.month}月: 對 ${targetCountry} 宣戰！`);
    setGameState(newGameState);
  };

  const startResearch = (type: 'military' | 'economic' | 'diplomatic') => {
    const cost = { energy: 20, steel: 10 };
    const hasEnoughResources = gameState.resources.energy >= cost.energy && gameState.resources.steel >= cost.steel;
    
    if (!hasEnoughResources) {
      toast({
        title: "資源不足",
        description: "研究需要更多能源和鋼鐵",
        variant: "destructive"
      });
      return;
    }
    
    const newGameState = { ...gameState };
    newGameState.resources.energy -= cost.energy;
    newGameState.resources.steel -= cost.steel;
    newGameState.research[type] += 10;
    newGameState.events.push(`${newGameState.year}年${newGameState.month}月: 開始 ${type} 研究`);
    setGameState(newGameState);
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
              <span>現代世界2 - 獨立遊戲系統 (200個國家)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                選擇一個國家開始你的統治之路！台灣擁有最強國力。建設、外交、戰爭、科技研究等你探索。
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 遊戲控制面板 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{gameState.selectedCountry?.flag_emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{gameState.selectedCountry?.name}</h1>
            <p className="text-muted-foreground">
              {gameState.year}年{gameState.month}月{gameState.day}日
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsGamePaused(!isGamePaused)}
            variant="outline"
            size="sm"
          >
            {isGamePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isGamePaused ? '繼續' : '暫停'}
          </Button>
          
          <select 
            value={gameState.gameSpeed}
            onChange={(e) => setGameState(prev => ({ ...prev, gameSpeed: Number(e.target.value) }))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
          
          {user && (
            <Button
              onClick={saveGame}
              disabled={saveStatus === 'saving'}
              variant="outline"
              size="sm"
            >
              {saveStatus === 'saving' && <Save className="w-4 h-4 mr-2 animate-spin" />}
              {saveStatus === 'saved' && <Check className="w-4 h-4 mr-2 text-green-500" />}
              {saveStatus === 'idle' && <Save className="w-4 h-4 mr-2" />}
              保存
            </Button>
          )}
        </div>
      </div>

      {/* 國家統計 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{Math.floor(gameState.economy)}</div>
            <div className="text-sm text-muted-foreground">經濟</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Sword className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{Math.floor(gameState.military)}</div>
            <div className="text-sm text-muted-foreground">軍事</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{Math.floor(gameState.technology)}</div>
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
            <div className="text-2xl font-bold">{Math.floor(gameState.happiness)}</div>
            <div className="text-sm text-muted-foreground">民心</div>
          </CardContent>
        </Card>
      </div>

      {/* 資源面板 */}
      <Card>
        <CardHeader>
          <CardTitle>資源</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <Fuel className="w-6 h-6 mx-auto mb-1 text-black" />
              <div className="text-lg font-bold">{Math.floor(gameState.resources.oil)}</div>
              <div className="text-sm text-muted-foreground">石油</div>
            </div>
            <div className="text-center">
              <Pickaxe className="w-6 h-6 mx-auto mb-1 text-gray-600" />
              <div className="text-lg font-bold">{Math.floor(gameState.resources.minerals)}</div>
              <div className="text-sm text-muted-foreground">礦物</div>
            </div>
            <div className="text-center">
              <Wheat className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
              <div className="text-lg font-bold">{Math.floor(gameState.resources.agriculture)}</div>
              <div className="text-sm text-muted-foreground">農業</div>
            </div>
            <div className="text-center">
              <Hammer className="w-6 h-6 mx-auto mb-1 text-gray-700" />
              <div className="text-lg font-bold">{Math.floor(gameState.resources.steel)}</div>
              <div className="text-sm text-muted-foreground">鋼鐵</div>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <div className="text-lg font-bold">{Math.floor(gameState.resources.energy)}</div>
              <div className="text-sm text-muted-foreground">能源</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 建設和行動 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>建設</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => executeConstruction('factory', { steel: 20, energy: 15 }, 30)}
              className="w-full"
              size="sm"
            >
              <Factory className="w-4 h-4 mr-2" />
              建設工廠 (30天)
            </Button>
            <Button 
              onClick={() => executeConstruction('lab', { steel: 25, energy: 20 }, 45)}
              className="w-full"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              建設實驗室 (45天)
            </Button>
            <Button 
              onClick={() => executeConstruction('barracks', { steel: 30, minerals: 20 }, 40)}
              className="w-full"
              size="sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              建設軍營 (40天)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>外交</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => executeConstruction('embassy', { steel: 15, energy: 10 }, 20)}
              className="w-full"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              建立大使館 (20天)
            </Button>
            <Button 
              onClick={() => startWar('隨機國家')}
              className="w-full"
              size="sm"
              variant="destructive"
            >
              <Sword className="w-4 h-4 mr-2" />
              發動戰爭
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>科技研究</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => startResearch('military')}
              className="w-full"
              size="sm"
            >
              軍事研究 (進度: {gameState.research.military})
            </Button>
            <Button 
              onClick={() => startResearch('economic')}
              className="w-full"
              size="sm"
            >
              經濟研究 (進度: {gameState.research.economic})
            </Button>
            <Button 
              onClick={() => startResearch('diplomatic')}
              className="w-full"
              size="sm"
            >
              外交研究 (進度: {gameState.research.diplomatic})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 建設進度 */}
      {gameState.construction.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>建設進度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gameState.construction.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.type}</span>
                    <span>{item.timeLeft} / {item.totalTime} 天</span>
                  </div>
                  <Progress value={(item.totalTime - item.timeLeft) / item.totalTime * 100} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最近事件 */}
      <Card>
        <CardHeader>
          <CardTitle>最近事件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {gameState.events.slice(-10).reverse().map((event, index) => (
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
            setIsGamePaused(false);
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
