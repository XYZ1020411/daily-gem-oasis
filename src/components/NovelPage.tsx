import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { useNovels } from '@/hooks/useNovels';
import { useAINovelGenerator } from '@/hooks/useAINovelGenerator';
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
  Sparkles,
  RefreshCw,
  Wand2,
  PenTool
} from 'lucide-react';

const NovelPage: React.FC = () => {
  const { user, profile } = useUser();
  const { 
    todayNovel, 
    loading: novelsLoading, 
    markAsRead, 
    hasRead, 
    getNovelsByType 
  } = useNovels();
  const { loading: aiLoading, generateDailyNovel, generateCustomNovel } = useAINovelGenerator();
  const [activeTab, setActiveTab] = useState('today');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('浪漫');
  const [showCustomGenerator, setShowCustomGenerator] = useState(false);

  const recentNovels = getNovelsByType('recent');
  const popularNovels = getNovelsByType('popular');

  const genres = ['浪漫', '奇幻', '懸疑', '科幻', '都市', '歷史', '冒險', '溫馨'];

  const handleGenerateDailyNovel = async () => {
    const result = await generateDailyNovel();
    if (result) {
      // 重新載入小說列表
      window.location.reload();
    }
  };

  const handleGenerateCustomNovel = async () => {
    if (!customPrompt.trim()) {
      return;
    }
    
    const result = await generateCustomNovel(customPrompt, selectedGenre);
    if (result) {
      setCustomPrompt('');
      setShowCustomGenerator(false);
      // 重新載入小說列表
      window.location.reload();
    }
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      '浪漫': 'bg-pink-100 text-pink-700',
      '奇幻': 'bg-purple-100 text-purple-700',
      '懸疑': 'bg-gray-100 text-gray-700',
      '科幻': 'bg-blue-100 text-blue-700',
      '都市': 'bg-green-100 text-green-700',
      '歷史': 'bg-yellow-100 text-yellow-700',
      '冒險': 'bg-orange-100 text-orange-700',
      '溫馨': 'bg-teal-100 text-teal-700',
      '其他': 'bg-gray-100 text-gray-700'
    };
    return colors[genre] || 'bg-gray-100 text-gray-700';
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">請先登入</h2>
        <p className="text-muted-foreground">需要登入才能閱讀AI生成的小說</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI每日小說
        </h1>
        <p className="text-muted-foreground">
          體驗AI創作的精彩小說，每天都有新驚喜
        </p>
        <div className="flex justify-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateDailyNovel}
            disabled={aiLoading || novelsLoading}
          >
            <Wand2 className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
            AI生成今日小說
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCustomGenerator(!showCustomGenerator)}
          >
            <PenTool className="w-4 h-4 mr-2" />
            自定義生成
          </Button>
        </div>
      </div>

      {/* 自定義小說生成器 */}
      {showCustomGenerator && (
        <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Sparkles className="w-5 h-5 mr-2" />
              AI自定義小說生成器
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">小說類型</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">故事提示詞</label>
              <Textarea
                placeholder="請描述您想要的故事內容，例如：一個關於時間旅行的浪漫愛情故事..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleGenerateCustomNovel} 
                disabled={!customPrompt.trim() || aiLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Wand2 className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
                生成小說
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCustomGenerator(false)}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 用戶狀態卡片 */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">AI小說讀者</p>
              <p className="text-xl font-bold">{profile?.display_name || profile?.username}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm opacity-90">今日狀態</p>
            <p className="text-lg font-bold">
              {todayNovel && hasRead(todayNovel.id) ? '已完成閱讀' : '待閱讀'}
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
            <span>今日AI小說</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>最近生成</span>
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>熱門小說</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {todayNovel ? (
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getGenreColor(todayNovel.genre)}>
                      {todayNovel.genre}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI生成
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* TODO: 實現書籤功能 */}}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-2xl">{todayNovel.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>作者：{todayNovel.author}</span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {todayNovel.read_time} 分鐘
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
                    <span className="text-sm text-muted-foreground">喜歡這篇AI小說嗎？</span>
                  </div>
                  <Button 
                    onClick={() => markAsRead(todayNovel.id)}
                    disabled={hasRead(todayNovel.id) || novelsLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {hasRead(todayNovel.id) ? (
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
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Wand2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">暫無今日AI小說</h3>
                <p className="text-muted-foreground mb-4">點擊上方按鈕讓AI為您生成精彩小說</p>
                <Button 
                  onClick={handleGenerateDailyNovel} 
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Wand2 className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
                  AI生成今日小說
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 保持其他標籤頁的現有代碼 */}
        <TabsContent value="recent" className="space-y-4">
          {recentNovels.length > 0 ? recentNovels.map((novel) => (
            <Card key={novel.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getGenreColor(novel.genre)}>
                      {novel.genre}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{novel.publish_date}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* TODO: 實現書籤功能 */}}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {novel.content.length > 100 ? novel.content.substring(0, 100) + '...' : novel.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>作者：{novel.author}</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {novel.read_time} 分鐘
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-500" />
                      {novel.rating}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAsRead(novel.id)}
                    disabled={hasRead(novel.id) || novelsLoading}
                  >
                    {hasRead(novel.id) ? (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        已讀
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        閱讀
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">暫無最近生成</h3>
                <p className="text-muted-foreground">還沒有其他小說，請稍後再來查看</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          {popularNovels.length > 0 ? popularNovels.map((novel, index) => (
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
                    onClick={() => {/* TODO: 實現書籤功能 */}}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {novel.content.length > 100 ? novel.content.substring(0, 100) + '...' : novel.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>作者：{novel.author}</span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {novel.views}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-500" />
                      {novel.rating}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAsRead(novel.id)}
                    disabled={hasRead(novel.id) || novelsLoading}
                  >
                    {hasRead(novel.id) ? (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        已讀
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        閱讀
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">暫無熱門小說</h3>
                <p className="text-muted-foreground">還沒有足夠的數據來展示熱門小說</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 統計信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Wand2 className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{recentNovels.length + popularNovels.length + (todayNovel ? 1 : 0)}</div>
            <p className="text-sm text-muted-foreground">AI生成小說總數</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {todayNovel && hasRead(todayNovel.id) ? 1 : 0}
            </div>
            <p className="text-sm text-muted-foreground">今日閱讀數</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">
              {todayNovel ? todayNovel.rating.toFixed(1) : '4.8'}
            </div>
            <p className="text-sm text-muted-foreground">平均評分</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovelPage;
