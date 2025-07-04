import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useNovels } from '@/hooks/useNovels';
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
  RefreshCw
} from 'lucide-react';

const NovelPage: React.FC = () => {
  const { user, profile } = useUser();
  const { 
    todayNovel, 
    loading, 
    markAsRead, 
    generateDailyNovel,
    hasRead, 
    getNovelsByType 
  } = useNovels();
  const [activeTab, setActiveTab] = useState('today');

  const recentNovels = getNovelsByType('recent');
  const popularNovels = getNovelsByType('popular');

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      '浪漫': 'bg-pink-100 text-pink-700',
      '奇幻': 'bg-purple-100 text-purple-700',
      '懸疑': 'bg-gray-100 text-gray-700',
      '玄幻': 'bg-blue-100 text-blue-700',
      '修真': 'bg-green-100 text-green-700',
      '生活': 'bg-green-100 text-green-700',
      '娛樂': 'bg-yellow-100 text-yellow-700',
      '文化': 'bg-indigo-100 text-indigo-700',
      '社會': 'bg-red-100 text-red-700',
      '人文': 'bg-purple-100 text-purple-700',
      '都市': 'bg-blue-100 text-blue-700',
      '其他': 'bg-gray-100 text-gray-700'
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateDailyNovel}
          disabled={loading}
          className="ml-2"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          更新每日小說
        </Button>
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
          {todayNovel ? (
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getGenreColor(todayNovel.genre)}>
                      {todayNovel.genre}
                    </Badge>
                    <Badge className="bg-red-100 text-red-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      今日推薦
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
                    <span className="text-sm text-muted-foreground">喜歡這篇小說嗎？</span>
                  </div>
                  <Button 
                    onClick={() => markAsRead(todayNovel.id)}
                    disabled={hasRead(todayNovel.id) || loading}
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
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">暫無今日小說</h3>
                <p className="text-muted-foreground mb-4">請點擊上方的"更新每日小說"按鈕獲取最新內容</p>
                <Button onClick={generateDailyNovel} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  獲取今日小說
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
                    disabled={hasRead(novel.id) || loading}
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
                <h3 className="text-xl font-bold mb-2">暫無最近更新</h3>
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
                      {novel.views} 閱讀
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
                    disabled={hasRead(novel.id) || loading}
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
            <BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{recentNovels.length + popularNovels.length + (todayNovel ? 1 : 0)}</div>
            <p className="text-sm text-muted-foreground">總小說數量</p>
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