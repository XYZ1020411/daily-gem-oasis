
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserContext';
import { Skull, Shield, Heart, Zap, Package, Droplets, Thermometer, Users, Clock, AlertTriangle, TreePine, Home, Hammer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SurvivalState {
  health: number;
  hunger: number;
  thirst: number;
  energy: number;
  sanity: number;
  temperature: number;
  day: number;
  hour: number;
  weather: 'sunny' | 'rainy' | 'storm' | 'snow';
  location: string;
  inventory: {
    food: number;
    water: number;
    medicine: number;
    materials: number;
    fuel: number;
    weapons: number;
  };
  shelter: {
    level: number;
    durability: number;
    capacity: number;
  };
  threats: Array<{
    type: string;
    severity: number;
    timeLeft: number;
  }>;
  events: string[];
  skills: {
    scavenging: number;
    crafting: number;
    combat: number;
    medical: number;
  };
}

const DoomsdaySurvivalGame: React.FC = () => {
  const { user, profile, updatePoints } = useUser();
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [survivalState, setSurvivalState] = useState<SurvivalState>({
    health: 100,
    hunger: 100,
    thirst: 100,
    energy: 100,
    sanity: 100,
    temperature: 20,
    day: 1,
    hour: 8,
    weather: 'sunny',
    location: '廢棄建築',
    inventory: { food: 5, water: 3, medicine: 1, materials: 10, fuel: 2, weapons: 0 },
    shelter: { level: 1, durability: 100, capacity: 20 },
    threats: [],
    events: ['末日降臨，你必須生存下去...'],
    skills: { scavenging: 1, crafting: 1, combat: 1, medical: 1 }
  });

  // 遊戲時間流動系統
  useEffect(() => {
    if (gameStarted && !isGamePaused) {
      gameIntervalRef.current = setInterval(() => {
        setSurvivalState(prev => {
          const newState = { ...prev };
          
          // 時間推進
          newState.hour += gameSpeed;
          if (newState.hour >= 24) {
            newState.hour = 0;
            newState.day += 1;
          }
          
          // 基本消耗
          newState.hunger = Math.max(0, newState.hunger - 0.5 * gameSpeed);
          newState.thirst = Math.max(0, newState.thirst - 0.8 * gameSpeed);
          newState.energy = Math.max(0, newState.energy - 0.3 * gameSpeed);
          
          // 健康狀態影響
          if (newState.hunger < 20) newState.health = Math.max(0, newState.health - 0.5);
          if (newState.thirst < 10) newState.health = Math.max(0, newState.health - 1);
          if (newState.energy < 10) newState.sanity = Math.max(0, newState.sanity - 0.3);
          
          // 天氣變化
          if (Math.random() < 0.02) {
            const weathers: Array<'sunny' | 'rainy' | 'storm' | 'snow'> = ['sunny', 'rainy', 'storm', 'snow'];
            newState.weather = weathers[Math.floor(Math.random() * weathers.length)];
            newState.events.push(`第${newState.day}天 ${newState.hour}時: 天氣變為${newState.weather}`);
          }
          
          // 隨機事件
          if (Math.random() < 0.01) {
            const events = [
              '發現了一個廢棄的補給箱',
              '聽到遠處有奇怪的聲音',
              '找到了一些有用的材料',
              '遇到了其他倖存者'
            ];
            const event = events[Math.floor(Math.random() * events.length)];
            newState.events.push(`第${newState.day}天 ${newState.hour}時: ${event}`);
          }
          
          // 威脅處理
          newState.threats = newState.threats.map(threat => ({
            ...threat,
            timeLeft: Math.max(0, threat.timeLeft - gameSpeed)
          })).filter(threat => {
            if (threat.timeLeft === 0) {
              newState.health = Math.max(0, newState.health - threat.severity);
              newState.events.push(`第${newState.day}天: ${threat.type} 造成了 ${threat.severity} 點傷害！`);
              return false;
            }
            return true;
          });
          
          return newState;
        });
      }, 1000);
    }
    
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [gameStarted, isGamePaused, gameSpeed]);

  const startGame = () => {
    setGameStarted(true);
    toast({
      title: "末日生存開始！",
      description: "你必須管理好你的資源，在這個危險的世界中生存下去！",
    });
  };

  const scavenge = () => {
    const energy_cost = 20;
    if (survivalState.energy < energy_cost) {
      toast({
        title: "體力不足",
        description: "你需要休息來恢復體力",
        variant: "destructive"
      });
      return;
    }

    const newState = { ...survivalState };
    newState.energy -= energy_cost;
    
    // 搜尋結果
    const finds = Math.floor(Math.random() * 3) + 1;
    const items = ['food', 'water', 'materials', 'medicine'];
    const foundItem = items[Math.floor(Math.random() * items.length)] as keyof typeof newState.inventory;
    
    newState.inventory[foundItem] += finds;
    newState.skills.scavenging += 0.1;
    newState.events.push(`第${newState.day}天: 搜尋中找到了 ${finds} 個 ${foundItem}`);
    
    // 隨機威脅
    if (Math.random() < 0.3) {
      newState.threats.push({
        type: '搜尋時遇到的危險',
        severity: Math.floor(Math.random() * 20) + 5,
        timeLeft: 10
      });
    }
    
    setSurvivalState(newState);
  };

  const rest = () => {
    const newState = { ...survivalState };
    newState.energy = Math.min(100, newState.energy + 30);
    newState.health = Math.min(100, newState.health + 5);
    newState.hour += 4; // 休息4小時
    if (newState.hour >= 24) {
      newState.hour -= 24;
      newState.day += 1;
    }
    newState.events.push(`第${newState.day}天: 你休息了一段時間，恢復了體力`);
    setSurvivalState(newState);
  };

  const eat = () => {
    if (survivalState.inventory.food <= 0) {
      toast({
        title: "沒有食物",
        description: "你需要先找到食物",
        variant: "destructive"
      });
      return;
    }

    const newState = { ...survivalState };
    newState.inventory.food -= 1;
    newState.hunger = Math.min(100, newState.hunger + 40);
    newState.events.push(`第${newState.day}天: 你吃了一些食物，飢餓感減輕了`);
    setSurvivalState(newState);
  };

  const drink = () => {
    if (survivalState.inventory.water <= 0) {
      toast({
        title: "沒有水",
        description: "你需要先找到水源",
        variant: "destructive"
      });
      return;
    }

    const newState = { ...survivalState };
    newState.inventory.water -= 1;
    newState.thirst = Math.min(100, newState.thirst + 50);
    newState.events.push(`第${newState.day}天: 你喝了一些水，口渴感消失了`);
    setSurvivalState(newState);
  };

  const craft = () => {
    if (survivalState.inventory.materials < 5) {
      toast({
        title: "材料不足",
        description: "你需要至少5個材料來製作物品",
        variant: "destructive"
      });
      return;
    }

    const newState = { ...survivalState };
    newState.inventory.materials -= 5;
    
    const craftables = ['weapons', 'medicine', 'food'];
    const crafted = craftables[Math.floor(Math.random() * craftables.length)] as keyof typeof newState.inventory;
    newState.inventory[crafted] += 1;
    newState.skills.crafting += 0.2;
    newState.events.push(`第${newState.day}天: 你製作了一個 ${crafted}`);
    setSurvivalState(newState);
  };

  const getStatusColor = (value: number) => {
    if (value > 70) return 'bg-green-500';
    if (value > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Skull className="w-6 h-6" />
              <span>末日生存模擬器</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                世界末日降臨，你是少數的倖存者之一。在這個危險的世界中，你必須管理好你的健康、飢餓、口渴、體力和心理狀態。
                搜尋資源、建造庇護所、製作工具，並且小心各種威脅！
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">遊戲特色</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 真實的生存體驗</li>
                      <li>• 動態天氣系統</li>
                      <li>• 隨機事件和威脅</li>
                      <li>• 技能升級系統</li>
                      <li>• 資源管理</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">生存要素</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 健康狀態</li>
                      <li>• 飢餓和口渴</li>
                      <li>• 體力管理</li>
                      <li>• 心理狀態</li>
                      <li>• 庇護所建設</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Button onClick={startGame} className="w-full">
                開始生存挑戰
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 遊戲控制面板 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">末日生存 - 第{survivalState.day}天</h1>
          <p className="text-muted-foreground">
            時間: {survivalState.hour}:00 | 天氣: {survivalState.weather} | 位置: {survivalState.location}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsGamePaused(!isGamePaused)}
            variant="outline"
            size="sm"
          >
            {isGamePaused ? <Clock className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {isGamePaused ? '繼續' : '暫停'}
          </Button>
          
          <select 
            value={gameSpeed}
            onChange={(e) => setGameSpeed(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
        </div>
      </div>

      {/* 生存狀態 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{Math.floor(survivalState.health)}</div>
            <div className="text-sm text-muted-foreground">健康</div>
            <Progress value={survivalState.health} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{Math.floor(survivalState.hunger)}</div>
            <div className="text-sm text-muted-foreground">飽食</div>
            <Progress value={survivalState.hunger} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{Math.floor(survivalState.thirst)}</div>
            <div className="text-sm text-muted-foreground">水分</div>
            <Progress value={survivalState.thirst} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{Math.floor(survivalState.energy)}</div>
            <div className="text-sm text-muted-foreground">體力</div>
            <Progress value={survivalState.energy} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{Math.floor(survivalState.sanity)}</div>
            <div className="text-sm text-muted-foreground">理智</div>
            <Progress value={survivalState.sanity} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Thermometer className="w-6 h-6 mx-auto mb-2 text-gray-500" />
            <div className="text-2xl font-bold">{survivalState.temperature}°C</div>
            <div className="text-sm text-muted-foreground">溫度</div>
          </CardContent>
        </Card>
      </div>

      {/* 庫存和庇護所 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>庫存</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>食物: {survivalState.inventory.food}</div>
              <div>水: {survivalState.inventory.water}</div>
              <div>藥品: {survivalState.inventory.medicine}</div>
              <div>材料: {survivalState.inventory.materials}</div>
              <div>燃料: {survivalState.inventory.fuel}</div>
              <div>武器: {survivalState.inventory.weapons}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>庇護所</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>等級: {survivalState.shelter.level}</div>
              <div>耐久度: {survivalState.shelter.durability}/100</div>
              <div>容量: {survivalState.shelter.capacity}</div>
              <Progress value={survivalState.shelter.durability} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 行動按鈕 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={scavenge} className="w-full">
          <Package className="w-4 h-4 mr-2" />
          搜尋資源
        </Button>
        <Button onClick={rest} className="w-full">
          <Home className="w-4 h-4 mr-2" />
          休息
        </Button>
        <Button onClick={eat} className="w-full">
          <Package className="w-4 h-4 mr-2" />
          進食
        </Button>
        <Button onClick={drink} className="w-full">
          <Droplets className="w-4 h-4 mr-2" />
          喝水
        </Button>
        <Button onClick={craft} className="w-full">
          <Hammer className="w-4 h-4 mr-2" />
          製作物品
        </Button>
      </div>

      {/* 威脅警告 */}
      {survivalState.threats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span>當前威脅</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {survivalState.threats.map((threat, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{threat.type}</span>
                    <Badge variant="destructive">威脅等級: {threat.severity}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    剩餘時間: {threat.timeLeft} 小時
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 事件日誌 */}
      <Card>
        <CardHeader>
          <CardTitle>事件日誌</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {survivalState.events.slice(-10).reverse().map((event, index) => (
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
            setSurvivalState({
              health: 100,
              hunger: 100,
              thirst: 100,
              energy: 100,
              sanity: 100,
              temperature: 20,
              day: 1,
              hour: 8,
              weather: 'sunny',
              location: '廢棄建築',
              inventory: { food: 5, water: 3, medicine: 1, materials: 10, fuel: 2, weapons: 0 },
              shelter: { level: 1, durability: 100, capacity: 20 },
              threats: [],
              events: ['末日降臨，你必須生存下去...'],
              skills: { scavenging: 1, crafting: 1, combat: 1, medical: 1 }
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

export default DoomsdaySurvivalGame;
