
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Flag
} from 'lucide-react';

const ModernWorld2Game: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState({
    population: 50000000,
    economy: 75,
    military: 60,
    technology: 45,
    diplomacy: 70,
    stability: 80
  });

  const countries = [
    { name: '美國', flag: '🇺🇸', difficulty: '困難', power: 95 },
    { name: '中國', flag: '🇨🇳', difficulty: '困難', power: 90 },
    { name: '俄羅斯', flag: '🇷🇺', difficulty: '困難', power: 85 },
    { name: '德國', flag: '🇩🇪', difficulty: '中等', power: 75 },
    { name: '日本', flag: '🇯🇵', difficulty: '中等', power: 70 },
    { name: '英國', flag: '🇬🇧', difficulty: '中等', power: 68 },
    { name: '法國', flag: '🇫🇷', difficulty: '中等', power: 65 },
    { name: '台灣', flag: '🇹🇼', difficulty: '簡單', power: 45 }
  ];

  const departments = [
    { name: '國防部', icon: Shield, description: '管理軍事和國防' },
    { name: '經濟部', icon: DollarSign, description: '發展經濟和貿易' },
    { name: '外交部', icon: Globe, description: '處理國際關係' },
    { name: '教育部', icon: Users, description: '提升人民教育水平' },
    { name: '科技部', icon: Factory, description: '研發新技術' },
    { name: '基建部', icon: Building, description: '建設國家基礎設施' }
  ];

  const handleStartGame = () => {
    if (selectedCountry) {
      setGameStarted(true);
    }
  };

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <span>現代世界2 - 總統模擬器</span>
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
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>選擇你要統治的國家</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {countries.map((country) => (
                <Button
                  key={country.name}
                  variant={selectedCountry === country.name ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center space-y-2"
                  onClick={() => setSelectedCountry(country.name)}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {country.difficulty}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    實力: {country.power}
                  </div>
                </Button>
              ))}
            </div>
            
            {selectedCountry && (
              <div className="mt-6 text-center">
                <Button onClick={handleStartGame} size="lg">
                  <Flag className="w-4 h-4 mr-2" />
                  開始統治 {selectedCountry}
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
            <span>{selectedCountry}總統府</span>
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
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Target className="w-6 h-6 text-red-500" />
              <span>陸軍</span>
              <span className="text-xs text-muted-foreground">50萬人</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Ship className="w-6 h-6 text-blue-500" />
              <span>海軍</span>
              <span className="text-xs text-muted-foreground">200艘艦艇</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Plane className="w-6 h-6 text-gray-500" />
              <span>空軍</span>
              <span className="text-xs text-muted-foreground">500架戰機</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
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
