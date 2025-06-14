
import React from 'react';
import { Card } from '@/components/ui/card';
import { GamepadIcon } from 'lucide-react';

const GamesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <GamepadIcon className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">遊戲中心</h1>
          <p className="text-gray-600">遊戲功能正在開發中，敬請期待</p>
        </div>

        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <GamepadIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">即將推出</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              我們正在開發令人興奮的遊戲體驗，請稍後再來查看！
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GamesPage;
