
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingBag, 
  Coins, 
  Package, 
  Star, 
  History,
  Gift,
  Smartphone,
  Coffee,
  CreditCard,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const ShopPage = () => {
  const { user, products, exchanges, updatePoints, addExchange } = useUser();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', '電子產品', '餐飲券', '購物券'];

  const filteredProducts = selectedCategory === '全部' 
    ? products.filter(p => p.isActive)
    : products.filter(p => p.isActive && p.category === selectedCategory);

  const userExchanges = exchanges.filter(e => e.userId === user?.id);

  const handleExchange = (product: any) => {
    if (!user) return;

    if (user.points < product.price) {
      toast({
        title: "積分不足",
        description: `您需要 ${product.price} 積分，目前只有 ${user.points} 積分`,
        variant: "destructive"
      });
      return;
    }

    if (product.stock <= 0) {
      toast({
        title: "商品缺貨",
        description: "該商品目前缺貨，請選擇其他商品",
        variant: "destructive"
      });
      return;
    }

    // 扣除積分
    updatePoints(-product.price, `兌換商品: ${product.name}`);

    // 添加兌換記錄
    addExchange({
      userId: user.id,
      productId: product.id,
      quantity: 1,
      totalPrice: product.price,
      status: 'pending'
    });

    toast({
      title: "兌換成功！",
      description: `已成功兌換 ${product.name}，請等待管理員處理`,
    });
  };

  const getProductIcon = (category: string) => {
    switch (category) {
      case '電子產品': return <Smartphone className="w-6 h-6" />;
      case '餐飲券': return <Coffee className="w-6 h-6" />;
      case '購物券': return <CreditCard className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'rejected': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待處理';
      case 'approved': return '已審核';
      case 'completed': return '已完成';
      case 'rejected': return '已拒絕';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div>請先登入</div>;
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          積分商城
        </h1>
        <p className="text-muted-foreground">
          使用積分兌換精美商品和優惠券
        </p>
      </div>

      {/* 用戶積分顯示 */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">可用積分</p>
              <p className="text-2xl font-bold">{user.points.toLocaleString()}</p>
            </div>
          </div>
          <ShoppingBag className="w-8 h-8 opacity-70" />
        </CardContent>
      </Card>

      {/* 商品分類 */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* 商品列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getProductIcon(product.category)}
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </div>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold text-purple-600">
                    {product.price.toLocaleString()}
                  </span>
                </div>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  庫存: {product.stock}
                </Badge>
              </div>

              <Button
                onClick={() => handleExchange(product)}
                disabled={user.points < product.price || product.stock <= 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Gift className="w-4 h-4 mr-2" />
                {user.points < product.price ? '積分不足' : product.stock <= 0 ? '缺貨' : '立即兌換'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暫無商品</h3>
            <p className="text-muted-foreground">該分類下暫無可兌換的商品</p>
          </CardContent>
        </Card>
      )}

      {/* 我的兌換記錄 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-6 h-6 text-blue-500" />
            <span>我的兌換記錄</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userExchanges.length > 0 ? (
            <div className="space-y-3">
              {userExchanges.slice(0, 5).map((exchange) => {
                const product = products.find(p => p.id === exchange.productId);
                return (
                  <div key={exchange.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getProductIcon(product?.category || '')}
                      <div>
                        <p className="font-medium">{product?.name || '未知商品'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exchange.requestDate).toLocaleString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(exchange.status)}
                        <Badge className={getStatusColor(exchange.status)}>
                          {getStatusText(exchange.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exchange.totalPrice} 積分
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">暫無兌換記錄</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopPage;
