
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, RefreshCw, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NewsWidget from './NewsWidget';
import CurrentWeatherWidget from './CurrentWeatherWidget';
import WeatherWidget from './WeatherWidget';

interface WeatherAlert {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  category: string;
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  headline: string;
  description: string;
  instruction?: string;
  area: Array<{
    areaDesc: string;
  }>;
}

const InfoPage: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { toast } = useToast();

  const fetchWeatherAlerts = async () => {
    try {
      const response = await fetch(
        'https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-001?Authorization=CWA-6FC4659D-D65C-4612-928C-CC2CCFFBA42A'
      );
      const data = await response.json();
      
      if (data.success === 'true') {
        setAlerts(data.records.record || []);
      } else {
        throw new Error('獲取氣象警報失敗');
      }
    } catch (error) {
      console.error('氣象警報獲取錯誤:', error);
      toast({
        title: "氣象警報載入失敗",
        description: "無法獲取氣象警報，請稍後再試",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWeatherAlerts();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'destructive';
      case 'moderate':
        return 'secondary';
      case 'minor':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Info className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">資訊服務</h1>
      </div>

      <Tabs defaultValue="weather" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weather">即時天氣</TabsTrigger>
          <TabsTrigger value="forecast">天氣預報</TabsTrigger>
          <TabsTrigger value="alerts">氣象警報</TabsTrigger>
          <TabsTrigger value="news">新聞資訊</TabsTrigger>
        </TabsList>

        <TabsContent value="weather" className="space-y-4">
          <CurrentWeatherWidget />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <WeatherWidget />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-lg">氣象警報</CardTitle>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchWeatherAlerts}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.event}
                          </Badge>
                          <Badge variant="outline">{alert.urgency}</Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(alert.sent)}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium">{alert.headline}</h4>
                      
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      
                      {alert.instruction && (
                        <div className="bg-muted/50 p-3 rounded">
                          <p className="text-sm font-medium">應變指示：</p>
                          <p className="text-sm">{alert.instruction}</p>
                        </div>
                      )}
                      
                      {alert.area.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">影響區域：</p>
                          <div className="flex flex-wrap gap-1">
                            {alert.area.map((area, areaIndex) => (
                              <Badge key={areaIndex} variant="secondary" className="text-xs">
                                {area.areaDesc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>目前沒有氣象警報</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <NewsWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfoPage;
