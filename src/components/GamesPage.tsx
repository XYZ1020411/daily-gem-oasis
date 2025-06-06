import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import CountryGameModal from './CountryGameModal';
import { 
  Gamepad2, 
  Zap, 
  Target, 
  Puzzle, 
  Building,
  Users,
  Heart,
  Star,
  Gift,
  Coins,
  Plus,
  Play,
  MousePointer
} from 'lucide-react';

const GamesPage = () => {
  const { user, updatePoints } = useUser();
  const { toast } = useToast();
  
  const [showCountryGame, setShowCountryGame] = useState(false);
  
  // 氣球遊戲狀態
  const [balloons, setBalloons] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);
  const [balloonCount, setBalloonCount] = useState(0);
  
  // 生成人類遊戲狀態
  const [humans, setHumans] = useState<Array<{id: number, name: string, profession: string}>>([]);
  const [humanCount, setHumanCount] = useState(0);
  
  // 點擊獎勵遊戲狀態
  const [clickCount, setClickCount] = useState(0);
  const [targetClicks, setTargetClicks] = useState(10);
  
  // 拼圖遊戲狀態
  const [puzzlePieces, setPuzzlePieces] = useState(0);
  const [maxPieces] = useState(9);

  const handleReward = (amount: number, reason: string) => {
    updatePoints(amount, reason);
    toast({
      title: "獲得獎勵！",
      description: `${reason}：+${amount} 積分`
    });
  };

  // 氣球遊戲
  const generateBalloon = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
    const newBalloon = {
      id: balloonCount + 1,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setBalloons(prev => [...prev, newBalloon]);
    setBalloonCount(prev => prev + 1);
    handleReward(5, '生成氣球');
  };

  const popBalloon = (id: number) => {
    setBalloons(prev => prev.filter(balloon => balloon.id !== id));
    handleReward(10, '戳破氣球');
  };

  // 生成人類遊戲
  const generateHuman = () => {
    const names = ['小明', '小紅', '小華', '小美', '小強', '小芳'];
    const professions = ['工程師', '醫生', '老師', '廚師', '畫家', '音樂家'];
    const newHuman = {
      id: humanCount + 1,
      name: names[Math.floor(Math.random() * names.length)],
      profession: professions[Math.floor(Math.random() * professions.length)]
    };
    setHumans(prev => [...prev, newHuman]);
    setHumanCount(prev => prev + 1);
    handleReward(15, '生成人類');
  };

  const removeHuman = (id: number) => {
    setHumans(prev => prev.filter(human => human.id !== id));
    handleReward(5, '移除人類');
  };

  // 點擊挑戰遊戲
  const handleTargetClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    handleReward(3, '點擊目標');
    
    if (newCount >= targetClicks) {
      handleReward(50, '完成點擊挑戰');
      setClickCount(0);
      setTargetClicks(prev => prev + 5);
      toast({
        title: "挑戰完成！",
        description: `達成 ${targetClicks} 次點擊，獲得額外獎勵！`
      });
    }
  };

  // 拼圖遊戲
  const addPuzzlePiece = () => {
    if (puzzlePieces < maxPieces) {
      setPuzzlePieces(prev => prev + 1);
      handleReward(8, '放置拼圖');
      
      if (puzzlePieces + 1 === maxPieces) {
        handleReward(100, '完成拼圖');
        toast({
          title: "拼圖完成！",
          description: "獲得完成獎勵 100 積分！"
        });
        setTimeout(() => setPuzzlePieces(0), 2000);
      }
    }
  };

  const resetPuzzle = () => {
    setPuzzlePieces(0);
    toast({
      title: "拼圖重置",
      description: "重新開始拼圖挑戰"
    });
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          遊戲中心
        </h1>
        <p className="text-muted-foreground">
          享受各種有趣的小遊戲，賺取積分獎勵
        </p>
      </div>

      {/* 遊戲網格 */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* 氣球遊戲 */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                🎈
              </div>
              <span>氣球樂園</span>
              <Badge className="bg-red-100 text-red-800">點擊遊戲</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative bg-sky-100 rounded-lg p-4 h-64 overflow-hidden">
              {balloons.map(balloon => (
                <button
                  key={balloon.id}
                  onClick={() => popBalloon(balloon.id)}
                  className="absolute w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${balloon.x}px`,
                    top: `${balloon.y}px`,
                    backgroundColor: balloon.color
                  }}
                >
                  🎈
                </button>
              ))}
              {balloons.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  點擊下方按鈕生成氣球
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button onClick={generateBalloon} className="flex-1 bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                生成氣球 (+5積分)
              </Button>
              <Button 
                onClick={() => setBalloons([])} 
                variant="outline"
                disabled={balloons.length === 0}
              >
                清空
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              氣球數量: {balloons.length} | 戳破氣球獲得 10 積分
            </p>
          </CardContent>
        </Card>

        {/* 生成人類遊戲 */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span>人類工廠</span>
              <Badge className="bg-blue-100 text-blue-800">生成遊戲</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 h-64 overflow-y-auto">
              {humans.map(human => (
                <div 
                  key={human.id} 
                  className="flex items-center justify-between p-2 mb-2 bg-white rounded border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="font-medium">{human.name}</p>
                      <p className="text-xs text-muted-foreground">{human.profession}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeHuman(human.id)}
                  >
                    移除
                  </Button>
                </div>
              ))}
              {humans.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  點擊下方按鈕生成人類
                </div>
              )}
            </div>
            <Button onClick={generateHuman} className="w-full bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              生成人類 (+15積分)
            </Button>
            <p className="text-sm text-muted-foreground">
              人類數量: {humans.length} | 移除人類獲得 5 積分
            </p>
          </CardContent>
        </Card>

        {/* 點擊挑戰遊戲 */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MousePointer className="w-8 h-8 text-green-500" />
              <span>點擊挑戰</span>
              <Badge className="bg-green-100 text-green-800">反應遊戲</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-green-600">
                  {clickCount} / {targetClicks}
                </div>
                <Button 
                  onClick={handleTargetClick}
                  size="lg"
                  className="w-32 h-32 rounded-full bg-green-500 hover:bg-green-600 text-2xl"
                >
                  <Target className="w-12 h-12" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  點擊目標達成挑戰
                </p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span>進度:</span>
                <span>{Math.round((clickCount / targetClicks) * 100)}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((clickCount / targetClicks) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 拼圖遊戲 */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Puzzle className="w-8 h-8 text-purple-500" />
              <span>拼圖挑戰</span>
              <Badge className="bg-purple-100 text-purple-800">益智遊戲</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
                {Array.from({ length: maxPieces }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-14 h-14 border-2 border-purple-300 rounded-lg flex items-center justify-center ${
                      index < puzzlePieces 
                        ? 'bg-purple-400 border-purple-500' 
                        : 'bg-white border-dashed'
                    }`}
                  >
                    {index < puzzlePieces && (
                      <Puzzle className="w-8 h-8 text-white" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={addPuzzlePiece}
                disabled={puzzlePieces >= maxPieces}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                放置拼圖 (+8積分)
              </Button>
              <Button 
                onClick={resetPuzzle}
                variant="outline"
                disabled={puzzlePieces === 0}
              >
                重置
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              進度: {puzzlePieces}/{maxPieces} | 完成拼圖獲得 100 積分
            </p>
          </CardContent>
        </Card>

        {/* 建立國家遊戲 */}
        <Card className="md:col-span-2 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-8 h-8 text-emerald-500" />
              <span>建立你的國家</span>
              <Badge className="bg-emerald-100 text-emerald-800">策略遊戲</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                成為一國之君，制定法律、建設國家、發展經濟
              </p>
              <Button 
                onClick={() => setShowCountryGame(true)}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Play className="w-5 h-5 mr-2" />
                開始遊戲
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 建立國家遊戲模態框 */}
      <CountryGameModal
        isOpen={showCountryGame}
        onClose={() => setShowCountryGame(false)}
        onReward={handleReward}
      />
    </div>
  );
};

export default GamesPage;
