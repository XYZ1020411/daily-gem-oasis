import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Package, 
  Gift, 
  MessageSquare, 
  Settings, 
  QrCode,
  BarChart3,
  UserCheck,
  Crown,
  Shield,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';

const AdminPage = () => {
  const { 
    profile, 
    users, 
    products, 
    exchanges, 
    announcements,
    giftCodes,
    updateUserById,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    updateExchange,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addGiftCode,
    updateGiftCode,
    deleteGiftCode
  } = useUser();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('users');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAddingGiftCode, setIsAddingGiftCode] = useState(false);

  console.log('AdminPage - profile:', profile);
  console.log('AdminPage - profile.role:', profile?.role);

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">權限不足</h2>
        <p className="text-muted-foreground">只有管理員才能訪問此頁面</p>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm">當前用戶信息：</p>
          <p className="text-sm">用戶名稱: {profile?.username || '未知'}</p>
          <p className="text-sm">角色: {profile?.role || '未知'}</p>
        </div>
      </div>
    );
  }

  const handleAddGiftCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await addGiftCode({
        code: formData.get('code') as string,
        points: Number(formData.get('points')),
        is_active: true,
        used_by: [],
        expires_at: formData.get('expiresAt') as string,
        created_by: profile?.id
      });
      
      setIsAddingGiftCode(false);
    } catch (error) {
      // Error already handled in useDatabase hook
    }
  };

  const handleToggleGiftCode = async (codeId: string) => {
    const giftCode = giftCodes.find(code => code.id === codeId);
    if (giftCode) {
      try {
        await updateGiftCode(codeId, { 
          is_active: !giftCode.is_active 
        });
      } catch (error) {
        // Error already handled in useDatabase hook
      }
    }
  };

  const handleDeleteGiftCode = async (codeId: string) => {
    if (confirm('確定要刪除此禮品碼嗎？')) {
      try {
        await deleteGiftCode(codeId);
      } catch (error) {
        // Error already handled in useDatabase hook
      }
    }
  };

  const tabs = [
    { id: 'users', label: '用戶管理', icon: Users },
    { id: 'products', label: '商品管理', icon: Package },
    { id: 'exchanges', label: '兌換管理', icon: Gift },
    { id: 'announcements', label: '公告管理', icon: MessageSquare },
    { id: 'giftcodes', label: '禮品碼管理', icon: QrCode },
    { id: 'stats', label: '數據統計', icon: BarChart3 }
  ];

  const handleUpdateUserRole = (userId: string, newRole: string) => {
    updateUserById(userId, { role: newRole as any });
    toast({
      title: "更新成功",
      description: "用戶角色已更新"
    });
  };

  const handleApproveExchange = (exchangeId: string) => {
    updateExchange(exchangeId, { 
      status: 'approved',
      processed_date: new Date().toISOString(),
      processed_by: profile.id
    });
    toast({
      title: "審核通過",
      description: "兌換申請已通過"
    });
  };

  const handleRejectExchange = (exchangeId: string) => {
    updateExchange(exchangeId, { 
      status: 'rejected',
      processed_date: new Date().toISOString(),
      processed_by: profile.id
    });
    toast({
      title: "已拒絕",
      description: "兌換申請已拒絕"
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await addProduct({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        category: formData.get('category') as string,
        stock: Number(formData.get('stock')),
        is_active: true,
        created_by: profile?.id
      });
      
      setIsAddingProduct(false);
    } catch (error) {
      // Error already handled in useDatabase hook
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await addAnnouncement({
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        type: formData.get('type') as any,
        created_by: profile?.id || '',
        is_active: true
      });
      
      setIsAddingAnnouncement(false);
    } catch (error) {
      // Error already handled in useDatabase hook
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">用戶管理</h3>
        <Badge>總計: {users.length} 位用戶</Badge>
      </div>
      
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {u.role === 'admin' && <Shield className="w-5 h-5 text-red-500" />}
                    {u.role === 'vip' && <Crown className="w-5 h-5 text-yellow-500" />}
                    {u.role === 'user' && <UserCheck className="w-5 h-5 text-blue-500" />}
                    <div>
                      <p className="font-medium">{u.username}</p>
                      <p className="text-sm text-muted-foreground">{u.email_username}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{u.points}</p>
                    <p className="text-xs text-muted-foreground">積分</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select 
                    value={u.role} 
                    onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="user">普通會員</option>
                    <option value="vip">VIP會員</option>
                    <option value="admin">管理員</option>
                  </select>
                  
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if (confirm('確定要刪除此用戶嗎？')) {
                        deleteUser(u.id);
                        toast({ title: "刪除成功", description: "用戶已刪除" });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">商品管理</h3>
        <Button onClick={() => setIsAddingProduct(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增商品
        </Button>
      </div>

      {isAddingProduct && (
        <Card>
          <CardHeader>
            <CardTitle>新增商品</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <Label htmlFor="name">商品名稱</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">商品描述</Label>
                <Textarea id="description" name="description" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">價格 (積分)</Label>
                  <Input id="price" name="price" type="number" required />
                </div>
                <div>
                  <Label htmlFor="stock">庫存</Label>
                  <Input id="stock" name="stock" type="number" required />
                </div>
              </div>
              <div>
                <Label htmlFor="category">分類</Label>
                <select id="category" name="category" className="w-full border rounded px-3 py-2" required>
                  <option value="電子產品">電子產品</option>
                  <option value="餐飲券">餐飲券</option>
                  <option value="購物券">購物券</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">新增</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingProduct(false)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge>{product.category}</Badge>
                    <span className="text-sm">價格: {product.price} 積分</span>
                    <span className="text-sm">庫存: {product.stock}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if (confirm('確定要刪除此商品嗎？')) {
                        deleteProduct(product.id);
                        toast({ title: "刪除成功", description: "商品已刪除" });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderExchangesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">兌換管理</h3>
        <Badge>待處理: {exchanges.filter(e => e.status === 'pending').length}</Badge>
      </div>
      
      <div className="space-y-3">
        {exchanges.map((exchange) => {
          const exchangeUser = users.find(u => u.id === exchange.user_id);
          const product = products.find(p => p.id === exchange.product_id);
          
          return (
            <Card key={exchange.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{exchangeUser?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      兌換商品: {product?.name} x{exchange.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      總價: {exchange.total_price} 積分
                    </p>
                    <p className="text-sm text-muted-foreground">
                      申請時間: {new Date(exchange.request_date).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      exchange.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      exchange.status === 'approved' ? 'bg-green-100 text-green-800' :
                      exchange.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {exchange.status === 'pending' ? '待處理' :
                       exchange.status === 'approved' ? '已審核' :
                       exchange.status === 'completed' ? '已完成' : '已拒絕'}
                    </Badge>
                    
                    {exchange.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveExchange(exchange.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectExchange(exchange.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderAnnouncementsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">公告管理</h3>
        <Button onClick={() => setIsAddingAnnouncement(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增公告
        </Button>
      </div>

      {isAddingAnnouncement && (
        <Card>
          <CardHeader>
            <CardTitle>新增公告</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <Label htmlFor="title">公告標題</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="content">公告內容</Label>
                <Textarea id="content" name="content" required />
              </div>
              <div>
                <Label htmlFor="type">公告類型</Label>
                <select id="type" name="type" className="w-full border rounded px-3 py-2" required>
                  <option value="info">一般資訊</option>
                  <option value="warning">警告</option>
                  <option value="success">成功</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">發布</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingAnnouncement(false)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{announcement.title}</h4>
                    <Badge className={
                      announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                      announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {announcement.type === 'info' ? '資訊' :
                       announcement.type === 'warning' ? '警告' :
                       announcement.type === 'success' ? '成功' : '緊急'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground">
                    發布時間: {new Date(announcement.created_at).toLocaleString('zh-TW')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if (confirm('確定要刪除此公告嗎？')) {
                        deleteAnnouncement(announcement.id);
                        toast({ title: "刪除成功", description: "公告已刪除" });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGiftCodesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">禮品碼管理</h3>
        <Button onClick={() => setIsAddingGiftCode(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增禮品碼
        </Button>
      </div>

      {isAddingGiftCode && (
        <Card>
          <CardHeader>
            <CardTitle>新增禮品碼</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGiftCode} className="space-y-4">
              <div>
                <Label htmlFor="code">禮品碼</Label>
                <Input 
                  id="code" 
                  name="code" 
                  placeholder="例如: WELCOME2024" 
                  required 
                  pattern="[A-Z0-9]+"
                  title="只能包含大寫字母和數字"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">積分價值</Label>
                  <Input id="points" name="points" type="number" min="1" required />
                </div>
                <div>
                  <Label htmlFor="expiresAt">到期日期</Label>
                  <Input id="expiresAt" name="expiresAt" type="date" required />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">新增</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingGiftCode(false)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {giftCodes.map((giftCode) => (
          <Card key={giftCode.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-lg">
                      {giftCode.code}
                    </code>
                    <Badge className={giftCode.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {giftCode.is_active ? '啟用' : '停用'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">積分價值:</span> {giftCode.points}
                    </div>
                    <div>
                      <span className="font-medium">使用次數:</span> {giftCode.used_by.length}
                    </div>
                    <div>
                      <span className="font-medium">創建日期:</span> {new Date(giftCode.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">到期日期:</span> {new Date(giftCode.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant={giftCode.is_active ? "outline" : "default"}
                    onClick={() => handleToggleGiftCode(giftCode.id)}
                  >
                    {giftCode.is_active ? '停用' : '啟用'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteGiftCode(giftCode.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStatsTab = () => {
    const totalUsers = users.length;
    const vipUsers = users.filter(u => u.role === 'vip').length;
    const totalExchanges = exchanges.length;
    const pendingExchanges = exchanges.filter(e => e.status === 'pending').length;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">數據統計</h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground">總用戶數</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{vipUsers}</p>
                  <p className="text-sm text-muted-foreground">VIP會員</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Gift className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{totalExchanges}</p>
                  <p className="text-sm text-muted-foreground">總兌換數</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingExchanges}</p>
                  <p className="text-sm text-muted-foreground">待處理</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>待處理事項</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>待審核兌換申請</span>
                <Badge variant="destructive">{pendingExchanges}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          管理後台
        </h1>
        <p className="text-muted-foreground">
          系統管理和監控中心
        </p>
      </div>

      {/* 標籤導航 */}
      <div className="flex space-x-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* 標籤內容 */}
      <div>
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'exchanges' && renderExchangesTab()}
        {activeTab === 'announcements' && renderAnnouncementsTab()}
        {activeTab === 'giftcodes' && renderGiftCodesTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </div>
    </div>
  );
};

export default AdminPage;
