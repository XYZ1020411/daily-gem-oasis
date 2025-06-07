
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  Sword, 
  Building, 
  Users, 
  DollarSign, 
  Shield, 
  Factory,
  Plane,
  Ship,
  Target,
  TrendingUp,
  Crown,
  Flag,
  Search,
  Loader2
} from 'lucide-react';
import { useCountries, Country } from '@/hooks/useCountries';
import { useGameSession } from '@/hooks/useGameSession';
import { useToast } from '@/hooks/use-toast';

const ModernWorld2Game: React.FC = () => {
  const { countries, loading: countriesLoading, error: countriesError } = useCountries();
  const { session, createSession, updateGameState, recordAction } = useGameSession();
  const { toast } = useToast();
  
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('全部');
  const [gameStats, setGameStats] = useState({
    population: 50000000,
    economy: 75,
    military: 60,
    technology: 45,
    diplomacy: 70,
    stability: 80
  });

  // 過濾國家
  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         country.capital?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === '全部' || country.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // 獲取所有地區
  const regions = ['全部', ...Array.from(new Set(countries.map(c => c.region)))];

  const departments = [
    { name: '國防部', icon: Shield, description: '管理軍事和國防' },
    { name: '經濟部', icon: DollarSign, description: '發展經濟和貿易' },
    { name: '外交部', icon: Globe, description: '處理國際關係' },
    { name: '教育部', icon: Users, description: '提升人民教育水平' },
    { name: '科技部', icon: Factory, description: '研發新技術' },
    { name: '基建部', icon: Building, description: '建設國家基礎設施' }
  ];

  const handleStartGame = async () => {
    if (!selectedCountry) return;

    const initialGameState = {
      countryName: selectedCountry.name,
      stats: gameStats,
      startTime: new Date().toISOString()
    };

    const newSession = await createSession(selectedCountry.id, initialGameState);
    if (newSession) {
      setGameStarted(true);
      toast({
        title: "遊戲開始",
        description: `歡迎成為${selectedCountry.name}的總統！`
      });
    }
  };

  const handleAction = async (actionType: string, actionName: string, statChanges: any) => {
    const newStats = { ...gameStats, ...statChanges };
    setGameStats(newStats);
    
    await updateGameState({
      ...session?.game_state,
      stats: newStats,
      lastAction: {
        type: actionType,
        name: actionName,
        timestamp: new Date().toISOString()
      }
    });
    
    await recordAction(actionType, {
      actionName,
      statChanges,
      newStats
    });

    toast({
      title: actionName,
      description: "政策執行成功！"
    });
  };

  // 載入保存的遊戲狀態
  useEffect(() => {
    if (session?.game_state?.stats) {
      setGameStats(session.game_state.stats);
    }
  }, [session]);

  if (countriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">載入國家資料中...</span>
      </div>
    );
  }

  if (countriesError) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>載入失敗: {countriesError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          重新載入
        </Button>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <span>現代世界2 - 總統模擬器</span>
              <Badge variant="secondary">網路同步版</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                《現代世界2》是一款集地緣政治、經濟、軍事為一體的策略遊戲。
                在遊戲中，你要以總統的身份管理一個現代國家。
              </p>
              
              <div className="grid gap-2">
                <h3 className="font-semibold">遊戲特色：</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>戰爭體系：吞併國家、發動戰爭、建立軍隊</li>
                  <li>政府部門：管理衛生、教育、基建等各部委</li>
                  <li>外交系統：簽署條約、參與聯合國、國際制裁</li>
                  <li>法律與意識形態：制定法律、選擇宗教和意識形態</li>
                  <li>生產貿易：發展經濟、資源開發、國際貿易</li>
                  <li>內政管理：應對災害、疫情、示威等事件</li>
                  <li>🌐 網路同步：即時保存遊戲進度到雲端</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>選擇你要統治的國家 ({countries.length}個國家)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 搜索和篩選 */}
            <div className="space-y-4 mb-6">
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索國家或首都..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
              {filteredCountries.map((country) => (
                <Button
                  key={country.id}
                  variant={selectedCountry?.id === country.id ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center space-y-2"
                  onClick={() => setSelectedCountry(country)}
                >
                  <span className="text-2xl">{country.flag_emoji}</span>
                  <span className="font-medium text-xs">{country.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {country.difficulty}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    實力: {country.power_level}
                  </div>
                  {country.capital && (
                    <div className="text-xs text-muted-foreground">
                      {country.capital}
                    </div>
                  )}
                </Button>
              ))}
            </div>
            
            {selectedCountry && (
              <div className="mt-6 text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold">{selectedCountry.name} 詳細資訊</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>地區: {selectedCountry.region}</div>
                    <div>首都: {selectedCountry.capital}</div>
                    <div>人口: {selectedCountry.population?.toLocaleString()}</div>
                    <div>GDP: ${selectedCountry.gdp}兆</div>
                  </div>
                </div>
                <Button onClick={handleStartGame} size="lg">
                  <Flag className="w-4 h-4 mr-2" />
                  開始統治 {selectedCountry.name}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 國家狀態面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span>{selectedCountry?.name}總統府</span>
            <Badge variant="outline" className="text-xs">
              🌐 已同步
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">經濟發展</span>
                <span className="text-sm font-medium">{gameStats.economy}%</span>
              </div>
              <Progress value={gameStats.economy} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">軍事力量</span>
                <span className="text-sm font-medium">{gameStats.military}%</span>
              </div>
              <Progress value={gameStats.military} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">科技水平</span>
                <span className="text-sm font-medium">{gameStats.technology}%</span>
              </div>
              <Progress value={gameStats.technology} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">外交關係</span>
                <span className="text-sm font-medium">{gameStats.diplomacy}%</span>
              </div>
              <Progress value={gameStats.diplomacy} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">國家穩定</span>
                <span className="text-sm font-medium">{gameStats.stability}%</span>
              </div>
              <Progress value={gameStats.stability} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">人口</span>
                <span className="text-sm font-medium">{(gameStats.population / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 政府部門 */}
      <Card>
        <CardHeader>
          <CardTitle>政府部門</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <Button
                  key={dept.name}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => handleAction(
                    'department',
                    dept.name,
                    { economy: Math.min(100, gameStats.economy + 2) }
                  )}
                >
                  <Icon className="w-8 h-8 text-blue-500" />
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {dept.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 軍事指揮中心 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sword className="w-5 h-5 text-red-500" />
            <span>軍事指揮中心</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleAction(
                'military',
                '訓練陸軍',
                { military: Math.min(100, gameStats.military + 3) }
              )}
            >
              <Target className="w-6 h-6 text-red-500" />
              <span>陸軍</span>
              <span className="text-xs text-muted-foreground">50萬人</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleAction(
                'military',
                '建造軍艦',
                { military: Math.min(100, gameStats.military + 4) }
              )}
            >
              <Ship className="w-6 h-6 text-blue-500" />
              <span>海軍</span>
              <span className="text-xs text-muted-foreground">200艘艦艇</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleAction(
                'military',
                '購買戰機',
                { military: Math.min(100, gameStats.military + 5) }
              )}
            >
              <Plane className="w-6 h-6 text-gray-500" />
              <span>空軍</span>
              <span className="text-xs text-muted-foreground">500架戰機</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleAction(
                'military',
                '核武研發',
                { military: Math.min(100, gameStats.military + 10), technology: Math.min(100, gameStats.technology + 5) }
              )}
            >
              <Target className="w-6 h-6 text-orange-500" />
              <span>核武</span>
              <span className="text-xs text-muted-foreground">機密</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 遊戲控制 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setGameStarted(false)}>
              返回選擇國家
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              查看統計
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernWorld2Game;
