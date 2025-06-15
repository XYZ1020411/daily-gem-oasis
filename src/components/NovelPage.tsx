
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Star, 
  Clock, 
  Heart,
  Bookmark,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

interface Novel {
  id: string;
  title: string;
  author: string;
  content: string;
  genre: string;
  readTime: number;
  publishDate: string;
  rating: number;
  views: number;
  isBookmarked: boolean;
  isNew: boolean;
}

const NovelPage: React.FC = () => {
  const { user, profile, updatePoints } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('today');
  const [todayNovel, setTodayNovel] = useState<Novel | null>(null);
  const [recentNovels, setRecentNovels] = useState<Novel[]>([]);
  const [popularNovels, setPopularNovels] = useState<Novel[]>([]);
  const [hasReadToday, setHasReadToday] = useState(false);

  // 模擬小說數據
  useEffect(() => {
    const today: Novel = {
      id: 'today-1',
      title: '星空下的約定',
      author: '月影書齋',
      content: `夜空中繁星點點，如同散落在黑絲絨上的鑽石。李雨晴站在天台上，望著這片她從小就熟悉的星空。今晚的月亮格外圓潤，灑下的銀輝為整個城市披上了一層神秘的面紗。

"你還記得我們的約定嗎？"身後傳來熟悉的聲音。

雨晴沒有回頭，嘴角卻不禁上揚。"當然記得，我們說好要在滿月的夜晚，一起數星星到天亮。"

陳浩走到她身邊，兩人並肩而立。十年了，從青澀的中學時代到現在，他們都在各自的人生道路上奔跑著，但這個約定，卻像是一根無形的線，將他們緊緊相連。

"一、二、三..."雨晴開始輕聲數著星星。

"四、五、六..."陳浩接著她的節拍。

就這樣，在這個特殊的夜晚，兩個人重新找回了那份純真的美好。星空見證著他們的友誼，也見證著某種更深層的情感在悄悄萌芽...`,
      genre: '浪漫',
      readTime: 8,
      publishDate: new Date().toISOString().split('T')[0],
      rating: 4.8,
      views: 1247,
      isBookmarked: false,
      isNew: true
    };

    const recent: Novel[] = [
      {
        id: 'recent-1',
        title: '時光旅人的咖啡館',
        author: '時間守護者',
        content: '在城市的一個小巷裡，有一家神秘的咖啡館...',
        genre: '奇幻',
        readTime: 12,
        publishDate: '2024-06-14',
        rating: 4.6,
        views: 892,
        isBookmarked: true,
        isNew: false
      },
      {
        id: 'recent-2',
        title: '雨夜中的祕密',
        author: '雨聲創作',
        content: '大雨滂沱的夜晚，她發現了一個改變命運的祕密...',
        genre: '懸疑',
        readTime: 15,
        publishDate: '2024-06-13',
        rating: 4.4,
        views: 756,
        isBookmarked: false,
        isNew: false
      }
    ];

    const popular: Novel[] = [
      {
        id: 'popular-1',
        title: '龍族傳說：覺醒',
        author: '龍吟天下',
        content: '在遙遠的古代，龍族與人類共存於世...',
        genre: '玄幻',
        readTime: 20,
        publishDate: '2024-06-10',
        rating: 4.9,
        views: 5284,
        isBookmarked: true,
        isNew: false
      },
      {
        id: 'popular-2',
        title: '都市修仙錄',
        author: '修真大師',
        content: '在現代都市中隱藏著修仙者的世界...',
        genre: '修真',
        readTime: 18,
        publishDate: '2024-06-08',
        rating: 4.7,
        views: 4156,
        isBookmarked: false,
        isNew: false
      }
    ];

    setTodayNovel(today);
    setRecentNovels(recent);
    setPopularNovels(popular);
  }, []);

  const handleReadNovel = (novel: Novel) => {
    if (novel.id === todayNovel?.id && !hasReadToday) {
      setHasReadToday(true);
      const reward = profile?.role === 'vip' ? 100 : 50;
      updatePoints(reward);
      toast({
        title: "閱讀完成！",
        description: `獲得 ${reward} 積分獎勵`,
      });
    }
  };

  const toggleBookmark = (novelId: string) => {
    // 實際實現中會調用 API
    toast({
      title: "書籤更新",
      description: "小說已加入/移除書籤",
    });
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      '浪漫': 'bg-pink-100 text-pink-700',
      '奇幻': 'bg-purple-100 text-purple-700',
      '懸疑': 'bg-gray-100 text-gray-700',
      '玄幻': 'bg-blue-100 text-blue-700',
      '修真': 'bg-green-100 text-green-700'
    };
    return colors[genre] || 'bg-gray-100 text-gray-700';
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">請先登入</h2>
        <p className="text-muted-foreground">需要登入才能閱讀每日小說</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          每日小說
        </h1>
        <p className="text-muted-foreground">
          每天為您精選優質小說，享受閱讀的美好時光
        </p>
      </div>

      {/* 用戶狀態卡片 */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">讀者</p>
              <p className="text-xl font-bold">{profile?.display_name || profile?.username}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm opacity-90">今日狀態</p>
            <p className="text-lg font-bold">
              {hasReadToday ? '已完成閱讀' : '待閱讀'}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm opacity-90">可用積分</p>
            <p className="text-2xl font-bold">{(profile?.points || 0).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* 主要內容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>今日推薦</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>最近更新</span>
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>熱門小說</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {todayNovel && (
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getGenreColor(todayNovel.genre)}>
                      {todayNovel.genre}
                    </Badge>
                    {todayNovel.isNew && (
                      <Badge className="bg-red-100 text-red-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        最新
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(todayNovel.id)}
                  >
                    <Bookmark className={`w-4 h-4 ${todayNovel.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <CardTitle className="text-2xl">{todayNovel.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>作者：{todayNovel.author}</span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {todayNovel.readTime} 分鐘
                  </span>
                  <span className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current text-yellow-500" />
                    {todayNovel.rating}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {todayNovel.views}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {todayNovel.content}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">喜歡這篇小說嗎？</span>
                  </div>
                  <Button 
                    onClick={() => handleReadNovel(todayNovel)}
                    disabled={hasReadToday}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {hasReadToday ? (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        已完成閱讀
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        標記為已讀 (+{profile?.role === 'vip' ? 100 : 50}積分)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentNovels.map((novel) => (
            <Card key={novel.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getGenreColor(novel.genre)}>
                      {novel.genre}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{novel.publishDate}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(novel.id)}
                  >
                    <Bookmark className={`w-4 h-4 ${novel.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
                <p className="text-muted-foreground mb-3">{novel.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>作者：{novel.author}</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {novel.readTime} 分鐘
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-500" />
                      {novel.rating}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    閱讀
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          {popularNovels.map((novel, index) => (
            <Card key={novel.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-700">
                      #{index + 1}
                    </Badge>
                    <Badge className={getGenreColor(novel.genre)}>
                      {novel.genre}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(novel.id)}
                  >
                    <Bookmark className={`w-4 h-4 ${novel.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
                <p className="text-muted-foreground mb-3">{novel.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>作者：{novel.author}</span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {novel.views} 閱讀
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-500" />
                      {novel.rating}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    閱讀
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* 統計信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">總小說數量</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">89</div>
            <p className="text-sm text-muted-foreground">今日閱讀者</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-sm text-muted-foreground">平均評分</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovelPage;
