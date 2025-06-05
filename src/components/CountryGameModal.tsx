
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Gavel, Briefcase, Building, Shield, Handshake, Coins, Heart, Users } from 'lucide-react';

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

  const handleAction = (actionType: string, actionName: string, cost: number, reward: number) => {
    if (treasury >= cost) {
      setTreasury(prev => prev - cost);
      
      // 根據行動類型更新相應數據
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
        case 'military':
          setMilitary(prev => Math.min(100, prev + 10));
          break;
      }
      
      onReward(reward, `${actionName}獎勵`);
    }
  };

  const handleCloseGame = () => {
    // 根據國家發展給予最終獎勵
    const finalReward = Math.floor((happiness + military + population / 50) / 3);
    onReward(finalReward, '國家發展獎勵');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="text-2xl font-bold">{population.toLocaleString()}</div>
                <div className="text-sm opacity-90">人口</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{happiness}%</div>
                <div className="text-sm opacity-90">幸福度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{military}%</div>
                <div className="text-sm opacity-90">軍事力量</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="laws" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="laws" className="flex items-center space-x-2">
                  <Gavel className="w-4 h-4" />
                  <span>法律</span>
                </TabsTrigger>
                <TabsTrigger value="buildings" className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>建築</span>
                </TabsTrigger>
                <TabsTrigger value="policies" className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>政策</span>
                </TabsTrigger>
                <TabsTrigger value="military" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>軍事</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="laws" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">已頒布法律</h3>
                  <div className="flex flex-wrap gap-2">
                    {laws.map((law, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {law}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="輸入新法律名稱"
                      value={newLaw}
                      onChange={(e) => setNewLaw(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAction('law', '頒布法律', 500, 30)}
                      disabled={!newLaw.trim() || treasury < 500}
                      className="bg-blue-500 hover:bg-blue-600"
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
                  <div className="flex flex-wrap gap-2">
                    {buildings.map((building, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50">
                        {building}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="輸入新建築名稱"
                      value={newBuilding}
                      onChange={(e) => setNewBuilding(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAction('building', '建造建築', 800, 40)}
                      disabled={!newBuilding.trim() || treasury < 800}
                      className="bg-green-500 hover:bg-green-600"
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
                  <div className="flex flex-wrap gap-2">
                    {policies.map((policy, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50">
                        {policy}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="輸入新政策名稱"
                      value={newPolicy}
                      onChange={(e) => setNewPolicy(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAction('policy', '實施政策', 600, 35)}
                      disabled={!newPolicy.trim() || treasury < 600}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      實施政策 (費用: 600, 獎勵: 35積分)
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="military" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">軍事發展</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleAction('military', '招募軍隊', 1000, 50)}
                      disabled={treasury < 1000}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      招募軍隊 (費用: 1000)
                    </Button>
                    <Button
                      onClick={() => handleAction('military', '外交談判', 300, 25)}
                      disabled={treasury < 300}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Handshake className="w-4 h-4 mr-2" />
                      外交談判 (費用: 300)
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      軍事力量: {military}% | 建議保持適當的軍事力量以維護國家安全
                    </p>
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
