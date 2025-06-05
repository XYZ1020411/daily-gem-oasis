
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'user' | 'vip' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  points: number;
  vipLevel: number;
  checkInDays: number;
  lastCheckIn: string | null;
  avatar?: string;
  joinDate: string;
  status: 'active' | 'suspended' | 'inactive';
  totalSpent: number;
  lastLogin: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'gift' | 'checkin' | 'game';
  amount: number;
  description: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface Exchange {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
}

interface UserContextType {
  user: User | null;
  users: User[];
  transactions: Transaction[];
  announcements: Announcement[];
  products: Product[];
  exchanges: Exchange[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePoints: (amount: number, description?: string) => void;
  checkIn: () => boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  addUser: (user: Omit<User, 'id' | 'joinDate' | 'lastLogin'>) => void;
  updateUserById: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addExchange: (exchange: Omit<Exchange, 'id' | 'requestDate'>) => void;
  updateExchange: (id: string, updates: Partial<Exchange>) => void;
  redeemGiftCode: (code: string) => boolean;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 預設用戶資料（包含密碼驗證）
const defaultUsers: Record<string, { user: User; password: string }> = {
  '001': {
    user: {
      id: '001',
      username: 'VIP會員001',
      email: 'vip001@example.com',
      role: 'vip',
      points: 5000,
      vipLevel: 3,
      checkInDays: 15,
      lastCheckIn: null,
      avatar: '🌟',
      joinDate: '2024-01-01',
      status: 'active',
      totalSpent: 2000,
      lastLogin: null
    },
    password: 'vip001'
  },
  '002': {
    user: {
      id: '002',
      username: '系統管理員',
      email: 'admin@example.com',
      role: 'admin',
      points: 99999,
      vipLevel: 5,
      checkInDays: 100,
      lastCheckIn: null,
      avatar: '👑',
      joinDate: '2023-12-01',
      status: 'active',
      totalSpent: 0,
      lastLogin: null
    },
    password: 'admin123'
  },
  'vip8888': {
    user: {
      id: 'vip8888',
      username: 'VIP鑽石會員',
      email: 'vip8888@example.com',
      role: 'vip',
      points: 10000,
      vipLevel: 5,
      checkInDays: 30,
      lastCheckIn: null,
      avatar: '💎',
      joinDate: '2024-02-01',
      status: 'active',
      totalSpent: 5000,
      lastLogin: null
    },
    password: 'vip8888'
  }
};

// 預設交易記錄
const defaultTransactions: Transaction[] = [
  {
    id: '1',
    userId: '001',
    type: 'checkin',
    amount: 20,
    description: '每日簽到獎勵',
    timestamp: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    userId: 'vip8888',
    type: 'game',
    amount: 100,
    description: '射氣球遊戲獎勵',
    timestamp: '2024-01-15T10:30:00Z'
  }
];

// 預設公告
const defaultAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '系統維護通知',
    content: '系統將於今晚23:00-01:00進行維護，期間部分功能可能無法使用。',
    type: 'warning',
    createdAt: '2024-01-15T09:00:00Z',
    createdBy: '002',
    isActive: true
  },
  {
    id: '2',
    title: '新遊戲上線！',
    content: '全新射飛鏢遊戲正式上線，快來挑戰並贏取豐富獎勵！',
    type: 'success',
    createdAt: '2024-01-14T12:00:00Z',
    createdBy: '002',
    isActive: true
  }
];

// 預設商品
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '最新款iPhone 15 Pro，256GB存儲空間',
    price: 30000,
    category: '電子產品',
    stock: 5,
    isActive: true
  },
  {
    id: '2',
    name: 'Starbucks咖啡券',
    description: 'Starbucks $100 咖啡券，全台門市可使用',
    price: 100,
    category: '餐飲券',
    stock: 50,
    isActive: true
  },
  {
    id: '3',
    name: '7-11禮品卡',
    description: '7-11 $500 禮品卡，可購買任何商品',
    price: 500,
    category: '購物券',
    stock: 20,
    isActive: true
  }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    // 從 localStorage 載入資料
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('allUsers');
    const savedTransactions = localStorage.getItem('transactions');
    const savedAnnouncements = localStorage.getItem('announcements');
    const savedProducts = localStorage.getItem('products');
    const savedExchanges = localStorage.getItem('exchanges');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const allUsers = Object.values(defaultUsers).map(u => u.user);
      setUsers(allUsers);
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements));
    }
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedExchanges) {
      setExchanges(JSON.parse(savedExchanges));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // 檢查預設用戶
    if (defaultUsers[username] && defaultUsers[username].password === password) {
      const userData = defaultUsers[username].user;
      const updatedUser = { ...userData, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return true;
    }
    
    // 檢查自定義用戶
    const existingUser = users.find(u => u.username === username);
    if (existingUser && password) { // 簡單驗證，實際應用需要密碼雜湊
      const updatedUser = { ...existingUser, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return true;
    }
    
    // 新用戶註冊
    if (username && password && !existingUser) {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email: `${username}@example.com`,
        role: 'user',
        points: 100,
        vipLevel: 0,
        checkInDays: 0,
        lastCheckIn: null,
        avatar: '👤',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        totalSpent: 0,
        lastLogin: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // 同時更新用戶列表
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    }
  };

  const updatePoints = (amount: number, description = '積分變動') => {
    if (user) {
      const newPoints = Math.max(0, user.points + amount);
      updateUser({ points: newPoints });
      
      // 添加交易記錄
      addTransaction({
        userId: user.id,
        type: amount > 0 ? 'earn' : 'spend',
        amount: Math.abs(amount),
        description
      });
    }
  };

  const checkIn = (): boolean => {
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCheckIn === today) return false;
    
    const baseReward = user.role === 'vip' ? 20 : 10;
    const bonusReward = Math.floor(user.checkInDays / 7) * 5;
    const totalReward = baseReward + bonusReward;
    
    updateUser({
      checkInDays: user.checkInDays + 1,
      lastCheckIn: today,
      points: user.points + totalReward
    });
    
    addTransaction({
      userId: user.id,
      type: 'checkin',
      amount: totalReward,
      description: `每日簽到獎勵 (第${user.checkInDays + 1}天)`
    });
    
    return true;
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  // 管理員功能
  const addUser = (userData: Omit<User, 'id' | 'joinDate' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: null
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
  };

  const updateUserById = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
    setUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    
    // 如果更新的是當前用戶
    if (user?.id === id) {
      const updatedCurrentUser = { ...user, ...updates };
      setUser(updatedCurrentUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
  };

  const addAnnouncement = (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedAnnouncements = [newAnnouncement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    const updatedAnnouncements = announcements.map(a => a.id === id ? { ...a, ...updates } : a);
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
  };

  const deleteAnnouncement = (id: string) => {
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString()
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const addExchange = (exchangeData: Omit<Exchange, 'id' | 'requestDate'>) => {
    const newExchange: Exchange = {
      ...exchangeData,
      id: Date.now().toString(),
      requestDate: new Date().toISOString()
    };
    
    const updatedExchanges = [newExchange, ...exchanges];
    setExchanges(updatedExchanges);
    localStorage.setItem('exchanges', JSON.stringify(updatedExchanges));
  };

  const updateExchange = (id: string, updates: Partial<Exchange>) => {
    const updatedExchanges = exchanges.map(e => e.id === id ? { ...e, ...updates } : e);
    setExchanges(updatedExchanges);
    localStorage.setItem('exchanges', JSON.stringify(updatedExchanges));
  };

  const redeemGiftCode = (code: string): boolean => {
    // 簡單的禮品碼系統
    const giftCodes: Record<string, number> = {
      'WELCOME100': 100,
      'VIP500': 500,
      'LUCKY1000': 1000
    };
    
    if (giftCodes[code] && user) {
      const points = giftCodes[code];
      updatePoints(points, `禮品碼兌換: ${code}`);
      return true;
    }
    return false;
  };

  const value: UserContextType = {
    user,
    users,
    transactions,
    announcements,
    products,
    exchanges,
    login,
    logout,
    updateUser,
    updatePoints,
    checkIn,
    addTransaction,
    addUser,
    updateUserById,
    deleteUser,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addProduct,
    updateProduct,
    deleteProduct,
    addExchange,
    updateExchange,
    redeemGiftCode,
    isLoggedIn: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
