
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Sun, RefreshCw, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  locationName: string;
  weatherElement: Array<{
    elementName: string;
    time: Array<{
      startTime: string;
      endTime: string;
      parameter: {
        parameterName: string;
        parameterValue?: string;
      };
    }>;
  }>;
}

const CurrentWeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { toast } = useToast();

  const fetchCurrentWeather = async () => {
    try {
      const response = await fetch(
        'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-6FC4659D-D65C-4612-928C-CC2CCFFBA42A&locationName=臺北市,新北市,桃園市,臺中市,高雄市'
      );
      const data = await response.json();
      
      if (data.success === 'true') {
        setWeatherData(data.records.location);
      } else {
        throw new Error('獲取天氣資料失敗');
      }
    } catch (error) {
      console.error('天氣獲取錯誤:', error);
      toast({
        title: "天氣載入失敗",
        description: "無法獲取即時天氣，請稍後再試",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCurrentWeather();
  }, []);

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('晴') || weather.includes('多雲')) {
      return <Sun className="w-5 h-5 text-yellow-500" />;
    }
    return <Cloud className="w-5 h-5 text-gray-500" />;
  };

  const getWeatherInfo = (location: WeatherData) => {
    const weather = location.weatherElement.find(el => el.elementName === 'Wx')?.time[0]?.parameter.parameterName || '未知';
    const temperature = location.weatherElement.find(el => el.elementName === 'MinT')?.time[0]?.parameter.parameterName || '--';
    const maxTemp = location.weatherElement.find(el => el.elementName === 'MaxT')?.time[0]?.parameter.parameterName || '--';
    const pop = location.weatherElement.find(el => el.elementName === 'PoP')?.time[0]?.parameter.parameterName || '0';
    
    return { weather, temperature, maxTemp, pop };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">即時天氣</CardTitle>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchCurrentWeather}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
            {weatherData.slice(0, 5).map((location, index) => {
              const { weather, temperature, maxTemp, pop } = getWeatherInfo(location);
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getWeatherIcon(weather)}
                    <div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-sm">{location.locationName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{weather}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {temperature}°C ~ {maxTemp}°C
                    </div>
                    <div className="text-xs text-muted-foreground">
                      降雨機率 {pop}%
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherWidget;
