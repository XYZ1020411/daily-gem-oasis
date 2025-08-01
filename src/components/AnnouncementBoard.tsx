import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Clock, Users, AlertCircle, Info, Star } from 'lucide-react';

const AnnouncementBoard: React.FC = () => {
  const { announcements } = useUser();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!announcements || announcements.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            系統公告
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            目前沒有公告內容
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          系統公告
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(announcement.type)}
                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                <Badge className={getTypeBadgeColor(announcement.type)}>
                  {announcement.type === 'urgent' && '緊急'}
                  {announcement.type === 'warning' && '警告'}
                  {announcement.type === 'success' && '成功'}
                  {announcement.type === 'info' && '資訊'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {formatDate(announcement.created_at)}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AnnouncementBoard;