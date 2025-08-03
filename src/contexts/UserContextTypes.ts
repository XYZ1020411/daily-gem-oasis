
import { Product, Exchange, Announcement, GiftCode } from '@/hooks/useDatabase';

export interface User {
  id: string;
  username: string;
  display_name: string;
  email_username: string;
  role: 'admin' | 'vip' | 'user';
  points: number;
  vip_level: number;
  created_at: string;
  updated_at: string;
  check_in_streak: number;
  last_check_in: string;
  avatar_url?: string;
  join_date: string;
  last_vip_bonus?: string;
}

export interface UserContextType {
  user: any | null;
  profile: User | null;
  users: User[];
  isLoading: boolean;
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  updateUserById: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updatePoints: (amount: number, description: string) => void;
  
  
  // 簽到相關
  checkIn: () => void;
  
  // 交易和禮品碼相關
  transactions: any[];
  redeemGiftCode: (code: string) => boolean;
  
  // 帳號創建相關
  createRealAccounts: () => Promise<{ accounts: Array<{email: string, password: string, role: string}> }>;
  
  // 數據庫相關功能
  products: Product[];
  exchanges: Exchange[];
  announcements: Announcement[];
  giftCodes: GiftCode[];
  dbLoading: boolean;
  addProduct: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sync_version' | 'last_modified'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  addExchange: (exchangeData: Omit<Exchange, 'id' | 'request_date' | 'sync_version' | 'last_modified'>) => Promise<Exchange>;
  updateExchange: (id: string, updates: Partial<Exchange>) => Promise<Exchange>;
  addAnnouncement: (announcementData: Omit<Announcement, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => Promise<Announcement>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addGiftCode: (giftCodeData: Omit<GiftCode, 'id' | 'created_at' | 'sync_version' | 'last_modified'>) => Promise<GiftCode>;
  updateGiftCode: (id: string, updates: Partial<GiftCode>) => Promise<GiftCode>;
  deleteGiftCode: (id: string) => Promise<void>;
  loadProducts: () => Promise<void>;
  loadExchanges: () => Promise<void>;
  loadGiftCodes: () => Promise<void>;
  loadAnnouncements: () => Promise<void>;
}
