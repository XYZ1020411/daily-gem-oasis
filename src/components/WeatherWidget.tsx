
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud, Sun, RefreshCw, Thermometer, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherForecast {
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

const WeatherWidget: React.FC = () => {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('臺北市');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const cities = [
    '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市',
    '宜蘭縣', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣',
    '嘉義縣', '屏東縣', '臺東縣', '花蓮縣', '澎湖縣', '基隆市',
    '新竹市', '嘉義市', '金門縣', '連江縣'
  ];

  const fetchWeatherForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=CWA-6FC4659D-D65C-4612-928C-CC2CCFFBA42A&locationName=${selectedCity}`
      );
      const data = await response.json();
      
      if (data.success === 'true') {
        setForecasts(data.records.locations[0].location);
      } else {
        throw new Error('獲取天氣預報失敗');
      }
    } catch (error) {
      console.error('天氣預報獲取錯誤:', error);
      toast({
        title: "天氣預報載入失敗",
        description: "無法獲取天氣預報，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherForecast();
  }, [selectedCity]);

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('晴') || weather.includes('多雲')) {
      return <Sun className="w-4 h-4 text-yellow-500" />;
    }
    return <Cloud className="w-4 h-4 text-gray-500" />;
  };

  const getForecastData = (forecast: WeatherForecast) => {
    const weather = forecast.weatherElement.find(el => el.elementName === 'Wx')?.time.slice(0, 3) || [];
    const minTemp = forecast.weatherElement.find(el => el.elementName === 'MinT')?.time.slice(0, 3) || [];
    const maxTemp = forecast.weatherElement.find(el => el.elementName === 'MaxT')?.time.slice(0, 3) || [];
    const pop = forecast.weatherElement.find(el => el.elementName === 'PoP')?.time.slice(0, 3) || [];
    
    return weather.map((w, index) => ({
      time: new Date(w.startTime).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
      weather: w.parameter.parameterName,
      minTemp: minTemp[index]?.parameter.parameterName || '--',
      maxTemp: maxTemp[index]?.parameter.parameterName || '--',
      pop: pop[index]?.parameter.parameterName || '0'
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">天氣預報</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeatherForecast}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <SelectValue placeholder="選擇城市" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {forecasts.length > 0 && getForecastData(forecasts[0]).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getWeatherIcon(day.weather)}
                    <div>
                      <div className="font-medium text-sm">{day.time}</div>
                      <div className="text-xs text-muted-foreground">{day.weather}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-red-500" />
                      <span className="text-sm">{day.minTemp}°C ~ {day.maxTemp}°C</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-muted-foreground">{day.pop}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
