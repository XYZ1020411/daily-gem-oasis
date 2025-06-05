
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Gavel, Briefcase, Building, Shield, Handshake, Coins, Heart, Users, Plus, Minus } from 'lucide-react';

interface CountryGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (amount: number, reason: string) => void;
}

const CountryGameModal: React.FC<CountryGameModalProps> = ({ isOpen, onClose, onReward }) => {
  const [countryName, setCountryName] = useState('新國家');
  const [treasury, setTreasury] = useState(10000);
  const [population, setPopulation] = useState(1000);
  const [happiness, setHappiness] = useState(70);
  const [military, setMilitary] = useState(50);

  const [laws, setLaws] = useState<string[]>(['基本人權法', '稅收法']);
  const [buildings, setBuildings] = useState<string[]>(['政府大樓', '醫院']);
  const [policies, setPolicies] = useState<string[]>(['免費教育', '全民健保']);

  const [newLaw, setNewLaw] = useState('');
  const [newBuilding, setNewBuilding] = useState('');
  const [newPolicy, setNewPolicy] = useState('');

  if (!isOpen) return null;

  const quickActions = {
    laws: [
      '環保法案', '勞工保護法', '言論自由法', '反貪污法', '數位隱私法'
    ],
    buildings: [
      '學校', '圖書館', '公園', '醫院', '警察局', '消防局', '體育館', '博物館'
    ],
    policies: [
      '全民基本收入', '綠能政策', '數位教育', '長照服務', '青年就業', '老人福利'
    ]
  };

  const handleQuickAction = (actionType: string, actionName: string, cost: number, reward: number) => {
    if (treasury >= cost) {
      setTreasury(prev => prev - cost);
      
      switch (actionType) {
        case 'law':
          setLaws(prev => [...prev, actionName]);
          setHappiness(prev => Math.min(100, prev + 5));
          break;
        case 'building':
          setBuildings(prev => [...prev, actionName]);
          setPopulation(prev => prev + 100);
          break;
        case 'policy':
          setPolicies(prev => [...prev, actionName]);
          setHappiness(prev => Math.min(100, prev + 10));
          break;
        case 'military':
          setMilitary(prev => Math.min(100, prev + 10));
          break;
        case 'diplomacy':
          setHappiness(prev => Math.min(100, prev + 8));
          break;
      }
      
      onReward(reward, `${actionName}獎勵`);
    }
  };

  const handleCustomAction = (actionType: string, actionName: string, cost: number, reward: number) => {
    if (treasury >= cost) {
      setTreasury(prev => prev - cost);
      
      switch (actionType) {
        case 'law':
          if (newLaw.trim()) {
            setLaws(prev => [...prev, newLaw.trim()]);
            setNewLaw('');
            setHappiness(prev => Math.min(100, prev + 5));
          }
          break;
        case 'building':
          if (newBuilding.trim()) {
            setBuildings(prev => [...prev, newBuilding.trim()]);
            setNewBuilding('');
            setPopulation(prev => prev + 100);
          }
          break;
        case 'policy':
          if (newPolicy.trim()) {
            setPolicies(prev => [...prev, newPolicy.trim()]);
            setNewPolicy('');
            setHappiness(prev => Math.min(100, prev + 10));
          }
          break;
      }
      
      onReward(reward, `${actionName}獎勵`);
    }
  };

  const adjustValue = (type: string, change: number) => {
    const cost = Math.abs(change) * 10;
    if (treasury >= cost) {
      setTreasury(prev => prev - cost);
      switch (type) {
        case 'happiness':
          setHappiness(prev => Math.max(0, Math.min(100, prev + change)));
          break;
        case 'military':
          setMilitary(prev => Math.max(0, Math.min(100, prev + change)));
          break;
        case 'population':
          setPopulation(prev => Math.max(0, prev + change * 10));
          break;
      }
    }
  };

  const handleCloseGame = () => {
    const finalReward = Math.floor((happiness + military + population / 50) / 3);
    onReward(finalReward, '國家發展獎勵');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl flex items-center space-x-2">
                <Building className="w-8 h-8" />
                <span>{countryName}</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleCloseGame} className="text-green-600 border-white">
                結束遊戲
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{treasury.toLocaleString()}</div>
                <div className="text-sm opacity-90">國庫</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => adjustValue('population', -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span>{population.toLocaleString()}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => adjustValue('population', 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-sm opacity-90">人口</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => adjustValue('happiness', -5)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span>{happiness}%</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => adjustValue('happiness', 5)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-sm opacity-90">幸福度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => adjustValue('military', -5)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span>{military}%</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => adjustValue('military', 5)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-sm opacity-90">軍事力量</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="laws" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="laws" className="flex items-center space-x-1">
                  <Gavel className="w-4 h-4" />
                  <span>法律</span>
                </TabsTrigger>
                <TabsTrigger value="buildings" className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>建築</span>
                </TabsTrigger>
                <TabsTrigger value="policies" className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>政策</span>
                </TabsTrigger>
                <TabsTrigger value="military" className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>軍事</span>
                </TabsTrigger>
                <TabsTrigger value="economy" className="flex items-center space-x-1">
                  <Coins className="w-4 h-4" />
                  <span>經濟</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="laws" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">已頒布法律</h3>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-blue-50 rounded-lg">
                    {laws.map((law, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-100">
                        {law}
                      </Badge>
                    ))}
                  </div>
                  
                  <h4 className="font-medium">快速法律選項</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {quickActions.laws.map((law, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuickAction('law', law, 500, 30)}
                        disabled={treasury < 500 || laws.includes(law)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2"
                      >
                        {law}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium">自訂法律</h4>
                    <Input
                      placeholder="輸入新法律名稱"
                      value={newLaw}
                      onChange={(e) => setNewLaw(e.target.value)}
                    />
                    <Button
                      onClick={() => handleCustomAction('law', '頒布法律', 500, 30)}
                      disabled={!newLaw.trim() || treasury < 500}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      頒布法律 (費用: 500, 獎勵: 30積分)
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="buildings" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">已建造建築</h3>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-green-50 rounded-lg">
                    {buildings.map((building, index) => (
                      <Badge key={index} variant="outline" className="bg-green-100">
                        {building}
                      </Badge>
                    ))}
                  </div>
                  
                  <h4 className="font-medium">快速建築選項</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {quickActions.buildings.map((building, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuickAction('building', building, 800, 40)}
                        disabled={treasury < 800 || buildings.includes(building)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2"
                      >
                        {building}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium">自訂建築</h4>
                    <Input
                      placeholder="輸入新建築名稱"
                      value={newBuilding}
                      onChange={(e) => setNewBuilding(e.target.value)}
                    />
                    <Button
                      onClick={() => handleCustomAction('building', '建造建築', 800, 40)}
                      disabled={!newBuilding.trim() || treasury < 800}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      建造建築 (費用: 800, 獎勵: 40積分)
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="policies" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">已實施政策</h3>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-purple-50 rounded-lg">
                    {policies.map((policy, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-100">
                        {policy}
                      </Badge>
                    ))}
                  </div>
                  
                  <h4 className="font-medium">快速政策選項</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {quickActions.policies.map((policy, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuickAction('policy', policy, 600, 35)}
                        disabled={treasury < 600 || policies.includes(policy)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2"
                      >
                        {policy}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium">自訂政策</h4>
                    <Input
                      placeholder="輸入新政策名稱"
                      value={newPolicy}
                      onChange={(e) => setNewPolicy(e.target.value)}
                    />
                    <Button
                      onClick={() => handleCustomAction('policy', '實施政策', 600, 35)}
                      disabled={!newPolicy.trim() || treasury < 600}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      實施政策 (費用: 600, 獎勵: 35積分)
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="military" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">軍事與外交</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">軍事行動</h4>
                      <Button
                        onClick={() => handleQuickAction('military', '招募軍隊', 1000, 50)}
                        disabled={treasury < 1000}
                        className="w-full bg-red-500 hover:bg-red-600"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        招募軍隊 (費用: 1000)
                      </Button>
                      <Button
                        onClick={() => handleQuickAction('military', '軍事演習', 500, 25)}
                        disabled={treasury < 500}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        軍事演習 (費用: 500)
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">外交行動</h4>
                      <Button
                        onClick={() => handleQuickAction('diplomacy', '外交談判', 300, 25)}
                        disabled={treasury < 300}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                      >
                        <Handshake className="w-4 h-4 mr-2" />
                        外交談判 (費用: 300)
                      </Button>
                      <Button
                        onClick={() => handleQuickAction('diplomacy', '貿易協定', 800, 40)}
                        disabled={treasury < 800}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        貿易協定 (費用: 800)
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      軍事力量: {military}% | 建議保持適當的軍事力量以維護國家安全
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="economy" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">經濟管理</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">稅務政策</h4>
                      <Button
                        onClick={() => handleQuickAction('economy', '調整稅率', 200, 15)}
                        disabled={treasury < 200}
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        調整稅率 (費用: 200)
                      </Button>
                      <Button
                        onClick={() => handleQuickAction('economy', '發行國債', 500, 30)}
                        disabled={treasury < 500}
                        className="w-full bg-indigo-500 hover:bg-indigo-600"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        發行國債 (費用: 500)
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">產業發展</h4>
                      <Button
                        onClick={() => handleQuickAction('economy', '科技園區', 1200, 60)}
                        disabled={treasury < 1200}
                        className="w-full bg-cyan-500 hover:bg-cyan-600"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        科技園區 (費用: 1200)
                      </Button>
                      <Button
                        onClick={() => handleQuickAction('economy', '農業補助', 400, 20)}
                        disabled={treasury < 400}
                        className="w-full bg-lime-500 hover:bg-lime-600"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        農業補助 (費用: 400)
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">經濟成長率:</span> {((happiness + military) / 2).toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">失業率:</span> {Math.max(0, 10 - happiness / 10).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CountryGameModal;
